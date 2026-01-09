import * as FirebaseAnalytics from 'expo-firebase-analytics';

class AnalyticsServiceClass {
  private initialized = false;

  async init() {
    if (this.initialized) return;
    try {
      if (FirebaseAnalytics.setDebugModeEnabledAsync) {
        await FirebaseAnalytics.setDebugModeEnabledAsync(true);
      }
      this.initialized = true;
    } catch (error) {
      console.warn('Analytics init failed', error);
    }
  }

  async track(event: string, params?: Record<string, any>) {
    try {
      if (!this.initialized) {
        await this.init();
      }
      await FirebaseAnalytics.logEvent(event, params);
    } catch (error) {
      console.warn('Analytics track failed', error);
    }
  }
}

export const AnalyticsService = new AnalyticsServiceClass();
