import { escapeHtml } from './escape-html';

describe('escapeHtml Utility', () => {
  it('should escape dangerous HTML characters to prevent XSS', () => {
    const dangerousInput = '<script>alert("XSS & attack")</script>';
    const expectedOutput = '&lt;script&gt;alert(&quot;XSS &amp; attack&quot;)&lt;/script&gt;';
    expect(escapeHtml(dangerousInput)).toBe(expectedOutput);
  });

  it('should escape single quotes properly', () => {
    const input = "John O'Connor";
    expect(escapeHtml(input)).toBe('John O&#039;Connor');
  });

  it('should handle null and undefined safely', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('should pass through normal safe strings unchanged', () => {
    expect(escapeHtml('Mamadou Diallo')).toBe('Mamadou Diallo');
  });
});
