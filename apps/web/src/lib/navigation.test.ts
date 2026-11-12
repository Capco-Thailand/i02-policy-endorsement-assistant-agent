import { describe, expect, it } from 'vitest';
import { safeDestination } from './navigation';

describe('FR-01 AC1: sign-in return destination', () => {
  it('keeps internal paths and falls back for external or malformed destinations', () => {
    expect(safeDestination('/policies/SYN-POL-1001?tab=summary')).toBe(
      '/policies/SYN-POL-1001?tab=summary',
    );
    expect(safeDestination('https://evil.example')).toBe('/policies');
    expect(safeDestination('//evil.example')).toBe('/policies');
    expect(safeDestination('/\\evil.example')).toBe('/policies');
  });
});
