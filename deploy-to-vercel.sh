#!/bin/bash

# Boom Booking Clean - Vercel Deployment Script
echo "🚀 Deploying Boom Booking Clean to Vercel..."

# Check if user is logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Please login to Vercel first:"
    echo "   vercel login"
    exit 1
fi

echo "✅ Vercel CLI authenticated"

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Configure environment variables in Vercel dashboard"
    echo "2. Set up custom domain"
    echo "3. Configure subdomain DNS"
    echo "4. Test production functionality"
    echo ""
    echo "📋 Environment Variables to Set:"
    echo "   DATABASE_URL=your_neon_postgresql_connection_string"
    echo "   JWT_SECRET=your_super_secure_jwt_secret"
    echo "   STRIPE_SECRET_KEY=sk_live_your_stripe_key"
    echo "   STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key"
else
    echo "❌ Deployment failed"
    exit 1
fi
