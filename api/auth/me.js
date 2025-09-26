// Vercel API Route: /api/auth/me
import { sql, initDatabase } from '../../lib/neon-db.js';
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

  // Only allow GET requests
  if (req.method !== 'GET') {
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

    // Initialize database if needed
    console.log('🗄️ Initializing database connection...');
    const dbInitialized = await initDatabase();
    
    if (!dbInitialized) {
      console.error('❌ Database initialization failed');
      throw new Error('Database initialization failed');
    }

    console.log('✅ Database connection established');

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

  } catch (error) {
    console.error('❌ Session validation error:', error);
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
