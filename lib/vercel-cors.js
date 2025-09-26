// Vercel-specific CORS middleware
// Handles dynamic Vercel deployment URLs and CORS configuration

/**
 * Check if an origin is a valid Vercel deployment URL
 */
function isValidVercelOrigin(origin) {
  if (!origin) return false;
  
  // Allow localhost for development
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return true;
  }
  
  // Allow Vercel deployment URLs
  const vercelPatterns = [
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*-.*-.*\.vercel\.app$/,
    /^https:\/\/boom-booking.*\.vercel\.app$/,
    /^https:\/\/boom-booking\.com$/,
    /^https:\/\/www\.boom-booking\.com$/
  ];
  
  return vercelPatterns.some(pattern => pattern.test(origin));
}

/**
 * Get allowed origins for CORS
 */
function getAllowedOrigins() {
  const origins = [
    'https://boom-booking-clean-v1.vercel.app',
    'https://boom-booking.com',
    'https://www.boom-booking.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];
  
  // Add any additional origins from environment
  if (process.env.CORS_ORIGINS) {
    const envOrigins = process.env.CORS_ORIGINS.split(',').map(o => o.trim());
    origins.push(...envOrigins);
  }
  
  return origins;
}

/**
 * Vercel CORS middleware
 */
export function vercelCORS(req, res, options = {}) {
  const origin = req.headers.origin;
  
  // Default CORS options
  const defaultOptions = {
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
    maxAge: 86400
  };
  
  const corsOptions = { ...defaultOptions, ...options };
  
  // Determine allowed origin
  let allowedOrigin = '*';
  
  if (origin && isValidVercelOrigin(origin)) {
    allowedOrigin = origin;
  } else if (origin) {
    // Check if origin is in allowed list
    const allowedOrigins = getAllowedOrigins();
    if (allowedOrigins.includes(origin)) {
      allowedOrigin = origin;
    }
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Max-Age', corsOptions.maxAge.toString());
  
  if (corsOptions.credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

/**
 * Wrapper for API handlers with Vercel CORS
 */
export function withVercelCORS(handler, options = {}) {
  return async (req, res) => {
    // Apply CORS middleware
    const handled = vercelCORS(req, res, options);
    
    // If it was a preflight request, don't call the handler
    if (handled) {
      return;
    }
    
    // Call the original handler
    return handler(req, res);
  };
}

/**
 * Quick CORS setup for individual endpoints
 */
export function setVercelCORSHeaders(req, res, customOptions = {}) {
  vercelCORS(req, res, customOptions);
}
