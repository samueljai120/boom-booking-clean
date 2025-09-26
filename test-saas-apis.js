// Test script for SaaS API endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testTenant = {
  name: 'Test Karaoke Business',
  subdomain: 'test-karaoke',
  plan_type: 'pro',
  settings: {
    timezone: 'America/New_York',
    currency: 'USD'
  }
};

const testUser = {
  email: 'test@example.com',
  password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  name: 'Test User'
};

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`\n🧪 Testing ${method} ${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    
    return { success: response.ok, data: result, status: response.status };
  } catch (error) {
    console.error(`❌ Error testing ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting SaaS API Tests\n');
  console.log('=' .repeat(50));

  // Test 1: Health check
  await testAPI('/health');

  // Test 2: Get tenants (should be empty initially)
  await testAPI('/tenants');

  // Test 3: Create a tenant
  const createResult = await testAPI('/tenants', 'POST', testTenant);
  
  if (createResult.success && createResult.data?.data?.id) {
    const tenantId = createResult.data.data.id;
    console.log(`✅ Created tenant with ID: ${tenantId}`);

    // Test 4: Get specific tenant
    await testAPI(`/tenants?id=${tenantId}`);

    // Test 5: Get billing info
    await testAPI(`/billing?tenant_id=${tenantId}`);

    // Test 6: Get usage stats
    await testAPI(`/usage?tenant_id=${tenantId}`);

    // Test 7: Check usage limits for rooms
    await testAPI('/usage', 'POST', {
      tenant_id: tenantId,
      resource_type: 'rooms',
      resource_count: 1
    });

    // Test 8: Get rooms for tenant
    await testAPI(`/rooms?tenant_id=${tenantId}`);

    // Test 9: Get business hours for tenant
    await testAPI(`/business-hours?tenant_id=${tenantId}`);

    // Test 10: Create a booking
    const bookingData = {
      tenant_id: tenantId,
      room_id: 'test-room-id', // This will fail but tests the API structure
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      notes: 'Test booking'
    };
    await testAPI('/bookings', 'POST', bookingData);

    // Test 11: Update tenant
    await testAPI(`/tenants?id=${tenantId}`, 'PUT', {
      name: 'Updated Test Business',
      plan_type: 'business'
    });

    // Test 12: Delete tenant (soft delete)
    await testAPI(`/tenants?id=${tenantId}`, 'DELETE');
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✅ SaaS API Tests Complete');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testAPI, runTests };
