import { API_CONFIG } from '../config/api';

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  jobDescription: string;
  company: string;
  companyLogo: string | null;
  companyDescription: string | null;
  companyWebsite?: string | null;
  location: string | null;
  jobType: string | null;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string | null;
  jobStatus: 'published' | 'draft' | 'closed'; // Job post status
  applicationsCount?: number;
  postedAt?: string;
  requirements?: string | null;
  responsibilities?: string | null;
  benefits?: string | null;
  status: string; // Application status: pending, reviewed, shortlisted, interview, rejected, withdrawn
  coverLetter: string | null;
  matchScore: number;
  appliedAt: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalApplications: number;
  interviews: number;
  profileCompletion: number;
}

class JobSeekerApiService {
  private baseUrl = API_CONFIG.BASE_URL;

  private getAuthHeader(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  // Get job seeker's applications
  async getApplications(token: string): Promise<{ applications: Application[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/job-seeker/applications`, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      return await response.json();
    } catch (error) {
      console.error('Applications fetch error:', error);
      throw error;
    }
  }

  // Get single application details
  async getApplicationDetails(
    token: string,
    applicationId: number
  ): Promise<{ application: Application }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/job-seeker/applications/${applicationId}`,
        {
          method: 'GET',
          headers: this.getAuthHeader(token),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch application details');
      }

      return await response.json();
    } catch (error) {
      console.error('Application details fetch error:', error);
      throw error;
    }
  }

  // Apply for a job
  async applyForJob(
    token: string,
    jobId: number,
    coverLetter?: string
  ): Promise<{ message: string; application: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/job-seeker/applications`, {
        method: 'POST',
        headers: this.getAuthHeader(token),
        body: JSON.stringify({ jobId, coverLetter }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit application');
      }

      return await response.json();
    } catch (error) {
      console.error('Application submission error:', error);
      throw error;
    }
  }

  // Withdraw an application
  async withdrawApplication(
    token: string,
    applicationId: number
  ): Promise<{ message: string; applicationId: number }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/job-seeker/applications/${applicationId}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeader(token),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to withdraw application');
      }

      return await response.json();
    } catch (error) {
      console.error('Application withdrawal error:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  async getDashboardStats(token: string): Promise<DashboardStats> {
    try {
      const response = await fetch(`${this.baseUrl}/job-seeker/dashboard/stats`, {
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

  // Get saved jobs
  async getSavedJobs(token: string): Promise<{ savedJobIds: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/job-seeker/saved-jobs`, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved jobs');
      }

      return await response.json();
    } catch (error) {
      console.error('Saved jobs fetch error:', error);
      throw error;
    }
  }

  // Save a job
  async saveJob(token: string, jobId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/job-seeker/saved-jobs`, {
        method: 'POST',
        headers: this.getAuthHeader(token),
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save job');
      }

      return await response.json();
    } catch (error) {
      console.error('Save job error:', error);
      throw error;
    }
  }

  // Un-save a job
  async unsaveJob(token: string, jobId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/job-seeker/saved-jobs/${jobId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unsave job');
      }

      return await response.json();
    } catch (error) {
      console.error('Unsave job error:', error);
      throw error;
    }
  }
}

export const jobSeekerApi = new JobSeekerApiService();
