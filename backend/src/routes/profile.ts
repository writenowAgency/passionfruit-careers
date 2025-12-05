import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import profileService from '../services/profileService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  uploadProfilePhoto,
  uploadDocument,
  uploadToR2,
  getLocalFileUrl,
  deleteFromR2,
  deleteLocalFile,
  USE_LOCAL_STORAGE,
} from '../middleware/upload';

const router = Router();

// Get user profile
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const profile = await profileService.getProfile(userId);
    return res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to get profile',
    });
  }
});

// Update personal information
router.put(
  '/personal',
  authenticateToken,
  [
    body('headline').optional().trim(),
    body('bio').optional().trim(),
    body('location').optional().trim(),
    body('phone').optional().trim(),
    body('linkedinUrl').optional().trim().isURL().withMessage('Invalid LinkedIn URL'),
    body('portfolioUrl').optional().trim().isURL().withMessage('Invalid portfolio URL'),
    body('yearsOfExperience').optional().isInt({ min: 0 }).withMessage('Must be a positive number'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const updatedProfile = await profileService.updatePersonalInfo(userId, req.body);
      return res.json({
        message: 'Profile updated successfully',
        profile: updatedProfile,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to update profile',
      });
    }
  }
);

// Add skill
router.post(
  '/skills',
  authenticateToken,
  [
    body('skillName').trim().notEmpty().withMessage('Skill name is required'),
    body('proficiencyLevel').optional().trim(),
    body('yearsExperience').optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const skill = await profileService.addSkill(userId, req.body);
      return res.status(201).json({
        message: 'Skill added successfully',
        skill,
      });
    } catch (error) {
      console.error('Add skill error:', error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to add skill',
      });
    }
  }
);

// Remove skill
router.delete('/skills/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const skillId = parseInt(req.params.id);

    if (isNaN(skillId)) {
      return res.status(400).json({ message: 'Invalid skill ID' });
    }

    await profileService.removeSkill(userId, skillId);
    return res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    console.error('Remove skill error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to remove skill',
    });
  }
});

// Add experience
router.post(
  '/experience',
  authenticateToken,
  [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('jobTitle').trim().notEmpty().withMessage('Job title is required'),
    body('description').optional().trim(),
    body('startDate').notEmpty().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date'),
    body('isCurrent').isBoolean(),
    body('location').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const experience = await profileService.addExperience(userId, req.body);
      return res.status(201).json({
        message: 'Experience added successfully',
        experience,
      });
    } catch (error) {
      console.error('Add experience error:', error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to add experience',
      });
    }
  }
);

// Add education
router.post(
  '/education',
  authenticateToken,
  [
    body('institutionName').trim().notEmpty().withMessage('Institution name is required'),
    body('degree').trim().notEmpty().withMessage('Degree is required'),
    body('fieldOfStudy').optional().trim(),
    body('startDate').notEmpty().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date'),
    body('grade').optional().trim(),
    body('description').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const education = await profileService.addEducation(userId, req.body);
      return res.status(201).json({
        message: 'Education added successfully',
        education,
      });
    } catch (error) {
      console.error('Add education error:', error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to add education',
      });
    }
  }
);

// Upload profile photo
router.post('/photo', authenticateToken, uploadProfilePhoto, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    let photoUrl: string;

    // Get old photo URL to delete it later
    const profile = await profileService.getProfile(userId);
    const oldPhotoUrl = profile.profile.profilePhotoUrl;

    if (USE_LOCAL_STORAGE) {
      // Local storage
      photoUrl = getLocalFileUrl(req.file.filename);
    } else {
      // Upload to R2
      photoUrl = await uploadToR2(req.file, 'profile-photos', userId);
    }

    // Update profile with new photo URL
    await profileService.updateProfilePhoto(userId, photoUrl);

    // Delete old photo if it exists
    if (oldPhotoUrl) {
      if (USE_LOCAL_STORAGE) {
        deleteLocalFile(oldPhotoUrl);
      } else {
        await deleteFromR2(oldPhotoUrl);
      }
    }

    return res.json({
      message: 'Profile photo uploaded successfully',
      photoUrl,
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to upload photo',
    });
  }
});

// Delete profile photo
router.delete('/photo', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    // Get current photo URL
    const profile = await profileService.getProfile(userId);
    const photoUrl = profile.profile.profilePhotoUrl;

    if (!photoUrl) {
      return res.status(404).json({ message: 'No profile photo to delete' });
    }

    // Delete from storage
    if (USE_LOCAL_STORAGE) {
      deleteLocalFile(photoUrl);
    } else {
      await deleteFromR2(photoUrl);
    }

    // Update profile to remove photo URL
    await profileService.updateProfilePhoto(userId, null);

    return res.json({ message: 'Profile photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to delete photo',
    });
  }
});

