// Complete Development Server
// This server handles both frontend and API routes for local development

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// Database connection
const sql = neon(process.env.DATABASE_URL);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-this-now-local-dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await sql`SELECT 1`;
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      message: 'Local development server is running',
      environment: process.env.NODE_ENV || 'development',
      platform: 'local',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      database: 'disconnected'
    });
  }
});

// Business hours
app.get('/api/business-hours', async (req, res) => {
  try {
    const hours = await sql`
      SELECT day_of_week as "dayOfWeek", 
             open_time as "openTime", 
             close_time as "closeTime", 
             is_closed as "isClosed"
      FROM business_hours 
      ORDER BY day_of_week
    `;
    
    res.json({
      success: true,
      data: hours
    });
  } catch (error) {
    console.error('Business hours error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business hours'
    });
  }
});

// Rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await sql`
      SELECT id, name, capacity, category, description, 
             price_per_hour as "pricePerHour", 
             is_active as "isActive"
      FROM rooms 
      WHERE is_active = true
      ORDER BY name
    `;
    
    // Transform data for frontend compatibility
    const transformedRooms = rooms.map(room => ({
      ...room,
      _id: room.id,
      hourlyRate: parseFloat(room.pricePerHour),
      status: room.isActive ? 'active' : 'inactive',
      isBookable: room.isActive
    }));
    
    res.json({
      success: true,
      data: transformedRooms
    });
  } catch (error) {
    console.error('Rooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rooms'
    });
  }
});

// Authentication - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Find user in database
    const users = await sql`
      SELECT id, email, password, name, role 
      FROM users 
      WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Authentication - Get user info
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database
      const users = await sql`
        SELECT id, email, name, role 
        FROM users 
        WHERE id = ${decoded.id}
      `;
      
      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
      
      const user = users[0];
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

// Handle client-side routing - serve index.html for all routes that don't start with /api
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Serve the React app for all other routes
  res.sendFile(join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      // If dist/index.html doesn't exist, serve a simple fallback
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Boom Karaoke Booking - Local Development</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    color: white;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    text-align: center;
                }
                .header {
                    margin-bottom: 40px;
                }
                .status {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    backdrop-filter: blur(10px);
                }
                .api-test {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    backdrop-filter: blur(10px);
                }
                .btn {
                    background: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 5px;
                    text-decoration: none;
                    display: inline-block;
                }
                .btn:hover {
                    background: #45a049;
                }
                .response {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 15px;
                    border-radius: 5px;
                    margin: 10px 0;
                    text-align: left;
                    font-family: monospace;
                    white-space: pre-wrap;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎤 Boom Karaoke Booking</h1>
                    <p>Local Development Server</p>
                </div>
                
                <div class="status">
                    <h2>✅ Server Status</h2>
                    <p>API Server is running successfully!</p>
                    <p>Database: Connected to Neon PostgreSQL</p>
                    <p>Environment: Development</p>
                    <p><strong>Note:</strong> Frontend build not found. Please run 'npm run build' to build the React app.</p>
                </div>
                
                <div class="api-test">
                    <h2>🧪 API Testing</h2>
                    <p>Test the API endpoints:</p>
                    <button class="btn" onclick="testHealth()">Test Health Check</button>
                    <button class="btn" onclick="testRooms()">Test Rooms API</button>
                    <button class="btn" onclick="testBusinessHours()">Test Business Hours</button>
                    <button class="btn" onclick="testLogin()">Test Login</button>
                    <div id="response" class="response" style="display: none;"></div>
                </div>
                
                <div class="api-test">
                    <h2>📚 Available Endpoints</h2>
                    <ul style="text-align: left;">
                        <li><strong>GET /api/health</strong> - Health check</li>
                        <li><strong>GET /api/rooms</strong> - Get all rooms</li>
                        <li><strong>GET /api/business-hours</strong> - Get business hours</li>
                        <li><strong>POST /api/auth/login</strong> - User login</li>
                        <li><strong>GET /api/auth/me</strong> - Get user info (requires token)</li>
                    </ul>
                </div>
                
                <div class="api-test">
                    <h2>🔑 Demo Credentials</h2>
                    <p>Email: <code>demo@example.com</code></p>
                    <p>Password: <code>demo123</code></p>
                </div>
            </div>
            
            <script>
                async function testHealth() {
                    try {
                        const response = await fetch('/api/health');
                        const data = await response.json();
                        showResponse('Health Check', data);
                    } catch (error) {
                        showResponse('Health Check Error', { error: error.message });
                    }
                }
                
                async function testRooms() {
                    try {
                        const response = await fetch('/api/rooms');
                        const data = await response.json();
                        showResponse('Rooms API', data);
                    } catch (error) {
                        showResponse('Rooms API Error', { error: error.message });
                    }
                }
                
                async function testBusinessHours() {
                    try {
                        const response = await fetch('/api/business-hours');
                        const data = await response.json();
                        showResponse('Business Hours API', data);
                    } catch (error) {
                        showResponse('Business Hours API Error', { error: error.message });
                    }
                }
                
                async function testLogin() {
                    try {
                        const response = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email: 'demo@example.com',
                                password: 'demo123'
                            })
                        });
                        const data = await response.json();
                        showResponse('Login API', data);
                    } catch (error) {
                        showResponse('Login API Error', { error: error.message });
                    }
                }
                
                function showResponse(title, data) {
                    const responseDiv = document.getElementById('response');
                    responseDiv.style.display = 'block';
                    responseDiv.innerHTML = \`<strong>\${title}:</strong>\\n\${JSON.stringify(data, null, 2)}\`;
                }
            </script>
        </body>
        </html>
      `);
    }
  });
});

