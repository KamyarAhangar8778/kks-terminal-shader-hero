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
  'a, button, input, select, textarea, [role="button"], [data-interactive="true"], .cursor-pointer, [onclick]';

const TEXT_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, span, label, li, blockquote, code, pre';

const targetStateCache = new WeakMap<HTMLElement, number>();

function getTargetCursorBits(target: HTMLElement): number {
  const cached = targetStateCache.get(target);
  if (cached !== undefined) return cached;
  const isClick =
    typeof target.closest === 'function' && Boolean(target.closest(CLICKABLE_SELECTOR));
  const isText =
    !isClick && typeof target.closest === 'function' && Boolean(target.closest(TEXT_SELECTOR));
  const bits = isClick ? 1 : isText ? 2 : 0;
  targetStateCache.set(target, bits);
  return bits;
}

/**
 * Highly optimized check to see if an element or its ancestors are clickable.
 * Avoids getComputedStyle to prevent layout reflow thrashing and memoizes DOM lookups via WeakMap.
 *
 * @param {HTMLElement | null} target - Target element to inspect.
 * @returns {boolean} True if element is an interactive clickable target.
 */
export function checkClickable(target: HTMLElement | null): boolean {
  if (!target) return false;
  return (getTargetCursorBits(target) & 1) !== 0;
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
  return (getTargetCursorBits(target) & 2) !== 0;
}
