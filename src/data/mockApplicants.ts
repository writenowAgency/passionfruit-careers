import { Applicant } from '../types';

export const mockApplicants: Applicant[] = [
  {
    id: 'app-1',
    name: 'Ayanda Mkhize',
    role: 'Full-stack Engineer',
    matchScore: 86,
    location: 'Cape Town',
    experience: '6 yrs SaaS',
    status: 'reviewed',
  },
  {
    id: 'app-2',
    name: 'Neo Khumalo',
    role: 'Data Scientist',
    matchScore: 91,
    location: 'Johannesburg',
    experience: '4 yrs Fintech',
    status: 'interview',
  },
];