// Subdomain API endpoint
app.get('/api/subdomain', async (req, res) => {
  try {
    // Extract subdomain from Host header
    const host = req.headers.host || req.headers['x-forwarded-host'];
    let subdomain = null;
    
    if (host) {
      const hostname = host.split(':')[0];
      const parts = hostname.split('.');
      
      if (parts.length >= 3) {
        const potentialSubdomain = parts[0];
        const excludedSubdomains = ['www', 'api', 'admin', 'app', 'staging', 'dev', 'test'];
        
        if (!excludedSubdomains.includes(potentialSubdomain.toLowerCase())) {
          subdomain = potentialSubdomain.toLowerCase();
        }
      }
    }
    
    if (!subdomain) {
      return res.json({
        success: true,
        data: {
          subdomain: null,
          tenant: null,
          isMainDomain: true
        }
      });
    }

    // Get tenant by subdomain
    const tenantResult = await sql`
      SELECT 
        t.id, t.name, t.subdomain, t.domain, t.plan_type, t.status,
        t.settings, t.stripe_customer_id, t.subscription_id, t.subscription_status,
        t.trial_ends_at, t.created_at, t.updated_at
      FROM tenants t
      WHERE t.subdomain = ${subdomain} 
        AND t.status = 'active' 
        AND t.deleted_at IS NULL
    `;

    const tenant = tenantResult.length > 0 ? tenantResult[0] : null;

    res.json({
      success: true,
      data: {
        subdomain: subdomain,
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          domain: tenant.domain,
          planType: tenant.plan_type,
          status: tenant.status,
          settings: tenant.settings,
          subscriptionStatus: tenant.subscription_status,
          trialEndsAt: tenant.trial_ends_at,
          createdAt: tenant.created_at
        } : null,
        isMainDomain: false,
        isValid: !!tenant
      }
    });
  } catch (error) {
    console.error('Subdomain API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subdomain information'
    });
  }
});

