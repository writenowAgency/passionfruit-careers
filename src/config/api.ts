// API Configuration
// For development, we'll use localhost. For production, update this to your actual API URL.

// Force development mode for now
const isDevelopment = true;

export const API_CONFIG = {
  // Use your local IP address or localhost for development
  // If testing on a physical device, replace with your computer's local IP
  BASE_URL: isDevelopment
    ? 'http://localhost:3000/api'  // Development (use your computer's IP for physical devices)
    : 'https://api.passionfruit.careers',  // Production

  TIMEOUT: 10000, // 10 seconds
};

// Helper to get the correct API URL
export const getApiUrl = () => {
  return API_CONFIG.BASE_URL;
};

// For testing on physical devices, you may need to replace 'localhost' with your computer's IP
// For example: 'http://192.168.1.100:3000/api'
// To find your IP on Windows: ipconfig
// To find your IP on Mac/Linux: ifconfig
