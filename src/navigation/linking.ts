import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['passionfruit://', 'https://passionfruit.careers'],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          Login: 'login',
          Register: 'register',
        },
      },
      JobSeeker: {
        screens: {
          Home: 'home',
          JobDetails: 'job/:jobId',
        },
      },
      Employer: 'employer',
    },
  },
};
