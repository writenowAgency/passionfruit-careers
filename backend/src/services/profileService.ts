import pool from '../database/config';

interface PersonalInfo {
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
}

interface Skill {
  skillName: string;
  proficiencyLevel?: string;
  yearsExperience?: number;
}

interface Experience {
  companyName: string;
  jobTitle: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
}

interface Education {
  institutionName: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

interface Certification {
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

interface Language {
  languageName: string;
  proficiencyLevel: string;
}

interface CareerObjectives {
  careerObjectives: string;
}

interface Document {
  documentType: 'cv' | 'cover_letter' | 'id_document' | 'certificate' | 'reference' | 'portfolio';
  documentName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  isPrimary?: boolean;
}

export class ProfileService {
  // Get or create job seeker profile
  async getProfile(userId: number) {
    try {
      // Get basic user info
      const userResult = await pool.query(
        'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Get or create job seeker profile
      let profileResult = await pool.query(
        'SELECT * FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        // Create profile if it doesn't exist
        profileResult = await pool.query(
          `INSERT INTO job_seeker_profiles (user_id)
           VALUES ($1)
           RETURNING *`,
          [userId]
        );
      }

      const profile = profileResult.rows[0];

      // Get skills
      const skillsResult = await pool.query(
        'SELECT * FROM job_seeker_skills WHERE profile_id = $1 ORDER BY created_at DESC',
        [profile.id]
      );

      // Get experience
      const experienceResult = await pool.query(
        'SELECT * FROM job_seeker_experience WHERE profile_id = $1 ORDER BY start_date DESC',
        [profile.id]
      );

      // Get education
      const educationResult = await pool.query(
        'SELECT * FROM job_seeker_education WHERE profile_id = $1 ORDER BY start_date DESC',
        [profile.id]
      );

      // Get certifications
      const certificationsResult = await pool.query(
        'SELECT * FROM job_seeker_certifications WHERE profile_id = $1 ORDER BY issue_date DESC',
        [profile.id]
      );

      // Get languages
      const languagesResult = await pool.query(
        'SELECT * FROM job_seeker_languages WHERE profile_id = $1 ORDER BY language_name ASC',
        [profile.id]
      );

      // Get documents
      const documentsResult = await pool.query(
        'SELECT * FROM job_seeker_documents WHERE profile_id = $1 ORDER BY uploaded_at DESC',
        [profile.id]
      );

      // Get preferred job categories
      const preferredCategoriesResult = await pool.query(
        `SELECT jc.id, jc.category_name, jc.description
         FROM job_categories jc
         INNER JOIN job_seeker_preferred_categories jspc ON jc.id = jspc.category_id
         WHERE jspc.profile_id = $1
         ORDER BY jc.category_name ASC`,
        [profile.id]
      );

      // Calculate profile completion
      const completion = this.calculateCompletion(
        user,
        profile,
        skillsResult.rows,
        experienceResult.rows,
        educationResult.rows,
        certificationsResult.rows,
        languagesResult.rows
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          fullName: `${user.first_name} ${user.last_name}`.trim(),
        },
        profile: {
          id: profile.id,
          headline: profile.headline,
          bio: profile.bio,
          location: profile.location,
          phone: profile.phone,
          profilePhotoUrl: profile.profile_photo_url,
          linkedinUrl: profile.linkedin_url,
          portfolioUrl: profile.portfolio_url,
          resumeUrl: profile.resume_url,
          coverLetterUrl: profile.cover_letter_url,
          idDocumentUrl: profile.id_document_url,
          portfolioFileUrl: profile.portfolio_url,
          yearsOfExperience: profile.years_of_experience,
          desiredSalaryMin: profile.desired_salary_min,
          desiredSalaryMax: profile.desired_salary_max,
          salaryCurrency: profile.salary_currency,
          isOpenToWork: profile.is_open_to_work,
          careerObjectives: profile.career_objectives,
          preferredWorkType: profile.preferred_work_type,
          availabilityStartDate: profile.availability_start_date,
          completion,
        },
        preferences: {
          emailNotificationsEnabled: profile.email_notifications_enabled,
          pushNotificationsEnabled: profile.push_notifications_enabled,
          jobAlertsEnabled: profile.job_alerts_enabled,
          applicationUpdatesEnabled: profile.application_updates_enabled,
          marketingEmailsEnabled: profile.marketing_emails_enabled,
        },
        preferredJobCategories: preferredCategoriesResult.rows.map(c => ({
          id: c.id,
          categoryName: c.category_name,
          description: c.description,
        })),
        skills: skillsResult.rows.map(s => ({
          id: s.id,
          name: s.skill_name,
          proficiencyLevel: s.proficiency_level,
          yearsExperience: s.years_experience,
        })),
        experience: experienceResult.rows.map(e => ({
          id: e.id,
          companyName: e.company_name,
          jobTitle: e.job_title,
          description: e.description,
          startDate: e.start_date,
          endDate: e.end_date,
          isCurrent: e.is_current,
          location: e.location,
        })),
        education: educationResult.rows.map(e => ({
          id: e.id,
          institutionName: e.institution_name,
          degree: e.degree,
          fieldOfStudy: e.field_of_study,
          startDate: e.start_date,
          endDate: e.end_date,
          grade: e.grade,
          description: e.description,
        })),
        certifications: certificationsResult.rows.map(c => ({
          id: c.id,
          certificationName: c.certification_name,
          issuingOrganization: c.issuing_organization,
          issueDate: c.issue_date,
          expiryDate: c.expiry_date,
          credentialId: c.credential_id,
          credentialUrl: c.credential_url,
          description: c.description,
        })),
        languages: languagesResult.rows.map(l => ({
          id: l.id,
          languageName: l.language_name,
          proficiencyLevel: l.proficiency_level,
        })),
        documents: documentsResult.rows.map(d => ({
          id: d.id,
          documentType: d.document_type,
          documentName: d.document_name,
          fileUrl: d.file_url,
          fileSize: d.file_size,
          mimeType: d.mime_type,
          uploadedAt: d.uploaded_at,
          updatedAt: d.updated_at,
          description: d.description,
          isPrimary: d.is_primary,
        })),
      };
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update personal information
  async updatePersonalInfo(userId: number, data: PersonalInfo) {
    try {
      // Get profile ID
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      // Update profile
      const result = await pool.query(
        `UPDATE job_seeker_profiles
         SET headline = COALESCE($1, headline),
             bio = COALESCE($2, bio),
             location = COALESCE($3, location),
             phone = COALESCE($4, phone),
             linkedin_url = COALESCE($5, linkedin_url),
             portfolio_url = COALESCE($6, portfolio_url),
             years_of_experience = COALESCE($7, years_of_experience),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8
         RETURNING *`,
        [
          data.headline,
          data.bio,
          data.location,
          data.phone,
          data.linkedinUrl,
          data.portfolioUrl,
          data.yearsOfExperience,
          profileId,
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Update personal info error:', error);
      throw error;
    }
  }

  // Add skill
  async addSkill(userId: number, skill: Skill) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      const result = await pool.query(
        `INSERT INTO job_seeker_skills (profile_id, skill_name, proficiency_level, years_experience)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [profileId, skill.skillName, skill.proficiencyLevel, skill.yearsExperience]
      );

      return {
        id: result.rows[0].id,
        name: result.rows[0].skill_name,
        proficiencyLevel: result.rows[0].proficiency_level,
        yearsExperience: result.rows[0].years_experience,
      };
    } catch (error) {
      console.error('Add skill error:', error);
      throw error;
    }
  }

  // Remove skill
  async removeSkill(userId: number, skillId: number) {
    try {
      const result = await pool.query(
        `DELETE FROM job_seeker_skills
         WHERE id = $1
         AND profile_id IN (SELECT id FROM job_seeker_profiles WHERE user_id = $2)
         RETURNING id`,
        [skillId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Skill not found or unauthorized');
      }

      return { success: true };
    } catch (error) {
      console.error('Remove skill error:', error);
      throw error;
    }
  }

  // Add experience
  async addExperience(userId: number, experience: Experience) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      const result = await pool.query(
        `INSERT INTO job_seeker_experience
         (profile_id, company_name, job_title, description, start_date, end_date, is_current, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          profileId,
          experience.companyName,
          experience.jobTitle,
          experience.description,
          experience.startDate,
          experience.endDate,
          experience.isCurrent,
          experience.location,
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Add experience error:', error);
      throw error;
    }
  }

  // Add education
  async addEducation(userId: number, education: Education) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      const result = await pool.query(
        `INSERT INTO job_seeker_education
         (profile_id, institution_name, degree, field_of_study, start_date, end_date, grade, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          profileId,
          education.institutionName,
          education.degree,
          education.fieldOfStudy,
          education.startDate,
          education.endDate,
          education.grade,
          education.description,
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Add education error:', error);
      throw error;
    }
  }

  // Calculate profile completion percentage
  private calculateCompletion(
    user: any,
    profile: any,
    skills: any[],
    experience: any[],
    education: any[],
    certifications: any[] = [],
    languages: any[] = []
  ): number {
    let score = 0;
    const maxScore = 100;

    // Basic info (25 points)
    if (user.first_name && user.last_name) score += 4;
    if (user.email) score += 4;
    if (profile.phone) score += 4;
    if (profile.location) score += 4;
    if (profile.headline) score += 5;
    if (profile.bio && profile.bio.length > 50) score += 4;

    // Skills (15 points)
    if (skills.length > 0) score += 8;
    if (skills.length >= 5) score += 7;

    // Experience (20 points)
    if (experience.length > 0) score += 12;
    if (experience.length >= 2) score += 8;

    // Education (15 points)
    if (education.length > 0) score += 10;
    if (education.length >= 2) score += 5;

    // Certifications (10 points)
    if (certifications.length > 0) score += 6;
    if (certifications.length >= 2) score += 4;

    // Languages (5 points)
    if (languages.length > 0) score += 3;
    if (languages.length >= 2) score += 2;

    // Career Objectives (5 points)
    if (profile.career_objectives && profile.career_objectives.length > 50) score += 5;

    // Additional info (5 points)
    if (profile.linkedin_url) score += 3;
    if (profile.portfolio_url) score += 2;

    return Math.min(score, maxScore);
  }

  // Update profile photo
  async updateProfilePhoto(userId: number, photoUrl: string | null) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      await pool.query(
        `UPDATE job_seeker_profiles
         SET profile_photo_url = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [photoUrl, profileId]
      );

      return { success: true };
    } catch (error) {
      console.error('Update profile photo error:', error);
      throw error;
    }
  }

  // Update resume URL
  async updateResumeUrl(userId: number, resumeUrl: string | null) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      await pool.query(
        `UPDATE job_seeker_profiles
         SET resume_url = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [resumeUrl, profileId]
      );

      return { success: true };
    } catch (error) {
      console.error('Update resume URL error:', error);
      throw error;
    }
  }

  // Add certification
  async addCertification(userId: number, certification: Certification) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      const result = await pool.query(
        `INSERT INTO job_seeker_certifications
         (profile_id, certification_name, issuing_organization, issue_date, expiry_date, credential_id, credential_url, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          profileId,
          certification.certificationName,
          certification.issuingOrganization,
          certification.issueDate,
          certification.expiryDate,
          certification.credentialId,
          certification.credentialUrl,
          certification.description,
        ]
      );

      return {
        id: result.rows[0].id,
        certificationName: result.rows[0].certification_name,
        issuingOrganization: result.rows[0].issuing_organization,
        issueDate: result.rows[0].issue_date,
        expiryDate: result.rows[0].expiry_date,
        credentialId: result.rows[0].credential_id,
        credentialUrl: result.rows[0].credential_url,
        description: result.rows[0].description,
      };
    } catch (error) {
      console.error('Add certification error:', error);
      throw error;
    }
  }

