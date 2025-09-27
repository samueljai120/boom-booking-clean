import { getApiBaseUrl } from '../utils/apiConfig';

// API Configuration - Fix port mismatch and improve error handling
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Smart API mode detection - tries real API first, falls back to mock
export const FORCE_REAL_API = true; // Enable real API attempts
export const FALLBACK_TO_MOCK = true; // Allow fallback to mock on failure

// Debug API configuration
console.log('🔧 API Config - BASE_URL:', API_CONFIG.BASE_URL);
console.log('🔧 API Config - Environment:', import.meta.env.MODE);
console.log('🔧 API Config - VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
