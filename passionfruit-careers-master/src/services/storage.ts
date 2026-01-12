import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 Configuration
const R2_ACCOUNT_ID = process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.EXPO_PUBLIC_R2_BUCKET_NAME || 'passionfruit-careers';
const R2_PUBLIC_URL = process.env.EXPO_PUBLIC_R2_PUBLIC_URL || '';

// Initialize S3 Client for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export type FileCategory = 'cvs' | 'images' | 'certificates' | 'logos' | 'documents';

interface UploadOptions {
  file: File | Blob;
  fileName: string;
  category: FileCategory;
  userId: string;
  contentType?: string;
}

interface UploadResult {
  success: boolean;
  fileUrl: string;
  key: string;
  error?: string;
}

/**
 * Generate a unique file key with category prefix
 */
const generateFileKey = (category: FileCategory, userId: string, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${category}/${userId}/${timestamp}-${sanitizedFileName}`;
};

/**
 * Upload a file to Cloudflare R2
 */
export const uploadFile = async ({
  file,
  fileName,
  category,
  userId,
  contentType,
}: UploadOptions): Promise<UploadResult> => {
  try {
    const key = generateFileKey(category, userId, fileName);

    // Convert file to buffer for upload
    const buffer = await file.arrayBuffer();
    const body = new Uint8Array(buffer);

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType || file.type || 'application/octet-stream',
      Metadata: {
        userId,
        category,
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    await r2Client.send(command);

    // Generate public URL
    const fileUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : await getSignedUrl(r2Client as any, new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        }), { expiresIn: 31536000 }); // 1 year for pre-signed URLs

    return {
      success: true,
      fileUrl,
      key,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      fileUrl: '',
      key: '',
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

/**
 * Get a signed URL for private file access
 */
export const getFileUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  try {
    // If using public bucket, return public URL
    if (R2_PUBLIC_URL) {
      return `${R2_PUBLIC_URL}/${key}`;
    }

    // Otherwise, generate signed URL
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(r2Client as any, command, { expiresIn });
  } catch (error) {
    console.error('Get URL error:', error);
    throw error;
  }
};

/**
 * Delete a file from R2
 */
export const deleteFile = async (key: string): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

/**
 * Upload multiple files
 */
export const uploadFiles = async (
  uploads: UploadOptions[]
): Promise<UploadResult[]> => {
  return Promise.all(uploads.map(uploadFile));
};

/**
 * Helper function to validate file size
 */
export const validateFileSize = (file: File | Blob, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Helper function to validate file type
 */
export const validateFileType = (
  file: File | Blob,
  allowedTypes: string[]
): boolean => {
  if (!file.type) return false;
  return allowedTypes.some((type) => file.type.includes(type));
};

/**
 * Predefined validation rules
 */
export const FILE_VALIDATION_RULES = {
  cvs: {
    maxSizeMB: 10,
    allowedTypes: ['pdf', 'doc', 'docx'],
  },
  images: {
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  certificates: {
    maxSizeMB: 10,
    allowedTypes: ['pdf', 'image/jpeg', 'image/png'],
  },
  logos: {
    maxSizeMB: 2,
    allowedTypes: ['image/png', 'image/svg', 'image/jpeg'],
  },
  documents: {
    maxSizeMB: 10,
    allowedTypes: ['pdf', 'doc', 'docx', 'txt'],
  },
};

export const StorageService = {
  uploadFile,
  getFileUrl,
  deleteFile,
  uploadFiles,
  validateFileSize,
  validateFileType,
  FILE_VALIDATION_RULES,
};
