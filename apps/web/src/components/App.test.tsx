import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App (dark-mode toggle)', () => {
  it('toggles dark mode and persists preference', () => {
    // Ensure clean state
    localStorage.removeItem('nbncompare:darkMode');

    render(<App />);

    const toggle = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(toggle).toBeInTheDocument();

    // Toggle on
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(localStorage.getItem('nbncompare:darkMode')).toBe('true');

    // Toggle off
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
    expect(localStorage.getItem('nbncompare:darkMode')).toBe('false');
  });
});