  // Update certification
  async updateCertification(userId: number, certificationId: number, certification: Partial<Certification>) {
    try {
      const result = await pool.query(
        `UPDATE job_seeker_certifications
         SET certification_name = COALESCE($1, certification_name),
             issuing_organization = COALESCE($2, issuing_organization),
             issue_date = COALESCE($3, issue_date),
             expiry_date = COALESCE($4, expiry_date),
             credential_id = COALESCE($5, credential_id),
             credential_url = COALESCE($6, credential_url),
             description = COALESCE($7, description),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8
         AND profile_id IN (SELECT id FROM job_seeker_profiles WHERE user_id = $9)
         RETURNING *`,
        [
          certification.certificationName,
          certification.issuingOrganization,
          certification.issueDate,
          certification.expiryDate,
          certification.credentialId,
          certification.credentialUrl,
          certification.description,
          certificationId,
          userId,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error('Certification not found or unauthorized');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Update certification error:', error);
      throw error;
    }
  }

  // Remove certification
  async removeCertification(userId: number, certificationId: number) {
    try {
      const result = await pool.query(
        `DELETE FROM job_seeker_certifications
         WHERE id = $1
         AND profile_id IN (SELECT id FROM job_seeker_profiles WHERE user_id = $2)
         RETURNING id`,
        [certificationId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Certification not found or unauthorized');
      }

      return { success: true };
    } catch (error) {
      console.error('Remove certification error:', error);
      throw error;
    }
  }

  // Add language
  async addLanguage(userId: number, language: Language) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      const result = await pool.query(
        `INSERT INTO job_seeker_languages
         (profile_id, language_name, proficiency_level)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [profileId, language.languageName, language.proficiencyLevel]
      );

      return {
        id: result.rows[0].id,
        languageName: result.rows[0].language_name,
        proficiencyLevel: result.rows[0].proficiency_level,
      };
    } catch (error) {
      console.error('Add language error:', error);
      throw error;
    }
  }

  // Update language
  async updateLanguage(userId: number, languageId: number, language: Partial<Language>) {
    try {
      const result = await pool.query(
        `UPDATE job_seeker_languages
         SET language_name = COALESCE($1, language_name),
             proficiency_level = COALESCE($2, proficiency_level),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         AND profile_id IN (SELECT id FROM job_seeker_profiles WHERE user_id = $4)
         RETURNING *`,
        [language.languageName, language.proficiencyLevel, languageId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Language not found or unauthorized');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Update language error:', error);
      throw error;
    }
  }

  // Remove language
  async removeLanguage(userId: number, languageId: number) {
    try {
      const result = await pool.query(
        `DELETE FROM job_seeker_languages
         WHERE id = $1
         AND profile_id IN (SELECT id FROM job_seeker_profiles WHERE user_id = $2)
         RETURNING id`,
        [languageId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Language not found or unauthorized');
      }

      return { success: true };
    } catch (error) {
      console.error('Remove language error:', error);
      throw error;
    }
  }

  // Update career objectives
  async updateCareerObjectives(userId: number, data: CareerObjectives) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      const result = await pool.query(
        `UPDATE job_seeker_profiles
         SET career_objectives = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [data.careerObjectives, profileId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Update career objectives error:', error);
      throw error;
    }
  }

  // ==================== Document Management ====================

  // Upload document
  async uploadDocument(userId: number, document: Document) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      // If document is marked as primary, unmark other documents of the same type
      if (document.isPrimary) {
        await pool.query(
          `UPDATE job_seeker_documents
           SET is_primary = FALSE
           WHERE profile_id = $1 AND document_type = $2`,
          [profileId, document.documentType]
        );
      }

      const result = await pool.query(
        `INSERT INTO job_seeker_documents
         (profile_id, document_type, document_name, file_url, file_size, mime_type, description, is_primary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          profileId,
          document.documentType,
          document.documentName,
          document.fileUrl,
          document.fileSize || null,
          document.mimeType || null,
          document.description || null,
          document.isPrimary || false,
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  }

  // Get all documents for a user
  async getDocuments(userId: number, documentType?: string) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      let query = 'SELECT * FROM job_seeker_documents WHERE profile_id = $1';
      const params: any[] = [profileId];

      if (documentType) {
        query += ' AND document_type = $2';
        params.push(documentType);
      }

      query += ' ORDER BY uploaded_at DESC';

      const result = await pool.query(query, params);

      return result.rows.map(d => ({
        id: d.id,
        documentType: d.document_type,
        documentName: d.document_name,
        fileUrl: d.file_url,
        fileSize: d.file_size,
        mimeType: d.mime_type,
        uploadedAt: d.uploaded_at,
        updatedAt: d.updated_at,
        description: d.description,
        isPrimary: d.is_primary,
      }));
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  }

  // Update document
  async updateDocument(userId: number, documentId: number, updates: Partial<Document>) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      // Verify document belongs to user
      const docResult = await pool.query(
        'SELECT * FROM job_seeker_documents WHERE id = $1 AND profile_id = $2',
        [documentId, profileId]
      );

      if (docResult.rows.length === 0) {
        throw new Error('Document not found');
      }

      // If setting as primary, unmark other documents of the same type
      if (updates.isPrimary) {
        await pool.query(
          `UPDATE job_seeker_documents
           SET is_primary = FALSE
           WHERE profile_id = $1 AND document_type = $2 AND id != $3`,
          [profileId, docResult.rows[0].document_type, documentId]
        );
      }

      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (updates.documentName !== undefined) {
        updateFields.push(`document_name = $${paramIndex++}`);
        values.push(updates.documentName);
      }
      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(updates.description);
      }
      if (updates.isPrimary !== undefined) {
        updateFields.push(`is_primary = $${paramIndex++}`);
        values.push(updates.isPrimary);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(documentId);

      const result = await pool.query(
        `UPDATE job_seeker_documents
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Update document error:', error);
      throw error;
    }
  }

  // Delete document
  async deleteDocument(userId: number, documentId: number) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      // Verify document belongs to user and get file URL
      const docResult = await pool.query(
        'SELECT file_url FROM job_seeker_documents WHERE id = $1 AND profile_id = $2',
        [documentId, profileId]
      );

      if (docResult.rows.length === 0) {
        throw new Error('Document not found');
      }

      await pool.query(
        'DELETE FROM job_seeker_documents WHERE id = $1',
        [documentId]
      );

      return docResult.rows[0].file_url;
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  }

  // Update cover letter URL in profile
  async updateCoverLetterUrl(userId: number, url: string | null) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      await pool.query(
        `UPDATE job_seeker_profiles
         SET cover_letter_url = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [url, profileId]
      );

      return url;
    } catch (error) {
      console.error('Update cover letter URL error:', error);
      throw error;
    }
  }

  // Update ID document URL in profile
  async updateIdDocumentUrl(userId: number, url: string | null) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      await pool.query(
        `UPDATE job_seeker_profiles
         SET id_document_url = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [url, profileId]
      );

      return url;
    } catch (error) {
      console.error('Update ID document URL error:', error);
      throw error;
    }
  }

