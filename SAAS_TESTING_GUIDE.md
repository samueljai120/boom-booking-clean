# SaaS Testing Guide

## 🎯 Overview

This guide provides comprehensive testing procedures for the newly implemented SaaS infrastructure including multi-tenancy, Stripe billing, and usage tracking.

## 🚀 Quick Start Testing

### 1. Environment Setup

Create a `.env.local` file with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@hostname:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Stripe Configuration (Required for billing features)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

## 🧪 API Testing

### Multi-Tenancy APIs

#### Create Tenant
```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Karaoke Business",
    "subdomain": "test-karaoke",
    "plan_type": "pro",
    "settings": {
      "timezone": "America/New_York",
      "currency": "USD"
    }
  }'
```

#### Get Tenants
```bash
curl http://localhost:3000/api/tenants
```

#### Get Specific Tenant
```bash
curl "http://localhost:3000/api/tenants?id=TENANT_ID"
```

#### Update Tenant
```bash
curl -X PUT "http://localhost:3000/api/tenants?id=TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Business Name",
    "plan_type": "business"
  }'
```

#### Delete Tenant
```bash
curl -X DELETE "http://localhost:3000/api/tenants?id=TENANT_ID"
```

### Billing APIs

#### Get Billing Information
```bash
curl "http://localhost:3000/api/billing?tenant_id=TENANT_ID"
```

#### Create Subscription (Requires Stripe Setup)
```bash
curl -X POST http://localhost:3000/api/billing \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "TENANT_ID",
    "price_id": "price_pro",
    "payment_method_id": "pm_test_123"
  }'
```

#### Update Subscription
```bash
curl -X PUT http://localhost:3000/api/billing \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "TENANT_ID",
    "price_id": "price_business"
  }'
```

#### Cancel Subscription
```bash
curl -X DELETE http://localhost:3000/api/billing \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "TENANT_ID"
  }'
```

### Usage Tracking APIs

#### Get Usage Statistics
```bash
curl "http://localhost:3000/api/usage?tenant_id=TENANT_ID&period=current_month"
```

#### Check Usage Limits
```bash
curl -X POST http://localhost:3000/api/usage \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "TENANT_ID",
    "resource_type": "rooms",
    "resource_count": 1
  }'
```

### Updated Existing APIs

#### Get Rooms (Tenant-Filtered)
```bash
curl "http://localhost:3000/api/rooms?tenant_id=TENANT_ID"
```

#### Get Bookings (Tenant-Filtered)
```bash
curl "http://localhost:3000/api/bookings?tenant_id=TENANT_ID"
```

#### Create Booking (Tenant-Aware)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "TENANT_ID",
    "room_id": "ROOM_ID",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T12:00:00Z",
    "notes": "Test booking"
  }'
```

#### Get Business Hours (Tenant-Filtered)
```bash
curl "http://localhost:3000/api/business-hours?tenant_id=TENANT_ID"
```

## 🎨 Frontend Testing

### 1. Tenant Management

1. **Navigate to the application**
2. **Check Tenant Switcher**: Look for tenant switcher in the header
3. **Create New Tenant**: Use the "New Tenant" button
4. **Switch Between Tenants**: Test tenant switching functionality
5. **Verify Data Isolation**: Ensure data is properly separated

### 2. Billing Dashboard

1. **Access Billing Dashboard**: Navigate to billing section
2. **View Usage Statistics**: Check room, booking, and user counts
3. **Verify Plan Limits**: Ensure limits are displayed correctly
4. **Test Upgrade Prompts**: Trigger usage limit warnings

### 3. Multi-Tenant Data

1. **Create Bookings**: Make bookings in different tenants
2. **Verify Isolation**: Ensure bookings don't appear in wrong tenant
3. **Test Room Management**: Create rooms in different tenants
4. **Check Business Hours**: Verify tenant-specific business hours

## 🔍 Database Testing

### Schema Validation

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify tenant isolation
SELECT t.name, COUNT(r.id) as room_count, COUNT(b.id) as booking_count
FROM tenants t
LEFT JOIN rooms r ON t.id = r.tenant_id AND r.deleted_at IS NULL
LEFT JOIN bookings b ON t.id = b.tenant_id AND b.deleted_at IS NULL
GROUP BY t.id, t.name;

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema='public';
```

## 🚨 Common Issues & Solutions

### 1. Database Connection Issues

**Problem**: "No database connection string was provided"
**Solution**: Ensure `DATABASE_URL` is set in environment variables

### 2. Stripe Configuration Issues

**Problem**: "Stripe is not configured"
**Solution**: Set `STRIPE_SECRET_KEY` environment variable

### 3. Tenant ID Missing

**Problem**: "Tenant ID is required"
**Solution**: Ensure all API calls include `tenant_id` parameter

### 4. Foreign Key Violations

**Problem**: Database constraint errors
**Solution**: Ensure proper table creation order and data relationships

## 📊 Test Scenarios

### Scenario 1: New Tenant Onboarding

1. Create a new tenant with "free" plan
2. Verify default business hours are created
3. Check usage limits are enforced
4. Test room creation within limits
5. Verify upgrade prompts appear when limits reached

### Scenario 2: Subscription Management

1. Create tenant with "pro" plan
2. Set up Stripe subscription
3. Verify billing information is displayed
4. Test plan upgrade/downgrade
5. Test subscription cancellation

### Scenario 3: Data Isolation

1. Create two tenants
2. Add rooms and bookings to each
3. Verify data doesn't leak between tenants
4. Test tenant switching
5. Confirm proper data filtering

### Scenario 4: Usage Tracking

1. Create bookings in different tenants
2. Verify usage statistics are accurate
3. Test limit enforcement
4. Check upgrade prompts
5. Verify plan-based restrictions

## ✅ Success Criteria

- [ ] All API endpoints respond correctly
- [ ] Tenant data is properly isolated
- [ ] Usage limits are enforced
- [ ] Billing information displays correctly
- [ ] Frontend tenant switching works
- [ ] Database schema is valid
- [ ] No linting errors
- [ ] All tests pass

## 🚀 Production Readiness Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Stripe keys configured
- [ ] SSL certificates installed
- [ ] Monitoring setup
- [ ] Error logging configured
- [ ] Performance testing completed
- [ ] Security audit passed

## 📞 Support

For issues or questions:
1. Check the troubleshooting guide
2. Review API documentation
3. Check environment configuration
4. Verify database connectivity
5. Test with minimal data first

---

**Ready to launch your SaaS karaoke booking platform!** 🎉
