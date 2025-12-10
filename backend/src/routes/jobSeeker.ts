import express from 'express';
import { authenticateToken } from '../middleware/auth';
import pool from '../database/config';

const router = express.Router();

// Get job seeker's applications
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get applications with job details, including job status
    // Only show applications where job is still active or user has already applied
    const applicationsResult = await pool.query(
      `SELECT
        a.id,
        a.job_id,
        a.status,
        a.cover_letter,
        a.match_score,
        a.applied_at,
        j.title as job_title,
        j.description as job_description,
        j.requirements,
        j.responsibilities,
        j.benefits,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.status as job_status,
        j.applications_count,
        j.created_at as posted_at,
        e.company_name,
        e.company_logo_url,
        e.company_description
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN employer_profiles e ON j.employer_id = e.id
      WHERE a.applicant_id = $1
        AND j.status = 'published'
      ORDER BY a.applied_at DESC`,
      [userId]
    );

    const applications = applicationsResult.rows.map(row => ({
      id: row.id,
      jobId: row.job_id,
      jobTitle: row.job_title,
      jobDescription: row.job_description,
      requirements: row.requirements,
      responsibilities: row.responsibilities,
      benefits: row.benefits,
      company: row.company_name,
      companyLogo: row.company_logo_url,
      companyDescription: row.company_description,
      location: row.location,
      jobType: row.job_type,
      salaryMin: row.salary_min,
      salaryMax: row.salary_max,
      salaryCurrency: row.salary_currency,
      jobStatus: row.job_status,
      applicationsCount: row.applications_count,
      postedAt: row.posted_at,
      status: row.status, // application status
      coverLetter: row.cover_letter,
      matchScore: parseFloat(row.match_score),
      appliedAt: row.applied_at,
    }));

    res.json({ applications });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Apply for a job
router.post('/applications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Check if already applied
    const existingApplication = await pool.query(
      'SELECT id FROM applications WHERE job_id = $1 AND applicant_id = $2',
      [jobId, userId]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create application
    const applicationResult = await pool.query(
      `INSERT INTO applications (job_id, applicant_id, status, cover_letter, match_score)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [jobId, userId, 'pending', coverLetter || null, 0]
    );

    // Update job applications count
    await pool.query(
      'UPDATE jobs SET applications_count = applications_count + 1 WHERE id = $1',
      [jobId]
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      application: applicationResult.rows[0],
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// Get job seeker dashboard stats
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get total applications
    const applicationsResult = await pool.query(
      'SELECT COUNT(*) as count FROM applications WHERE applicant_id = $1',
      [userId]
    );

    // Get interviews count (shortlisted + interview status)
    const interviewsResult = await pool.query(
      `SELECT COUNT(*) as count FROM applications
       WHERE applicant_id = $1
       AND status IN ('shortlisted', 'interview')`,
      [userId]
    );

    const totalApplications = parseInt(applicationsResult.rows[0].count);
    const interviews = parseInt(interviewsResult.rows[0].count);

    res.json({
      totalApplications,
      interviews,
      profileCompletion: 0,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// Get saved jobs
router.get('/saved-jobs', authenticateToken, async (req, res) => {
    try {
        const userId = req.user!.id;
        const result = await pool.query('SELECT job_id FROM saved_jobs WHERE user_id = $1', [userId]);
        const savedJobIds = result.rows.map(row => row.job_id.toString());
        res.json({ savedJobIds });
    } catch (error) {
        console.error('Failed to get saved jobs', error);
        res.status(500).json({ message: 'Failed to get saved jobs' });
    }
});

// Save a job
router.post('/saved-jobs', authenticateToken, async (req, res) => {
    try {
        const userId = req.user!.id;
        const { jobId } = req.body;
        if (!jobId) {
            return res.status(400).json({ message: 'Job ID is required' });
        }
        await pool.query('INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, jobId]);
        res.status(201).json({ message: 'Job saved successfully' });
    } catch (error) {
        console.error('Failed to save job', error);
        res.status(500).json({ message: 'Failed to save job' });
    }
});

// Un-save a job
router.delete('/saved-jobs/:jobId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user!.id;
        const { jobId } = req.params;
        if (!jobId) {
            return res.status(400).json({ message: 'Job ID is required' });
        }
        await pool.query('DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2', [userId, jobId]);
        res.status(200).json({ message: 'Job unsaved successfully' });
    } catch (error) {
        console.error('Failed to unsave job', error);
        res.status(500).json({ message: 'Failed to unsave job' });
    }
});

// Withdraw an application
router.delete('/applications/:applicationId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({ message: 'Application ID is required' });
    }

    // Check if application exists and belongs to user
    const applicationCheck = await pool.query(
      'SELECT id, job_id, status FROM applications WHERE id = $1 AND applicant_id = $2',
      [applicationId, userId]
    );

    if (applicationCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = applicationCheck.rows[0];

    // Prevent withdrawal if already in final stages
    if (['hired', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        message: `Cannot withdraw application with status: ${application.status}`,
      });
    }

    // Update application status to 'withdrawn'
    await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2',
      ['withdrawn', applicationId]
    );

    // Decrement job applications count
    await pool.query(
      'UPDATE jobs SET applications_count = GREATEST(applications_count - 1, 0) WHERE id = $1',
      [application.job_id]
    );

    res.json({
      message: 'Application withdrawn successfully',
      applicationId: parseInt(applicationId),
    });
  } catch (error) {
    console.error('Application withdrawal error:', error);
    console.error('Full error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    res.status(500).json({
      message: 'Failed to withdraw application',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get single application details
router.get('/applications/:applicationId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { applicationId } = req.params;

    const result = await pool.query(
      `SELECT
        a.id,
        a.job_id,
        a.status,
        a.cover_letter,
        a.match_score,
        a.applied_at,
        j.title as job_title,
        j.description as job_description,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.status as job_status,
        j.applications_count,
        j.created_at as posted_at,
        j.requirements,
        j.responsibilities,
        j.benefits,
        e.company_name,
        e.company_logo_url,
        e.company_description,
        e.company_website
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN employer_profiles e ON j.employer_id = e.id
      WHERE a.id = $1 AND a.applicant_id = $2`,
      [applicationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const row = result.rows[0];
    const application = {
      id: row.id,
      jobId: row.job_id,
      jobTitle: row.job_title,
      jobDescription: row.job_description,
      company: row.company_name,
      companyLogo: row.company_logo_url,
      companyDescription: row.company_description,
      companyWebsite: row.company_website,
      location: row.location,
      jobType: row.job_type,
      salaryMin: row.salary_min,
      salaryMax: row.salary_max,
      salaryCurrency: row.salary_currency,
      jobStatus: row.job_status,
      applicationsCount: row.applications_count,
      postedAt: row.posted_at,
      requirements: row.requirements,
      responsibilities: row.responsibilities,
      benefits: row.benefits,
      status: row.status,
      coverLetter: row.cover_letter,
      matchScore: parseFloat(row.match_score),
      appliedAt: row.applied_at,
    };

    res.json({ application });
  } catch (error) {
    console.error('Application details fetch error:', error);
    console.error('Full error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    res.status(500).json({
      message: 'Failed to fetch application details',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;

