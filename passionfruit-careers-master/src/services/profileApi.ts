import { API_CONFIG } from '../config/api';

// Profile data interfaces
export interface ProfileData {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  profile: {
    id: number;
    headline: string | null;
    bio: string | null;
    location: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    profilePhotoUrl: string | null;
    resumeUrl: string | null;
    coverLetterUrl: string | null;
    idDocumentUrl: string | null;
    portfolioFileUrl: string | null;
    yearsOfExperience: number | null;
    desiredSalaryMin: number | null;
    desiredSalaryMax: number | null;
    salaryCurrency: string | null;
    isOpenToWork: boolean;
    careerObjectives: string | null;
    preferredWorkType: 'remote' | 'office' | 'hybrid' | null;
    availabilityStartDate: string | null;
    completion: number;
  };
  preferences: {
    emailNotificationsEnabled: boolean;
    pushNotificationsEnabled: boolean;
    jobAlertsEnabled: boolean;
    applicationUpdatesEnabled: boolean;
    marketingEmailsEnabled: boolean;
  };
  preferredJobCategories: Array<{
    id: number;
    categoryName: string;
    description: string | null;
  }>;
  skills: Array<{
    id: number;
    name: string;
    proficiencyLevel: string | null;
    yearsExperience: number | null;
  }>;
  experience: Array<{
    id: number;
    companyName: string;
    jobTitle: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    location: string | null;
  }>;
  education: Array<{
    id: number;
    institutionName: string;
    degree: string;
    fieldOfStudy: string | null;
    startDate: string;
    endDate: string | null;
    grade: string | null;
    description: string | null;
  }>;
  certifications: Array<{
    id: number;
    certificationName: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate: string | null;
    credentialId: string | null;
    credentialUrl: string | null;
    description: string | null;
  }>;
  languages: Array<{
    id: number;
    languageName: string;
    proficiencyLevel: string;
  }>;
  documents: Array<{
    id: number;
    documentType: 'cv' | 'cover_letter' | 'id_document' | 'certificate' | 'reference' | 'portfolio';
    documentName: string;
    fileUrl: string;
    fileSize: number | null;
    mimeType: string | null;
    uploadedAt: string;
    updatedAt: string;
    description: string | null;
    isPrimary: boolean;
  }>;
}

export interface PersonalInfoUpdate {
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
}

export interface SkillCreate {
  skillName: string;
  proficiencyLevel?: string;
  yearsExperience?: number;
}

export interface ExperienceCreate {
  companyName: string;
  jobTitle: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
}

export interface EducationCreate {
  institutionName: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface CertificationCreate {
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

export interface LanguageCreate {
  languageName: string;
  proficiencyLevel: string;
}

export interface CareerObjectivesUpdate {
  careerObjectives: string;
}

export interface DocumentUpload {
  documentType: 'cv' | 'cover_letter' | 'id_document' | 'certificate' | 'reference' | 'portfolio';
  file: any; // File object
  description?: string;
  isPrimary?: boolean;
}

export interface DocumentUpdate {
  documentName?: string;
  description?: string;
  isPrimary?: boolean;
}

class ProfileApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // Helper method to get auth token
  private getAuthHeader(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  // Get complete user profile
  async getProfile(token: string): Promise<ProfileData> {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  }

  // Update personal information
  async updatePersonalInfo(
    token: string,
    data: PersonalInfoUpdate
  ): Promise<{ message: string; profile: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/personal`, {
        method: 'PUT',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update personal information');
      }

      return responseData;
    } catch (error) {
      console.error('Personal info update error:', error);
      throw error;
    }
  }

  // Add a new skill
  async addSkill(
    token: string,
    skill: SkillCreate
  ): Promise<{ message: string; skill: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/skills`, {
        method: 'POST',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(skill),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add skill');
      }

      return data;
    } catch (error) {
      console.error('Add skill error:', error);
      throw error;
    }
  }

  // Remove a skill
  async removeSkill(token: string, skillId: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/skills/${skillId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove skill');
      }

      return data;
    } catch (error) {
      console.error('Remove skill error:', error);
      throw error;
    }
  }

