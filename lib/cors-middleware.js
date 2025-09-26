// Centralized CORS Middleware for Vercel Serverless Functions
// This ensures consistent CORS handling across all API endpoints

/**
 * CORS middleware for Vercel serverless functions
 * Handles both simple and preflight requests with proper security
 */
export function corsMiddleware(req, res, options = {}) {
  // Default CORS options
  const defaultOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Content-Type',
      'Date',
      'X-Api-Version'
    ],
    credentials: true,
    maxAge: 86400 // 24 hours
  };

  const corsOptions = { ...defaultOptions, ...options };

  // Get the origin from the request
  const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '');
  
  // Determine allowed origin
  let allowedOrigin = corsOptions.origin;
  if (corsOptions.origin === '*') {
    allowedOrigin = '*';
  } else if (typeof corsOptions.origin === 'string') {
    allowedOrigin = corsOptions.origin;
  } else if (Array.isArray(corsOptions.origin)) {
    allowedOrigin = corsOptions.origin.includes(origin) ? origin : corsOptions.origin[0];
  } else if (typeof corsOptions.origin === 'function') {
    allowedOrigin = corsOptions.origin(origin) ? origin : false;
  }

  // Set CORS headers
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Max-Age', corsOptions.maxAge.toString());
  
  if (corsOptions.credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Indicates that the request was handled
  }

  return false; // Indicates that the request should continue
}

/**
 * Wrapper function for API handlers with CORS
 * Usage: export default withCORS(handlerFunction)
 */
export function withCORS(handler, corsOptions = {}) {
  return async (req, res) => {
    // Apply CORS middleware
    const handled = corsMiddleware(req, res, corsOptions);
    
    // If it was a preflight request, don't call the handler
    if (handled) {
      return;
    }

    // Call the original handler
    return handler(req, res);
  };
}

/**
 * Environment-specific CORS configuration
 * Automatically detects the environment and sets appropriate origins
 */
export function getCORSConfig() {
  const environment = process.env.NODE_ENV || 'development';
  
  // Production origins - includes all possible Vercel deployment URLs
  const productionOrigins = [
    'https://boom-booking-clean-v1.vercel.app',
    'https://boom-booking-clean-v1-466avod5w-samueljai120s-projects.vercel.app',
    'https://boom-booking-clean-v1-m7k4m65w7-samueljai120s-projects.vercel.app',
    'https://boom-booking.com',
    'https://www.boom-booking.com'
  ];

  // Development origins
  const developmentOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];

  switch (environment) {
    case 'production':
      return {
        origin: productionOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'X-CSRF-Token',
          'Accept',
          'Accept-Version',
          'Content-Length',
          'Content-MD5',
          'Content-Type',
          'Date',
          'X-Api-Version'
        ]
      };
    
    case 'development':
      return {
        origin: developmentOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'X-CSRF-Token',
          'Accept',
          'Accept-Version',
          'Content-Length',
          'Content-MD5',
          'Content-Type',
          'Date',
          'X-Api-Version'
        ]
      };
    
    default:
      return {
        origin: '*',
        credentials: false,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Requested-With',
          'X-CSRF-Token',
          'Accept',
          'Accept-Version',
          'Content-Length',
          'Content-MD5',
          'Content-Type',
          'Date',
          'X-Api-Version'
        ]
      };
  }
}

/**
 * Quick CORS setup for individual endpoints
 * Usage: corsHeaders(req, res) at the start of your handler
 */
export function corsHeaders(req, res, customOptions = {}) {
  const config = getCORSConfig();
  const options = { ...config, ...customOptions };
  corsMiddleware(req, res, options);
}
