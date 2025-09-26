// Neon PostgreSQL connection for Vercel Functions
import { neon } from '@neondatabase/serverless';

// Neon configuration with error handling
let sql;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  console.log('🔗 Connecting to Neon database...');
  sql = neon(process.env.DATABASE_URL);
  console.log('✅ Neon database connection established');
} catch (error) {
  console.error('❌ Failed to establish Neon database connection:', error);
  throw error;
}

// Database initialization with proper PostgreSQL schema and multi-tenancy
export async function initDatabase() {
  try {
    console.log('🗄️ Initializing Neon PostgreSQL database with multi-tenancy...');
    
    // Create tenants table for multi-tenancy
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

    // Create users table with proper PostgreSQL types
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

    // Ensure password_hash column exists (migration for existing databases)
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `;

    // Create tenant_users table for cross-tenant user management
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

    // Create rooms table with tenant isolation
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        capacity INTEGER NOT NULL CHECK (capacity > 0),
        category VARCHAR(100) NOT NULL,
        description TEXT,
        price_per_hour DECIMAL(10,2) DEFAULT 0 CHECK (price_per_hour >= 0),
        is_active BOOLEAN DEFAULT TRUE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(tenant_id, name)
      )
    `;

    // Create business_hours table with tenant isolation
    await sql`
      CREATE TABLE IF NOT EXISTS business_hours (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(tenant_id, day_of_week)
      )
    `;

    // Create bookings table with tenant isolation and proper constraints
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
        notes TEXT,
        total_price DECIMAL(10,2) CHECK (total_price >= 0),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT valid_booking_time CHECK (end_time > start_time)
      )
    `;

    // Create tenant-aware indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_rooms_tenant_id ON rooms(tenant_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_bookings_room_time ON bookings(tenant_id, room_id, start_time, end_time)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(tenant_id, customer_email)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_bookings_conflict_check ON bookings(room_id, start_time, end_time) WHERE status != 'cancelled'
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_business_hours_tenant_day ON business_hours(tenant_id, day_of_week)
    `;

    // Insert default data
    await insertDefaultData();
    
    // Comprehensive data integrity migration
    await migrateDataIntegrity();
    
    console.log('✅ Neon PostgreSQL database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Neon database initialization failed:', error);
    return false;
  }
}

