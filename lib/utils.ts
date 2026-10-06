/**
 * @file lib/utils.ts
 * @description Helper utilities for class names and formatting.
 */

export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(' ');
}
