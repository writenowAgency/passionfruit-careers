import { API_CONFIG } from '../config/api';

export interface DashboardStats {
  activeJobs: number;
  totalApplicants: number;
  recentApplicants: number;
  applicantGrowth: number;
  jobGrowth: number;
}

export interface RecentApplicant {
  id: number;
  name: string;
  email: string;
  role: string;
  jobTitle: string;
  jobId: number;
  appliedAt: string;
  status: string;
  matchScore: number;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  job_type: string | null;
  salary_min: string | null;
  salary_max: string | null;
  salary_currency: string | null;
  experience_level: string | null;
  status: string;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

class EmployerApiService {
  private baseUrl = API_CONFIG.BASE_URL;

  private getAuthHeader(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  // Get dashboard statistics
  async getDashboardStats(token: string): Promise<DashboardStats> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/dashboard/stats`, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  }

  // Get recent applicants
  async getRecentApplicants(
    token: string,
    limit: number = 5
  ): Promise<{ applicants: RecentApplicant[] }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/employer/dashboard/recent-applicants?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getAuthHeader(token),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recent applicants');
      }

      return await response.json();
    } catch (error) {
      console.error('Recent applicants error:', error);
      throw error;
    }
  }

  // Get all jobs for employer
  async getJobs(token: string): Promise<{ jobs: Job[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/jobs`, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      return await response.json();
    } catch (error) {
      console.error('Jobs fetch error:', error);
      throw error;
    }
  }

  // Create a new job
  async createJob(
    token: string,
    jobData: {
      title: string;
      description: string;
      requirements?: string;
      location?: string;
      jobType?: string;
      salaryMin?: number;
      salaryMax?: number;
      salaryCurrency?: string;
      experienceLevel?: string;
      status?: string;
    }
  ): Promise<{ message: string; job: Job }> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/jobs`, {
        method: 'POST',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create job');
      }

      return await response.json();
    } catch (error) {
      console.error('Job creation error:', error);
      throw error;
    }
  }

  // Update a job
  async updateJob(
    token: string,
    jobId: number,
    jobData: Partial<{
      title: string;
      description: string;
      requirements: string;
      location: string;
      jobType: string;
      salaryMin: number;
      salaryMax: number;
      salaryCurrency: string;
      experienceLevel: string;
      status: string;
    }>
  ): Promise<{ message: string; job: Job }> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/jobs/${jobId}`, {
        method: 'PUT',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update job');
      }

      return await response.json();
    } catch (error) {
      console.error('Job update error:', error);
      throw error;
    }
  }

  // Delete a job
  async deleteJob(token: string, jobId: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/jobs/${jobId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete job');
      }

      return await response.json();
    } catch (error) {
      console.error('Job deletion error:', error);
      throw error;
    }
  }
}

export const employerApi = new EmployerApiService();
