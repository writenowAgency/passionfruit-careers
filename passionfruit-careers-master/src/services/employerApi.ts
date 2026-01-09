import { API_CONFIG } from '../config/api';

export interface DashboardStats {
  activeJobs: number;
  totalApplicants: number;
  recentApplicants: number;
  pendingReviews: number;
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

export interface Activity {
  id: number;
  type: 'application' | 'job_posted' | 'review' | 'interview';
  title: string;
  description?: string;
  timestamp: string;
}

export interface ApplicantDetails {
  application: {
    id: number;
    jobId: number;
    jobTitle: string;
    appliedAt: string;
    status: string;
    matchScore: number;
    coverLetter: string | null;
    notes: string | null;
  };
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    memberSince: string;
  };
  profile: {
    id: number;
    headline: string | null;
    bio: string | null;
    location: string | null;
    phone: string | null;
    profilePhotoUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    yearsOfExperience: number | null;
    desiredSalaryMin: number | null;
    desiredSalaryMax: number | null;
    salaryCurrency: string | null;
    isOpenToWork: boolean | null;
    careerObjectives: string | null;
    preferredWorkType: string | null;
    availabilityStartDate: string | null;
  } | null;
  skills: {
    id: number;
    name: string;
    proficiencyLevel: string | null;
    yearsExperience: number | null;
  }[];
  experience: {
    id: number;
    companyName: string;
    jobTitle: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    location: string | null;
  }[];
  education: {
    id: number;
    institutionName: string;
    degree: string;
    fieldOfStudy: string | null;
    startDate: string;
    endDate: string | null;
    grade: string | null;
    description: string | null;
  }[];
  certifications: {
    id: number;
    certificationName: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate: string | null;
    credentialId: string | null;
    credentialUrl: string | null;
    description: string | null;
  }[];
  languages: {
    id: number;
    languageName: string;
    proficiencyLevel: string;
  }[];
  documents: {
    id: number;
    documentType: string;
    documentName: string;
    fileUrl: string;
    fileSize: number | null;
    mimeType: string | null;
    uploadedAt: string;
    description: string | null;
    isPrimary: boolean | null;
  }[];
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

  // Get recent activity
  async getRecentActivity(token: string, limit: number = 10): Promise<{ activities: Activity[] }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/employer/dashboard/activity?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getAuthHeader(token),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recent activity');
      }

      const data = await response.json();

      // Map backend types to frontend types
      const activities = data.activities.map((item: any) => {
        let type: Activity['type'] = 'application';
        if (item.type === 'job') type = 'job_posted';
        if (item.type === 'review') type = 'review';
        // interview type can be added if backend supports it

        return {
          id: parseInt(item.id),
          type,
          title: item.title,
          description: item.description,
          timestamp: item.timestamp,
        };
      });

      return { activities };
    } catch (error) {
      console.error('Recent activity fetch error:', error);
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

  // Get employer profile
  async getProfile(token: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/profile`, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update employer profile
  async updateProfile(token: string, profileData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/profile`, {
        method: 'PUT',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Get full applicant details by application ID
  async getApplicantDetails(token: string, applicationId: number): Promise<ApplicantDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/applicants/${applicationId}`, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch applicant details');
      }

      return await response.json();
    } catch (error) {
      console.error('Get applicant details error:', error);
      throw error;
    }
  }

  async updateApplicationStatus(
    token: string,
    applicationId: number,
    status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'interview'
  ): Promise<{ message: string; status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update application status');
      }

      return await response.json();
    } catch (error) {
      console.error('Update application status error:', error);
      throw error;
    }
  }

  // Get notification preferences
  async getNotificationPreferences(token: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/notification-preferences`, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      return await response.json();
    } catch (error) {
      console.error('Get notification preferences error:', error);
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(token: string, preferences: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/notification-preferences`, {
        method: 'PUT',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update notification preferences');
      }

      return await response.json();
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  }

  // Get credits balance and stats
  async getCreditsBalance(token: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/credits/balance`, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch credits balance');
      }

      return await response.json();
    } catch (error) {
      console.error('Get credits balance error:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactions(token: string, limit: number = 50): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/credits/transactions?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      return await response.json();
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  }

  // Purchase credits
  async purchaseCredits(
    token: string,
    packageData: {
      packageId: string;
      packageName: string;
      credits: number;
      price: number;
      paymentDetails?: {
        cardNumber: string;
        cardHolder: string;
        expiryDate: string;
        cvv: string;
        email: string;
      };
    }
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/credits/purchase`, {
        method: 'POST',
        headers: this.getAuthHeader(token),
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to purchase credits');
      }

      return await response.json();
    } catch (error) {
      console.error('Purchase credits error:', error);
      throw error;
    }
  }

  // ==================== Team Management ====================

  // Get team members
  async getTeamMembers(token: string): Promise<{ members: any[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/team`, {
        method: 'GET',
        headers: this.getAuthHeader(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      return await response.json();
    } catch (error) {
      console.error('Get team members error:', error);
      throw error;
    }
  }

  // Invite team member
  async inviteTeamMember(token: string, email: string, role: string): Promise<{ message: string; member: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/team/invite`, {
        method: 'POST',
        headers: this.getAuthHeader(token),
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to invite member');
      }

      return data;
    } catch (error) {
      console.error('Invite member error:', error);
      throw error;
    }
  }

  // Remove team member
  async removeTeamMember(token: string, memberId: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/team/${memberId}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove member');
      }

      return data;
    } catch (error) {
      console.error('Remove member error:', error);
      throw error;
    }
  }

  // Update team member role
  async updateTeamMemberRole(token: string, memberId: number, role: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/employer/team/${memberId}/role`, {
        method: 'PUT',
        headers: this.getAuthHeader(token),
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update role');
      }

      return data;
    } catch (error) {
      console.error('Update role error:', error);
      throw error;
    }
  }
}

export const employerApi = new EmployerApiService();
