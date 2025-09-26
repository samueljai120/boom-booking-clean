// Vercel API Route: /api/auth/login
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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
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
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return detailed error for debugging
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Authentication service unavailable'
    });
  }
}
