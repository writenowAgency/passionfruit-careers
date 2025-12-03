# Login Credentials

## Demo Accounts

### Job Seeker Account
- **Email:** candidate@demo.com
- **Password:** password123
- **Role:** Job Seeker

Use this account to access the job seeker features including:
- Browse and search jobs
- View job recommendations
- Apply to jobs
- Track applications
- Manage profile and skills
- Upload documents

### Employer Account
- **Email:** recruiter@demo.com
- **Password:** password123
- **Role:** Employer

Use this account to access the employer features including:
- Post and manage job listings
- View applicants
- Track recruitment analytics
- Manage company profile
- Purchase and use credits

## How to Login

1. Navigate to http://localhost:8085 in your browser
2. Select either "Job seeker" or "Employer" role
3. Enter the credentials above
4. Click "Log in"

## Logout

To log out of the application:
- **Job Seekers:** Navigate to the Profile tab and click the "Log out" button at the bottom
- **Employers:** Navigate to the Home tab and scroll down to find the "Log out" button

## Notes

- The app currently uses mock authentication, so any valid email/password format will work
- However, using the demo credentials above is recommended for consistency
- Login state is persisted in AsyncStorage, so you'll remain logged in even after refreshing the page