// Subdomain availability check
app.post('/api/subdomain', async (req, res) => {
  try {
    const { subdomain } = req.body;

    if (!subdomain) {
      return res.status(400).json({
        success: false,
        error: 'Subdomain is required'
      });
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    const isValidFormat = subdomain.length >= 3 && 
                         subdomain.length <= 63 && 
                         subdomainRegex.test(subdomain) &&
                         !subdomain.includes('--');

    if (!isValidFormat) {
      return res.json({
        success: true,
        data: {
          subdomain: subdomain.toLowerCase(),
          available: false,
          reason: 'Invalid subdomain format'
        }
      });
    }

    // Check if reserved
    const reservedSubdomains = ['www', 'api', 'admin', 'app', 'staging', 'dev', 'test', 'demo'];
    if (reservedSubdomains.includes(subdomain.toLowerCase())) {
      return res.json({
        success: true,
        data: {
          subdomain: subdomain.toLowerCase(),
          available: false,
          reason: 'Subdomain is reserved'
        }
      });
    }

    // Check if already exists
    const existing = await sql`
      SELECT id FROM tenants 
      WHERE subdomain = ${subdomain.toLowerCase()} AND deleted_at IS NULL
    `;

    const available = existing.length === 0;

    res.json({
      success: true,
      data: {
        subdomain: subdomain.toLowerCase(),
        available: available,
        reason: available ? 'Available' : 'Subdomain already taken'
      }
    });
  } catch (error) {
    console.error('Subdomain availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check subdomain availability'
    });
  }
});

// Bookings API endpoint
app.get('/api/bookings', async (req, res) => {
  try {
    const { room_id, date, status, tenant_id } = req.query;
    
    // Extract tenant from subdomain or query param
    let tenantId = tenant_id;
    
    if (!tenantId) {
      // Try to get tenant from subdomain
      const host = req.headers.host || req.headers['x-forwarded-host'];
      if (host) {
        const hostname = host.split(':')[0];
        const parts = hostname.split('.');
        
        if (parts.length >= 3) {
          const subdomain = parts[0];
          const excludedSubdomains = ['www', 'api', 'admin', 'app', 'staging', 'dev', 'test'];
          
          if (!excludedSubdomains.includes(subdomain.toLowerCase())) {
            const tenantResult = await sql`
              SELECT id FROM tenants 
              WHERE subdomain = ${subdomain.toLowerCase()} 
                AND status = 'active' 
                AND deleted_at IS NULL
            `;
            
            if (tenantResult.length > 0) {
              tenantId = tenantResult[0].id;
            }
          }
        }
      }
    }
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required'
      });
    }
    
    let query = `
      SELECT 
        b.id, b.tenant_id, b.room_id, b.customer_name, b.customer_email, b.customer_phone,
        b.start_time, b.end_time, b.status, b.notes, b.total_price,
        b.created_at, b.updated_at,
        r.name as room_name, r.capacity as room_capacity, r.category as room_category
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.tenant_id = $1 AND b.deleted_at IS NULL AND r.deleted_at IS NULL
    `;
    
    const params = [tenantId];
    
    if (room_id) {
      query += ` AND b.room_id = $${params.length + 1}`;
      params.push(room_id);
    }
    
    if (date) {
      query += ` AND DATE(b.start_time) = $${params.length + 1}`;
      params.push(date);
    }
    
    if (status) {
      query += ` AND b.status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY b.start_time DESC`;
    
    const result = await sql.unsafe(query, params);
    
    const bookings = result.map(row => ({
      id: row.id,
      tenantId: row.tenant_id,
      roomId: row.room_id,
      roomName: row.room_name,
      roomCapacity: row.room_capacity,
      roomCategory: row.room_category,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      notes: row.notes,
      totalPrice: parseFloat(row.total_price || 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Bookings API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      success: false, 
      error: 'API endpoint not found',
      path: req.path 
    });
  }
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Complete development server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`\n🎯 Test the application:`);
  console.log(`   - Open browser: http://localhost:${PORT}`);
  console.log(`   - Test API endpoints using the interface`);
  console.log(`   - Login with: demo@example.com / demo123`);
});
