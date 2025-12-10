import express from 'express';
import { authenticateToken } from '../middleware/auth';
import pool from '../database/config';

const router = express.Router();

// Get employer dashboard statistics
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get employer profile
    const employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    if (employerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const employerId = employerResult.rows[0].id;

    // Get active jobs count
    const activeJobsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM jobs
       WHERE employer_id = $1 AND status = 'published'`,
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

    const activeJobs = parseInt(activeJobsResult.rows[0].count);
    const totalApplicants = parseInt(applicantsResult.rows[0].count);
    const recentApplicants = parseInt(recentApplicantsResult.rows[0].count);
    const previousApplicants = parseInt(previousApplicantsResult.rows[0].count);

    // Calculate growth percentage
    const applicantGrowth = previousApplicants > 0
      ? Math.round(((recentApplicants - previousApplicants) / previousApplicants) * 100)
      : 0;

    res.json({
      activeJobs,
      totalApplicants,
      recentApplicants,
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

    // Get employer profile
    const employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    if (employerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const employerId = employerResult.rows[0].id;

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

// Get all jobs for employer
router.get('/jobs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get employer profile
    const employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    if (employerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const employerId = employerResult.rows[0].id;

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

    if (employerResult.rows.length === 0) {
      // Auto-create employer profile if it doesn't exist
      const userResult = await pool.query(
        'SELECT first_name, last_name FROM users WHERE id = $1',
        [userId]
      );

      const user = userResult.rows[0];
      const companyName = `${user.first_name} ${user.last_name}'s Company`;

      employerResult = await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name, company_description, company_size)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, companyName, 'A great place to work', '1-10']
      );
    }

    const employerId = employerResult.rows[0].id;

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

    // Get employer profile
    const employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    if (employerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const employerId = employerResult.rows[0].id;

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

    // Get employer profile
    const employerResult = await pool.query(
      'SELECT id FROM employer_profiles WHERE user_id = $1',
      [userId]
    );

    if (employerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }

    const employerId = employerResult.rows[0].id;

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

export default router;
