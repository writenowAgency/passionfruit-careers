const fs = require('fs');
const path = require('path');

const screens = [
  ['screens/auth/SplashScreen.tsx', 'SplashScreen', 'Loading', 'Warming up the Passionfruit experience.'],
  ['screens/auth/WelcomeScreen.tsx', 'WelcomeScreen', 'Welcome', 'Choose your journey as a job seeker or employer.'],
  ['screens/auth/LoginScreen.tsx', 'LoginScreen', 'Log in', 'Sign in to continue'],
  ['screens/auth/RegisterScreen.tsx', 'RegisterScreen', 'Create account', 'Complete the quick signup.'],
  ['screens/auth/ForgotPasswordScreen.tsx', 'ForgotPasswordScreen', 'Forgot password', 'Recover your account securely.'],
  ['screens/auth/EmailVerificationScreen.tsx', 'EmailVerificationScreen', 'Verify email', 'Enter the OTP we sent to your inbox.'],
  ['screens/jobSeeker/onboarding/ProfileWizard.tsx', 'ProfileWizard', 'Profile wizard', 'Multi-step onboarding for job seekers.'],
  ['screens/jobSeeker/onboarding/PersonalInfoStep.tsx', 'PersonalInfoStep', 'Personal info', 'Capture your basics.'],
  ['screens/jobSeeker/onboarding/ExperienceStep.tsx', 'ExperienceStep', 'Experience', 'Add experience history.'],
  ['screens/jobSeeker/onboarding/EducationStep.tsx', 'EducationStep', 'Education', 'List your qualifications.'],
  ['screens/jobSeeker/onboarding/SkillsStep.tsx', 'SkillsStep', 'Skills', 'Select your top skills.'],
  ['screens/jobSeeker/onboarding/CVUploadStep.tsx', 'CVUploadStep', 'Upload CV', 'Upload documents securely.'],
  ['screens/jobSeeker/onboarding/PreferencesStep.tsx', 'PreferencesStep', 'Preferences', 'Set job preferences.'],
  ['screens/jobSeeker/dashboard/HomeScreen.tsx', 'HomeScreen', 'Discover jobs', 'Personalised matches powered by AI.'],
  ['screens/jobSeeker/dashboard/DailyMatchesWidget.tsx', 'DailyMatchesWidget', 'Daily matches', 'Snapshot of today\'s matches.'],
  ['screens/jobSeeker/jobs/JobSearchScreen.tsx', 'JobSearchScreen', 'Job search', 'Filter and explore openings.'],
  ['screens/jobSeeker/jobs/JobDetailsScreen.tsx', 'JobDetailsScreen', 'Job details', 'Full breakdown of the opportunity.'],
  ['screens/jobSeeker/jobs/SavedJobsScreen.tsx', 'SavedJobsScreen', 'Saved jobs', 'Your bookmarked roles.'],
  ['screens/jobSeeker/jobs/JobAlertSettings.tsx', 'JobAlertSettings', 'Job alerts', 'Fine tune smart alerts.'],
  ['screens/jobSeeker/applications/ApplicationsScreen.tsx', 'ApplicationsScreen', 'Applications', 'Track every submission.'],
  ['screens/jobSeeker/applications/ApplicationStatus.tsx', 'ApplicationStatus', 'Application status', 'Timeline of a specific application.'],
  ['screens/jobSeeker/applications/ApplicationDetails.tsx', 'ApplicationDetails', 'Application details', 'Submitted docs and AI notes.'],
  ['screens/jobSeeker/aiFeatures/AIAutoApplyScreen.tsx', 'AIAutoApplyScreen', 'AI auto-apply', 'Manage automated submissions.'],
  ['screens/jobSeeker/aiFeatures/AutoApplySettings.tsx', 'AutoApplySettings', 'Auto-apply settings', 'Configure smart thresholds.'],
  ['screens/jobSeeker/aiFeatures/DailySummaryScreen.tsx', 'DailySummaryScreen', 'Daily summary', 'Recap of AI actions.'],
  ['screens/jobSeeker/aiFeatures/CoverLetterGenerator.tsx', 'CoverLetterGenerator', 'Cover letter AI', 'Generate personalised letters.'],
  ['screens/jobSeeker/aiFeatures/ProfileOptimizer.tsx', 'ProfileOptimizer', 'Profile optimizer', 'AI-backed suggestions.'],
  ['screens/jobSeeker/profile/ProfileScreen.tsx', 'ProfileScreen', 'Profile', 'Manage your Passionfruit identity.'],
  ['screens/jobSeeker/profile/ProfileStrengthMeter.tsx', 'ProfileStrengthMeter', 'Profile strength', 'Visualise completion.'],
  ['screens/jobSeeker/profile/SkillsManager.tsx', 'SkillsManager', 'Skills manager', 'Add or remove skills.'],
  ['screens/jobSeeker/profile/DocumentsManager.tsx', 'DocumentsManager', 'Documents', 'Store CVs and certificates.'],
  ['screens/jobSeeker/profile/CareerInsights.tsx', 'CareerInsights', 'Career insights', 'Predictive analytics for you.'],
  ['screens/jobSeeker/subscription/PremiumScreen.tsx', 'PremiumScreen', 'Premium', 'Unlock AI auto-apply perks.'],
  ['screens/jobSeeker/subscription/PaymentScreen.tsx', 'PaymentScreen', 'PayFast checkout', 'Secure payment for upgrades.'],
  ['screens/jobSeeker/subscription/SubscriptionStatus.tsx', 'SubscriptionStatus', 'Subscription status', 'View plan details.'],
  ['screens/employer/onboarding/CompanySetup.tsx', 'CompanySetup', 'Company setup', 'Start your employer profile.'],
  ['screens/employer/onboarding/CompanyInfoStep.tsx', 'CompanyInfoStep', 'Company info', 'Details about your organisation.'],
  ['screens/employer/onboarding/BrandingStep.tsx', 'BrandingStep', 'Branding', 'Upload logos and culture.'],
  ['screens/employer/onboarding/TeamSetup.tsx', 'TeamSetup', 'Team setup', 'Invite collaborators.'],
  ['screens/employer/dashboard/EmployerHome.tsx', 'EmployerHome', 'Employer dashboard', 'Monitor recruitment pulses.'],
  ['screens/employer/dashboard/QuickStats.tsx', 'QuickStats', 'Quick stats', 'Snapshot metrics.'],
  ['screens/employer/dashboard/RecentActivity.tsx', 'RecentActivity', 'Recent activity', 'Real-time feed of applicants.'],
  ['screens/employer/jobs/PostJobWizard.tsx', 'PostJobWizard', 'Post job wizard', 'Four-step creation flow.'],
  ['screens/employer/jobs/JobBasicInfo.tsx', 'JobBasicInfo', 'Job basic info', 'Title, location, type.'],
  ['screens/employer/jobs/JobDetails.tsx', 'EmployerJobDetails', 'Job details', 'Rich editor for requirements.'],
  ['screens/employer/jobs/JobRequirements.tsx', 'JobRequirements', 'Job requirements', 'Skills, experience, criteria.'],
  ['screens/employer/jobs/JobSettings.tsx', 'JobSettings', 'Job settings', 'Expiry, screening questions.'],
  ['screens/employer/jobs/ManageJobsScreen.tsx', 'ManageJobsScreen', 'Manage jobs', 'View all postings.'],
  ['screens/employer/jobs/BulkImportScreen.tsx', 'BulkImportScreen', 'Bulk import', 'Upload CSV positions.'],
  ['screens/employer/jobs/JobAnalytics.tsx', 'EmployerJobAnalytics', 'Job analytics', 'Performance metrics.'],
  ['screens/employer/applicants/ApplicantsScreen.tsx', 'EmployerApplicantsScreen', 'Applicants', 'Kanban style overview.'],
  ['screens/employer/applicants/ApplicantProfile.tsx', 'EmployerApplicantProfile', 'Applicant profile', 'Full candidate context.'],
  ['screens/employer/applicants/ApplicantFilters.tsx', 'ApplicantFilters', 'Applicant filters', 'Advanced filtering.'],
  ['screens/employer/applicants/BulkActions.tsx', 'BulkActions', 'Bulk actions', 'Manage multi-select updates.'],
  ['screens/employer/applicants/ExportApplicants.tsx', 'ExportApplicants', 'Export applicants', 'Download data securely.'],
  ['screens/employer/credits/CreditsScreen.tsx', 'CreditsScreen', 'Credits', 'Balance and packages.'],
  ['screens/employer/credits/PurchaseCredits.tsx', 'PurchaseCredits', 'Purchase credits', 'Select bundles.'],
  ['screens/employer/credits/UsageHistory.tsx', 'UsageHistory', 'Usage history', 'Transaction log.'],
  ['screens/employer/analytics/AnalyticsScreen.tsx', 'EmployerAnalyticsScreen', 'Analytics', 'Charts & insights.'],
  ['screens/employer/analytics/JobPerformance.tsx', 'JobPerformance', 'Job performance', 'Individual job stats.'],
  ['screens/employer/analytics/RecruitmentFunnel.tsx', 'RecruitmentFunnel', 'Recruitment funnel', 'Conversion metrics.'],
];

const template = (component, title, description) => `import React from 'react';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { Text } from 'react-native-paper';

const ${component}: React.FC = () => (
  <ScreenContainer title="${title}">
    <Text>${description}</Text>
  </ScreenContainer>
);

export default ${component};
`;

screens.forEach(([relativePath, component, title, description]) => {
  const fullPath = path.join(process.cwd(), 'src', relativePath);
  if (fs.existsSync(fullPath)) return;
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, template(component, title, description));
});
