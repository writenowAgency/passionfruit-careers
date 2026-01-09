import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  JobSeeker: undefined;
  Employer: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: { role?: 'jobSeeker' | 'employer' } | undefined;
  ForgotPassword: undefined;
  EmailVerification: undefined;
};

export type JobSeekerTabParamList = {
  Home: undefined;
  Jobs: undefined;
  Applications: undefined;
  AI: undefined;
  Profile: undefined;
};

export type JobSeekerJobsStackParamList = {
  JobSearch: undefined;
  JobDetails: { jobId: string };
  SavedJobs: undefined;
  JobAlertSettings: undefined;
};

export type AIFeaturesStackParamList = {
  AIAutoApply: undefined;
  AutoApplySettings: undefined;
  DailySummary: undefined;
  CoverLetter: undefined;
  ProfileOptimizer: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  SkillsManager: undefined;
  ExperienceManager: undefined;
  EducationManager: undefined;
  CertificationsManager: undefined;
  LanguagesManager: undefined;
  CareerObjectivesEditor: undefined;
  DocumentsManager: undefined;
  PreferencesManager: undefined;
  ProfileStrengthMeter: undefined;
  CareerInsights: undefined;
  Premium: undefined;
  Payment: undefined;
  SubscriptionStatus: undefined;
};

export type EmployerJobsStackParamList = {
  ManageJobs: { openCreateModal?: boolean } | undefined;
  PostJobWizard: undefined;
  JobBasicInfo: undefined;
  EmployerJobDetails: { jobId: string };
  JobRequirements: undefined;
  JobSettings: undefined;
  BulkImport: undefined;
  EmployerJobAnalytics: undefined;
};

export type EmployerApplicantsStackParamList = {
  Applicants: { filter?: string } | undefined;
  ApplicantPipeline: undefined;
  ApplicantProfile: { applicantId: number };
  ApplicantFilters: undefined;
  BulkActions: undefined;
  ExportApplicants: undefined;
};

export type EmployerAnalyticsStackParamList = {
  Analytics: undefined;
  JobPerformance: { jobId: string };
  RecruitmentFunnel: undefined;
};

export type EmployerCreditsStackParamList = {
  Credits: undefined;
  PurchaseCredits: undefined;
  UsageHistory: undefined;
};

export type EmployerTabParamList = {
  EmployerHome: undefined;
  EmployerJobs: NavigatorScreenParams<EmployerJobsStackParamList>;
  EmployerApplicants: NavigatorScreenParams<EmployerApplicantsStackParamList>;
  EmployerAnalytics: NavigatorScreenParams<EmployerAnalyticsStackParamList>;
  EmployerCredits: NavigatorScreenParams<EmployerCreditsStackParamList>;
};
