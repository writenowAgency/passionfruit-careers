import express from 'express';
import { authenticateToken, authenticateTokenFromHeaderOrQuery } from '../middleware/auth';
import pool from '../database/config';
import axios from 'axios';

const router = express.Router();

// Get employer dashboard statistics
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get or create employer profile
    let employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    let employerId: number;

    // If employer profile doesn't exist, create one
    if (employerResult.rows.length === 0) {
      console.log(`Creating employer profile for user ${userId}`);
      const createResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id`,
        [userId, 'My Company']
      );
      employerId = createResult.rows[0].id;
    } else {
      employerId = employerResult.rows[0].id;
    }

    // Get active jobs count (check both 'published' and 'active' status)
    const activeJobsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM jobs
       WHERE employer_id = $1 AND status IN ('published', 'active', 'open')`,
      [employerId]
    );

    // Get total applicants count
    const applicantsResult = await pool.query(
      `SELECT COUNT(DISTINCT a.applicant_id) as count
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.employer_id = $1`,
      [employerId]
    );

    // Get recent applicants count (last 7 days)
    const recentApplicantsResult = await pool.query(
      `SELECT COUNT(DISTINCT a.applicant_id) as count
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.employer_id = $1
       AND a.applied_at >= NOW() - INTERVAL '7 days'`,
      [employerId]
    );

    // Get previous period for comparison
    const previousApplicantsResult = await pool.query(
      `SELECT COUNT(DISTINCT a.applicant_id) as count
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.employer_id = $1
       AND a.applied_at >= NOW() - INTERVAL '14 days'
       AND a.applied_at < NOW() - INTERVAL '7 days'`,
      [employerId]
    );

    // Get pending reviews count
    const pendingReviewsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.employer_id = $1 AND a.status = 'pending'`,
      [employerId]
    );

    const activeJobs = parseInt(activeJobsResult.rows[0].count);
    const totalApplicants = parseInt(applicantsResult.rows[0].count);
    const recentApplicants = parseInt(recentApplicantsResult.rows[0].count);
    const previousApplicants = parseInt(previousApplicantsResult.rows[0].count);
    const pendingReviews = parseInt(pendingReviewsResult.rows[0].count);

    console.log(`Stats for employer ${employerId}:`, {
      activeJobs,
      totalApplicants,
      recentApplicants,
      previousApplicants,
      pendingReviews
    });

    // Calculate growth percentage
    const applicantGrowth = previousApplicants > 0
      ? Math.round(((recentApplicants - previousApplicants) / previousApplicants) * 100)
      : 0;

    res.json({
      activeJobs,
      totalApplicants,
      recentApplicants,
      pendingReviews,
      applicantGrowth,
      jobGrowth: 3 // Placeholder, calculate from actual data if needed
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// Get recent applicants for employer
router.get('/dashboard/recent-applicants', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 5;

    // Get or create employer profile
    let employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    let employerId: number;

    if (employerResult.rows.length === 0) {
      console.log(`Creating employer profile for user ${userId}`);
      const createResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id`,
        [userId, 'My Company']
      );
      employerId = createResult.rows[0].id;
    } else {
      employerId = employerResult.rows[0].id;
    }

    // Get recent applicants with user details and job info
    const applicantsResult = await pool.query(
      `SELECT
        a.id,
        a.applied_at,
        a.status,
        a.match_score,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        j.id as job_id,
        j.title as job_title,
        p.headline
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.applicant_id = u.id
      LEFT JOIN job_seeker_profiles p ON p.user_id = u.id
      WHERE j.employer_id = $1
      ORDER BY a.applied_at DESC
      LIMIT $2`,
      [employerId, limit]
    );

    const applicants = applicantsResult.rows.map(row => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      role: row.headline || row.job_title,
      jobTitle: row.job_title,
      jobId: row.job_id,
      appliedAt: row.applied_at,
      status: row.status,
      matchScore: parseFloat(row.match_score)
    }));

    res.json({ applicants });
  } catch (error) {
    console.error('Recent applicants error:', error);
    res.status(500).json({ message: 'Failed to fetch recent applicants' });
  }
});

