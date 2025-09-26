# Production Deployment Guide - Boom Booking Clean

## 🚀 Quick Deployment Checklist

### ✅ Pre-Deployment (5 minutes)
- [ ] Set up Neon PostgreSQL database
- [ ] Configure environment variables
- [ ] Test local functionality

### ✅ Deployment (30 minutes)
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Test production functionality

---

## 📋 Step-by-Step Deployment

### 1. Database Setup (5 minutes)

#### Create Neon Database:
1. Go to [Neon Console](https://console.neon.tech/)
2. Create new project: "boom-booking-production"
3. Copy connection string
4. Update `.env.production` with your `DATABASE_URL`

#### Initialize Database Schema:
```bash
# The database will auto-initialize on first API call
# Or run manually:
curl https://your-app.vercel.app/api/health
```

### 2. Environment Configuration (5 minutes)

#### Required Environment Variables:
```bash
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secure-secret-key
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
```

#### Vercel Environment Setup:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all variables from `.env.production`
3. Set for Production environment

### 3. Deploy to Vercel (15 minutes)

#### Method 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Method 2: GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

### 4. Domain Configuration (10 minutes)

#### Custom Domain Setup:
1. Add custom domain in Vercel Dashboard
2. Configure DNS records:
   - A record: `@` → Vercel IP
   - CNAME: `www` → `cname.vercel-dns.com`
3. Enable SSL (automatic)

#### Subdomain Configuration:
1. Add wildcard domain: `*.yourdomain.com`
2. Configure DNS:
   - CNAME: `*` → `wildcard.vercel-dns.com`
3. SSL certificates auto-provision

---

## 🧪 Testing Production Deployment

### 1. Health Check
```bash
curl https://your-app.vercel.app/api/health
```

### 2. Subdomain Testing
```bash
# Test main domain
curl https://your-app.vercel.app/api/subdomain

# Test subdomain (if configured)
curl -H "Host: demo.yourdomain.com" https://your-app.vercel.app/api/subdomain
```

### 3. API Endpoints
```bash
# Test rooms API
curl https://your-app.vercel.app/api/rooms

# Test business hours
curl https://your-app.vercel.app/api/business-hours
```

---

## 🔧 Production Configuration

### Vercel Configuration (`vercel.json`):
```json
{
  "version": 2,
  "buildCommand": "npm ci && npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "/api",
    "VITE_WS_URL": "",
    "VITE_APP_NAME": "Boom Karaoke Booking",
    "VITE_APP_VERSION": "1.0.0"
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "trailingSlash": false,
  "cleanUrls": false,
  "regions": ["iad1"]
}
```

### Package.json Scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

---

## 🚨 Troubleshooting

### Common Issues:

#### 1. Database Connection Error
**Error**: `NeonDbError: connection failed`
**Solution**: 
- Check `DATABASE_URL` format
- Verify database is active
- Check network connectivity

#### 2. Build Failures
**Error**: `Build failed`
**Solution**:
- Check Node.js version (20.x required)
- Verify all dependencies installed
- Check for syntax errors

#### 3. API Routes Not Working
**Error**: `404 Not Found`
**Solution**:
- Verify `vercel.json` configuration
- Check file structure in `/api` folder
- Ensure proper exports

#### 4. Subdomain Issues
**Error**: `Subdomain not detected`
**Solution**:
- Configure wildcard DNS
- Check Vercel domain settings
- Verify SSL certificates

---

## 📊 Performance Optimization

### Build Optimization:
- ✅ Code splitting enabled
- ✅ Tree shaking active
- ✅ Minification enabled
- ✅ Gzip compression

### Runtime Optimization:
- ✅ Serverless functions auto-scale
- ✅ Edge caching enabled
- ✅ CDN distribution
- ✅ Database connection pooling

---

## 🔒 Security Checklist

### Production Security:
- ✅ HTTPS enforced
- ✅ CORS properly configured
- ✅ JWT tokens secured
- ✅ Environment variables protected
- ✅ SQL injection prevention
- ✅ Input validation active

### Monitoring:
- ✅ Error tracking ready
- ✅ Performance monitoring
- ✅ Security headers
- ✅ Rate limiting

---

## 🎯 Post-Deployment

### Immediate Actions:
1. **Test all functionality**
2. **Configure monitoring**
3. **Set up backups**
4. **Create admin accounts**

### Business Setup:
1. **Configure Stripe billing**
2. **Set up customer onboarding**
3. **Create marketing materials**
4. **Launch customer acquisition**

---

## 📞 Support

### Documentation:
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Neon Database Guide](https://neon.tech/docs)
- [Stripe Integration Guide](https://stripe.com/docs)

### Emergency Contacts:
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Neon Support: [neon.tech/support](https://neon.tech/support)

---

## 🎉 Success Criteria

### Deployment Complete When:
- ✅ Application accessible via custom domain
- ✅ All API endpoints responding correctly
- ✅ Database connected and functional
- ✅ Subdomain routing working
- ✅ SSL certificates active
- ✅ Performance metrics acceptable

**🚀 Ready for customer onboarding and revenue generation!**
