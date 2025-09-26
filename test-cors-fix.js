#!/usr/bin/env node

/**
 * CORS Fix Testing Script
 * Tests all API endpoints to ensure CORS headers are properly configured
 */

// Using built-in fetch (Node.js 18+)
// import fetch from 'node-fetch'; // Not needed for Node.js 18+

const BASE_URL = process.env.BASE_URL || 'https://boom-booking-clean-v1.vercel.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://boom-booking-clean-v1-466avod5w-samueljai120s-projects.vercel.app';

const API_ENDPOINTS = [
  '/api/health',
  '/api/business-hours',
  '/api/subdomain',
  '/api/rooms',
  '/api/auth/login',
  '/api/auth/me',
  '/api/bookings',
  '/api/tenants',
  '/api/billing',
  '/api/usage'
];

const REQUIRED_CORS_HEADERS = [
  'access-control-allow-origin',
  'access-control-allow-methods',
  'access-control-allow-headers',
  'access-control-allow-credentials',
  'access-control-max-age'
];

/**
 * Test CORS headers for a specific endpoint
 */
async function testCORSEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  
  console.log(`\n🧪 Testing CORS for: ${endpoint}`);
  console.log(`   URL: ${url}`);
  
  try {
    // Test OPTIONS request (preflight)
    console.log('   Testing OPTIONS request...');
    const optionsResponse = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`   OPTIONS Status: ${optionsResponse.status}`);
    
    // Check CORS headers
    const corsHeaders = {};
    REQUIRED_CORS_HEADERS.forEach(header => {
      const value = optionsResponse.headers.get(header);
      corsHeaders[header] = value;
      console.log(`   ${header}: ${value || '❌ MISSING'}`);
    });
    
    // Test actual GET request
    console.log('   Testing GET request...');
    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   GET Status: ${getResponse.status}`);
    
    // Check if CORS headers are present in GET response too
    const getCorsHeaders = {};
    REQUIRED_CORS_HEADERS.forEach(header => {
      const value = getResponse.headers.get(header);
      getCorsHeaders[header] = value;
      if (value) {
        console.log(`   ✅ ${header}: ${value}`);
      } else {
        console.log(`   ❌ ${header}: MISSING`);
      }
    });
    
    // Determine if CORS is properly configured
    const hasAllHeaders = REQUIRED_CORS_HEADERS.every(header => 
      corsHeaders[header] || getCorsHeaders[header]
    );
    
    if (hasAllHeaders) {
      console.log(`   ✅ CORS properly configured for ${endpoint}`);
      return { endpoint, status: 'success', corsHeaders: { ...corsHeaders, ...getCorsHeaders } };
    } else {
      console.log(`   ❌ CORS missing headers for ${endpoint}`);
      return { endpoint, status: 'failed', corsHeaders: { ...corsHeaders, ...getCorsHeaders } };
    }
    
  } catch (error) {
    console.log(`   ❌ Error testing ${endpoint}: ${error.message}`);
    return { endpoint, status: 'error', error: error.message };
  }
}

/**
 * Test cross-origin request simulation
 */
async function testCrossOriginRequest() {
  console.log('\n🌐 Testing Cross-Origin Request Simulation');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log(`   Response Status: ${response.status}`);
    console.log(`   Response Data:`, JSON.stringify(data, null, 2));
    
    // Check if the response includes CORS headers
    const originHeader = response.headers.get('access-control-allow-origin');
    if (originHeader === FRONTEND_URL || originHeader === '*') {
      console.log('   ✅ Cross-origin request would be allowed');
      return true;
    } else {
      console.log(`   ❌ Cross-origin request would be blocked. Origin header: ${originHeader}`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Cross-origin request failed: ${error.message}`);
    return false;
  }
}

/**
 * Main testing function
 */
async function runCORSTests() {
  console.log('🚀 Starting CORS Fix Testing');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Frontend URL: ${FRONTEND_URL}`);
  console.log(`   Testing ${API_ENDPOINTS.length} endpoints...`);
  
  const results = [];
  
  // Test each endpoint
  for (const endpoint of API_ENDPOINTS) {
    const result = await testCORSEndpoint(endpoint);
    results.push(result);
  }
  
  // Test cross-origin request
  const crossOriginSuccess = await testCrossOriginRequest();
  
  // Summary
  console.log('\n📊 CORS Test Summary');
  console.log('==================');
  
  const successCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`✅ Successful: ${successCount}/${API_ENDPOINTS.length}`);
  console.log(`❌ Failed: ${failedCount}/${API_ENDPOINTS.length}`);
  console.log(`🚫 Errors: ${errorCount}/${API_ENDPOINTS.length}`);
  console.log(`🌐 Cross-Origin: ${crossOriginSuccess ? '✅ Working' : '❌ Blocked'}`);
  
  // Detailed results
  console.log('\n📋 Detailed Results:');
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : result.status === 'failed' ? '❌' : '🚫';
    console.log(`   ${status} ${result.endpoint}: ${result.status}`);
  });
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (failedCount > 0 || errorCount > 0) {
    console.log('   - Check that all API endpoints include proper CORS headers');
    console.log('   - Verify vercel.json configuration includes CORS headers');
    console.log('   - Ensure environment variables are properly set');
    console.log('   - Test deployment after making changes');
  } else {
    console.log('   - CORS configuration looks good!');
    console.log('   - Consider testing with actual frontend deployment');
    console.log('   - Monitor for any CORS-related issues in production');
  }
  
  return {
    success: successCount === API_ENDPOINTS.length && crossOriginSuccess,
    results,
    crossOriginSuccess
  };
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCORSTests()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 All CORS tests passed!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Some CORS tests failed. Please review the results above.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { runCORSTests, testCORSEndpoint, testCrossOriginRequest };