// Get recent activity for employer
router.get('/dashboard/activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get or create employer profile
    let employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    let employerId: number;

    if (employerResult.rows.length === 0) {
      console.log(`Creating employer profile for user ${userId}`);
      const createResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id`,
        [userId, 'My Company']
      );
      employerId = createResult.rows[0].id;
    } else {
      employerId = employerResult.rows[0].id;
    }

    // Fetch combined activities
    const activityResult = await pool.query(
      `SELECT * FROM (
        -- Recent Applications
        SELECT
          'application' as type,
          a.id::text as id,
          j.title as title,
          CONCAT(u.first_name, ' ', u.last_name, ' applied for ', j.title) as description,
          a.applied_at as timestamp,
          'document-text' as icon,
          '#2196F3' as icon_color
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users u ON a.applicant_id = u.id
        WHERE j.employer_id = $1

        UNION ALL

        -- Job Posts
        SELECT
          'job' as type,
          j.id::text as id,
          j.title as title,
          CONCAT(j.title, ' position is now ', j.status) as description,
          j.created_at as timestamp,
          'briefcase' as icon,
          '#4CAF50' as icon_color
        FROM jobs j
        WHERE j.employer_id = $1

        UNION ALL

        -- Status Updates (Reviews)
        SELECT
          'review' as type,
          a.id::text as id,
          j.title as title,
          CONCAT('You reviewed ', u.first_name, ' ', u.last_name, ' for ', j.title) as description,
          a.reviewed_at as timestamp,
          'eye' as icon,
          '#FF9800' as icon_color
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users u ON a.applicant_id = u.id
        WHERE j.employer_id = $1
          AND a.reviewed_at IS NOT NULL
      ) as combined_activities
      ORDER BY timestamp DESC
      LIMIT $2`,
      [employerId, limit]
    );

    res.json({ activities: activityResult.rows });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Failed to fetch recent activity' });
  }
});

// Get all jobs for employer
router.get('/jobs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get or create employer profile
    let employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    let employerId: number;

    if (employerResult.rows.length === 0) {
      console.log(`Creating employer profile for user ${userId}`);
      const createResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id`,
        [userId, 'My Company']
      );
      employerId = createResult.rows[0].id;
    } else {
      employerId = employerResult.rows[0].id;
    }

    // Get all jobs
    const jobsResult = await pool.query(
      `SELECT
        id,
        title,
        description,
        requirements,
        location,
        job_type,
        salary_min,
        salary_max,
        salary_currency,
        experience_level,
        status,
        views_count,
        applications_count,
        created_at,
        updated_at,
        expires_at
      FROM jobs
      WHERE employer_id = $1
      ORDER BY created_at DESC`,
      [employerId]
    );

    res.json({ jobs: jobsResult.rows });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Create a new job
