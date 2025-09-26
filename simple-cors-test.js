#!/usr/bin/env node

/**
 * Simple CORS Test
 * Quick test to verify CORS headers are working
 */

const BASE_URL = 'https://boom-booking-clean-v1.vercel.app';
const FRONTEND_URL = 'https://boom-booking-clean-v1-466avod5w-samueljai120s-projects.vercel.app';

async function testCORS() {
  console.log('🧪 Testing CORS Configuration');
  console.log(`   API URL: ${BASE_URL}`);
  console.log(`   Frontend URL: ${FRONTEND_URL}`);
  
  try {
    // Test OPTIONS request (preflight)
    console.log('\n📡 Testing OPTIONS request...');
    const optionsResponse = await fetch(`${BASE_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`   Status: ${optionsResponse.status}`);
    
    // Check CORS headers
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials',
      'access-control-max-age'
    ];
    
    console.log('\n📋 CORS Headers:');
    corsHeaders.forEach(header => {
      const value = optionsResponse.headers.get(header);
      console.log(`   ${header}: ${value || '❌ MISSING'}`);
    });
    
    // Test GET request
    console.log('\n📡 Testing GET request...');
    const getResponse = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${getResponse.status}`);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    }
    
    // Check if CORS headers are present
    const originHeader = getResponse.headers.get('access-control-allow-origin');
    if (originHeader === FRONTEND_URL || originHeader === '*') {
      console.log('\n✅ CORS is properly configured!');
      console.log('   Cross-origin requests should work.');
    } else {
      console.log('\n❌ CORS configuration issue detected.');
      console.log(`   Origin header: ${originHeader}`);
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
}

// Run the test
testCORS();
