// Passionfruit Careers Brand Color Palette
export const colors = {
  // Primary Brand Colors
  primary: '#F4E04D',
  primaryLight: '#FFF59D',
  primaryDark: '#E8D21F',

  // Secondary Colors
  secondary: '#FFA726',
  secondaryLight: '#FFCC80',
  secondaryDark: '#F57C00',

  // Accent Colors
  accent: '#FF6B9D',
  accentLight: '#FFB3C1',
  accentDark: '#C2185B',

  // Neutral Colors
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#F5F5F5',

  // Text Colors
  text: '#1A1A1A',
  textSecondary: '#757575',
  textTertiary: '#9E9E9E',
  textDisabled: '#BDBDBD',

  // Status Colors
  success: '#4CAF50',
  successLight: '#81C784',
  error: '#F44336',
  errorLight: '#E57373',
  warning: '#FF9800',
  warningLight: '#FFB74D',
  info: '#2196F3',
  infoLight: '#64B5F6',

  // UI Elements
  border: '#E0E0E0',
  borderLight: '#F5F5F5',
  divider: '#EEEEEE',

  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // Card/Shadow Colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowStrong: 'rgba(0, 0, 0, 0.2)',

  // Gradient Colors
  gradientPrimary: ['#F4E04D', '#E8D21F'],
  gradientSecondary: ['#FFA726', '#F57C00'],
  gradientAccent: ['#FF6B9D', '#C2185B'],
  gradientBackground: ['#FFFFFF', '#F8F9FA'],

  // Match Score Colors
  matchHigh: '#4CAF50',    // 80-100%
  matchMedium: '#FFA726',  // 60-79%
  matchLow: '#FF6B9D',     // 0-59%
};

export type ColorPalette = typeof colors;