// Insert default data with tenant setup
async function insertDefaultData() {
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

    // Insert default user (password: demo123)
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('demo123', 10);
    
    const userResult = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ('demo@example.com', ${hashedPassword}, 'Demo User', 'admin')
      RETURNING id
    `;
    const userId = userResult[0].id;

    // Link user to tenant as owner
    await sql`
      INSERT INTO tenant_users (tenant_id, user_id, role)
      VALUES (${tenantId}, ${userId}, 'owner')
    `;

    // Insert default rooms with tenant_id
    await sql`
      INSERT INTO rooms (tenant_id, name, capacity, category, description, price_per_hour)
      VALUES 
        (${tenantId}, 'Room A', 4, 'Standard', 'Standard karaoke room for small groups', 25.00),
        (${tenantId}, 'Room B', 6, 'Premium', 'Premium room with better sound system', 35.00),
        (${tenantId}, 'Room C', 8, 'VIP', 'VIP room with luxury amenities', 50.00)
    `;

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

    console.log('✅ Default data inserted successfully');
  } catch (error) {
    console.error('❌ Failed to insert default data:', error);
  }
}

// Data validation and migration utilities
export function validateJsonbField(field, fieldName) {
  if (field === null || field === undefined) {
    return null;
  }
  
  // If it's already a proper object, return as-is
  if (typeof field === 'object' && !Array.isArray(field)) {
    return field;
  }
  
  // If it's a string that looks like JSON, parse it
  if (typeof field === 'string' && (field.startsWith('{') || field.startsWith('['))) {
    try {
      return JSON.parse(field);
    } catch (error) {
      console.warn(`⚠️ Invalid JSON in ${fieldName}:`, field);
      return {};
    }
  }
  
  // If it's a string that's not JSON, wrap it in an object
  if (typeof field === 'string') {
    console.warn(`⚠️ Converting string to object for ${fieldName}:`, field);
    return { value: field };
  }
  
  // Default fallback
  console.warn(`⚠️ Unexpected data type for ${fieldName}:`, typeof field, field);
  return {};
}

export function validateStringField(field, fieldName) {
  if (field === null || field === undefined) {
    return null;
  }
  
  // If it's already a string, return as-is
  if (typeof field === 'string') {
    return field;
  }
  
  // If it's an object, stringify it (for debugging)
  if (typeof field === 'object') {
    console.warn(`⚠️ Converting object to string for ${fieldName}:`, field);
    return JSON.stringify(field);
  }
  
  // Convert other types to string
  return String(field);
}

// Comprehensive data migration function
async function migrateDataIntegrity() {
  try {
    console.log('🔧 Starting comprehensive data integrity migration...');
    
    // Fix password_hash fields
    await migratePasswordHashes();
    
    // Fix JSONB fields
    await migrateJsonbFields();
    
    // Fix string fields that might contain objects
    await migrateStringFields();
    
    console.log('✅ Comprehensive data integrity migration completed');
  } catch (error) {
    console.error('❌ Data integrity migration failed:', error);
  }
}

// Migrate password hashes
async function migratePasswordHashes() {
  try {
    console.log('🔧 Migrating password hashes...');
    
    const users = await sql`
      SELECT id, email, password_hash
      FROM users
    `;
    
    const bcrypt = await import('bcryptjs');
    
    for (const user of users) {
      const passwordHash = validateStringField(user.password_hash, 'password_hash');
      
      // Check if it's a valid bcrypt hash
      if (!passwordHash || !passwordHash.startsWith('$2')) {
        console.log(`🔧 Regenerating password hash for user: ${user.email}`);
        const newHash = await bcrypt.default.hash('demo123', 10);
        
        await sql`
          UPDATE users 
          SET password_hash = ${newHash}
          WHERE id = ${user.id}
        `;
      }
    }
    
    console.log('✅ Password hash migration completed');
  } catch (error) {
    console.error('❌ Password hash migration failed:', error);
  }
}

// Migrate JSONB fields
async function migrateJsonbFields() {
  try {
    console.log('🔧 Migrating JSONB fields...');
    
    // Fix tenants.settings
    const tenants = await sql`
      SELECT id, name, settings
      FROM tenants
    `;
    
    for (const tenant of tenants) {
      const settings = validateJsonbField(tenant.settings, 'tenant.settings');
      
      if (JSON.stringify(settings) !== JSON.stringify(tenant.settings)) {
        console.log(`🔧 Fixing JSONB settings for tenant: ${tenant.name}`);
        
        await sql`
          UPDATE tenants 
          SET settings = ${settings}
          WHERE id = ${tenant.id}
        `;
      }
    }
    
    // Check if rooms.metadata column exists before trying to fix it
    try {
      const rooms = await sql`
        SELECT id, name, metadata
        FROM rooms
      `;
      
      for (const room of rooms) {
        const metadata = validateJsonbField(room.metadata, 'room.metadata');
        
        if (JSON.stringify(metadata) !== JSON.stringify(room.metadata)) {
          console.log(`🔧 Fixing JSONB metadata for room: ${room.name}`);
          
          await sql`
            UPDATE rooms 
            SET metadata = ${metadata}
            WHERE id = ${room.id}
          `;
        }
      }
    } catch (error) {
      console.log('⚠️ Rooms metadata column does not exist, skipping...');
    }
    
    // Check if bookings.metadata column exists before trying to fix it
    try {
      const bookings = await sql`
        SELECT id, customer_name, metadata
        FROM bookings
      `;
      
      for (const booking of bookings) {
        const metadata = validateJsonbField(booking.metadata, 'booking.metadata');
        
        if (JSON.stringify(metadata) !== JSON.stringify(booking.metadata)) {
          console.log(`🔧 Fixing JSONB metadata for booking: ${booking.customer_name}`);
          
          await sql`
            UPDATE bookings 
            SET metadata = ${metadata}
            WHERE id = ${booking.id}
          `;
        }
      }
    } catch (error) {
      console.log('⚠️ Bookings metadata column does not exist, skipping...');
    }
    
    console.log('✅ JSONB fields migration completed');
  } catch (error) {
    console.error('❌ JSONB fields migration failed:', error);
  }
}

// Migrate string fields
async function migrateStringFields() {
  try {
    console.log('🔧 Migrating string fields...');
    
    // Fix any string fields that might contain objects
    const users = await sql`
      SELECT id, email, name, role
      FROM users
    `;
    
    for (const user of users) {
      const name = validateStringField(user.name, 'user.name');
      const role = validateStringField(user.role, 'user.role');
      
      if (name !== user.name || role !== user.role) {
        console.log(`🔧 Fixing string fields for user: ${user.email}`);
        
        await sql`
          UPDATE users 
          SET name = ${name}, role = ${role}
          WHERE id = ${user.id}
        `;
      }
    }
    
    console.log('✅ String fields migration completed');
  } catch (error) {
    console.error('❌ String fields migration failed:', error);
  }
}

// Fix corrupted password hashes - AGGRESSIVE FIX
async function fixPasswordHashes() {
  try {
    console.log('🔧 AGGRESSIVE: Regenerating ALL password hashes...');
    
    // Get all users
    const users = await sql`
      SELECT id, email, password_hash
      FROM users
    `;
    
    const bcrypt = await import('bcryptjs');
    
    // Force regenerate password hash for ALL users
    for (const user of users) {
      console.log(`🔧 FORCE REGENERATING password hash for user: ${user.email}`);
      console.log(`🔧 Current hash type: ${typeof user.password_hash}`);
      console.log(`🔧 Current hash value: ${JSON.stringify(user.password_hash)}`);
      
      // Generate new hash for demo password
      const newHash = await bcrypt.default.hash('demo123', 10);
      console.log(`🔧 New hash generated: ${newHash}`);
      
      // Update the user's password hash
      await sql`
        UPDATE users 
        SET password_hash = ${newHash}
        WHERE id = ${user.id}
      `;
      
      console.log(`✅ FORCE REGENERATED password hash for user: ${user.email}`);
    }
    
    console.log('✅ AGGRESSIVE password hash fix completed - ALL users updated');
  } catch (error) {
    console.error('❌ Failed to fix password hashes:', error);
  }
}

// Export sql for use in API routes
export { sql };
