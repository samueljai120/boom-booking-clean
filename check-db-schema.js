// Check Production Database Schema
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkDatabaseSchema() {
  console.log('🔍 Checking Production Database Schema...');
  
  try {
    // Check tenants table structure
    console.log('\n📊 Tenants Table Structure:');
    const tenantsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      ORDER BY ordinal_position
    `;
    
    tenantsColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if tenants table exists and has data
    console.log('\n📋 Tenants Data:');
    const tenantsData = await sql`SELECT * FROM tenants LIMIT 3`;
    console.log(`Found ${tenantsData.length} tenants:`);
    tenantsData.forEach(tenant => {
      console.log(`  - ${tenant.name} (${tenant.subdomain}) - ${tenant.plan_type}`);
    });
    
    // Check rooms table structure
    console.log('\n🏠 Rooms Table Structure:');
    const roomsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'rooms' 
      ORDER BY ordinal_position
    `;
    
    roomsColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check rooms data
    console.log('\n📋 Rooms Data:');
    const roomsData = await sql`SELECT * FROM rooms LIMIT 3`;
    console.log(`Found ${roomsData.length} rooms:`);
    roomsData.forEach(room => {
      console.log(`  - ${room.name} (${room.capacity} people) - $${room.price_per_hour}/hour`);
    });
    
    // Check business_hours table structure
    console.log('\n⏰ Business Hours Table Structure:');
    const businessHoursColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'business_hours' 
      ORDER BY ordinal_position
    `;
    
    businessHoursColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check bookings table structure
    console.log('\n📅 Bookings Table Structure:');
    const bookingsColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      ORDER BY ordinal_position
    `;
    
    bookingsColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n✅ Database schema check completed!');
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error);
  }
}

// Run schema check
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabaseSchema().catch(console.error);
}
