// Vercel API Route: /api/auth/register
import { sql, initDatabase } from '../../lib/neon-db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
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

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Registration service unavailable'
    });
  }
}
