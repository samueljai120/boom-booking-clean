# Subdomain Testing Guide

## Overview

This guide provides comprehensive testing procedures for the subdomain functionality in the multi-tenant booking system.

## Prerequisites

### 1. Local Development Setup
```bash
# Add to /etc/hosts (macOS/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 demo.localhost
127.0.0.1 tenant1.localhost
127.0.0.1 tenant2.localhost
127.0.0.1 mycompany.localhost
```

### 2. Environment Setup
```bash
# Start the development server
npm run dev

# Server should be running on http://localhost:3000
```

## Testing Procedures

### 1. Automated Testing

#### Run Test Script
```bash
# Run the automated test suite
node test-subdomain-apis.js

# Or with custom base URL
BASE_URL=https://your-app.vercel.app node test-subdomain-apis.js
```

#### Test Coverage
- ✅ Subdomain detection
- ✅ Availability checking
- ✅ Tenant-specific APIs
- ✅ Subdomain validation
- ✅ Error handling

### 2. Manual Testing

#### 2.1 Subdomain Detection

**Test Case 1: Main Domain**
```bash
curl http://localhost:3000/api/subdomain
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "subdomain": null,
    "tenant": null,
    "isMainDomain": true
  }
}
```

**Test Case 2: Valid Subdomain**
```bash
curl -H "Host: demo.localhost:3000" http://localhost:3000/api/subdomain
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "subdomain": "demo",
    "tenant": {
      "id": "uuid",
      "name": "Demo Karaoke",
      "subdomain": "demo",
      "planType": "pro"
    },
    "isMainDomain": false,
    "isValid": true
  }
}
```

#### 2.2 Subdomain Availability

**Test Case 1: Available Subdomain**
```bash
curl -X POST http://localhost:3000/api/subdomain \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "mycompany"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "subdomain": "mycompany",
    "available": true,
    "reason": "Available"
  }
}
```

**Test Case 2: Reserved Subdomain**
```bash
curl -X POST http://localhost:3000/api/subdomain \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "www"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "subdomain": "www",
    "available": false,
    "reason": "Subdomain is reserved"
  }
}
```

#### 2.3 Tenant-Specific APIs

**Test Case 1: Rooms API with Subdomain**
```bash
curl -H "Host: demo.localhost:3000" http://localhost:3000/api/rooms
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "name": "Room A",
      "capacity": 4,
      "category": "Standard"
    }
  ],
  "tenant": {
    "id": "uuid",
    "name": "Demo Karaoke",
    "subdomain": "demo",
    "planType": "pro"
  }
}
```

**Test Case 2: Business Hours API with Subdomain**
```bash
curl -H "Host: demo.localhost:3000" http://localhost:3000/api/business-hours
```

**Test Case 3: Bookings API with Subdomain**
```bash
curl -H "Host: demo.localhost:3000" http://localhost:3000/api/bookings
```

#### 2.4 Subdomain Validation

**Test Cases:**
```bash
# Valid subdomains
curl -X POST http://localhost:3000/api/subdomain \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "test123"}'

curl -X POST http://localhost:3000/api/subdomain \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "test-123"}'

# Invalid subdomains
curl -X POST http://localhost:3000/api/subdomain \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "invalid--subdomain"}'

curl -X POST http://localhost:3000/api/subdomain \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "a"}'

curl -X POST http://localhost:3000/api/subdomain \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "-test"}'
```

### 3. Browser Testing

#### 3.1 Frontend Subdomain Detection

**Test Case 1: Main Domain**
1. Navigate to `http://localhost:3000`
2. Open browser dev tools → Network tab
3. Check `/api/subdomain` request
4. Verify `isMainDomain: true`

**Test Case 2: Subdomain**
1. Navigate to `http://demo.localhost:3000`
2. Open browser dev tools → Network tab
3. Check `/api/subdomain` request
4. Verify tenant is automatically loaded

#### 3.2 SubdomainManager Component

**Test Case 1: Check Availability**
1. Navigate to tenant settings
2. Open SubdomainManager component
3. Enter subdomain: `mycompany`
4. Click "Check" button
5. Verify availability status

**Test Case 2: Update Subdomain**
1. Enter available subdomain
2. Click "Update Subdomain"
3. Verify success message
4. Check if page reloads with new subdomain

**Test Case 3: Visit Subdomain**
1. With existing subdomain
2. Click "Visit Subdomain" button
3. Verify new tab opens with subdomain URL

### 4. Integration Testing

#### 4.1 End-to-End Subdomain Flow

**Test Scenario: Complete Tenant Setup**
1. Create new tenant via `/api/tenants`
2. Set subdomain for tenant
3. Access tenant via subdomain URL
4. Verify all APIs work with subdomain
5. Test tenant isolation

**Test Scenario: Cross-Tenant Isolation**
1. Create two tenants with different subdomains
2. Access tenant1 via subdomain1
3. Access tenant2 via subdomain2
4. Verify data isolation between tenants

#### 4.2 Performance Testing

**Test Case 1: Subdomain Detection Performance**
```bash
# Measure response time for subdomain detection
time curl -H "Host: demo.localhost:3000" http://localhost:3000/api/subdomain
```

