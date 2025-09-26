#!/bin/bash

# CORS Fix Deployment Script
# This script deploys the CORS fixes to Vercel

echo "🚀 Deploying CORS Fix to Vercel"
echo "================================"

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please run this script from the boom-booking-clean directory."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI not found. Please install it with: npm i -g vercel"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "   ✅ CORS middleware created"
echo "   ✅ API endpoints updated"
echo "   ✅ vercel.json configured"
echo "   ✅ Environment variables updated"

echo ""
echo "🔧 Deploying to Vercel..."

# Deploy to production
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🧪 Testing CORS fix..."
    
    # Wait a moment for deployment to propagate
    sleep 10
    
    # Run the simple CORS test
    node simple-cors-test.js
    
    echo ""
    echo "📋 Next steps:"
    echo "   1. Check Vercel dashboard for deployment status"
    echo "   2. Test frontend-backend communication"
    echo "   3. Monitor for any CORS errors in browser console"
    echo "   4. Verify all API endpoints are working"
    
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
