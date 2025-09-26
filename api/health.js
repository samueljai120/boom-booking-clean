// Vercel API Route: /api/health
import { withCORS, getCORSConfig } from '../lib/cors-middleware.js';

export default function handler(req, res) {
  // Apply CORS headers using centralized middleware
  const corsConfig = getCORSConfig();
  corsConfig.origin = [
    'https://boom-booking-clean-v1.vercel.app',
    'https://boom-booking-clean-v1-466avod5w-samueljai120s-projects.vercel.app',
    'https://boom-booking.com',
    'https://www.boom-booking.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check response
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Vercel API health check - server is running',
    environment: process.env.NODE_ENV || 'development',
    platform: 'vercel'
  });
}
