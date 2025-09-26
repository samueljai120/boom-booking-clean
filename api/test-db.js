// Test Database API endpoint
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // Test database connection
    const result = await sql`SELECT 1 as test`;
    
    // Check tenants
    const tenants = await sql`SELECT id, name, subdomain, plan_type, status FROM tenants LIMIT 3`;
    
    // Check rooms
    const rooms = await sql`SELECT id, name, capacity FROM rooms LIMIT 3`;
    
    // Check business hours
    const businessHours = await sql`SELECT id, day_of_week, open_time, close_time FROM business_hours LIMIT 3`;
    
    res.status(200).json({
      success: true,
      message: 'Database test successful',
      data: {
        connection: result[0],
        tenants: tenants,
        rooms: rooms,
        businessHours: businessHours
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error
    });
  }
}
