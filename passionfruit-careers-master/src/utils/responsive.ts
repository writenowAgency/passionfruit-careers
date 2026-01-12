/**
 * Responsive Utilities for Mobile, Tablet, and Desktop Breakpoints
 *
 * This module provides centralized responsive design utilities including:
 * - Breakpoint constants
 * - Device type detection
 * - Responsive scaling functions
 * - Spacing calculators
 */

// Breakpoint constants
export const BREAKPOINTS = {
  mobile: { min: 0, max: 511 },
  tablet: { min: 512, max: 1023 },
  desktop: { min: 1024, max: 99999 }
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Determines device type based on screen width
 * @param width - Current screen width in pixels
 * @returns DeviceType - 'mobile', 'tablet', or 'desktop'
 */
export const getDeviceType = (width: number): DeviceType => {
  if (width < BREAKPOINTS.tablet.min) return 'mobile';
  if (width < BREAKPOINTS.desktop.min) return 'tablet';
  return 'desktop';
};

/**
 * Scales a size value based on device type
 * Useful for responsive dimensions (width, height, icon sizes, etc.)
 * @param size - Base size value
 * @param deviceType - Current device type
 * @returns Scaled size rounded to nearest integer
 */
export const scaleSize = (size: number, deviceType: DeviceType): number => {
  const scaleFactor = {
    mobile: 1,
    tablet: 1.25,
    desktop: 1.5
  };
  return Math.round(size * scaleFactor[deviceType]);
};

/**
 * Scales font size based on device type
 * Uses different scale factors optimized for text readability
 * @param fontSize - Base font size
 * @param deviceType - Current device type
 * @returns Scaled font size rounded to nearest integer
 */
export const scaleFontSize = (fontSize: number, deviceType: DeviceType): number => {
  const fontScaleFactor = {
    mobile: 1,
    tablet: 1.15,
    desktop: 1.3
  };
  return Math.round(fontSize * fontScaleFactor[deviceType]);
};

/**
 * Calculates responsive spacing based on device type
 * Adjusts spacing values to maintain proportional layouts
 * @param baseSpacing - Base spacing value from theme
 * @param deviceType - Current device type
 * @returns Responsive spacing value
 */
export const getResponsiveSpacing = (baseSpacing: number, deviceType: DeviceType): number => {
  const spacingMultiplier = {
    mobile: 1,
    tablet: 1.2,
    desktop: 1.4
  };
  return baseSpacing * spacingMultiplier[deviceType];
};

/**
 * Calculates responsive padding for containers
 * @param basePadding - Base padding value
 * @param deviceType - Current device type
 * @returns Responsive padding value
 */
export const getResponsivePadding = (basePadding: number, deviceType: DeviceType): number => {
  const paddingScale = {
    mobile: 1,
    tablet: 1.25,
    desktop: 1.5
  };
  return Math.round(basePadding * paddingScale[deviceType]);
};

/**
 * Determines if current width is mobile
 * @param width - Current screen width
 * @returns true if mobile, false otherwise
 */
export const isMobileWidth = (width: number): boolean => {
  return width < BREAKPOINTS.tablet.min;
};

/**
 * Determines if current width is tablet
 * @param width - Current screen width
 * @returns true if tablet, false otherwise
 */
export const isTabletWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.tablet.min && width < BREAKPOINTS.desktop.min;
};

/**
 * Determines if current width is desktop
 * @param width - Current screen width
 * @returns true if desktop, false otherwise
 */
export const isDesktopWidth = (width: number): boolean => {
  return width >= BREAKPOINTS.desktop.min;
};

/**
 * Get responsive column count for grid layouts
 * @param deviceType - Current device type
 * @returns Number of columns appropriate for device
 */
export const getGridColumns = (deviceType: DeviceType): number => {
  return {
    mobile: 1,
    tablet: 2,
    desktop: 3
  }[deviceType];
};

/**
 * Calculate grid item width based on columns and gaps
 * @param containerWidth - Container width
 * @param columns - Number of columns
 * @param gap - Gap between items
 * @returns Width for each grid item
 */
export const getGridItemWidth = (
  containerWidth: number,
  columns: number,
  gap: number
): number => {
  return (containerWidth - (gap * (columns + 1))) / columns;
};

/**
 * Get responsive max width for content containers
 * @param deviceType - Current device type
 * @returns Max width value or '100%' for mobile
 */
export const getMaxContentWidth = (deviceType: DeviceType): number | string => {
  return {
    mobile: '100%',
    tablet: 800,
    desktop: 1200
  }[deviceType];
};
