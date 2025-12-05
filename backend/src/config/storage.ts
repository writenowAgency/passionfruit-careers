import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Cloudflare R2 configuration (S3-compatible)
export const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 uses 'auto' for region
  endpoint: process.env.R2_ENDPOINT || '', // e.g., https://your-account-id.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'passionfruit-careers';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''; // e.g., https://cdn.passionfruit.careers

// For local development without R2, use local storage
export const USE_LOCAL_STORAGE = process.env.NODE_ENV === 'development' && !process.env.R2_ENDPOINT;
export const LOCAL_UPLOAD_DIR = './uploads';
