/**
 * Responsive Styles Hook
 *
 * Hook for creating responsive styles with scaling and spacing utilities
 * Provides memoized functions to prevent unnecessary re-calculations
 */

import { useMemo } from 'react';
import { useDeviceType } from './useResponsive';
import { scaleSize, scaleFontSize, getResponsiveSpacing, getResponsivePadding } from '@/utils/responsive';

/**
 * Hook that provides responsive styling utilities
 * Returns memoized functions for scaling sizes, fonts, and spacing
 *
 * @returns Object with responsive styling functions
 */
export const useResponsiveStyles = () => {
  const deviceType = useDeviceType();

  return useMemo(() => ({
    /**
     * Scale a size value based on device type
     * @param size - Base size value
     * @returns Scaled size
     */
    scale: (size: number) => scaleSize(size, deviceType),

    /**
     * Scale a font size based on device type
     * @param fontSize - Base font size
     * @returns Scaled font size
     */
    scaleFont: (fontSize: number) => scaleFontSize(fontSize, deviceType),

    /**
     * Get responsive spacing value
     * @param baseSpacing - Base spacing value from theme
     * @returns Responsive spacing
     */
    spacing: (baseSpacing: number) => getResponsiveSpacing(baseSpacing, deviceType),

    /**
     * Get responsive padding value
     * @param basePadding - Base padding value
     * @returns Responsive padding
     */
    padding: (basePadding: number) => getResponsivePadding(basePadding, deviceType),

    /**
     * Current device type
     */
    deviceType
  }), [deviceType]);
};
