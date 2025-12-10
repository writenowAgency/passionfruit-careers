export type UserRole = 'jobSeeker' | 'employer';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  companyDescription?: string;
  companyWebsite?: string | null;
  location: string | null;
  jobType: string | null;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string | null;
  experienceLevel: string | null;
  description: string;
  requirements: string | null;
  status: string;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  // Computed fields for backwards compatibility
  type?: string;
  salary?: string;
  matchScore?: number;
  postedDate?: string;
  tags?: string[];
}

export interface Applicant {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  location: string;
  experience: string;
  status: 'new' | 'reviewed' | 'interview' | 'offer';
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  status: 'submitted' | 'interview' | 'offer' | 'rejected';
  timeline: { label: string; date: string }[];
}

export interface AutoApplySettings {
  enabled: boolean;
  dailyLimit: number;
  minimumMatch: number;
  excludedCompanies: string[];
}
