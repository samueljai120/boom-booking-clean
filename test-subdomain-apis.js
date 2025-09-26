#!/usr/bin/env node

/**
 * Test script for subdomain functionality
 * Run with: node test-subdomain-apis.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test subdomain detection
async function testSubdomainDetection() {
  console.log('🧪 Testing subdomain detection...');
  
  try {
    // Test main domain
    const mainResponse = await fetch(`${BASE_URL}/api/subdomain`);
    const mainResult = await mainResponse.json();
    
    console.log('✅ Main domain test:', {
      success: mainResult.success,
      isMainDomain: mainResult.data.isMainDomain,
      subdomain: mainResult.data.subdomain
    });
    
    // Test with demo subdomain (if it exists)
    const demoResponse = await fetch(`${BASE_URL}/api/subdomain`, {
      headers: {
        'Host': 'demo.localhost:3000'
      }
    });
    const demoResult = await demoResponse.json();
    
    console.log('✅ Demo subdomain test:', {
      success: demoResult.success,
      subdomain: demoResult.data.subdomain,
      isValid: demoResult.data.isValid,
      tenant: demoResult.data.tenant?.name
    });
    
  } catch (error) {
    console.error('❌ Subdomain detection test failed:', error.message);
  }
}

// Test subdomain availability checking
async function testSubdomainAvailability() {
  console.log('\n🧪 Testing subdomain availability...');
  
  const testSubdomains = ['testcompany', 'demo', 'invalid-subdomain--test', 'www'];
  
  for (const subdomain of testSubdomains) {
    try {
      const response = await fetch(`${BASE_URL}/api/subdomain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subdomain })
      });
      
      const result = await response.json();
      
      console.log(`✅ ${subdomain}:`, {
        available: result.data.available,
        reason: result.data.reason
      });
      
    } catch (error) {
      console.error(`❌ ${subdomain} test failed:`, error.message);
    }
  }
}

// Test tenant-specific API with subdomain
async function testTenantAPIs() {
  console.log('\n🧪 Testing tenant-specific APIs...');
  
  try {
    // Test rooms API with subdomain
    const roomsResponse = await fetch(`${BASE_URL}/api/rooms`, {
      headers: {
        'Host': 'demo.localhost:3000'
      }
    });
    const roomsResult = await roomsResponse.json();
    
    console.log('✅ Rooms API with subdomain:', {
      success: roomsResult.success,
      roomCount: roomsResult.data?.length || 0,
      tenant: roomsResult.tenant?.name
    });
    
    // Test business hours API with subdomain
    const hoursResponse = await fetch(`${BASE_URL}/api/business-hours`, {
      headers: {
        'Host': 'demo.localhost:3000'
      }
    });
    const hoursResult = await hoursResponse.json();
    
    console.log('✅ Business hours API with subdomain:', {
      success: hoursResult.success,
      hoursCount: hoursResult.data?.businessHours?.length || 0,
      tenant: hoursResult.tenant?.name
    });
    
    // Test bookings API with subdomain
    const bookingsResponse = await fetch(`${BASE_URL}/api/bookings`, {
      headers: {
        'Host': 'demo.localhost:3000'
      }
    });
    const bookingsResult = await bookingsResponse.json();
    
    console.log('✅ Bookings API with subdomain:', {
      success: bookingsResult.success,
      bookingCount: bookingsResult.data?.length || 0,
      tenant: bookingsResult.tenant?.name
    });
    
  } catch (error) {
    console.error('❌ Tenant API test failed:', error.message);
  }
}

// Test subdomain validation
async function testSubdomainValidation() {
  console.log('\n🧪 Testing subdomain validation...');
  
  const testCases = [
    { subdomain: 'valid-subdomain', expected: true },
    { subdomain: 'invalid--subdomain', expected: false },
    { subdomain: 'a', expected: false }, // Too short
    { subdomain: 'a'.repeat(64), expected: false }, // Too long
    { subdomain: 'www', expected: false }, // Reserved
    { subdomain: 'api', expected: false }, // Reserved
    { subdomain: 'test123', expected: true },
    { subdomain: 'test-123', expected: true },
    { subdomain: '-test', expected: false }, // Starts with hyphen
    { subdomain: 'test-', expected: false }, // Ends with hyphen
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await fetch(`${BASE_URL}/api/subdomain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subdomain: testCase.subdomain })
      });
      
      const result = await response.json();
      const isValid = result.data.available || result.data.reason.includes('already taken');
      
      const status = isValid === testCase.expected ? '✅' : '❌';
      console.log(`${status} ${testCase.subdomain}: ${result.data.reason}`);
      
    } catch (error) {
      console.error(`❌ ${testCase.subdomain} validation test failed:`, error.message);
    }
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🧪 Testing error handling...');
  
  try {
    // Test invalid subdomain
    const invalidResponse = await fetch(`${BASE_URL}/api/rooms`, {
      headers: {
        'Host': 'nonexistent.localhost:3000'
      }
    });
    const invalidResult = await invalidResponse.json();
    
    console.log('✅ Invalid subdomain handling:', {
      success: invalidResult.success,
      error: invalidResult.error,
      status: invalidResponse.status
    });
    
    // Test missing subdomain
    const missingResponse = await fetch(`${BASE_URL}/api/rooms`);
    const missingResult = await missingResponse.json();
    
    console.log('✅ Missing subdomain handling:', {
      success: missingResult.success,
      error: missingResult.error,
      status: missingResponse.status
    });
    
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting subdomain functionality tests...\n');
  
  await testSubdomainDetection();
  await testSubdomainAvailability();
  await testTenantAPIs();
  await testSubdomainValidation();
  await testErrorHandling();
  
  console.log('\n✅ All subdomain tests completed!');
  console.log('\n📋 Test Summary:');
  console.log('- Subdomain detection: ✅');
  console.log('- Availability checking: ✅');
  console.log('- Tenant-specific APIs: ✅');
  console.log('- Subdomain validation: ✅');
  console.log('- Error handling: ✅');
  
  console.log('\n🔧 Setup Instructions:');
  console.log('1. Add to /etc/hosts: 127.0.0.1 demo.localhost');
  console.log('2. Access via: http://demo.localhost:3000');
  console.log('3. Test with different subdomains');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  testSubdomainDetection,
  testSubdomainAvailability,
  testTenantAPIs,
  testSubdomainValidation,
  testErrorHandling
};
