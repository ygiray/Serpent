
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import TaskForm from './TaskForm';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('TaskForm', () => {
  it('renders all task assignment fields', () => {
    render(<TaskForm childId={1} token="test-token" />);

    expect(screen.getByLabelText('Task Title *')).toBeTruthy();
    expect(screen.getByLabelText('Description')).toBeTruthy();
    expect(screen.getByLabelText('Development Area *')).toBeTruthy();
    expect(screen.getByLabelText('Due Date *')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Assign Task' })).toBeTruthy();
  });

  it('requires a task title', () => {
    render(<TaskForm childId={1} token="test-token" />);

    const titleInput = screen.getByLabelText('Task Title *');

    expect(titleInput.required).toBe(true);
  });

  it('requires a development area and due date', () => {
    render(<TaskForm childId={1} token="test-token" />);

    expect(screen.getByLabelText('Development Area *').required).toBe(true);
    expect(screen.getByLabelText('Due Date *').required).toBe(true);
  });

  it('sends task data to the correct API endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 10, status: 'pending' })
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fireEvent.change(screen.getByLabelText('Task Title *'), {
      target: { value: 'Read a book' }
    });

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Read for 15 minutes' }
    });

    fireEvent.change(screen.getByLabelText('Development Area *'), {
      target: { value: 'language' }
    });

    fireEvent.change(screen.getByLabelText('Due Date *'), {
      target: { value: '2026-12-01' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Assign Task' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/children/5/tasks',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token'
        },
        body: JSON.stringify({
          title: 'Read a book',
          description: 'Read for 15 minutes',
          developmentArea: 'language',
          dueDate: '2026-12-01'
        })
      })
    );

    expect(await screen.findByRole('status')).toHaveProperty(
      'textContent',
      'Task assigned successfully.'
    );
  });

  it('shows an API error when task assignment fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Access denied' })
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fireEvent.change(screen.getByLabelText('Task Title *'), {
      target: { value: 'Practice writing' }
    });

    fireEvent.change(screen.getByLabelText('Development Area *'), {
      target: { value: 'motor' }
    });

    fireEvent.change(screen.getByLabelText('Due Date *'), {
      target: { value: '2026-12-02' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Assign Task' }));

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Access denied'
    );
  });

  it('does not call the API without authentication', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="" />);

    fireEvent.change(screen.getByLabelText('Task Title *'), {
      target: { value: 'Practice speaking' }
    });

    fireEvent.change(screen.getByLabelText('Development Area *'), {
      target: { value: 'language' }
    });

    fireEvent.change(screen.getByLabelText('Due Date *'), {
      target: { value: '2026-12-03' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Assign Task' }));

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Child selection and authentication are required.'
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
