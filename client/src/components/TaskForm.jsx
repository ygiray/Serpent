
import { useRef, useState } from 'react';

const DEVELOPMENT_AREAS = [
  { value: 'language', label: 'Language' },
  { value: 'motor', label: 'Motor' },
  { value: 'cognitive', label: 'Cognitive' },
  { value: 'social_emotional', label: 'Social / Emotional' },
  { value: 'self_care', label: 'Self Care' }
];

const VALID_AREAS = DEVELOPMENT_AREAS.map((area) => area.value);

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (year < 1 || year > 9999) {
    return false;
  }

  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getErrorMessage(status, serverMessage) {
  if (status === 400) {
    return serverMessage || 'Please check the task details and try again.';
  }

  if (status === 401) {
    return 'Your session is invalid or has expired. Please sign in again.';
  }

  if (status === 403) {
    return 'You do not have permission to assign tasks to this child.';
  }

  if (status === 404) {
    return 'The selected child could not be found.';
  }

  if (status >= 500) {
    return 'The server is having trouble. Please try again later.';
  }

  return serverMessage || 'Failed to assign task. Please try again.';
}

export default function TaskForm({ childId, token, onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [developmentArea, setDevelopmentArea] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submittingRef = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    setError('');
    setSuccess('');

    if (!title.trim() || !developmentArea || !dueDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!VALID_AREAS.includes(developmentArea)) {
      setError('Please select a valid development area.');
      return;
    }

    if (!isValidDate(dueDate)) {
      setError('Please enter a valid due date.');
      return;
    }

    if (
      childId === undefined ||
      childId === null ||
      String(childId).trim() === '' ||
      !token ||
      !String(token).trim()
    ) {
      setError('Child selection and authentication are required.');
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    let createdTask = null;

    try {
      const response = await fetch(
        `/api/children/${encodeURIComponent(childId)}/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            developmentArea,
            dueDate
          })
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        // The server may return an empty or non-JSON response.
      }

      if (!response.ok) {
        const serverMessage =
          data &&
          typeof data.error === 'string' &&
          data.error.trim()
            ? data.error
            : '';

        throw new Error(getErrorMessage(response.status, serverMessage));
      }

      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error(
          'The server returned an unexpected response. Please check the task list before trying again.'
        );
      }

      createdTask = data;

      setTitle('');
      setDescription('');
      setDevelopmentArea('');
      setDueDate('');
      setSuccess('Task assigned successfully.');
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }

    if (createdTask && typeof onTaskCreated === 'function') {
      try {
        onTaskCreated(createdTask);
      } catch (callbackError) {
        console.error('Task created, but the UI update failed:', callbackError);
      }
    }
  }

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.65rem',
    fontSize: '1rem',
    border: '1px solid #9ca3af',
    borderRadius: '6px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.4rem',
    fontWeight: 600
  };

  const groupStyle = {
    marginBottom: '1rem'
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={loading}
      style={{
        width: '100%',
        maxWidth: '520px',
        boxSizing: 'border-box',
        padding: '1rem',
        margin: '0 auto'
      }}
    >
      <h2>Assign Task</h2>

      <p>Fields marked with * are required.</p>

      <div style={groupStyle}>
        <label htmlFor="task-title" style={labelStyle}>
          Task Title *
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoComplete="off"
          disabled={loading}
          required
          style={fieldStyle}
        />
      </div>

      <div style={groupStyle}>
        <label htmlFor="task-description" style={labelStyle}>
          Description
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          disabled={loading}
          style={fieldStyle}
        />
      </div>

      <div style={groupStyle}>
        <label htmlFor="task-area" style={labelStyle}>
          Development Area *
        </label>
        <select
          id="task-area"
          value={developmentArea}
          onChange={(event) => setDevelopmentArea(event.target.value)}
          disabled={loading}
          required
          style={fieldStyle}
        >
          <option value="">Select development area</option>
          {DEVELOPMENT_AREAS.map((area) => (
            <option key={area.value} value={area.value}>
              {area.label}
            </option>
          ))}
        </select>
      </div>

      <div style={groupStyle}>
        <label htmlFor="task-date" style={labelStyle}>
          Due Date *
        </label>
        <input
          id="task-date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          disabled={loading}
          required
          style={fieldStyle}
        />
      </div>

      {error && (
        <p role="alert" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}

      {success && (
        <p role="status" style={{ color: '#166534' }}>
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          fontWeight: 600,
          border: 'none',
          borderRadius: '6px',
          backgroundColor: loading ? '#6b7280' : '#1d4ed8',
          color: '#ffffff',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Assigning...' : 'Assign Task'}
      </button>
    </form>
  );
}
