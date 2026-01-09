import { Job } from '../types';

export const mockJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Senior React Native Engineer',
    company: 'CapeTech Labs',
    companyLogo: 'https://placehold.co/64x64',
    location: 'Cape Town, WC',
    type: 'Hybrid',
    salary: 'R850k - R1m',
    description: 'Lead the mobile guild building AI-powered career journeys.',
    matchScore: 92,
    postedDate: '2d ago',
    tags: ['React Native', 'AI', 'Leadership'],
  },
  {
    id: 'job-2',
    title: 'AI Product Manager',
    company: 'Passionfruit Careers',
    companyLogo: 'https://placehold.co/64x64',
    location: 'Johannesburg, GP',
    type: 'Remote',
    salary: 'R1m - R1.2m',
    description: 'Own the roadmap for the auto-apply intelligence engine.',
    matchScore: 88,
    postedDate: '4d ago',
    tags: ['Product', 'AI', 'Roadmap'],
  },
];
