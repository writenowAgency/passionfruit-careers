/**
 * Z-Index Constants for Proper Component Layering
 *
 * Provides standardized z-index values to ensure correct stacking order
 * of UI elements across the application
 *
 * Usage:
 * import { Z_INDEX } from '@/constants/zIndex';
 *
 * const styles = StyleSheet.create({
 *   modal: {
 *     zIndex: Z_INDEX.modal,
 *     elevation: Z_INDEX.modal, // For Android
 *   }
 * });
 */

export const Z_INDEX = {
  /**
   * Modals - Highest priority (full-screen overlays)
   * Use for: Full-screen modals, sheets, dialogs
   */
  modal: 9999,

  /**
   * Toasts/Snackbars - Above modals
   * Use for: Toast notifications, snackbar messages
   */
  toast: 10000,

  /**
   * Overlays - Below modals, above most content
   * Use for: Modal backgrounds, dimmed overlays
   */
  overlay: 1000,

  /**
   * Dropdowns/Popovers - Above regular content
   * Use for: Select dropdowns, autocomplete suggestions, tooltips
   */
  dropdown: 500,

  /**
   * Fixed Headers/Footers - Above scrolling content
   * Use for: Sticky headers, fixed bottom navigation
   */
  header: 100,
  footer: 100,

  /**
   * Floating Action Buttons - Above content, below headers
   * Use for: FABs, floating buttons
   */
  fab: 50,

  /**
   * Sticky Elements - Slightly above normal content
   * Use for: Sticky table headers, pinned items
   */
  sticky: 10,

  /**
   * Regular Content - Default layer
   * Use for: Most UI elements
   */
  content: 1,

  /**
   * Background Elements - Behind content
   * Use for: Background decorations, patterns
   */
  background: 0,

  /**
   * Hidden Elements - Completely behind
   * Use for: Elements that should not be visible
   */
  hidden: -1,
} as const;

/**
 * Android Elevation Values
 * Maps z-index to Material Design elevation for Android shadow rendering
 */
export const ELEVATION = {
  modal: 24,
  toast: 24,
  overlay: 16,
  dropdown: 12,
  header: 8,
  footer: 8,
  fab: 6,
  sticky: 4,
  content: 2,
  background: 0,
  hidden: 0,
} as const;

/**
 * Helper function to get both zIndex and elevation
 * @param layer - Layer name from Z_INDEX
 * @returns Object with zIndex and elevation
 */
export const getLayerStyle = (layer: keyof typeof Z_INDEX) => ({
  zIndex: Z_INDEX[layer],
  elevation: ELEVATION[layer],
});
