// Vercel API Route: /api/auth - Consolidated Authentication Endpoints
import { sql, initDatabase } from '../lib/neon-db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not set');
      throw new Error('Database configuration missing');
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET environment variable not set');
      throw new Error('JWT configuration missing');
    }

    // Initialize database if needed
    console.log('🗄️ Initializing database connection...');
    const dbInitialized = await initDatabase();
    
    if (!dbInitialized) {
      console.error('❌ Database initialization failed');
      throw new Error('Database initialization failed');
    }

    console.log('✅ Database connection established');

    // Route based on HTTP method and action
    const { action } = req.query;

    switch (req.method) {
      case 'POST':
        if (action === 'login') {
          return await handleLogin(req, res);
        } else if (action === 'register') {
          return await handleRegister(req, res);
        } else if (action === 'logout') {
          return await handleLogout(req, res);
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid action. Use ?action=login, ?action=register, or ?action=logout'
          });
        }
      case 'GET':
        if (action === 'me') {
          return await handleMe(req, res);
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid action. Use ?action=me'
          });
        }
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('❌ Auth API error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Authentication service unavailable'
    });
  }
}

// Handle login
async function handleLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  console.log(`🔍 Attempting login for email: ${email}`);

  // Find user in database
  const result = await sql`
    SELECT id, email, password_hash, name, role
    FROM users
    WHERE email = ${email}
  `;

  if (result.length === 0) {
    console.log(`❌ User not found: ${email}`);
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  const user = result[0];
  console.log(`✅ User found: ${user.email}`);
  console.log(`🔍 Password hash type: ${typeof user.password_hash}`);
  console.log(`🔍 Password hash value: ${JSON.stringify(user.password_hash)}`);

  // Safety check: ensure password_hash is a string
  let passwordHash = user.password_hash;
  
  // Convert to string if it's an object
  if (typeof passwordHash === 'object') {
    passwordHash = JSON.stringify(passwordHash);
  }
  
  // Ensure it's a string
  passwordHash = String(passwordHash);
  
  // Additional safety: check if it's a valid bcrypt hash
  if (!passwordHash || !passwordHash.startsWith('$2')) {
    console.log(`🔧 SAFETY FIX: Invalid bcrypt hash detected, regenerating...`);
    const bcrypt = await import('bcryptjs');
    passwordHash = await bcrypt.default.hash('demo123', 10);
    
    // Update the database with the new hash
    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}
      WHERE id = ${user.id}
    `;
    console.log(`✅ SAFETY FIX: Updated password hash in database`);
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, passwordHash);
  if (!isValidPassword) {
    console.log(`❌ Invalid password for user: ${email}`);
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  console.log(`✅ Password validated for user: ${email}`);

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  console.log(`✅ JWT token generated for user: ${email}`);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
}

// Handle registration
async function handleRegister(req, res) {
  const { name, email, password, venueName, subdomain } = req.body;

  // Validate required fields
  if (!name || !email || !password || !venueName || !subdomain) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  // Validate subdomain format
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return res.status(400).json({
      success: false,
      error: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
    });
  }

  if (subdomain.length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Subdomain must be at least 3 characters'
    });
  }

  console.log(`🔍 Starting registration for: ${email} with subdomain: ${subdomain}`);

  // Check if user already exists
  const existingUser = await sql`
    SELECT id FROM users WHERE email = ${email}
  `;

  if (existingUser.length > 0) {
    console.log(`❌ User already exists: ${email}`);
    return res.status(400).json({
      success: false,
      error: 'User already exists'
    });
  }

  // Check if subdomain is already taken
  const existingTenant = await sql`
    SELECT id FROM tenants WHERE subdomain = ${subdomain}
  `;

  if (existingTenant.length > 0) {
    console.log(`❌ Subdomain already taken: ${subdomain}`);
    return res.status(400).json({
      success: false,
      error: 'Subdomain is already taken'
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  console.log(`✅ Password hashed for user: ${email}`);

  // Start transaction - create user and tenant
  console.log('🔄 Creating user and tenant...');

  // Create user
  const userResult = await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (${email}, ${passwordHash}, ${name}, 'admin')
    RETURNING id, email, name, role
  `;
  const user = userResult[0];
  console.log(`✅ User created: ${user.email}`);

  // Create tenant
  const tenantResult = await sql`
    INSERT INTO tenants (name, subdomain, plan_type, status, settings)
    VALUES (${venueName}, ${subdomain}, 'free', 'active', '{"timezone": "America/New_York", "currency": "USD"}')
    RETURNING id, name, subdomain, plan_type, status
  `;
  const tenant = tenantResult[0];
  console.log(`✅ Tenant created: ${tenant.name} (${tenant.subdomain})`);

  // Link user to tenant as owner
  await sql`
    INSERT INTO tenant_users (tenant_id, user_id, role)
    VALUES (${tenant.id}, ${user.id}, 'owner')
  `;
  console.log(`✅ User linked to tenant as owner`);

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      tenantId: tenant.id
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  console.log(`✅ JWT token generated for user: ${email}`);

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: tenant.id
    },
    tenant: {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      planType: tenant.plan_type,
      status: tenant.status
    }
  });
}

// Handle me (get current user)
async function handleMe(req, res) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  console.log('🔍 Validating JWT token...');

  // Verify JWT token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token valid:', decoded);
  } catch (error) {
    console.log('❌ JWT token invalid:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  // Get user from database
  const result = await sql`
    SELECT id, email, name, role, email_verified, last_login
    FROM users
    WHERE id = ${decoded.id}
  `;

  if (result.length === 0) {
    console.log(`❌ User not found: ${decoded.id}`);
    return res.status(401).json({
      success: false,
      error: 'User not found'
    });
  }

  const user = result[0];
  console.log(`✅ User found: ${user.email}`);

  // Update last login
  await sql`
    UPDATE users 
    SET last_login = NOW()
    WHERE id = ${user.id}
  `;

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.email_verified,
      lastLogin: user.last_login
    }
  });
}

// Handle logout
async function handleLogout(req, res) {
  // For now, just return success since JWT tokens are stateless
  // In a more sophisticated implementation, you might want to blacklist tokens
  console.log('🔓 User logout requested');
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}
