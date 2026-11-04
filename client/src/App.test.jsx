import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

afterEach(() => vi.restoreAllMocks());

describe('App', () => {
  it('shows backend status when the API answers', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', app: 'Serpent', version: '0.0.0' }),
    });
    render(<App />);
    expect(await screen.findByText('ok')).toBeInTheDocument();
  });

  it('shows an error when the API is not reachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Network error');
  });
});
