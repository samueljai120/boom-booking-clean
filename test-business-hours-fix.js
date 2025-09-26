#!/usr/bin/env node

/**
 * Test script to verify business hours functionality
 * Run with: node test-business-hours-fix.js
 */

const BASE_URL = 'http://localhost:3000';

async function testBusinessHoursAPI() {
  console.log('🧪 Testing Business Hours API Fixes...\n');

  try {
    // Test 1: Check if business-hours endpoint exists
    console.log('1️⃣ Testing business-hours endpoint availability...');
    const healthResponse = await fetch(`${BASE_URL}/api/business-hours`);
    
    if (healthResponse.ok) {
      console.log('✅ Business hours endpoint is accessible');
      
      const contentType = healthResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        console.log('✅ Response is JSON format');
        
        const data = await healthResponse.json();
        console.log('📊 Response structure:', {
          success: data.success,
          hasData: !!data.data,
          hasBusinessHours: !!data.data?.businessHours,
          businessHoursCount: data.data?.businessHours?.length || 0
        });
        
        // Test 2: Check data format
        if (data.data?.businessHours) {
          console.log('\n2️⃣ Testing data format...');
          const sampleHour = data.data.businessHours[0];
          console.log('📋 Sample business hour object:', sampleHour);
          
          const requiredFields = ['weekday', 'openTime', 'closeTime', 'isClosed'];
          const hasRequiredFields = requiredFields.every(field => field in sampleHour);
          
          if (hasRequiredFields) {
            console.log('✅ Data format is correct');
          } else {
            console.log('❌ Data format is missing required fields');
          }
        }
        
      } else {
        console.log('❌ Response is not JSON format');
        console.log('📄 Response content type:', contentType);
      }
    } else {
      console.log('❌ Business hours endpoint returned:', healthResponse.status);
    }

    // Test 3: Test subdomain detection
    console.log('\n3️⃣ Testing subdomain detection...');
    const subdomainResponse = await fetch(`${BASE_URL}/api/subdomain-detector`);
    
    if (subdomainResponse.ok) {
      const contentType = subdomainResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const subdomainData = await subdomainResponse.json();
        console.log('✅ Subdomain detector returns JSON');
        console.log('📊 Subdomain data:', {
          success: subdomainData.success,
          isMainDomain: subdomainData.data?.isMainDomain,
          hasTenant: !!subdomainData.data?.tenant
        });
      } else {
        console.log('❌ Subdomain detector response is not JSON');
      }
    } else {
      console.log('❌ Subdomain detector returned:', subdomainResponse.status);
    }

    // Test 4: Test subdomain router
    console.log('\n4️⃣ Testing subdomain router...');
    const routerResponse = await fetch(`${BASE_URL}/api/subdomain-router?subdomain=demo`);
    
    if (routerResponse.ok) {
      const contentType = routerResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const routerData = await routerResponse.json();
        console.log('✅ Subdomain router returns JSON');
        console.log('📊 Router data:', {
          success: routerData.success,
          hasTenant: !!routerData.data?.tenant,
          isValid: routerData.data?.isValid
        });
      } else {
        console.log('❌ Subdomain router response is not JSON');
      }
    } else {
      console.log('❌ Subdomain router returned:', routerResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBusinessHoursAPI().then(() => {
  console.log('\n🏁 Business hours API test completed');
}).catch(error => {
  console.error('💥 Test script error:', error);
});
