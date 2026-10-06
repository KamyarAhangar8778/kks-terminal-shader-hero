/**
 * Helper utilities for detecting hover states and device characteristics
 * of the custom kinematic cursor.
 */

/**
 * Checks if the user is on a touch or coarse pointer device.
 *
 * @returns {boolean} True if running on a touch/coarse pointer device.
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(pointer: coarse)').matches;
}

const CLICKABLE_SELECTOR =
  'a, button, input, select, textarea, [role="button"], .cursor-pointer, [onclick]';

const TEXT_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, span, label, li, blockquote, code, pre';

/**
 * Highly optimized check to see if an element or its ancestors are clickable.
 * Avoids getComputedStyle to prevent layout reflow thrashing.
 *
 * @param {HTMLElement | null} target - Target element to inspect.
 * @returns {boolean} True if element is an interactive clickable target.
 */
export function checkClickable(target: HTMLElement | null): boolean {
  if (!target) return false;
  return Boolean(target.closest(CLICKABLE_SELECTOR));
}

/**
 * Highly optimized check to see if the element is text to be hovered.
 *
 * @param {HTMLElement | null} target - Target element to inspect.
 * @param {boolean} isClickable - Whether the target has already been classified as clickable.
 * @returns {boolean} True if element is textual content suitable for tilt effect.
 */
export function checkHoveringText(target: HTMLElement | null, isClickable: boolean): boolean {
  if (!target || isClickable) return false;
  return Boolean(target.closest(TEXT_SELECTOR));
}
