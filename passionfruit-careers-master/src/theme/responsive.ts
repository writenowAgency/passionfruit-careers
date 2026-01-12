/**
 * Responsive Theme Enhancements
 *
 * Provides responsive versions of theme utilities:
 * - Spacing scales
 * - Typography
 * - Common dimensions
 */

import { DeviceType } from '@/utils/responsive';

/**
 * Get responsive spacing scale based on device type
 * Provides spacing values that scale appropriately for different screen sizes
 *
 * @param deviceType - Current device type
 * @returns Spacing scale object with xs through xxxl values
 */
export const getResponsiveSpacingScale = (deviceType: DeviceType) => ({
  xs: deviceType === 'mobile' ? 4 : deviceType === 'tablet' ? 6 : 8,
  sm: deviceType === 'mobile' ? 8 : deviceType === 'tablet' ? 10 : 12,
  md: deviceType === 'mobile' ? 16 : deviceType === 'tablet' ? 20 : 24,
  lg: deviceType === 'mobile' ? 24 : deviceType === 'tablet' ? 28 : 32,
  xl: deviceType === 'mobile' ? 32 : deviceType === 'tablet' ? 40 : 48,
  xxl: deviceType === 'mobile' ? 48 : deviceType === 'tablet' ? 56 : 64,
  xxxl: deviceType === 'mobile' ? 64 : deviceType === 'tablet' ? 72 : 80,
});

/**
 * Get responsive typography scale
 * Font sizes optimized for readability on different device sizes
 *
 * @param deviceType - Current device type
 * @returns Typography scale with h1-h4, body1-body2, and caption styles
 */
export const getResponsiveTypography = (deviceType: DeviceType) => ({
  h1: {
    fontSize: deviceType === 'mobile' ? 28 : deviceType === 'tablet' ? 32 : 36,
    lineHeight: deviceType === 'mobile' ? 36 : deviceType === 'tablet' ? 40 : 44,
    fontFamily: 'Poppins-Bold',
  },
  h2: {
    fontSize: deviceType === 'mobile' ? 24 : deviceType === 'tablet' ? 28 : 32,
    lineHeight: deviceType === 'mobile' ? 32 : deviceType === 'tablet' ? 36 : 40,
    fontFamily: 'Poppins-SemiBold',
  },
  h3: {
    fontSize: deviceType === 'mobile' ? 20 : deviceType === 'tablet' ? 24 : 28,
    lineHeight: deviceType === 'mobile' ? 28 : deviceType === 'tablet' ? 32 : 36,
    fontFamily: 'Poppins-SemiBold',
  },
  h4: {
    fontSize: deviceType === 'mobile' ? 18 : deviceType === 'tablet' ? 20 : 22,
    lineHeight: deviceType === 'mobile' ? 24 : deviceType === 'tablet' ? 28 : 30,
    fontFamily: 'Poppins-Medium',
  },
  body1: {
    fontSize: deviceType === 'mobile' ? 14 : deviceType === 'tablet' ? 16 : 18,
    lineHeight: deviceType === 'mobile' ? 20 : deviceType === 'tablet' ? 24 : 28,
    fontFamily: 'Inter-Regular',
  },
  body2: {
    fontSize: deviceType === 'mobile' ? 12 : deviceType === 'tablet' ? 14 : 16,
    lineHeight: deviceType === 'mobile' ? 18 : deviceType === 'tablet' ? 20 : 24,
    fontFamily: 'Inter-Regular',
  },
  caption: {
    fontSize: deviceType === 'mobile' ? 10 : deviceType === 'tablet' ? 12 : 14,
    lineHeight: deviceType === 'mobile' ? 14 : deviceType === 'tablet' ? 16 : 18,
    fontFamily: 'Inter-Regular',
  },
});

/**
 * Get responsive dimension helpers
 * Common UI element dimensions scaled for device type
 *
 * @param deviceType - Current device type
 * @returns Object with responsive dimension values
 */
export const getResponsiveDimensions = (deviceType: DeviceType) => ({
  /**
   * Standard card minimum height
   * Mobile: auto (content-driven), Tablet/Desktop: fixed heights
   */
  cardMinHeight: deviceType === 'mobile' ? 'auto' : deviceType === 'tablet' ? 240 : 280,

  /**
   * Logo/icon container sizes
   */
  logoSize: {
    small: deviceType === 'mobile' ? 40 : deviceType === 'tablet' ? 48 : 56,
    medium: deviceType === 'mobile' ? 56 : deviceType === 'tablet' ? 64 : 72,
    large: deviceType === 'mobile' ? 80 : deviceType === 'tablet' ? 96 : 112,
  },

  /**
   * Icon sizes for UI elements
   */
  iconSize: {
    small: deviceType === 'mobile' ? 16 : deviceType === 'tablet' ? 18 : 20,
    medium: deviceType === 'mobile' ? 20 : deviceType === 'tablet' ? 24 : 28,
    large: deviceType === 'mobile' ? 24 : deviceType === 'tablet' ? 28 : 32,
  },

  /**
   * Button heights
   */
  buttonHeight: {
    small: deviceType === 'mobile' ? 36 : deviceType === 'tablet' ? 40 : 44,
    medium: deviceType === 'mobile' ? 44 : deviceType === 'tablet' ? 48 : 52,
    large: deviceType === 'mobile' ? 52 : deviceType === 'tablet' ? 56 : 60,
  },

  /**
   * Input field heights
   */
  inputHeight: deviceType === 'mobile' ? 48 : deviceType === 'tablet' ? 52 : 56,

  /**
   * Avatar sizes
   */
  avatarSize: {
    small: deviceType === 'mobile' ? 32 : deviceType === 'tablet' ? 40 : 48,
    medium: deviceType === 'mobile' ? 48 : deviceType === 'tablet' ? 56 : 64,
    large: deviceType === 'mobile' ? 64 : deviceType === 'tablet' ? 72 : 80,
  },

  /**
   * Chip/badge heights
   */
  chipHeight: deviceType === 'mobile' ? 28 : deviceType === 'tablet' ? 32 : 36,

  /**
   * Touch target minimum size (accessibility)
   */
  minTouchTarget: 44, // Consistent across all devices for accessibility

  /**
   * Modal/sheet border radius
   */
  modalBorderRadius: deviceType === 'mobile' ? 16 : deviceType === 'tablet' ? 20 : 24,
});

/**
 * Get responsive container padding
 * Standard padding for screen containers
 *
 * @param deviceType - Current device type
 * @returns Padding value
 */
export const getResponsiveContainerPadding = (deviceType: DeviceType): number => {
  return deviceType === 'mobile' ? 16 : deviceType === 'tablet' ? 24 : 32;
};

/**
 * Get responsive card padding
 * Standard padding for card components
 *
 * @param deviceType - Current device type
 * @returns Padding value
 */
export const getResponsiveCardPadding = (deviceType: DeviceType): number => {
  return deviceType === 'mobile' ? 16 : deviceType === 'tablet' ? 20 : 24;
};
