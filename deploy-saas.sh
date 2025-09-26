#!/bin/bash

# SaaS Deployment Script for Boom Karaoke Booking Platform
# This script prepares and deploys the SaaS-enabled application

set -e  # Exit on any error

echo "🚀 Starting SaaS Deployment Process"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Run linting
run_linting() {
    print_status "Running linting checks..."
    npm run lint
    print_success "Linting passed"
}

# Build the application
build_application() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Check environment variables
check_environment() {
    print_status "Checking environment variables..."
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL is not set"
        print_warning "Please set your Neon PostgreSQL connection string"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        print_warning "JWT_SECRET is not set"
        print_warning "Please set a secure JWT secret"
    fi
    
    if [ -z "$STRIPE_SECRET_KEY" ]; then
        print_warning "STRIPE_SECRET_KEY is not set"
        print_warning "Billing features will not work without Stripe configuration"
    fi
    
    print_success "Environment check completed"
}

# Test database connection
test_database() {
    print_status "Testing database connection..."
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "Skipping database test - DATABASE_URL not set"
        return
    fi
    
    # Test database connection
    node -e "
    import('./lib/neon-db.js').then(async (db) => {
      try {
        console.log('Testing database connection...');
        const result = await db.initDatabase();
        console.log('Database connection successful');
        process.exit(0);
      } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
      }
    });
    " || {
        print_error "Database connection failed"
        print_error "Please check your DATABASE_URL and database accessibility"
        exit 1
    }
    
    print_success "Database connection successful"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not installed. Installing..."
        npm install -g vercel
    fi
    
    # Deploy
    vercel --prod --yes
    
    print_success "Deployment to Vercel completed"
}

# Run post-deployment tests
post_deployment_tests() {
    print_status "Running post-deployment tests..."
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "")
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        print_warning "Could not determine deployment URL"
        return
    fi
    
    print_status "Testing deployment at: https://$DEPLOYMENT_URL"
    
    # Test health endpoint
    if curl -f -s "https://$DEPLOYMENT_URL/api/health" > /dev/null; then
        print_success "Health endpoint is responding"
    else
        print_error "Health endpoint is not responding"
    fi
    
    # Test tenants endpoint
    if curl -f -s "https://$DEPLOYMENT_URL/api/tenants" > /dev/null; then
        print_success "Tenants endpoint is responding"
    else
        print_error "Tenants endpoint is not responding"
    fi
    
    print_success "Post-deployment tests completed"
}

# Main deployment function
main() {
    echo "🎯 SaaS Deployment Checklist"
    echo "============================"
    
    # Pre-deployment checks
    check_dependencies
    install_dependencies
    run_linting
    build_application
    check_environment
    test_database
    
    echo ""
    echo "🚀 Ready for Deployment!"
    echo "========================"
    
    # Ask for confirmation
    read -p "Do you want to deploy to Vercel? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_vercel
        post_deployment_tests
        
        echo ""
        echo "🎉 Deployment Complete!"
        echo "======================"
        echo "Your SaaS karaoke booking platform is now live!"
        echo ""
        echo "Next steps:"
        echo "1. Configure Stripe webhooks"
        echo "2. Set up monitoring"
        echo "3. Test all functionality"
        echo "4. Launch marketing campaign"
    else
        echo "Deployment cancelled"
    fi
}

# Run main function
main "$@"
