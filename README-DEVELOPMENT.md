# Boom Booking Clean - Development Branch

## 🚀 Development Environment

This is the **development branch** of the Boom Booking Clean multi-tenant SaaS platform. This branch contains:

- ✅ **Full source code** with development tools
- ✅ **Development server** (server.js) for local testing
- ✅ **Hot reload** and debugging features
- ✅ **Test files** and development utilities
- ✅ **Development environment** configuration
- ✅ **API testing** tools and scripts

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/samueljai120/boom-booking-clean.git
cd boom-booking-clean

# Switch to development branch
git checkout development

# Install dependencies
npm install

# Set up environment variables
cp .env.development .env.local
# Edit .env.local with your database credentials
```

### Development Server
```bash
# Start development server with API routes
npm run dev:full

# Or start Vite dev server only
npm run dev

# Or start Express server only
npm run start
```

### Development URLs
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

---

## 🧪 Development Features

### Testing
```bash
# Run linting
npm run lint

# Run tests
npm test

# Test API endpoints
node test-simple.js
node test-detailed.js
node test-subdomain-apis.js
```

### Development Tools
- **ESLint**: Code quality and style checking
- **Hot Reload**: Automatic browser refresh
- **Debug Mode**: Enhanced logging and error reporting
- **Mock Data**: Development data for testing
- **API Testing**: Comprehensive test scripts

---

## 🔧 Development Configuration

### Environment Variables
```bash
# Development-specific settings
VITE_DEV_MODE=true
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_HOT_RELOAD=true
VITE_ENABLE_TESTING=true
```

### Development Server Features
- **CORS enabled** for cross-origin requests
- **Hot reload** for instant updates
- **Debug logging** for troubleshooting
- **Mock API responses** for testing
- **Development database** connection

---

## 📁 Development Structure

```
boom-booking-clean/
├── src/                    # React source code
├── api/                    # Vercel API routes
├── lib/                    # Database and utilities
├── tests/                  # Test files
├── docs/                   # Documentation
├── server.js               # Development server
├── test-*.js              # API testing scripts
├── .env.development        # Development environment
└── README-DEVELOPMENT.md   # This file
```

---

## 🚀 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test locally
npm run dev:full

# Commit changes
git add .
git commit -m "Add new feature"

# Push to development
git push origin development
```

### 2. Testing
```bash
# Run all tests
npm test

# Test specific functionality
node test-subdomain-apis.js

# Check code quality
npm run lint
```

### 3. Deployment to Production
```bash
# Merge to main branch
git checkout main
git merge development

# Deploy to Vercel
vercel --prod
```

---

## 🔍 Development Debugging

### Common Issues

#### 1. Database Connection
```bash
# Check database connection
node -e "
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT 1\`.then(console.log).catch(console.error);
"
```

#### 2. API Endpoints
```bash
# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/rooms
curl http://localhost:3000/api/subdomain
```

#### 3. Subdomain Testing
```bash
# Test subdomain detection
curl -H "Host: demo.localhost:3000" http://localhost:3000/api/subdomain
```

---

## 📊 Development Metrics

### Performance Monitoring
- **Build Time**: ~2-3 seconds
- **Hot Reload**: <1 second
- **API Response**: <100ms
- **Database Query**: <50ms

### Development Tools
- **Vite**: Fast build and dev server
- **ESLint**: Code quality
- **React DevTools**: Component debugging
- **Network Tab**: API monitoring

---

## 🎯 Development Goals

### Current Focus
- ✅ **Multi-tenant architecture** implementation
- ✅ **Subdomain routing** functionality
- ✅ **API development** and testing
- ✅ **Database integration** with Neon PostgreSQL
- ✅ **Frontend development** with React + Vite

### Next Steps
- 🔄 **Real-time features** with WebSocket
- 🔄 **Advanced analytics** dashboard
- 🔄 **Mobile responsiveness** optimization
- 🔄 **Performance optimization**
- 🔄 **Additional integrations**

---

## 📞 Development Support

### Resources
- **Documentation**: `/docs/` folder
- **API Reference**: `/docs/production/API_DOCUMENTATION.md`
- **Testing Guide**: `/SAAS_TESTING_GUIDE.md`
- **Deployment Guide**: `/PRODUCTION_DEPLOYMENT_GUIDE.md`

### Getting Help
- Check existing documentation
- Review test files for examples
- Use development debugging tools
- Test with provided scripts

---

## 🎉 Development Ready!

**This development branch is ready for:**
- ✅ **Feature development** and testing
- ✅ **API development** and debugging
- ✅ **Database integration** and testing
- ✅ **Frontend development** with hot reload
- ✅ **Comprehensive testing** and validation

**Happy coding! 🚀**
