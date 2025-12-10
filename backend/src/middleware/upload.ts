import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, USE_LOCAL_STORAGE, LOCAL_UPLOAD_DIR } from '../config/storage';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure uploads directory exists for local storage
if (USE_LOCAL_STORAGE && !fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

// File filter for images only
const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
};

// File filter for documents (PDFs, Word docs)
const documentFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed'));
  }
};

// Configure multer for local storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, LOCAL_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure multer for memory storage (for R2 upload)
const memoryStorage = multer.memoryStorage();

// Upload middleware for profile photos
export const uploadProfilePhoto = multer({
  storage: USE_LOCAL_STORAGE ? localStorage : memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: imageFileFilter,
}).single('photo');

// Upload middleware for documents (resumes, etc.)
export const uploadDocument = multer({
  storage: USE_LOCAL_STORAGE ? localStorage : memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: documentFileFilter,
}).single('document');

// Helper function to upload file to R2
export async function uploadToR2(
  file: Express.Multer.File,
  folder: string,
  userId: number
): Promise<string> {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${folder}/${userId}-${Date.now()}${fileExtension}`;

  const uploadParams = {
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await r2Client.send(new PutObjectCommand(uploadParams));

  // Return the public URL (you'll need to configure R2 public access or custom domain)
  return `${process.env.R2_PUBLIC_URL}/${fileName}`;
}

// Helper function to get local file URL
export function getLocalFileUrl(fileName: string): string {
  return `${process.env.API_URL || 'http://localhost:3000'}/uploads/${fileName}`;
}

// Helper to delete file from R2
export async function deleteFromR2(fileUrl: string): Promise<void> {
  try {
    // Extract the key from the URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const deleteParams = {
      Bucket: R2_BUCKET_NAME,
      Key: key,
    };

    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    await r2Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    // Don't throw - deletion failure shouldn't block the request
  }
}

// Helper to delete local file
export function deleteLocalFile(fileUrl: string): void {
  try {
    const fileName = path.basename(fileUrl);
    const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting local file:', error);
  }
}
