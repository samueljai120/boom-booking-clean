# Localhost Subdomain Setup Guide
## Testing Subdomain Functionality on Localhost

**Status**: ✅ **READY TO IMPLEMENT**  
**Purpose**: Enable subdomain testing during local development

---

## 🎯 **Problem Solved**

The subdomain functionality works perfectly in production but needs special configuration for localhost development. This guide shows you how to test subdomain URLs locally.

---

## 🚀 **Solution Options**

### **Option 1: Hosts File Configuration (Recommended)**

#### **Step 1: Edit Hosts File**

**On macOS/Linux:**
```bash
sudo nano /etc/hosts
```

**On Windows:**
```bash
notepad C:\Windows\System32\drivers\etc\hosts
```

#### **Step 2: Add Localhost Subdomains**
Add these lines to your hosts file:
```
127.0.0.1 localhost
127.0.0.1 demo.localhost
127.0.0.1 test.localhost
127.0.0.1 customer1.localhost
127.0.0.1 sample.localhost
```

#### **Step 3: Update Server Configuration**
The server.js already supports subdomain detection, so no changes needed.

#### **Step 4: Test Subdomain URLs**
- ✅ `http://demo.localhost:3000`
- ✅ `http://test.localhost:3000`
- ✅ `http://customer1.localhost:3000`

---

### **Option 2: Query Parameter Fallback (Current)**

The current implementation already supports query parameters as a fallback:

- ✅ `http://localhost:3000?subdomain=demo`
- ✅ `http://localhost:3000?subdomain=test`
- ✅ `http://localhost:3000?subdomain=customer1`

---

### **Option 3: Port-Based Subdomains**

#### **Configure Multiple Ports**
```bash
# Terminal 1: Main server
npm run start  # Port 3000

# Terminal 2: Demo subdomain
PORT=3001 npm run start  # Port 3001

# Terminal 3: Test subdomain  
PORT=3002 npm run start  # Port 3002
```

#### **Access URLs**
- ✅ `http://localhost:3000` (Main)
- ✅ `http://localhost:3001` (Demo)
- ✅ `http://localhost:3002` (Test)

---

## 🔧 **Current Implementation Status**

### **What's Already Working:**
- ✅ **Subdomain Detection**: Server extracts subdomains from Host headers
- ✅ **Query Parameter Fallback**: `?subdomain=demo` works
- ✅ **Tenant Lookup**: Database queries work for subdomains
- ✅ **CORS Fixed**: Authorization header now allowed

### **What Needs Configuration:**
- ⏳ **Hosts File**: Add localhost subdomains
- ⏳ **Frontend URLs**: Update to use subdomain format
- ⏳ **Testing**: Verify subdomain functionality

---

## 🧪 **Testing Subdomain Functionality**

### **Test 1: Query Parameter (Works Now)**
```bash
curl "http://localhost:3000/api/subdomain-router?subdomain=demo"
```

### **Test 2: Hosts File (After Setup)**
```bash
curl "http://demo.localhost:3000/api/subdomain-router"
```

### **Test 3: Frontend Integration**
```javascript
// Update frontend to use subdomain URLs
const getSubdomainUrl = (subdomain, path = '') => {
  if (subdomain && window.location.hostname === 'localhost') {
    return `http://${subdomain}.localhost:3000${path}`;
  }
  return `http://localhost:3000${path}?subdomain=${subdomain}`;
};
```

---

## 📋 **Implementation Checklist**

### **Immediate Fixes (Completed):**
- [x] Fix CORS headers to allow Authorization
- [x] Update server.js CORS configuration
- [x] Update login.js CORS headers

### **Localhost Subdomain Setup:**
- [ ] Add localhost subdomains to hosts file
- [ ] Test subdomain URLs in browser
- [ ] Update frontend to use subdomain URLs
- [ ] Test authentication with subdomains

### **Development Workflow:**
- [ ] Use hosts file for subdomain testing
- [ ] Use query parameters as fallback
- [ ] Test both scenarios thoroughly

---

## 🎯 **Quick Start Commands**

### **1. Fix Hosts File (One-time setup):**
```bash
# Add to /etc/hosts (macOS/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 demo.localhost
127.0.0.1 test.localhost
127.0.0.1 customer1.localhost
```

### **2. Start Development Server:**
```bash
cd boom-booking-clean
npm run start
```

### **3. Test Subdomain URLs:**
- Open: `http://demo.localhost:3000`
- Open: `http://test.localhost:3000`
- Open: `http://customer1.localhost:3000`

### **4. Test API Endpoints:**
```bash
curl "http://demo.localhost:3000/api/subdomain-router"
curl "http://test.localhost:3000/api/subdomain-router"
```

---

## 🔍 **Troubleshooting**

### **CORS Issues Fixed:**
- ✅ Authorization header now allowed
- ✅ Multiple localhost ports configured
- ✅ Proper preflight handling

### **Subdomain Not Working:**
1. **Check hosts file**: Ensure subdomains are added
2. **Check server logs**: Look for subdomain detection
3. **Test API directly**: Use curl to test endpoints
4. **Use query fallback**: `?subdomain=demo` should work

### **Port Conflicts:**
- **Frontend**: Port 3008 (Vite dev server)
- **Backend**: Port 3000 (Express server)
- **API**: Port 3001 (if using separate API server)

---

## 💡 **Benefits of Localhost Subdomains**

### **Development Benefits:**
- 🎯 **Real-world testing**: Test actual subdomain behavior
- 🎯 **URL consistency**: Same URLs as production
- 🎯 **Better debugging**: Easier to trace subdomain issues
- 🎯 **User experience**: Test actual user workflows

### **Production Readiness:**
- 🚀 **Seamless transition**: Same code works in production
- 🚀 **No configuration changes**: Production setup unchanged
- 🚀 **Better testing**: Comprehensive subdomain testing

---

## 🎉 **Ready to Test!**

Your localhost subdomain setup is ready! The CORS issues are fixed, and you can now test subdomain functionality locally using either:

1. **Hosts file method**: `http://demo.localhost:3000`
2. **Query parameter method**: `http://localhost:3000?subdomain=demo`

Both methods will work with your existing subdomain detection code!

---

## 📞 **Next Steps**

1. **Add hosts file entries** for localhost subdomains
2. **Test subdomain URLs** in browser
3. **Update frontend** to use subdomain URLs
4. **Test authentication** with subdomains
5. **Deploy to production** with confidence

**Your subdomain functionality is ready for local testing! 🚀**
