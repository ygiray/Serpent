
import { useState } from 'react';

const DEVELOPMENT_AREAS = [
  { value: 'language', label: 'Language' },
  { value: 'motor', label: 'Motor' },
  { value: 'cognitive', label: 'Cognitive' },
  { value: 'social_emotional', label: 'Social / Emotional' },
  { value: 'self_care', label: 'Self Care' }
];

export default function TaskForm({ childId, token, onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [developmentArea, setDevelopmentArea] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!title.trim() || !developmentArea || !dueDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!childId || !token) {
      setError('Child selection and authentication are required.');
      return;
    }

    setLoading(true);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign task.');
      }

      setTitle('');
      setDescription('');
      setDevelopmentArea('');
      setDueDate('');

      setSuccess('Task assigned successfully.');

      if (onTaskCreated) {
        onTaskCreated(data);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Assign Task</h2>

      <div>
        <label htmlFor="task-title">Task Title *</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="task-area">Development Area *</label>
        <select
          id="task-area"
          value={developmentArea}
          onChange={(event) => setDevelopmentArea(event.target.value)}
          required
        >
          <option value="">Select development area</option>
          {DEVELOPMENT_AREAS.map((area) => (
            <option key={area.value} value={area.value}>
              {area.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="task-date">Due Date *</label>
        <input
          id="task-date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          required
        />
      </div>

      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Assigning...' : 'Assign Task'}
      </button>
    </form>
  );
}
