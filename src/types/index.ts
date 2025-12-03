export type UserRole = 'jobSeeker' | 'employer';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  matchScore: number;
  postedDate: string;
  tags: string[];
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
