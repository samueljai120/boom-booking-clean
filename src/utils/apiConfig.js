// Utility function to get API base URL from environment variables
export const getApiBaseUrl = () => {
  // Check for production backend URL first
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL;
    console.log('🔧 Using VITE_API_BASE_URL:', url);
    // If it's a full URL, use it; if it's relative, use it; if it's the old URL, use relative
    if (url.includes('boom-booking-clean-v1.vercel.app')) {
      return '/api';
    }
    return url;
  }
  
  // Check if we're in production (Vercel deployment)
  if (import.meta.env.PROD) {
    // Use Vercel API routes (same domain) - Force relative URL
    console.log('🔧 Production mode: Using relative /api');
    return '/api';
  }
  
  // Development fallback - Use port 3000 for Express API
  console.log('🔧 Development mode: Using port 3000 for Express API');
  
  // Use port 3000 for Express server
  return 'http://localhost:3000/api';
};

// Utility function to get WebSocket URL from environment variables
export const getWebSocketUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  
  if (import.meta.env.PROD) {
    // Use same domain for WebSocket (Vercel doesn't support WebSocket, so disable for now)
    return '';
  }
  
  return 'http://localhost:3000';
};
