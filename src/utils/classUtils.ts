/**
 * Utility functions for matching, filtering, and displaying SD school classes.
 * Handles both plain grade formats ('1', 'Kelas 1', '1-A', 'Kelas 1-A') seamlessly.
 */

export const STANDARD_SD_CLASSES = [
  'Kelas 1',
  'Kelas 2',
  'Kelas 3',
  'Kelas 4',
  'Kelas 5',
  'Kelas 6',
  '1-A',
  '1-B',
  '2-A',
  '2-B',
  '3-A',
  '3-B',
  '4-A',
  '4-B',
  '5-A',
  '5-B',
  '6-A',
  '6-B',
];

/**
 * Normalizes class strings for safe comparison
 * e.g. "Kelas 1" -> "1", "kelas 1-A" -> "1-a", "1" -> "1"
 */
export function normalizeClass(cls?: string): string {
  if (!cls) return '';
  return cls
    .trim()
    .toLowerCase()
    .replace(/^kelas\s*/i, '')
    .replace(/\s+/g, '');
}

/**
 * Checks if a student's class matches the teacher's homeroom class.
 * Matches:
 * - "Kelas 1" === "1" === "Kelas 1"
 * - "Kelas 1" matches student in "1", "Kelas 1", "1-A", "1-B" (if homeroom is general grade 1)
 * - "1-A" strictly matches "1-A" or "Kelas 1-A"
 */
export function isHomeroomClassMatch(studentClass?: string, homeroomClass?: string): boolean {
  if (!studentClass || !homeroomClass) return false;
  if (homeroomClass === 'Semua') return true;

  const stdClean = normalizeClass(studentClass);
  const hrClean = normalizeClass(homeroomClass);

  // Exact match
  if (stdClean === hrClean) return true;

  // If homeroom is general single-digit grade (1 to 6)
  if (['1', '2', '3', '4', '5', '6'].includes(hrClean)) {
    if (stdClean === hrClean) return true;
    if (stdClean.startsWith(`${hrClean}-`) || stdClean.startsWith(`${hrClean}_`)) return true;
  }

  return false;
}

/**
 * Formats a clean display label for a class (e.g. "Kelas 1", "Kelas 1-A")
 */
export function formatClassLabel(className?: string): string {
  if (!className) return 'Kelas -';
  if (className.toLowerCase().startsWith('kelas')) return className;
  return `Kelas ${className}`;
}
