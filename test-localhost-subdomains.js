#!/usr/bin/env node

/**
 * Test Localhost Subdomain Functionality
 * Tests subdomain detection and routing on localhost
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'http://localhost:3000/api';

async function testSubdomainFunctionality() {
  console.log('🧪 Testing Localhost Subdomain Functionality\n');

  const testCases = [
    {
      name: 'Main Domain (No Subdomain)',
      url: `${API_BASE_URL}/subdomain-router`,
      expectedSubdomain: null,
      description: 'Should detect main domain'
    },
    {
      name: 'Demo Subdomain (Query Parameter)',
      url: `${API_BASE_URL}/subdomain-router?subdomain=demo`,
      expectedSubdomain: 'demo',
      description: 'Should detect demo subdomain from query'
    },
    {
      name: 'Test Subdomain (Query Parameter)',
      url: `${API_BASE_URL}/subdomain-router?subdomain=test`,
      expectedSubdomain: 'test',
      description: 'Should detect test subdomain from query'
    },
    {
      name: 'Customer1 Subdomain (Query Parameter)',
      url: `${API_BASE_URL}/subdomain-router?subdomain=customer1`,
      expectedSubdomain: 'customer1',
      description: 'Should detect customer1 subdomain from query'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    try {
      console.log(`🔍 Testing: ${testCase.name}`);
      console.log(`   URL: ${testCase.url}`);
      console.log(`   Expected: ${testCase.expectedSubdomain}`);
      
      const response = await fetch(testCase.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`   ❌ HTTP Error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      
      if (data.success) {
        const detectedSubdomain = data.data?.subdomain;
        const isMainDomain = data.data?.isMainDomain;
        
        if (testCase.expectedSubdomain === null) {
          // Should be main domain
          if (isMainDomain && detectedSubdomain === null) {
            console.log(`   ✅ PASS: Detected main domain correctly`);
            passedTests++;
          } else {
            console.log(`   ❌ FAIL: Expected main domain, got subdomain: ${detectedSubdomain}`);
          }
        } else {
          // Should detect subdomain
          if (detectedSubdomain === testCase.expectedSubdomain && !isMainDomain) {
            console.log(`   ✅ PASS: Detected subdomain '${detectedSubdomain}' correctly`);
            passedTests++;
          } else {
            console.log(`   ❌ FAIL: Expected '${testCase.expectedSubdomain}', got '${detectedSubdomain}'`);
          }
        }
      } else {
        console.log(`   ❌ API Error: ${data.error || 'Unknown error'}`);
      }
      
      console.log(`   📋 Response: ${JSON.stringify(data, null, 2)}\n`);
      
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}\n`);
    }
  }

  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All subdomain tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the server configuration.');
  }

  console.log('\n🔧 Troubleshooting Tips:');
  console.log('1. Make sure the server is running: npm run start');
  console.log('2. Check if the server is listening on port 3000');
  console.log('3. Verify the subdomain-router endpoint exists');
  console.log('4. Check server logs for any errors');

  console.log('\n🌐 Localhost Subdomain URLs to Test:');
  console.log('• Main: http://localhost:3000');
  console.log('• Demo: http://localhost:3000?subdomain=demo');
  console.log('• Test: http://localhost:3000?subdomain=test');
  console.log('• Customer1: http://localhost:3000?subdomain=customer1');

  console.log('\n📝 To enable real subdomain URLs:');
  console.log('1. Add to /etc/hosts (macOS/Linux):');
  console.log('   127.0.0.1 demo.localhost');
  console.log('   127.0.0.1 test.localhost');
  console.log('   127.0.0.1 customer1.localhost');
  console.log('2. Then test: http://demo.localhost:3000');
}

// Run the test
testSubdomainFunctionality().catch(console.error);
