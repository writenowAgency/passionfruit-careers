import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { colors } from './colors';
import { typography } from './typography';

const fontConfig = {
  displayLarge: toPaperFont('h1'),
  displayMedium: toPaperFont('h2'),
  displaySmall: toPaperFont('h3'),
  headlineMedium: toPaperFont('h4'),
  bodyLarge: toPaperFont('body1'),
  bodyMedium: toPaperFont('body2'),
  labelLarge: toPaperFont('button'),
};

function toPaperFont(key: keyof typeof typography) {
  const style = typography[key];
  return {
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight as any,
    fontSize: style.fontSize,
    letterSpacing: 0.5,
    lineHeight: style.fontSize * 1.4,
  };
}

export const passionfruitTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    surface: colors.surface,
    background: colors.background,
    error: colors.error,
    outline: colors.border,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 16,
};

export const navigationTheme: NavigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

export type AppTheme = typeof passionfruitTheme;

// Spacing Scale (based on 4px grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border Radius Scale
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

// Shadow Presets (Material Design Elevation)
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
};

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;

// Re-export for convenience
export { colors } from './colors';
export { typography } from './typography';
