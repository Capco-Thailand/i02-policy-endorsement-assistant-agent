import { afterEach, expect, test, vi } from 'vitest';
import { act } from 'react';
import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import PoliciesLayout from './layout';
import PoliciesPage from './page';
import SignInPage from '../sign-in/page';
import { ApiError, currentActor, getPolicies, signOut } from '@/lib/api';

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error { constructor(readonly status: number) { super('API error'); } },
  currentActor: vi.fn(), getPolicies: vi.fn(), signOut: vi.fn(), signIn: vi.fn()
}));

const actor = { id: 'demo-alice', displayName: 'Alice Morgan' };
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.useRealTimers(); window.history.replaceState({}, '', '/'); });

test('first visit without a session has no expiry notice', async () => {
  vi.mocked(currentActor).mockRejectedValue(new ApiError(401));
  window.history.replaceState({}, '', '/policies');
  render(<PoliciesLayout><p>Protected policy</p></PoliciesLayout>);
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/sign-in?next=%2Fpolicies'));
  expect(screen.queryByText('Protected policy')).toBeNull();
});

test('signed-in visitor returns to the requested policy route', async () => {
  vi.mocked(currentActor).mockResolvedValue({ actor });
  window.history.replaceState({}, '', '/sign-in?next=%2Fpolicies%2FSYN-POL-1001');
  render(<SignInPage />);
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/policies/SYN-POL-1001'));
});

test('older session failure cannot hide a newer successful check', async () => {
  let failOld: (reason?: unknown) => void = () => {};
  vi.mocked(currentActor).mockImplementationOnce(() => new Promise((_, reject) => { failOld = reject; })).mockResolvedValue({ actor });
  vi.useFakeTimers();
  render(<PoliciesLayout><p>Protected policy</p></PoliciesLayout>);
  await act(async () => { vi.advanceTimersByTime(30_000); await Promise.resolve(); });
  expect(screen.getByText('Protected policy')).toBeTruthy();
  await act(async () => { failOld(new Error('stale failure')); await Promise.resolve(); });
  expect(screen.getByText('Protected policy')).toBeTruthy();
});

test('session check failure hides content and retry restores it', async () => {
  vi.mocked(currentActor).mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ actor });
  render(<PoliciesLayout><p>Protected policy</p></PoliciesLayout>);
  expect((await screen.findByRole('alert')).textContent).toContain('Session check is unavailable');
  expect(screen.queryByText('Protected policy')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Retry session check' }));
  expect(await screen.findByText('Protected policy')).toBeTruthy();
});

test('failed sign-out hides content until a successful retry', async () => {
  vi.mocked(currentActor).mockResolvedValue({ actor });
  vi.mocked(signOut).mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
  render(<PoliciesLayout><p>Protected policy</p></PoliciesLayout>);
  fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));
  expect((await screen.findByRole('alert')).textContent).toContain('Sign-out is unavailable');
  expect(screen.queryByText('Protected policy')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Retry sign out' }));
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/sign-in?reason=signed-out'));
});

test('policy-list retry fetches again after a transient failure', async () => {
  vi.mocked(getPolicies).mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ policies: [{ id: 'SYN-POL-1001', status: 'ACTIVE' }] });
  render(<PoliciesPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Retry policies' }));
  expect(await screen.findByText('SYN-POL-1001')).toBeTruthy();
  expect(getPolicies).toHaveBeenCalledTimes(2);
});
