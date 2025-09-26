// NEW API Configuration - Force complete refresh
// This file replaces the old apiConfig.js to force browser cache refresh

export const getApiBaseUrl = () => {
  // Check for production backend URL first
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL;
    // If it's a full URL, use it; if it's relative, use it; if it's the old URL, use relative
    if (url.includes('boom-booking-clean-v1.vercel.app')) {
      return '/api';
    }
    return url;
  }
  
  // Check if we're in production (Vercel deployment)
  if (import.meta.env.PROD) {
    // Use Vercel API routes (same domain) - Force relative URL
    return '/api';
  }
  
  // Development fallback - Vercel API routes on port 3001
  // FORCE REFRESH - NEW CONFIG FILE
  return 'http://localhost:3001/api';
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
  
  return 'http://localhost:3001';
};
