import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as api from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [tasksData, profileData] = await Promise.all([
          api.getTasks(),
          api.getProfile()
        ]);
        setTasks(tasksData.summaries || []);
        setProfile(profileData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Core interaction handler
  const processUserInput = async (text) => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare context for the AI
      const context = {
        history: chatHistory,
        available_tasks: tasks,
        profile: profile,
        current_task_id: currentTaskId,
        has_tasks: tasks.length > 0,
        task_count: tasks.length
      };

      // Process the input
      const response = await api.processInput(text, context);

      // Update chat history
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: response.response }
      ]);

      // Refresh tasks if needed
      if (response.refresh_tasks) {
        const updatedTasks = await api.getTasks();
        setTasks(updatedTasks.summaries || []);
      }

      // Update profile if needed
      if (response.profile_updated) {
        const updatedProfile = await api.getProfile();
        setProfile(updatedProfile);
      }

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Task management
  const selectTask = async (taskId) => {
    try {
      setCurrentTaskId(taskId);
      const task = await api.getTask(taskId);
      return task;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const createNewTask = async (taskData) => {
    try {
      const newTask = await api.createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      let updatedTask;
      
      if ('status' in updates) {
        updatedTask = await api.updateTaskStatus(taskId, updates.status, updates.alertAt);
      }
      if ('urgency' in updates) {
        updatedTask = await api.updateTaskUrgency(taskId, updates.urgency);
      }
      if ('notes' in updates) {
        updatedTask = await api.updateTaskNotes(taskId, updates.notes);
      }
      if ('description' in updates) {
        updatedTask = await api.updateTaskDescription(taskId, updates.description);
      }

      // Refresh tasks after update
      const updatedTasks = await api.getTasks();
      setTasks(updatedTasks.summaries || []);

      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Profile management
  const updateUserProfile = async (profileInput) => {
    try {
      const updatedProfile = await api.updateProfile(profileInput);
      setProfile(updatedProfile.profile);
      return updatedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearUserProfile = async () => {
    try {
      await api.clearProfile();
      setProfile(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Context value
  const value = {
    // State
    tasks,
    profile,
    chatHistory,
    currentTaskId,
    isLoading,
    error,

    // Core functions
    processUserInput,

    // Task functions
    selectTask,
    createNewTask,
    updateTask,

    // Profile functions
    updateUserProfile,
    clearUserProfile,

    // State setters
    setError: (err) => setError(err),
    clearError: () => setError(null),
    clearChatHistory: () => setChatHistory([])
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AppContext; 