# 🎤 Boom Booking Clean

**Professional Multi-Tenant SaaS Platform for Karaoke Room Booking**

A production-ready, enterprise-grade SaaS platform built with React, Vercel, and Neon PostgreSQL, featuring professional subdomain support and multi-tenant architecture.

## 🚀 Repository Structure

### Branches
- **`main`**: Production-ready code (deployed to Vercel)
- **`development`**: Active development with full source code and testing tools

### Quick Start
```bash
# Production version (main branch)
git clone https://github.com/samueljai120/boom-booking-clean.git
cd boom-booking-clean
npm install && npm run build

# Development version (development branch)
git checkout development
npm install && npm run dev:full
```

## 🏢 Enterprise Features

- **🌐 Multi-Tenant Architecture**: Complete tenant isolation with subdomain support
- **🏷️ Professional Branding**: White-label subdomains (customer.yourdomain.com)
- **💳 Subscription Billing**: Stripe integration for recurring payments
- **📊 Usage Tracking**: Enforce subscription limits and monitor usage
- **🔒 Enterprise Security**: JWT authentication, input validation, SQL injection prevention
- **📱 Responsive Design**: Works perfectly on desktop and mobile
- **⚡ Real-time Updates**: Live booking updates via WebSocket
- **🎯 Scalable Infrastructure**: Vercel serverless + Neon PostgreSQL

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Vercel Serverless Functions
- **Database**: Neon PostgreSQL with multi-tenant schema
- **Authentication**: JWT tokens with refresh mechanism
- **Billing**: Stripe integration
- **Deployment**: Vercel with automatic SSL
- **Monitoring**: Built-in error tracking and performance monitoring

## 🚀 Production Deployment

### Live Application
- **Production URL**: https://boom-booking-clean-776y99eh5-samueljai120s-projects.vercel.app
- **Status**: ✅ Deployed and live
- **Environment**: Production with authentication protection

### Deployment Features
- ✅ **Vercel Serverless Functions** for API routes
- ✅ **Neon PostgreSQL** database with multi-tenancy
- ✅ **Automatic SSL** certificates
- ✅ **CDN Distribution** for global performance
- ✅ **Environment Variables** configuration
- ✅ **Production Security** with authentication

## 🧪 Development Environment

### Development Branch Features
- **Full Source Code**: Complete development environment
- **Development Server**: Express server with API routes
- **Hot Reload**: Instant updates during development
- **Testing Tools**: Comprehensive test scripts
- **Debug Mode**: Enhanced logging and error reporting
- **Mock Data**: Development data for testing

### Development Setup
```bash
# Switch to development branch
git checkout development

# Install dependencies
npm install

# Set up environment
cp .env.development .env.local

# Start development server
npm run dev:full
```

## 📊 Multi-Tenant Capabilities

### Tenant Management
- **Tenant Creation**: Easy tenant onboarding process
- **Subdomain Assignment**: Automatic subdomain generation
- **Data Isolation**: Complete tenant data separation
- **Plan Management**: Free, Basic, Pro, Business tiers
- **Usage Limits**: Enforce subscription limits

### Subdomain Support
- **Professional URLs**: `customer.yourdomain.com` format
- **Automatic Detection**: Server-side subdomain routing
- **SSL Certificates**: Automatic HTTPS for all subdomains
- **Custom Branding**: Tenant-specific branding and settings

## 🔧 API Architecture

### Core Endpoints
- **`/api/health`**: System health check
- **`/api/subdomain`**: Subdomain detection and management
- **`/api/tenants`**: Tenant CRUD operations
- **`/api/rooms`**: Room management with tenant filtering
- **`/api/bookings`**: Booking management with tenant isolation
- **`/api/business-hours`**: Business hours configuration
- **`/api/billing`**: Stripe subscription management
- **`/api/usage`**: Usage tracking and limits

### Security Features
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Proper cross-origin handling
- **Rate Limiting**: API rate limiting (configurable)

## 📁 Project Structure

```
boom-booking-clean/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   └── utils/             # Utility functions
├── api/                    # Vercel serverless functions
│   ├── auth/              # Authentication endpoints
│   ├── billing.js         # Stripe billing
│   ├── bookings.js        # Booking management
│   ├── rooms.js           # Room management
│   └── subdomain.js       # Subdomain handling
├── lib/                    # Shared libraries
│   ├── neon-db.js         # Database connection
│   └── subdomain-middleware.js
├── docs/                   # Documentation
└── .github/               # GitHub workflows and templates
```

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Complete user flow testing
- **Subdomain Tests**: Multi-tenant functionality testing

### Running Tests
```bash
# All tests
npm test

# API tests
node test-subdomain-apis.js
node test-detailed.js

# Linting
npm run lint
```

## 📚 Documentation

### Available Documentation
- **Production Deployment Guide**: `/PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Development Setup**: `/README-DEVELOPMENT.md`
- **API Documentation**: `/docs/production/API_DOCUMENTATION.md`
- **Testing Guide**: `/SAAS_TESTING_GUIDE.md`
- **Subdomain Setup**: `/SUBDOMAIN_TESTING_GUIDE.md`
- **Contributing Guide**: `/CONTRIBUTING.md`

## 🎯 Business Model

### Revenue Streams
- **Subscription Plans**: Monthly/annual recurring revenue
- **Usage-Based Pricing**: Pay-per-booking models
- **Enterprise Features**: Advanced analytics and integrations
- **White-Label Licensing**: Custom branding solutions

### Target Market
- **Karaoke Bars**: Small to large establishments
- **Entertainment Venues**: Multi-purpose venues
- **Corporate Events**: Company entertainment bookings
- **Event Planners**: Professional booking management

## 🚀 Getting Started

### For Customers
1. **Sign Up**: Create account at main domain
2. **Choose Plan**: Select subscription tier
3. **Get Subdomain**: Receive branded subdomain
4. **Start Booking**: Begin managing bookings

### For Developers
1. **Fork Repository**: Create your fork
2. **Switch to Development**: `git checkout development`
3. **Set Up Environment**: Follow development guide
4. **Start Contributing**: Follow contributing guidelines

## 📞 Support

### Resources
- **Documentation**: Comprehensive guides in `/docs/`
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **API Reference**: Complete API documentation

### Contact
- **GitHub**: [samueljai120/boom-booking-clean](https://github.com/samueljai120/boom-booking-clean)
- **Production**: [Live Application](https://boom-booking-clean-776y99eh5-samueljai120s-projects.vercel.app)

## 🎉 Ready for Business!

**This is a complete, production-ready, enterprise-grade multi-tenant SaaS platform ready for:**
- ✅ **Customer onboarding** with branded subdomains
- ✅ **Revenue generation** through subscription billing
- ✅ **Enterprise sales** with white-label capabilities
- ✅ **Rapid scaling** to thousands of tenants
- ✅ **Professional market launch**

**🚀 Time to launch and start making money!**

---

**Built with ❤️ for the karaoke industry**