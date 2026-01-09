// API Configuration
// dynamic configuration via environment variables

export const API_CONFIG = {
  // Use EXPO_PUBLIC_API_URL if available (set in Railway/CI), otherwise default to localhost
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  TIMEOUT: 10000, // 10 seconds
};

// Helper to get the correct API URL
export const getApiUrl = () => {
  return API_CONFIG.BASE_URL;
};

// For testing on physical devices, you may need to replace 'localhost' with your computer's IP
// For example: 'http://192.168.1.100:3000/api'
