// Test Database Tenants
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testDatabaseTenants() {
  console.log('🔍 Testing Database Tenants...');
  
  try {
    // Check what tenants exist
    console.log('\n📊 Existing Tenants:');
    const tenants = await sql`SELECT id, name, subdomain, plan_type, status FROM tenants LIMIT 5`;
    
    if (tenants.length === 0) {
      console.log('❌ No tenants found in database');
      console.log('\n🔧 Creating demo tenant...');
      
      // Create a demo tenant
      const tenantResult = await sql`
        INSERT INTO tenants (name, subdomain, plan_type, status, settings)
        VALUES ('Demo Karaoke', 'demo', 'pro', 'active', '{"timezone": "America/New_York", "currency": "USD"}')
        RETURNING id, name, subdomain
      `;
      
      const tenant = tenantResult[0];
      console.log(`✅ Created tenant: ${tenant.name} (${tenant.subdomain}) - ID: ${tenant.id}`);
      
      // Create demo rooms
      await sql`
        INSERT INTO rooms (tenant_id, name, capacity, category, description, price_per_hour, is_active)
        VALUES 
          (${tenant.id}, 'Room A', 4, 'Standard', 'Standard karaoke room for small groups', 25.00, TRUE),
          (${tenant.id}, 'Room B', 6, 'Premium', 'Premium room with better sound system', 35.00, TRUE),
          (${tenant.id}, 'Room C', 8, 'VIP', 'VIP room with luxury amenities', 50.00, TRUE)
      `;
      console.log('✅ Created demo rooms');
      
      // Create demo business hours
      const businessHours = [
        { day: 1, open: '09:00', close: '22:00', closed: false },
        { day: 2, open: '09:00', close: '22:00', closed: false },
        { day: 3, open: '09:00', close: '22:00', closed: false },
        { day: 4, open: '09:00', close: '22:00', closed: false },
        { day: 5, open: '09:00', close: '23:00', closed: false },
        { day: 6, open: '10:00', close: '23:00', closed: false },
        { day: 0, open: '10:00', close: '21:00', closed: false }
      ];

      for (const hour of businessHours) {
        await sql`
          INSERT INTO business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
          VALUES (${tenant.id}, ${hour.day}, ${hour.open}, ${hour.close}, ${hour.closed})
        `;
      }
      console.log('✅ Created business hours');
      
      return tenant.id;
    } else {
      console.log(`✅ Found ${tenants.length} tenants:`);
      tenants.forEach(tenant => {
        console.log(`  - ${tenant.name} (${tenant.subdomain}) - ${tenant.plan_type} - ID: ${tenant.id}`);
      });
      return tenants[0].id;
    }
    
  } catch (error) {
    console.error('❌ Error testing database tenants:', error);
    return null;
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseTenants().then(tenantId => {
    if (tenantId) {
      console.log(`\n🎯 Use this tenant ID for testing: ${tenantId}`);
    }
  }).catch(console.error);
}
