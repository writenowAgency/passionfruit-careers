/**
 * Responsive Design Hooks
 *
 * Custom React hooks for responsive behavior in React Native
 * Provides window dimensions, device type detection, and responsive utilities
 */

import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { getDeviceType, DeviceType, isMobileWidth, isTabletWidth, isDesktopWidth } from '@/utils/responsive';

/**
 * Hook to get current window dimensions with real-time updates
 * Automatically subscribes to dimension changes (orientation changes, window resizing on web)
 *
 * @returns Object containing width and height of the window
 */
export const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState<ScaledSize>(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

/**
 * Hook to get current device type based on window width
 * Updates automatically when window dimensions change
 *
 * @returns DeviceType - 'mobile', 'tablet', or 'desktop'
 */
export const useDeviceType = (): DeviceType => {
  const { width } = useWindowDimensions();
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType(width));

  useEffect(() => {
    setDeviceType(getDeviceType(width));
  }, [width]);

  return deviceType;
};

/**
 * Comprehensive responsive hook
 * Provides all responsive values needed for component styling and layout
 *
 * @returns Object with dimensions, device type, and boolean flags
 */
export const useResponsive = () => {
  const dimensions = useWindowDimensions();
  const deviceType = useDeviceType();

  return {
    width: dimensions.width,
    height: dimensions.height,
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
  };
};
