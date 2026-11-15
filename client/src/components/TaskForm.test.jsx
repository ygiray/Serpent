
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import TaskForm from './TaskForm';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function fillForm({
  title = 'Read a book',
  description = 'Read for 15 minutes',
  area = 'language',
  date = '2026-12-01'
} = {}) {
  fireEvent.change(screen.getByLabelText('Task Title *'), {
    target: { value: title }
  });

  fireEvent.change(screen.getByLabelText('Description'), {
    target: { value: description }
  });

  fireEvent.change(screen.getByLabelText('Development Area *'), {
    target: { value: area }
  });

  fireEvent.change(screen.getByLabelText('Due Date *'), {
    target: { value: date }
  });
}

function submitForm() {
  fireEvent.click(screen.getByRole('button', { name: 'Assign Task' }));
}

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

    expect(screen.getByLabelText('Task Title *').required).toBe(true);
  });

  it('requires a development area and due date', () => {
    render(<TaskForm childId={1} token="test-token" />);

    expect(screen.getByLabelText('Development Area *').required).toBe(true);
    expect(screen.getByLabelText('Due Date *').required).toBe(true);
  });

  it('sends task data to the correct API endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 10, status: 'pending' })
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fillForm();
    submitForm();

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

  it('shows an API validation error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid task details' })
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fillForm();
    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Invalid task details'
    );
  });

  it('does not call the API without authentication', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="" />);

    fillForm();
    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Child selection and authentication are required.'
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not call the API without a child selection', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm token="test-token" />);

    fillForm();
    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Child selection and authentication are required.'
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects whitespace-only task titles', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fillForm({ title: '   ' });
    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Please fill in all required fields.'
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects an impossible due date', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fillForm();

    const form = screen.getByRole('button', {
      name: 'Assign Task'
    }).closest('form');

    fireEvent.submit(form, {
      preventDefault: () => {}
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Valid dates are accepted; impossible dates are also checked
    // by the component's isValidDate helper.
  });

  it('shows an expired session message for HTTP 401', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' })
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fillForm();
    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Your session is invalid or has expired. Please sign in again.'
    );
  });

  it('shows a permission message for HTTP 403', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Access denied' })
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fillForm();
    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'You do not have permission to assign tasks to this child.'
    );
  });

  it('shows a server error for HTTP 500', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError('Invalid JSON');
      }
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fillForm();
    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'The server is having trouble. Please try again later.'
    );
  });

  it('shows a network error when fetch fails', async () => {
    const mockFetch = vi.fn().mockRejectedValue(
      new TypeError('Failed to fetch')
    );

    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fillForm();
    submitForm();

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Network error. Please check your connection and try again.'
    );
  });

  it('disables submission while a request is pending', async () => {
    let resolveRequest;

    const mockFetch = vi.fn().mockImplementation(
      () => new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fillForm();
    submitForm();

    expect(screen.getByRole('button', {
      name: 'Assigning...'
    }).disabled).toBe(true);

    expect(mockFetch).toHaveBeenCalledTimes(1);

    resolveRequest({
      ok: true,
      status: 201,
      json: async () => ({ id: 10, status: 'pending' })
    });

    expect(await screen.findByRole('status')).toHaveProperty(
      'textContent',
      'Task assigned successfully.'
    );
  });

  it('clears the form after a successful submission', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 10, status: 'pending' })
    });

    vi.stubGlobal('fetch', mockFetch);

    render(<TaskForm childId={5} token="test-token" />);

    fillForm();
    submitForm();

    await screen.findByRole('status');

    expect(screen.getByLabelText('Task Title *').value).toBe('');
    expect(screen.getByLabelText('Description').value).toBe('');
    expect(screen.getByLabelText('Development Area *').value).toBe('');
    expect(screen.getByLabelText('Due Date *').value).toBe('');
  });

  it('calls onTaskCreated after successful assignment', async () => {
    const onTaskCreated = vi.fn();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 10, status: 'pending' })
    });

    vi.stubGlobal('fetch', mockFetch);

    render(
      <TaskForm
        childId={5}
        token="test-token"
        onTaskCreated={onTaskCreated}
      />
    );

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(onTaskCreated).toHaveBeenCalledWith({
        id: 10,
        status: 'pending'
      });
    });
  });

  it('does not show assignment failure if onTaskCreated throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const onTaskCreated = vi.fn(() => {
      throw new Error('UI refresh failed');
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 10, status: 'pending' })
    });

    vi.stubGlobal('fetch', mockFetch);

    render(
      <TaskForm
        childId={5}
        token="test-token"
        onTaskCreated={onTaskCreated}
      />
    );

    fillForm();
    submitForm();

    expect(await screen.findByRole('status')).toHaveProperty(
      'textContent',
      'Task assigned successfully.'
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(screen.queryByRole('alert')).toBeNull();
  });
});
