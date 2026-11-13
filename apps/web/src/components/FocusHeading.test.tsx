import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FocusHeading } from './FocusHeading';

describe('FR-01 protected page focus', () => {
  it('focuses the page heading after navigation', () => {
    render(<FocusHeading>Your policies</FocusHeading>);
    expect(
      screen.getByRole('heading', { name: 'Your policies' }),
    ).toHaveFocus();
  });
});