// Upload resume/document
router.post('/document', authenticateToken, uploadDocument, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    let documentUrl: string;

    // Get old document URL to delete it later
    const profile = await profileService.getProfile(userId);
    const oldDocumentUrl = profile.profile.resumeUrl;

    if (USE_LOCAL_STORAGE) {
      // Local storage
      documentUrl = getLocalFileUrl(req.file.filename);
    } else {
      // Upload to R2
      documentUrl = await uploadToR2(req.file, 'documents', userId);
    }

    // Update profile with new document URL
    await profileService.updateResumeUrl(userId, documentUrl);

    // Delete old document if it exists
    if (oldDocumentUrl) {
      if (USE_LOCAL_STORAGE) {
        deleteLocalFile(oldDocumentUrl);
      } else {
        await deleteFromR2(oldDocumentUrl);
      }
    }

    return res.json({
      message: 'Document uploaded successfully',
      documentUrl,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to upload document',
    });
  }
});

// Add certification
router.post(
  '/certifications',
  authenticateToken,
  [
    body('certificationName').trim().notEmpty().withMessage('Certification name is required'),
    body('issuingOrganization').trim().notEmpty().withMessage('Issuing organization is required'),
    body('issueDate').notEmpty().isISO8601().withMessage('Valid issue date is required'),
    body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date'),
    body('credentialId').optional().trim(),
    body('credentialUrl').optional().trim().isURL().withMessage('Invalid credential URL'),
    body('description').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const certification = await profileService.addCertification(userId, req.body);
      return res.status(201).json({
        message: 'Certification added successfully',
        certification,
      });
    } catch (error) {
      console.error('Add certification error:', error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to add certification',
      });
    }
  }
);

// Update certification
router.put('/certifications/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const certificationId = parseInt(req.params.id);

    if (isNaN(certificationId)) {
      return res.status(400).json({ message: 'Invalid certification ID' });
    }

    const certification = await profileService.updateCertification(userId, certificationId, req.body);
    return res.json({
      message: 'Certification updated successfully',
      certification,
    });
  } catch (error) {
    console.error('Update certification error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to update certification',
    });
  }
});

// Remove certification
router.delete('/certifications/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const certificationId = parseInt(req.params.id);

    if (isNaN(certificationId)) {
      return res.status(400).json({ message: 'Invalid certification ID' });
    }

    await profileService.removeCertification(userId, certificationId);
    return res.json({ message: 'Certification removed successfully' });
  } catch (error) {
    console.error('Remove certification error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to remove certification',
    });
  }
});

// Add language
router.post(
  '/languages',
  authenticateToken,
  [
    body('languageName').trim().notEmpty().withMessage('Language name is required'),
    body('proficiencyLevel').trim().notEmpty().withMessage('Proficiency level is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const language = await profileService.addLanguage(userId, req.body);
      return res.status(201).json({
        message: 'Language added successfully',
        language,
      });
    } catch (error) {
      console.error('Add language error:', error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to add language',
      });
    }
  }
);

// Update language
router.put('/languages/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const languageId = parseInt(req.params.id);

    if (isNaN(languageId)) {
      return res.status(400).json({ message: 'Invalid language ID' });
    }

    const language = await profileService.updateLanguage(userId, languageId, req.body);
    return res.json({
      message: 'Language updated successfully',
      language,
    });
  } catch (error) {
    console.error('Update language error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to update language',
    });
  }
});

// Remove language
router.delete('/languages/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const languageId = parseInt(req.params.id);

    if (isNaN(languageId)) {
      return res.status(400).json({ message: 'Invalid language ID' });
    }

    await profileService.removeLanguage(userId, languageId);
    return res.json({ message: 'Language removed successfully' });
  } catch (error) {
    console.error('Remove language error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to remove language',
    });
  }
});

// Update career objectives
router.put(
  '/career-objectives',
  authenticateToken,
  [body('careerObjectives').trim().notEmpty().withMessage('Career objectives are required')],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const profile = await profileService.updateCareerObjectives(userId, req.body);
      return res.json({
        message: 'Career objectives updated successfully',
        profile,
      });
    } catch (error) {
      console.error('Update career objectives error:', error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to update career objectives',
      });
    }
  }
);

// ==================== Document Management ====================

// Upload any document
router.post('/documents', authenticateToken, uploadDocument, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const { documentType, description, isPrimary } = req.body;

    if (!documentType) {
      return res.status(400).json({ message: 'Document type is required' });
    }

    const validTypes = ['cv', 'cover_letter', 'id_document', 'certificate', 'reference', 'portfolio'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    let fileUrl: string;

    if (USE_LOCAL_STORAGE) {
      fileUrl = getLocalFileUrl(req.file.filename);
    } else {
      fileUrl = await uploadToR2(req.file, 'documents', userId);
    }

    const document = await profileService.uploadDocument(userId, {
      documentType,
      documentName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      description: description || null,
      isPrimary: isPrimary === 'true' || isPrimary === true,
    });

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to upload document',
    });
  }
});

// Get all documents or filter by type
router.get('/documents', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    const documents = await profileService.getDocuments(userId, type as string);
    return res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to get documents',
    });
  }
});

// Update document metadata
router.put('/documents/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const documentId = parseInt(req.params.id);

    if (isNaN(documentId)) {
      return res.status(400).json({ message: 'Invalid document ID' });
    }

    const document = await profileService.updateDocument(userId, documentId, req.body);
    return res.json({
      message: 'Document updated successfully',
      document,
    });
  } catch (error) {
    console.error('Update document error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to update document',
    });
  }
});

