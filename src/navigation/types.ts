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
  SkillsManager: undefined;
  DocumentsManager: undefined;
  CareerInsights: undefined;
  Premium: undefined;
  Payment: undefined;
  SubscriptionStatus: undefined;
};

export type EmployerTabParamList = {
  EmployerHome: undefined;
  EmployerJobs: undefined;
  EmployerApplicants: undefined;
  EmployerAnalytics: undefined;
  EmployerCredits: undefined;
};
