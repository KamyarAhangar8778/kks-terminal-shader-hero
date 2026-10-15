/**
 * @file components/portfolio/category-utils.ts
 * @description Helper functions to translate and format project categories into natural Persian
 * with developer/code styling suitable for non-technical Iranian visitors.
 */

/**
 * Returns a clear, natural Persian category label for display in project cards and modals.
 *
 * @param {string} category - Raw category identifier or legacy string.
 * @returns {string} Human-friendly Persian category.
 */
export function getCategoryPersianLabel(category: string): string {
  if (category.indexOf('LANDING') !== -1 || category.indexOf('DEPLOYMENT') !== -1) {
    return 'صفحه فرود و معرفی';
  }
  if (category.indexOf('OPEN_SOURCE_TOOL') !== -1) {
    return 'ابزار وب و متن‌باز';
  }
  if (category.indexOf('TOOLING') !== -1 || category.indexOf('APPLICATION') !== -1) {
    return 'ابزار تحت وب';
  }
  return 'پروژه نرم‌افزاری';
}

/**
 * Returns a compact Persian label for tight UI headers and badges.
 *
 * @param {string} category - Raw category identifier.
 * @returns {string} Short Persian label.
 */
export function getCategoryShortLabel(category: string): string {
  if (category.indexOf('LANDING') !== -1) return 'صفحه فرود';
  if (category.indexOf('OPEN_SOURCE_TOOL') !== -1) return 'ابزار وب / متن‌باز';
  if (category.indexOf('TOOLING') !== -1 || category.indexOf('APPLICATION') !== -1)
    return 'ابزار وب';
  return 'نرم‌افزار';
}
