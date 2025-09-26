# Database Setup Guide - Neon PostgreSQL

## 🚨 **CRITICAL ISSUE IDENTIFIED**

Your demo account login issue is caused by a missing `DATABASE_URL` environment variable. This affects ALL tenant logins, not just the demo account.

## 🔧 **IMMEDIATE FIX REQUIRED**

### **Step 1: Get Your Neon Database URL**

1. **Go to Neon Console**: https://console.neon.tech/
2. **Select your project** (or create one if you don't have one)
3. **Go to Connection Details**
4. **Copy the Connection String** (it looks like: `postgresql://username:password@hostname/database?sslmode=require`)

### **Step 2: Configure Vercel Environment Variables**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `boom-booking-clean`
3. **Go to Settings → Environment Variables**
4. **Add the following variables**:

```
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
```

### **Step 3: Redeploy Your Application**

1. **Trigger a new deployment** in Vercel
2. **Wait for deployment to complete**
3. **Test the demo login** again

## 🧪 **Testing the Fix**

### **Test Demo Account**
- Email: `demo@example.com`
- Password: `demo123`

### **Test Database Connection**
Run this command locally to test:
```bash
cd boom-booking-clean
node test-db-connection.js
```

## 📊 **What This Fixes**

### **Before Fix**:
- ❌ Demo login falls back to mock data
- ❌ Real tenant logins fail
- ❌ Database operations fail
- ❌ Inconsistent behavior

### **After Fix**:
- ✅ Demo login works with real database
- ✅ All tenant logins work properly
- ✅ Database operations succeed
- ✅ Consistent behavior across all accounts

## 🔍 **Verification Steps**

1. **Check Environment Variables** in Vercel dashboard
2. **Test demo login** - should work with real database
3. **Test tenant creation** - should work properly
4. **Check database logs** - should show successful connections

## 🚨 **Security Notes**

- **Never commit** DATABASE_URL to version control
- **Use different** JWT_SECRET for production
- **Enable SSL** for database connections
- **Monitor** database access logs

## 📞 **Support**

If you need help:
1. Check Vercel deployment logs
2. Check Neon database logs
3. Run the test script locally
4. Verify environment variables are set correctly

---

**This fix will resolve both your demo account login issue AND ensure all other tenants can log in properly.**