// Delete document
router.delete('/documents/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const documentId = parseInt(req.params.id);

    if (isNaN(documentId)) {
      return res.status(400).json({ message: 'Invalid document ID' });
    }

    const fileUrl = await profileService.deleteDocument(userId, documentId);

    // Delete file from storage
    if (USE_LOCAL_STORAGE) {
      deleteLocalFile(fileUrl);
    } else {
      await deleteFromR2(fileUrl);
    }

    return res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to delete document',
    });
  }
});

// Upload cover letter (dedicated endpoint)
router.post('/cover-letter', authenticateToken, uploadDocument, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    let fileUrl: string;

    if (USE_LOCAL_STORAGE) {
      fileUrl = getLocalFileUrl(req.file.filename);
    } else {
      fileUrl = await uploadToR2(req.file, 'documents', userId);
    }

    await profileService.updateCoverLetterUrl(userId, fileUrl);

    // Also add to documents table
    await profileService.uploadDocument(userId, {
      documentType: 'cover_letter',
      documentName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      isPrimary: true,
    });

    return res.json({
      message: 'Cover letter uploaded successfully',
      coverLetterUrl: fileUrl,
    });
  } catch (error) {
    console.error('Upload cover letter error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to upload cover letter',
    });
  }
});

// Upload ID document (dedicated endpoint)
router.post('/id-document', authenticateToken, uploadDocument, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    let fileUrl: string;

    if (USE_LOCAL_STORAGE) {
      fileUrl = getLocalFileUrl(req.file.filename);
    } else {
      fileUrl = await uploadToR2(req.file, 'documents', userId);
    }

    await profileService.updateIdDocumentUrl(userId, fileUrl);

    // Also add to documents table
    await profileService.uploadDocument(userId, {
      documentType: 'id_document',
      documentName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      isPrimary: true,
    });

    return res.json({
      message: 'ID document uploaded successfully',
      idDocumentUrl: fileUrl,
    });
  } catch (error) {
    console.error('Upload ID document error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to upload ID document',
    });
  }
});

// Upload portfolio item (dedicated endpoint)
router.post('/portfolio', authenticateToken, uploadDocument, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    let fileUrl: string;

    if (USE_LOCAL_STORAGE) {
      fileUrl = getLocalFileUrl(req.file.filename);
    } else {
      fileUrl = await uploadToR2(req.file, 'documents', userId);
    }

    // Add to documents table
    const document = await profileService.uploadDocument(userId, {
      documentType: 'portfolio',
      documentName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      description: req.body.description || null,
    });

    return res.json({
      message: 'Portfolio item uploaded successfully',
      document,
    });
  } catch (error) {
    console.error('Upload portfolio error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to upload portfolio item',
    });
  }
});

// Upload certificate file and link to certification
router.post('/certifications/:id/file', authenticateToken, uploadDocument, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const certificationId = parseInt(req.params.id);

    if (isNaN(certificationId)) {
      return res.status(400).json({ message: 'Invalid certification ID' });
    }

    let fileUrl: string;

    if (USE_LOCAL_STORAGE) {
      fileUrl = getLocalFileUrl(req.file.filename);
    } else {
      fileUrl = await uploadToR2(req.file, 'documents', userId);
    }

    await profileService.updateCertificationFileUrl(userId, certificationId, fileUrl);

    // Also add to documents table
    await profileService.uploadDocument(userId, {
      documentType: 'certificate',
      documentName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      description: `Certificate for certification ID ${certificationId}`,
    });

    return res.json({
      message: 'Certificate file uploaded successfully',
      certificateFileUrl: fileUrl,
    });
  } catch (error) {
    console.error('Upload certificate file error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to upload certificate file',
    });
  }
});

// ===== PREFERENCES ROUTES =====

// Get all available job categories
router.get('/job-categories', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const categories = await profileService.getAllJobCategories();
    return res.json({ categories });
  } catch (error) {
    console.error('Get job categories error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to get job categories',
    });
  }
});

// Update preferred job categories
router.put('/preferred-categories', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { categoryIds } = req.body;

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ message: 'categoryIds must be an array' });
    }

    const categories = await profileService.updatePreferredCategories(userId, categoryIds);
    return res.json({
      message: 'Preferred categories updated successfully',
      categories,
    });
  } catch (error) {
    console.error('Update preferred categories error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to update preferred categories',
    });
  }
});

// Update work preferences (salary, work type, availability)
router.put('/work-preferences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    await profileService.updateWorkPreferences(userId, preferences);
    return res.json({
      message: 'Work preferences updated successfully',
    });
  } catch (error) {
    console.error('Update work preferences error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to update work preferences',
    });
  }
});

// Update notification preferences
router.put('/notification-preferences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    await profileService.updateNotificationPreferences(userId, preferences);
    return res.json({
      message: 'Notification preferences updated successfully',
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to update notification preferences',
    });
  }
});

export default router;