  // Add work experience
  async addExperience(
    token: string,
    experience: ExperienceCreate
  ): Promise<{ message: string; experience: any }> {
    try {
      console.log('[profileApi] Sending experience data:', JSON.stringify(experience, null, 2));

      const response = await fetch(`${this.baseUrl}/profile/experience`, {
        method: 'POST',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(experience),
      });

      const data = await response.json();
      console.log('[profileApi] Response status:', response.status);
      console.log('[profileApi] Response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        // Handle validation errors from express-validator
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: any) => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to add experience');
      }

      return data;
    } catch (error) {
      console.error('[profileApi] Add experience error:', error);
      throw error;
    }
  }

  // Remove work experience
  async removeExperience(token: string, experienceId: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/experience/${experienceId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove experience');
      }

      return data;
    } catch (error) {
      console.error('Remove experience error:', error);
      throw error;
    }
  }

  // Add education
  async addEducation(
    token: string,
    education: EducationCreate
  ): Promise<{ message: string; education: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/education`, {
        method: 'POST',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(education),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add education');
      }

      return data;
    } catch (error) {
      console.error('Add education error:', error);
      throw error;
    }
  }

  // Remove education
  async removeEducation(token: string, educationId: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/education/${educationId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove education');
      }

      return data;
    } catch (error) {
      console.error('Remove education error:', error);
      throw error;
    }
  }

  // Update profile photo URL
  async updateProfilePhotoUrl(token: string, photoUrl: string): Promise<{ message: string; photoUrl: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/photo-url`, {
        method: 'PUT',
        headers: this.getAuthHeader(token),
        body: JSON.stringify({ photoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update photo URL');
      }

      return data;
    } catch (error) {
      console.error('Update photo URL error:', error);
      throw error;
    }
  }

  // Upload profile photo
  async uploadPhoto(token: string, imageUri: string): Promise<{ message: string; photoUrl: string }> {
    try {
      const formData = new FormData();

      // Create file object from URI
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('photo', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${this.baseUrl}/profile/photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let fetch set it with boundary for multipart
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload photo');
      }

      return data;
    } catch (error) {
      console.error('Upload photo error:', error);
      throw error;
    }
  }

  // Delete profile photo
  async deletePhoto(token: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/photo`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete photo');
      }

      return data;
    } catch (error) {
      console.error('Delete photo error:', error);
      throw error;
    }
  }

  // Upload document/resume
  async uploadDocumentByUri(token: string, documentUri: string): Promise<{ message: string; documentUrl: string; fileName: string }> {
    try {
      const formData = new FormData();

      const filename = documentUri.split('/').pop() || 'document.pdf';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `application/${match[1]}` : 'application/pdf';

      formData.append('document', {
        uri: documentUri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${this.baseUrl}/profile/document`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document');
      }

      return data;
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  }

  // Add certification
  async addCertification(
    token: string,
    certification: CertificationCreate
  ): Promise<{ message: string; certification: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/certifications`, {
        method: 'POST',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(certification),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add certification');
      }

      return data;
    } catch (error) {
      console.error('Add certification error:', error);
      throw error;
    }
  }

  // Update certification
  async updateCertification(
    token: string,
    certificationId: number,
    certification: Partial<CertificationCreate>
  ): Promise<{ message: string; certification: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/certifications/${certificationId}`, {
        method: 'PUT',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(certification),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update certification');
      }

      return data;
    } catch (error) {
      console.error('Update certification error:', error);
      throw error;
    }
  }

  // Remove certification
  async removeCertification(token: string, certificationId: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/certifications/${certificationId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove certification');
      }

      return data;
    } catch (error) {
      console.error('Remove certification error:', error);
      throw error;
    }
  }

  // Add language
  async addLanguage(
    token: string,
    language: LanguageCreate
  ): Promise<{ message: string; language: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/languages`, {
        method: 'POST',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(language),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add language');
      }

      return data;
    } catch (error) {
      console.error('Add language error:', error);
      throw error;
    }
  }

  // Update language
  async updateLanguage(
    token: string,
    languageId: number,
    language: Partial<LanguageCreate>
  ): Promise<{ message: string; language: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/languages/${languageId}`, {
        method: 'PUT',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(language),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update language');
      }

      return data;
    } catch (error) {
      console.error('Update language error:', error);
      throw error;
    }
  }

  // Remove language
  async removeLanguage(token: string, languageId: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/languages/${languageId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove language');
      }

      return data;
    } catch (error) {
      console.error('Remove language error:', error);
      throw error;
    }
  }

  // Update career objectives
  async updateCareerObjectives(
    token: string,
    data: CareerObjectivesUpdate
  ): Promise<{ message: string; profile: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/career-objectives`, {
        method: 'PUT',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update career objectives');
      }

      return responseData;
    } catch (error) {
      console.error('Update career objectives error:', error);
      throw error;
    }
  }

  // ==================== Document Management ====================

  // Upload any document
  async uploadDocument(token: string, upload: DocumentUpload): Promise<{ message: string; document: any }> {
    try {
      const formData = new FormData();
      formData.append('document', upload.file);
      formData.append('documentType', upload.documentType);
      if (upload.description) formData.append('description', upload.description);
      if (upload.isPrimary !== undefined) formData.append('isPrimary', upload.isPrimary.toString());

      const response = await fetch(`${this.baseUrl}/profile/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document');
      }

      return data;
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  }

  // Get all documents or filter by type
  async getDocuments(token: string, type?: string): Promise<{ documents: ProfileData['documents'] }> {
    try {
      const url = type ? `${this.baseUrl}/profile/documents?type=${type}` : `${this.baseUrl}/profile/documents`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get documents');
      }

      return data;
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  }

  // Update document metadata
  async updateDocument(
    token: string,
    documentId: number,
    updates: DocumentUpdate
  ): Promise<{ message: string; document: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/documents/${documentId}`, {
        method: 'PUT',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update document');
      }

      return data;
    } catch (error) {
      console.error('Update document error:', error);
      throw error;
    }
  }

  // Delete document
  async deleteDocument(token: string, documentId: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/documents/${documentId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete document');
      }

      return data;
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }

  // Upload cover letter (dedicated endpoint)
  async uploadCoverLetter(token: string, file: any): Promise<{ message: string; coverLetterUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`${this.baseUrl}/profile/cover-letter`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload cover letter');
      }

      return data;
    } catch (error) {
      console.error('Upload cover letter error:', error);
      throw error;
    }
  }

  // Upload ID document (dedicated endpoint)
  async uploadIdDocument(token: string, file: any): Promise<{ message: string; idDocumentUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`${this.baseUrl}/profile/id-document`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload ID document');
      }

      return data;
    } catch (error) {
      console.error('Upload ID document error:', error);
      throw error;
    }
  }

  // Upload portfolio item (dedicated endpoint)
  async uploadPortfolio(token: string, file: any, description?: string): Promise<{ message: string; document: any }> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      if (description) formData.append('description', description);

      const response = await fetch(`${this.baseUrl}/profile/portfolio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload portfolio item');
      }

      return data;
    } catch (error) {
      console.error('Upload portfolio error:', error);
      throw error;
    }
  }

  // Upload certificate file and link to certification
  async uploadCertificateFile(
    token: string,
    certificationId: number,
    file: any
  ): Promise<{ message: string; certificateFileUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`${this.baseUrl}/profile/certifications/${certificationId}/file`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload certificate file');
      }

      return data;
    } catch (error) {
      console.error('Upload certificate file error:', error);
      throw error;
    }
  }

  // ===== PREFERENCES API METHODS =====

  async getAllJobCategories(token: string) {
    try {
      const response = await fetch(`${this.baseUrl}/profile/job-categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get job categories');
      }

      return data;
    } catch (error) {
      console.error('Get job categories error:', error);
      throw error;
    }
  }

  async updatePreferredCategories(token: string, categoryIds: number[]) {
    try {
      const response = await fetch(`${this.baseUrl}/profile/preferred-categories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update preferred categories');
      }

      return data;
    } catch (error) {
      console.error('Update preferred categories error:', error);
      throw error;
    }
  }

  async updateWorkPreferences(token: string, preferences: {
    desiredSalaryMin?: number | null;
    desiredSalaryMax?: number | null;
    salaryCurrency?: string;
    preferredWorkType?: 'remote' | 'office' | 'hybrid' | null;
    availabilityStartDate?: string | null;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/profile/work-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update work preferences');
      }

      return data;
    } catch (error) {
      console.error('Update work preferences error:', error);
      throw error;
    }
  }

  async updateNotificationPreferences(token: string, preferences: {
    emailNotificationsEnabled?: boolean;
    pushNotificationsEnabled?: boolean;
    jobAlertsEnabled?: boolean;
    applicationUpdatesEnabled?: boolean;
    marketingEmailsEnabled?: boolean;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/profile/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update notification preferences');
      }

      return data;
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  }
}

export const profileApi = new ProfileApiService();
