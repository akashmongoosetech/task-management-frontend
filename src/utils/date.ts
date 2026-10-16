/**
 * Format ISO date string into human-friendly format (e.g. "Oct 24, 2026")
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format for HTML <input type="date"> (YYYY-MM-DD)
 */
export function toInputDateValue(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

/**
 * Check if a due date is in the past compared to today (midnight)
 */
export function isOverdue(dateString: string | null | undefined, status: string): boolean {
  if (!dateString || status === 'completed') return false;
  const due = new Date(dateString);
  if (isNaN(due.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
}
