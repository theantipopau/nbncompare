import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Provide a minimal localStorage mock for jsdom
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] ?? null;
  },
  setItem(key: string, value: string) {
    this.store[key] = value;
  },
  removeItem(key: string) {
    delete this.store[key];
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});

describe('App (dark-mode toggle + mobile nav)', () => {
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

  it('toggles mobile nav and updates aria attributes', () => {
    render(<App />);

    const mobileToggle = screen.getByRole('button', { name: /open mobile menu|close mobile menu/i });
    const nav = screen.getByRole('navigation');

    // Initially closed
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');

    // Open
    fireEvent.click(mobileToggle);
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
    expect(nav.classList.contains('site-nav--open')).toBe(true);

    // Close
    fireEvent.click(mobileToggle);
    expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
    expect(nav.classList.contains('site-nav--open')).toBe(false);
  });
});