router.post('/jobs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const {
      title,
      description,
      requirements,
      responsibilities,
      benefits,
      location,
      jobType,
      salaryMin,
      salaryMax,
      salaryCurrency,
      experienceLevel,
      status = 'published',
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Get employer profile (or create if doesn't exist)
    let employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    let employerId: number;

    if (employerResult.rows.length === 0) {
      // Auto-create employer profile if it doesn't exist
      const userResult = await pool.query(
        'SELECT first_name, last_name FROM users WHERE id = $1',
        [userId]
      );

      const user = userResult.rows[0];
      const companyName = `${user.first_name} ${user.last_name}'s Company`;

      const createResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, company_description, company_size)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, companyName, 'A great place to work', '1-10']
      );
      employerId = createResult.rows[0].id;
    } else {
      employerId = employerResult.rows[0].id;
    }

    // Create job
    const jobResult = await pool.query(
      `INSERT INTO jobs (
        employer_id,
        title,
        description,
        requirements,
        responsibilities,
        benefits,
        location,
        job_type,
        salary_min,
        salary_max,
        salary_currency,
        experience_level,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        employerId,
        title,
        description,
        requirements || null,
        responsibilities || null,
        benefits || null,
        location || null,
        jobType || null,
        salaryMin || null,
        salaryMax || null,
        salaryCurrency || 'ZAR',
        experienceLevel || null,
        status,
      ]
    );

    res.status(201).json({
      message: 'Job created successfully',
      job: jobResult.rows[0],
    });
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ message: 'Failed to create job' });
  }
});

// Update a job
router.put('/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const jobId = parseInt(req.params.id);
    const {
      title,
      description,
      requirements,
      responsibilities,
      benefits,
      location,
      jobType,
      salaryMin,
      salaryMax,
      salaryCurrency,
      experienceLevel,
      status,
    } = req.body;

    // Get or create employer profile
    let employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    let employerId: number;

    if (employerResult.rows.length === 0) {
      console.log(`Creating employer profile for user ${userId}`);
      const createResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id`,
        [userId, 'My Company']
      );
      employerId = createResult.rows[0].id;
    } else {
      employerId = employerResult.rows[0].id;
    }

    // Verify job belongs to employer
    const jobCheck = await pool.query(
      'SELECT id FROM jobs WHERE id = $1 AND employer_id = $2',
      [jobId, employerId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (requirements !== undefined) {
      updates.push(`requirements = $${paramCount++}`);
      values.push(requirements);
    }
    if (responsibilities !== undefined) {
      updates.push(`responsibilities = $${paramCount++}`);
      values.push(responsibilities);
    }
    if (benefits !== undefined) {
      updates.push(`benefits = $${paramCount++}`);
      values.push(benefits);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (jobType !== undefined) {
      updates.push(`job_type = $${paramCount++}`);
      values.push(jobType);
    }
    if (salaryMin !== undefined) {
      updates.push(`salary_min = $${paramCount++}`);
      values.push(salaryMin);
    }
    if (salaryMax !== undefined) {
      updates.push(`salary_max = $${paramCount++}`);
      values.push(salaryMax);
    }
    if (salaryCurrency !== undefined) {
      updates.push(`salary_currency = $${paramCount++}`);
      values.push(salaryCurrency);
    }
    if (experienceLevel !== undefined) {
      updates.push(`experience_level = $${paramCount++}`);
      values.push(experienceLevel);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(jobId);

    const updateQuery = `
      UPDATE jobs
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);

    res.json({
      message: 'Job updated successfully',
      job: result.rows[0],
    });
  } catch (error) {
    console.error('Job update error:', error);
    res.status(500).json({ message: 'Failed to update job' });
  }
});

// Delete a job
router.delete('/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const jobId = parseInt(req.params.id);

    // Get or create employer profile
    let employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    let employerId: number;

    if (employerResult.rows.length === 0) {
      console.log(`Creating employer profile for user ${userId}`);
      const createResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id`,
        [userId, 'My Company']
      );
      employerId = createResult.rows[0].id;
    } else {
      employerId = employerResult.rows[0].id;
    }

    // Delete job (will cascade to applications)
    const result = await pool.query(
      'DELETE FROM jobs WHERE id = $1 AND employer_id = $2 RETURNING id',
      [jobId, employerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Job deletion error:', error);
    res.status(500).json({ message: 'Failed to delete job' });
  }
});

// Get employer profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get or create employer profile
    let employerResult = await pool.query(
      `SELECT ep.*, u.email, u.first_name, u.last_name
       FROM employer_profiles ep
       JOIN users u ON ep.user_id = u.id
       WHERE ep.user_id = $1`,
      [userId]
    );

    let profile;

    if (employerResult.rows.length === 0) {
      console.log(`Creating employer profile for user ${userId}`);

      // Get user email
      const userResult = await pool.query(
        'SELECT email, first_name, last_name FROM users WHERE id = $1',
        [userId]
      );

      const createResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING *`,
        [userId, 'My Company']
      );

      profile = {
        ...createResult.rows[0],
        email: userResult.rows[0].email,
        first_name: userResult.rows[0].first_name,
        last_name: userResult.rows[0].last_name,
      };
    } else {
      profile = employerResult.rows[0];
    }

    res.json({
      companyName: profile.company_name || '',
      industry: profile.industry || '',
      companySize: profile.company_size || '',
      website: profile.company_website || '',
      description: profile.company_description || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.location || '',
      city: '', // Can be extracted from location if needed
      country: '', // Can be extracted from location if needed
      logo: profile.company_logo_url || null,
      linkedIn: '', // Add field to DB if needed
      twitter: '', // Add field to DB if needed
      facebook: '', // Add field to DB if needed
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update employer profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const {
      companyName,
      industry,
      companySize,
      website,
      description,
      phone,
      address,
      logo,
    } = req.body;

    console.log('Updating profile for user:', userId);
    console.log('Profile data:', req.body);

    // Get or create employer profile
    let employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    let employerId: number;

    if (employerResult.rows.length === 0) {
      console.log(`Creating employer profile for user ${userId}`);
      const createResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id`,
        [userId, companyName || 'My Company']
      );
      employerId = createResult.rows[0].id;
    } else {
      employerId = employerResult.rows[0].id;
    }

    // Update the profile
    const updateResult = await pool.query(
      `UPDATE employer_profiles
       SET company_name = $1,
           industry = $2,
           company_size = $3,
           company_website = $4,
           company_description = $5,
           phone = $6,
           location = $7,
           company_logo_url = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        companyName,
        industry,
        companySize,
        website,
        description,
        phone,
        address,
        logo,
        employerId,
      ]
    );

    console.log('Profile updated successfully:', updateResult.rows[0]);

    res.json({
      message: 'Profile updated successfully',
      profile: {
        companyName: updateResult.rows[0].company_name,
        industry: updateResult.rows[0].industry,
        companySize: updateResult.rows[0].company_size,
        website: updateResult.rows[0].company_website,
        description: updateResult.rows[0].company_description,
        phone: updateResult.rows[0].phone,
        address: updateResult.rows[0].location,
        logo: updateResult.rows[0].company_logo_url,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get full applicant details by application ID
router.get('/applicants/:applicationId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const applicationId = parseInt(req.params.applicationId);

    if (isNaN(applicationId)) {
      return res.status(400).json({ message: 'Invalid application ID' });
    }

    // Get or create employer profile
    let employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    let employerId: number;

    if (employerResult.rows.length === 0) {
      console.log(`Creating employer profile for user ${userId}`);
      const createResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id`,
        [userId, 'My Company']
      );
      employerId = createResult.rows[0].id;
    } else {
      employerId = employerResult.rows[0].id;
    }

    // Get application with job verification
    const applicationResult = await pool.query(
      `SELECT a.*, j.title as job_title, j.employer_id
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1`,
      [applicationId]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = applicationResult.rows[0];

    // Verify the application belongs to this employer
    if (application.employer_id !== employerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applicantUserId = application.applicant_id;

    // Get basic user info
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
      [applicantUserId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    const user = userResult.rows[0];

    // Get job seeker profile
    const profileResult = await pool.query(
      'SELECT * FROM job_seeker_profiles WHERE user_id = $1',
      [applicantUserId]
    );

    const profile = profileResult.rows.length > 0 ? profileResult.rows[0] : null;
    const profileId = profile?.id;

    // Get all related data in parallel
    const [
      skillsResult,
      experienceResult,
      educationResult,
      certificationsResult,
      languagesResult,
      documentsResult,
    ] = await Promise.all([
      profileId ? pool.query('SELECT * FROM job_seeker_skills WHERE profile_id = $1 ORDER BY created_at DESC', [profileId]) : { rows: [] },
      profileId ? pool.query('SELECT * FROM job_seeker_experience WHERE profile_id = $1 ORDER BY start_date DESC', [profileId]) : { rows: [] },
      profileId ? pool.query('SELECT * FROM job_seeker_education WHERE profile_id = $1 ORDER BY start_date DESC', [profileId]) : { rows: [] },
      profileId ? pool.query('SELECT * FROM job_seeker_certifications WHERE profile_id = $1 ORDER BY issue_date DESC', [profileId]) : { rows: [] },
      profileId ? pool.query('SELECT * FROM job_seeker_languages WHERE profile_id = $1 ORDER BY language_name ASC', [profileId]) : { rows: [] },
      profileId ? pool.query('SELECT * FROM job_seeker_documents WHERE profile_id = $1 ORDER BY uploaded_at DESC', [profileId]) : { rows: [] },
    ]);

    // Build response
    res.json({
      application: {
        id: application.id,
        jobId: application.job_id,
        jobTitle: application.job_title,
        appliedAt: application.applied_at,
        status: application.status,
        matchScore: parseFloat(application.match_score),
        coverLetter: application.cover_letter,
        notes: application.notes,
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`.trim(),
        memberSince: user.created_at,
      },
      profile: profile ? {
        id: profile.id,
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        phone: profile.phone,
        profilePhotoUrl: profile.profile_photo_url,
        linkedinUrl: profile.linkedin_url,
        portfolioUrl: profile.portfolio_url,
        yearsOfExperience: profile.years_of_experience,
        desiredSalaryMin: profile.desired_salary_min,
        desiredSalaryMax: profile.desired_salary_max,
        salaryCurrency: profile.salary_currency,
        isOpenToWork: profile.is_open_to_work,
        careerObjectives: profile.career_objectives,
        preferredWorkType: profile.preferred_work_type,
        availabilityStartDate: profile.availability_start_date,
      } : null,
      skills: skillsResult.rows.map((s: any) => ({
        id: s.id,
        name: s.skill_name,
        proficiencyLevel: s.proficiency_level,
        yearsExperience: s.years_experience,
      })),
      experience: experienceResult.rows.map((e: any) => ({
        id: e.id,
        companyName: e.company_name,
        jobTitle: e.job_title,
        description: e.description,
        startDate: e.start_date,
        endDate: e.end_date,
        isCurrent: e.is_current,
        location: e.location,
      })),
      education: educationResult.rows.map((e: any) => ({
        id: e.id,
        institutionName: e.institution_name,
        degree: e.degree,
        fieldOfStudy: e.field_of_study,
        startDate: e.start_date,
        endDate: e.end_date,
        grade: e.grade,
        description: e.description,
      })),
      certifications: certificationsResult.rows.map((c: any) => ({
        id: c.id,
        certificationName: c.certification_name,
        issuingOrganization: c.issuing_organization,
        issueDate: c.issue_date,
        expiryDate: c.expiry_date,
        credentialId: c.credential_id,
        credentialUrl: c.credential_url,
        description: c.description,
      })),
      languages: languagesResult.rows.map((l: any) => ({
        id: l.id,
        languageName: l.language_name,
        proficiencyLevel: l.proficiency_level,
      })),
      documents: documentsResult.rows.map((d: any) => ({
        id: d.id,
        documentType: d.document_type,
        documentName: d.document_name,
        fileUrl: d.file_url,
        fileSize: d.file_size,
        mimeType: d.mime_type,
        uploadedAt: d.uploaded_at,
        description: d.description,
        isPrimary: d.is_primary,
      })),
    });
  } catch (error) {
    console.error('Get applicant details error:', error);
    res.status(500).json({ message: 'Failed to fetch applicant details' });
  }
});

// Proxy endpoint to serve applicant documents
router.get('/documents/:documentId', authenticateTokenFromHeaderOrQuery, async (req, res) => {
  try {
    const userId = req.user!.id;
    const documentId = parseInt(req.params.documentId);

    if (isNaN(documentId)) {
      return res.status(400).json({ message: 'Invalid document ID' });
    }

    // Get or create employer profile
    let employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    let employerId: number;

    if (employerResult.rows.length === 0) {
      console.log(`Creating employer profile for user ${userId}`);
      const createResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id`,
        [userId, 'My Company']
      );
      employerId = createResult.rows[0].id;
    } else {
      employerId = employerResult.rows[0].id;
    }

    // Get document and verify access
    const documentResult = await pool.query(
      `SELECT d.*, p.user_id as applicant_user_id
       FROM job_seeker_documents d
       JOIN job_seeker_profiles p ON d.profile_id = p.id
       WHERE d.id = $1`,
      [documentId]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = documentResult.rows[0];

    // Verify the employer has access to this applicant (they applied to one of employer's jobs)
    const accessCheck = await pool.query(
      `SELECT COUNT(*) as count
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.applicant_id = $1 AND j.employer_id = $2`,
      [document.applicant_user_id, employerId]
    );

    if (parseInt(accessCheck.rows[0].count) === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch the file from R2/storage
    const fileUrl = document.file_url;
    console.log('Fetching document from:', fileUrl);

    // If it's a local file, serve it directly
    if (fileUrl.startsWith('http://localhost') || fileUrl.startsWith('/uploads')) {
      // For local files, redirect to the local path
      return res.redirect(fileUrl);
    }

    // For R2 files, fetch as buffer and send
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const buffer = Buffer.from(response.data);
      console.log('Document fetched successfully, size:', buffer.length, 'bytes');
      console.log('MIME type:', document.mime_type);
      console.log('First 4 bytes (PDF signature):', buffer.slice(0, 4).toString());

      // Set appropriate headers
      res.setHeader('Content-Type', document.mime_type || 'application/pdf');
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Content-Disposition', `inline; filename="${document.document_name}"`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Content-Disposition');

      // Send the buffer using res.end() for binary data
      res.write(buffer);
      res.end();
    } catch (fetchError) {
      console.error('Error fetching from R2:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Document proxy error:', error);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
});

export default router;
