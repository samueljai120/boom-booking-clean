// Vercel API Route: /api/health
export default function handler(req, res) {
  // CORS headers are handled by vercel.json configuration

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
