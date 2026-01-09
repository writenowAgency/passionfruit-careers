import express from 'express';
import pool from '../database/config';

const router = express.Router();

// Get all published jobs (public endpoint for job seekers)
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;
    let query = `
      SELECT
        j.id,
        j.title,
        j.description,
        j.requirements,
        j.responsibilities,
        j.benefits,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.experience_level,
        j.status,
        j.views_count,
        j.applications_count,
        j.created_at,
        j.updated_at,
        j.expires_at,
        j.category_id,
        jc.category_name,
        e.company_name,
        e.company_logo_url,
        e.company_description,
        e.company_website
      FROM jobs j
      JOIN employer_profiles e ON j.employer_id = e.id
      LEFT JOIN job_categories jc ON j.category_id = jc.id
      WHERE j.status = 'published'
    `;

    const params: any[] = [];
    if (categoryId) {
      query += ` AND j.category_id = $1`;
      params.push(categoryId);
    }

    query += ` ORDER BY j.created_at DESC`;

    const jobsResult = await pool.query(query, params);

    const jobs = jobsResult.rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      requirements: row.requirements,
      responsibilities: row.responsibilities,
      benefits: row.benefits,
      location: row.location,
      jobType: row.job_type,
      salaryMin: row.salary_min,
      salaryMax: row.salary_max,
      salaryCurrency: row.salary_currency,
      experienceLevel: row.experience_level,
      status: row.status,
      viewsCount: row.views_count,
      applicationsCount: row.applications_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      expiresAt: row.expires_at,
      categoryId: row.category_id,
      categoryName: row.category_name,
      company: row.company_name,
      companyLogo: row.company_logo_url,
      companyDescription: row.company_description,
      companyWebsite: row.company_website,
    }));

    res.json(jobs);
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Get job categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categoriesResult = await pool.query(`
      SELECT 
        jc.id, 
        jc.category_name, 
        COUNT(j.id) as job_count
      FROM job_categories jc
      LEFT JOIN jobs j ON jc.id = j.category_id AND j.status = 'published'
      GROUP BY jc.id, jc.category_name
      HAVING COUNT(j.id) > 0
      ORDER BY job_count DESC
    `);

    res.json(categoriesResult.rows.map(row => ({
      id: row.id,
      name: row.category_name,
      jobCount: parseInt(row.job_count)
    })));
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);

    const jobResult = await pool.query(
      `SELECT
        j.id,
        j.title,
        j.description,
        j.requirements,
        j.responsibilities,
        j.benefits,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.experience_level,
        j.status,
        j.views_count,
        j.applications_count,
        j.created_at,
        j.updated_at,
        j.expires_at,
        e.company_name,
        e.company_logo_url,
        e.company_description,
        e.company_website
      FROM jobs j
      JOIN employer_profiles e ON j.employer_id = e.id
      WHERE j.id = $1 AND j.status = 'published'`,
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const row = jobResult.rows[0];
    const job = {
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      requirements: row.requirements,
      responsibilities: row.responsibilities,
      benefits: row.benefits,
      location: row.location,
      jobType: row.job_type,
      salaryMin: row.salary_min,
      salaryMax: row.salary_max,
      salaryCurrency: row.salary_currency,
      experienceLevel: row.experience_level,
      status: row.status,
      viewsCount: row.views_count,
      applicationsCount: row.applications_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      expiresAt: row.expires_at,
      company: row.company_name,
      companyLogo: row.company_logo_url,
      companyDescription: row.company_description,
      companyWebsite: row.company_website,
    };

    // Increment view count
    await pool.query(
      'UPDATE jobs SET views_count = views_count + 1 WHERE id = $1',
      [jobId]
    );

    res.json(job);
  } catch (error) {
    console.error('Job fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch job' });
  }
});

export default router;
