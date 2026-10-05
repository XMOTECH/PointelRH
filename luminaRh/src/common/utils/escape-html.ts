/**
 * Safely escapes HTML special characters to prevent Cross-Site Scripting (XSS) vulnerabilities.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) {
    return '';
  }
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
