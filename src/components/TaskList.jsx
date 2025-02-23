import { useState } from 'react';
import PropTypes from 'prop-types';
import { useApp } from '../context/AppContext';
import { TASK_STATUS, URGENCY_LEVELS } from '../constants/endpoints';
import { DocumentPlusIcon } from '@heroicons/react/24/solid';
import '../components/ButtonStyles.css';

const TaskList = ({ viewMode }) => {
  const {
    tasks,
    currentTaskId,
    selectTask,
    updateTask,
    createNewTask,
    isLoading,
    error
  } = useApp();

  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    description: '',
    urgency: URGENCY_LEVELS.MEDIUM
  });


  // Group tasks by urgency
  const groupedTasks = tasks.reduce((acc, task) => {
    const urgency = task.urgency || URGENCY_LEVELS.MEDIUM;
    if (!acc[urgency]) acc[urgency] = [];
    acc[urgency].push(task);
    return acc;
  }, {});

  const handleTaskClick = async (taskId) => {
    try {
      await selectTask(taskId);
    } catch (err) {
      console.error('Error selecting task:', err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleUrgencyChange = async (taskId, newUrgency) => {
    try {
      await updateTask(taskId, { urgency: parseInt(newUrgency) });
    } catch (err) {
      console.error('Error updating task urgency:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createNewTask(newTask);
      setNewTask({
        description: '',
        urgency: URGENCY_LEVELS.MEDIUM
      });
      setShowNewTaskForm(false);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const renderTaskCard = (task) => {
    const isSelected = task.id === currentTaskId;
    const urgencyColors = {
      [URGENCY_LEVELS.LOW]: 'border-gray-200 bg-gray-50',
      [URGENCY_LEVELS.MEDIUM_LOW]: 'border-blue-200 bg-blue-50',
      [URGENCY_LEVELS.MEDIUM]: 'border-yellow-200 bg-yellow-50',
      [URGENCY_LEVELS.MEDIUM_HIGH]: 'border-orange-200 bg-orange-50',
      [URGENCY_LEVELS.HIGH]: 'border-red-200 bg-red-50'
    };

    return (
      <div
        key={task.id}
        className={`p-4 mb-4 rounded-lg border-2 cursor-pointer transition-all
          ${urgencyColors[task.urgency]}
          ${isSelected ? 'ring-2 ring-blue-500' : ''}
          hover:shadow-md`}
        onClick={() => handleTaskClick(task.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Task #{task.id}</span>
          <div className="flex items-center space-x-2">
            <select
              value={task.urgency}
              onChange={(e) => handleUrgencyChange(task.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="text-sm border rounded p-1"
            >
              {Object.entries(URGENCY_LEVELS).map(([label, value]) => (
                <option key={value} value={value}>
                  {label.replace('_', ' ')}
                </option>
              ))}
            </select>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="text-sm border rounded p-1"
            >
              {Object.entries(TASK_STATUS).map(([label, value]) => (
                <option key={value} value={value}>
                  {label.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-gray-700">{task.description}</p>
        {task.notes && (
          <div className="mt-2 text-sm text-gray-500">
            Notes: {task.notes}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="card-header">
        <div className="card-header-content">
          <h2>Tasks & Opportunities</h2>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {viewMode === 'tasks' ? 'Tasks' : 'Opportunities'}
        </h2>
        <button
          onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          className="task-button"
          disabled={isLoading}
        >
          <DocumentPlusIcon className="button-icon" aria-hidden="true" />
          <span className="button-text">
            {showNewTaskForm ? 'Cancel' : `New ${viewMode === 'tasks' ? 'Task' : 'Opportunity'}`}
          </span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-bold">Error loading {viewMode}:</p>
          <p className="mt-2">The server encountered an error while fetching {viewMode}. Please try again later or contact support if the issue persists.</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* New Task Form */}
      {showNewTaskForm && (
        <form onSubmit={handleCreateTask} className="mb-6 p-4 bg-gray-100 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full p-2 border rounded-lg"
              rows="3"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Urgency
            </label>
            <select
              value={newTask.urgency}
              onChange={(e) => setNewTask({ ...newTask, urgency: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-lg"
            >
              {Object.entries(URGENCY_LEVELS).map(([label, value]) => (
                <option key={value} value={value}>
                  {label.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="task-button"
              disabled={isLoading}
            >
              <DocumentPlusIcon className="button-icon" aria-hidden="true" />
              <span className="button-text">Create {viewMode === 'tasks' ? 'Task' : 'Opportunity'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      {!error && Object.entries(groupedTasks)
        .sort(([a], [b]) => b - a)
        .map(([urgency, tasksInGroup]) => (
          <div key={urgency} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">
              Urgency Level {urgency}
            </h3>
            {tasksInGroup.map(renderTaskCard)}
          </div>
        ))}

      {tasks.length === 0 && !isLoading && !error && (
        <div className="text-center text-gray-500 py-8">
          No {viewMode} yet. Start a conversation or create a new {viewMode === 'tasks' ? 'task' : 'opportunity'}!
        </div>
      )}
    </div>
  );
};

TaskList.propTypes = {
  viewMode: PropTypes.oneOf(['tasks', 'opportunities']).isRequired
};

export default TaskList; 