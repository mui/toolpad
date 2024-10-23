/// <reference types="@testing-library/jest-dom/vitest" />

/**
 * @vitest-environment jsdom
 */

import * as React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import describeConformance from '@toolpad/utils/describeConformance';
import { SignInPage } from './SignInPage';

describe('SignInPage', () => {
  describeConformance(<SignInPage />, () => ({
    skip: ['themeDefaultProps'],
  }));

  test('renders oauth button', async () => {
    const signIn = vi.fn();
    render(<SignInPage signIn={signIn} providers={[{ id: 'github', name: 'GitHub' }]} />);

    const signInButton = screen.getByRole('button', { name: 'Sign in with GitHub' });

    await userEvent.click(signInButton);

    expect(signIn).toHaveBeenCalledWith({ id: 'github' });
  });

  test('renders credentials provider', async () => {
    const signIn = vi.fn();
    render(<SignInPage signIn={signIn} providers={[{ id: 'credentials', name: 'Credentials' }]} />);

    const emailField = screen.getByRole('textbox', { name: 'Email Address' });
    const passwordField = screen.getByLabelText(/Password/);
    const signInButton = screen.getByRole('button', { name: 'Sign in' });

    await userEvent.type(emailField, 'john@example.com');
    await userEvent.type(passwordField, 'thepassword');
    await userEvent.click(signInButton);

    const expectedFormData = new FormData();
    expectedFormData.append('email', 'john@example.com');
    expectedFormData.append('password', 'thepassword');

    expect(signIn).toHaveBeenCalledWith({ id: 'credentials' }, expectedFormData);
  });

  test('renders nodemailer provider', async () => {
    const signIn = vi.fn();
    render(<SignInPage signIn={signIn} providers={[{ id: 'nodemailer', name: 'Email' }]} />);

    const emailField = screen.getByRole('textbox', { name: 'Email Address' });
    const signInButton = screen.getByRole('button', { name: 'Sign in with Email' });

    await userEvent.type(emailField, 'john@example.com');
    await userEvent.click(signInButton);

    const expectedFormData = new FormData();
    expectedFormData.append('email', 'john@example.com');

    expect(signIn).toHaveBeenCalledWith({ id: 'nodemailer' }, expectedFormData);
  });

  test('renders passkey sign-in option when available', async () => {
    const signIn = vi.fn();

    render(<SignInPage signIn={signIn} providers={[{ id: 'passkey', name: 'Passkey ' }]} />);

    const emailField = screen.getByRole('textbox', { name: 'Email Address' });
    const signInButton = screen.getByRole('button', { name: 'Sign in with Passkey' });

    await userEvent.type(emailField, 'john@example.com');
    await userEvent.click(signInButton);

    const expectedFormData = new FormData();
    expectedFormData.append('email', 'john@example.com');

    expect(signIn).toHaveBeenCalledWith({ id: 'passkey' }, expectedFormData);
  });
});
