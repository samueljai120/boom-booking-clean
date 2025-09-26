// Production Database Migration Script
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrateProductionDatabase() {
  console.log('🚀 Production Database Migration');
  console.log('📊 Updating database schema for multi-tenancy...');
  
  try {
    // Check current schema
    console.log('\n🔍 Checking current database schema...');
    
    // Check if tenants table exists
    const tenantsCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants'
      );
    `;
    
    if (!tenantsCheck[0].exists) {
      console.log('❌ Tenants table does not exist. Creating full schema...');
      await createFullSchema();
    } else {
      console.log('✅ Tenants table exists. Checking for missing columns...');
      await updateExistingSchema();
    }
    
    console.log('\n✅ Production database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function createFullSchema() {
  console.log('\n🏗️ Creating full multi-tenant schema...');
  
  // Create tenants table
  await sql`
    CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      subdomain VARCHAR(100) UNIQUE NOT NULL,
      domain VARCHAR(255),
      plan_type VARCHAR(50) DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'pro', 'business')),
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
      settings JSONB DEFAULT '{}',
      stripe_customer_id VARCHAR(255),
      subscription_id VARCHAR(255),
      subscription_status VARCHAR(50),
      trial_ends_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE
    )
  `;
  console.log('✅ Created tenants table');

  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      email_verified BOOLEAN DEFAULT FALSE,
      last_login TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE
    )
  `;
  console.log('✅ Created users table');

  // Create tenant_users table
  await sql`
    CREATE TABLE IF NOT EXISTS tenant_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('owner', 'admin', 'user')),
      permissions JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(tenant_id, user_id)
    )
  `;
  console.log('✅ Created tenant_users table');

  // Update rooms table
  await sql`
    ALTER TABLE rooms 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE
  `;
  console.log('✅ Updated rooms table');

  // Update business_hours table
  await sql`
    ALTER TABLE business_hours 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
  `;
  console.log('✅ Updated business_hours table');

  // Update bookings table
  await sql`
    ALTER TABLE bookings 
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE
  `;
  console.log('✅ Updated bookings table');

  // Create indexes
  await createIndexes();
  
  // Insert default data
  await insertDefaultData();
}

async function updateExistingSchema() {
  console.log('\n🔧 Updating existing schema...');
  
  // Add missing columns to tenants table
  const tenantColumns = [
    'stripe_customer_id VARCHAR(255)',
    'subscription_id VARCHAR(255)', 
    'subscription_status VARCHAR(50)',
    'trial_ends_at TIMESTAMP WITH TIME ZONE',
    'deleted_at TIMESTAMP WITH TIME ZONE'
  ];
  
  for (const column of tenantColumns) {
    try {
      await sql.unsafe(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ${column.split(' ')[0]} ${column.split(' ').slice(1).join(' ')}`);
      console.log(`✅ Added column: ${column.split(' ')[0]}`);
    } catch (error) {
      console.log(`⚠️ Column ${column.split(' ')[0]} might already exist`);
    }
  }
  
  // Add missing columns to other tables
  try {
    await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE`;
    await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE`;
    console.log('✅ Updated rooms table');
  } catch (error) {
    console.log('⚠️ Rooms table columns might already exist');
  }
  
  try {
    await sql`ALTER TABLE business_hours ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE`;
    console.log('✅ Updated business_hours table');
  } catch (error) {
    console.log('⚠️ Business_hours table columns might already exist');
  }
  
  try {
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE`;
    console.log('✅ Updated bookings table');
  } catch (error) {
    console.log('⚠️ Bookings table columns might already exist');
  }
  
  // Create indexes
  await createIndexes();
}

async function createIndexes() {
  console.log('\n📊 Creating indexes...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id)',
    'CREATE INDEX IF NOT EXISTS idx_rooms_tenant_id ON rooms(tenant_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id) WHERE deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_bookings_room_time ON bookings(tenant_id, room_id, start_time, end_time)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(tenant_id, customer_email)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_conflict_check ON bookings(room_id, start_time, end_time) WHERE status != \'cancelled\' AND deleted_at IS NULL',
    'CREATE INDEX IF NOT EXISTS idx_business_hours_tenant_day ON business_hours(tenant_id, day_of_week)'
  ];
  
  for (const indexQuery of indexes) {
    try {
      await sql.unsafe(indexQuery);
      console.log(`✅ Created index: ${indexQuery.split(' ')[3]}`);
    } catch (error) {
      console.log(`⚠️ Index might already exist: ${indexQuery.split(' ')[3]}`);
    }
  }
}

async function insertDefaultData() {
  console.log('\n📝 Inserting default data...');
  
  try {
    // Check if data already exists
    const tenantCount = await sql`SELECT COUNT(*) as count FROM tenants`;
    if (tenantCount[0].count > 0) {
      console.log('✅ Default data already exists');
      return;
    }

    // Insert default tenant
    const tenantResult = await sql`
      INSERT INTO tenants (name, subdomain, plan_type, status, settings)
      VALUES ('Demo Karaoke', 'demo', 'pro', 'active', '{"timezone": "America/New_York", "currency": "USD"}')
      RETURNING id
    `;
    const tenantId = tenantResult[0].id;
    console.log('✅ Created demo tenant');

    // Insert default user (password: demo123)
    const userResult = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ('demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'admin')
      RETURNING id
    `;
    const userId = userResult[0].id;
    console.log('✅ Created demo user');

    // Link user to tenant as owner
    await sql`
      INSERT INTO tenant_users (tenant_id, user_id, role)
      VALUES (${tenantId}, ${userId}, 'owner')
    `;
    console.log('✅ Linked user to tenant');

    // Insert default rooms with tenant_id
    await sql`
      INSERT INTO rooms (tenant_id, name, capacity, category, description, price_per_hour, is_active)
      VALUES 
        (${tenantId}, 'Room A', 4, 'Standard', 'Standard karaoke room for small groups', 25.00, TRUE),
        (${tenantId}, 'Room B', 6, 'Premium', 'Premium room with better sound system', 35.00, TRUE),
        (${tenantId}, 'Room C', 8, 'VIP', 'VIP room with luxury amenities', 50.00, TRUE)
    `;
    console.log('✅ Created demo rooms');

    // Insert default business hours with tenant_id
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
        VALUES (${tenantId}, ${hour.day}, ${hour.open}, ${hour.close}, ${hour.closed})
      `;
    }
    console.log('✅ Created business hours');

    console.log('\n🎉 Default data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Failed to insert default data:', error);
  }
}

// Run migration
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateProductionDatabase().catch(console.error);
}
