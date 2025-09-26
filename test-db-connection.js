#!/usr/bin/env node

// Test script to verify Neon database connection
import { sql, initDatabase } from './lib/neon-db.js';

async function testConnection() {
  console.log('🧪 Testing Neon database connection...');
  
  try {
    // Test basic connection
    console.log('1️⃣ Testing basic connection...');
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Basic connection successful:', result[0]);
    
    // Test database initialization
    console.log('2️⃣ Testing database initialization...');
    const initialized = await initDatabase();
    if (initialized) {
      console.log('✅ Database initialization successful');
    } else {
      console.log('❌ Database initialization failed');
      return;
    }
    
    // Test user table
    console.log('3️⃣ Testing user table...');
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log('✅ User table accessible, count:', users[0].count);
    
    // Test demo user
    console.log('4️⃣ Testing demo user...');
    const demoUser = await sql`
      SELECT id, email, name, role 
      FROM users 
      WHERE email = 'demo@example.com'
    `;
    
    if (demoUser.length > 0) {
      console.log('✅ Demo user found:', demoUser[0]);
    } else {
      console.log('❌ Demo user not found');
    }
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}

// Run the test
testConnection();
