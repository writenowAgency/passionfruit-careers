import { useCallback } from 'react';
import { AnalyticsService } from '../services/analytics';

export const useAnalytics = () => {
  const track = useCallback(<T extends Record<string, any>>(event: string, payload?: T) => {
    AnalyticsService.track(event, payload);
  }, []);

  return { track };
};