**Test Case 2: Concurrent Subdomain Requests**
```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl -H "Host: demo.localhost:3000" http://localhost:3000/api/subdomain &
done
wait
```

### 5. Security Testing

#### 5.1 Subdomain Validation

**Test Case 1: Malicious Subdomains**
```bash
# Test various malicious subdomain attempts
curl -H "Host: <script>alert('xss')</script>.localhost:3000" http://localhost:3000/api/subdomain
curl -H "Host: ../../../etc/passwd.localhost:3000" http://localhost:3000/api/subdomain
curl -H "Host: admin'; DROP TABLE tenants; --.localhost:3000" http://localhost:3000/api/subdomain
```

**Test Case 2: Reserved Subdomain Bypass**
```bash
# Test attempts to use reserved subdomains
curl -H "Host: www.localhost:3000" http://localhost:3000/api/subdomain
curl -H "Host: api.localhost:3000" http://localhost:3000/api/subdomain
curl -H "Host: admin.localhost:3000" http://localhost:3000/api/subdomain
```

#### 5.2 Tenant Isolation

**Test Case 1: Cross-Tenant Data Access**
1. Create tenant1 with subdomain1
2. Create tenant2 with subdomain2
3. Access tenant1 data via subdomain2
4. Verify no data leakage

**Test Case 2: Invalid Subdomain Access**
1. Access APIs with non-existent subdomain
2. Verify proper error handling
3. Verify no data exposure

### 6. Production Testing

#### 6.1 DNS Configuration

**Test Case 1: Wildcard DNS**
```bash
# Test wildcard subdomain resolution
nslookup *.yourdomain.com
```

**Test Case 2: SSL Certificates**
```bash
# Test SSL certificate for subdomains
openssl s_client -connect tenant1.yourdomain.com:443 -servername tenant1.yourdomain.com
```

#### 6.2 Vercel Configuration

**Test Case 1: Subdomain Routing**
1. Deploy to Vercel with wildcard domain
2. Test subdomain access
3. Verify proper routing

**Test Case 2: SSL Provisioning**
1. Check Vercel dashboard for SSL status
2. Verify automatic SSL for subdomains
3. Test HTTPS access

## Test Results Validation

### 1. Expected Behaviors

#### ✅ Subdomain Detection
- Main domain returns `isMainDomain: true`
- Valid subdomains return tenant information
- Invalid subdomains return `isValid: false`

#### ✅ Availability Checking
- Available subdomains return `available: true`
- Reserved subdomains return `available: false`
- Invalid format returns `available: false`

#### ✅ Tenant APIs
- APIs work with subdomain detection
- Tenant context is properly injected
- Data isolation is maintained

#### ✅ Validation
- Format validation works correctly
- Reserved subdomain blocking works
- Database uniqueness is enforced

### 2. Error Handling

#### ✅ Invalid Subdomains
- Returns 404 with proper error message
- No data exposure
- Graceful degradation

#### ✅ Missing Subdomains
- Returns 400 with clear error
- Suggests proper usage
- Maintains security

#### ✅ Database Errors
- Proper error responses
- No sensitive information leaked
- Graceful fallbacks

## Troubleshooting

### 1. Common Issues

#### Issue: Subdomain Not Detected
**Symptoms:** APIs return "Tenant ID is required"
**Solutions:**
- Check DNS/hosts file configuration
- Verify Host header in requests
- Check subdomain middleware logs

#### Issue: Tenant Not Found
**Symptoms:** APIs return "Tenant not found or inactive"
**Solutions:**
- Verify tenant exists in database
- Check tenant status (must be 'active')
- Ensure tenant is not soft-deleted

#### Issue: SSL Certificate Errors
**Symptoms:** HTTPS access fails
**Solutions:**
- Check Vercel domain configuration
- Verify DNS propagation
- Wait for SSL certificate provisioning

### 2. Debug Commands

```bash
# Check subdomain detection
curl -v -H "Host: demo.localhost:3000" http://localhost:3000/api/subdomain

# Test database connection
curl http://localhost:3000/api/health

# Check tenant data
curl -H "Host: demo.localhost:3000" http://localhost:3000/api/tenants
```

## Performance Benchmarks

### 1. Response Times
- Subdomain detection: < 100ms
- Tenant API calls: < 200ms
- Availability checking: < 150ms

### 2. Concurrent Load
- 100 concurrent subdomain requests: < 500ms
- 1000 concurrent requests: < 2s

### 3. Memory Usage
- Subdomain middleware: < 1MB
- Tenant context: < 2MB

## Test Automation

### 1. CI/CD Integration
```yaml
# GitHub Actions example
- name: Test Subdomain Functionality
  run: |
    npm run test:subdomain
    node test-subdomain-apis.js
```

### 2. Monitoring
- Set up alerts for subdomain detection failures
- Monitor subdomain API response times
- Track subdomain creation/usage patterns

## Conclusion

The subdomain functionality provides:
- ✅ Complete tenant isolation
- ✅ Professional branding
- ✅ Easy access for customers
- ✅ Enterprise-ready features
- ✅ Secure implementation
- ✅ High performance

All tests should pass before deploying to production.