  // Update portfolio URL in profile
  async updatePortfolioUrl(userId: number, url: string | null) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      await pool.query(
        `UPDATE job_seeker_profiles
         SET portfolio_url = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [url, profileId]
      );

      return url;
    } catch (error) {
      console.error('Update portfolio URL error:', error);
      throw error;
    }
  }

  // Add certificate file URL to certification record
  async updateCertificationFileUrl(userId: number, certificationId: number, fileUrl: string | null) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      // Verify certification belongs to user
      const certResult = await pool.query(
        'SELECT id FROM job_seeker_certifications WHERE id = $1 AND profile_id = $2',
        [certificationId, profileId]
      );

      if (certResult.rows.length === 0) {
        throw new Error('Certification not found');
      }

      await pool.query(
        `UPDATE job_seeker_certifications
         SET certificate_file_url = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [fileUrl, certificationId]
      );

      return fileUrl;
    } catch (error) {
      console.error('Update certification file URL error:', error);
      throw error;
    }
  }

  // ===== PREFERENCES MANAGEMENT =====

  // Get all available job categories
  async getAllJobCategories() {
    try {
      const result = await pool.query(
        'SELECT * FROM job_categories ORDER BY category_name ASC'
      );

      return result.rows.map(c => ({
        id: c.id,
        categoryName: c.category_name,
        description: c.description,
      }));
    } catch (error) {
      console.error('Get job categories error:', error);
      throw error;
    }
  }

  // Update preferred job categories
  async updatePreferredCategories(userId: number, categoryIds: number[]) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const profileResult = await client.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      // Delete existing preferences
      await client.query(
        'DELETE FROM job_seeker_preferred_categories WHERE profile_id = $1',
        [profileId]
      );

      // Insert new preferences
      if (categoryIds.length > 0) {
        const values = categoryIds.map((catId, idx) =>
          `($1, $${idx + 2})`
        ).join(', ');

        await client.query(
          `INSERT INTO job_seeker_preferred_categories (profile_id, category_id) VALUES ${values}`,
          [profileId, ...categoryIds]
        );
      }

      await client.query('COMMIT');

      // Return updated categories
      const result = await pool.query(
        `SELECT jc.id, jc.category_name, jc.description
         FROM job_categories jc
         INNER JOIN job_seeker_preferred_categories jspc ON jc.id = jspc.category_id
         WHERE jspc.profile_id = $1
         ORDER BY jc.category_name ASC`,
        [profileId]
      );

      return result.rows.map(c => ({
        id: c.id,
        categoryName: c.category_name,
        description: c.description,
      }));
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update preferred categories error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update work preferences (salary, work type, availability)
  async updateWorkPreferences(userId: number, preferences: {
    desiredSalaryMin?: number | null;
    desiredSalaryMax?: number | null;
    salaryCurrency?: string;
    preferredWorkType?: 'remote' | 'office' | 'hybrid' | null;
    availabilityStartDate?: string | null;
  }) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (preferences.desiredSalaryMin !== undefined) {
        updates.push(`desired_salary_min = $${paramCount++}`);
        values.push(preferences.desiredSalaryMin);
      }

      if (preferences.desiredSalaryMax !== undefined) {
        updates.push(`desired_salary_max = $${paramCount++}`);
        values.push(preferences.desiredSalaryMax);
      }

      if (preferences.salaryCurrency) {
        updates.push(`salary_currency = $${paramCount++}`);
        values.push(preferences.salaryCurrency);
      }

      if (preferences.preferredWorkType !== undefined) {
        updates.push(`preferred_work_type = $${paramCount++}`);
        values.push(preferences.preferredWorkType);
      }

      if (preferences.availabilityStartDate !== undefined) {
        updates.push(`availability_start_date = $${paramCount++}`);
        values.push(preferences.availabilityStartDate);
      }

      if (updates.length === 0) {
        return { success: true };
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(profileId);

      await pool.query(
        `UPDATE job_seeker_profiles SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );

      return { success: true };
    } catch (error) {
      console.error('Update work preferences error:', error);
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(userId: number, preferences: {
    emailNotificationsEnabled?: boolean;
    pushNotificationsEnabled?: boolean;
    jobAlertsEnabled?: boolean;
    applicationUpdatesEnabled?: boolean;
    marketingEmailsEnabled?: boolean;
  }) {
    try {
      const profileResult = await pool.query(
        'SELECT id FROM job_seeker_profiles WHERE user_id = $1',
        [userId]
      );

      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }

      const profileId = profileResult.rows[0].id;

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (preferences.emailNotificationsEnabled !== undefined) {
        updates.push(`email_notifications_enabled = $${paramCount++}`);
        values.push(preferences.emailNotificationsEnabled);
      }

      if (preferences.pushNotificationsEnabled !== undefined) {
        updates.push(`push_notifications_enabled = $${paramCount++}`);
        values.push(preferences.pushNotificationsEnabled);
      }

      if (preferences.jobAlertsEnabled !== undefined) {
        updates.push(`job_alerts_enabled = $${paramCount++}`);
        values.push(preferences.jobAlertsEnabled);
      }

      if (preferences.applicationUpdatesEnabled !== undefined) {
        updates.push(`application_updates_enabled = $${paramCount++}`);
        values.push(preferences.applicationUpdatesEnabled);
      }

      if (preferences.marketingEmailsEnabled !== undefined) {
        updates.push(`marketing_emails_enabled = $${paramCount++}`);
        values.push(preferences.marketingEmailsEnabled);
      }

      if (updates.length === 0) {
        return { success: true };
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(profileId);

      await pool.query(
        `UPDATE job_seeker_profiles SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );

      return { success: true };
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  }
}

export default new ProfileService();
