// src/components/Chat.jsx
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TASK_STATUS, URGENCY_LEVELS } from '../constants/endpoints';
import HypersphereButton from './HypersphereButton';
import './GeometricButton.css';
import './ButtonStyles.css';
import { PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/solid';

const Chat = () => {
  const {
    processUserInput,
    chatHistory,
    isLoading,
    error,
    tasks,
    currentTaskId,
    selectTask,
    clearError,
    clearChatHistory
  } = useApp();

  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const handleClear = () => {
    // Clear chat history through context
    if (typeof clearChatHistory === 'function') {
      clearChatHistory();
    }
  };

  const handleGenerateReport = async () => {
    try {
      clearError();
      await processUserInput("Generate a report");
    } catch (err) {
      console.error('Error generating report:', err);
    }
  };

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      clearError();
      const userInput = input.trim();
      setInput('');

      // Check for manual task commands
      const taskCommand = /^task\s+#?(\d+)$/i.exec(userInput);
      if (taskCommand) {
        const taskId = parseInt(taskCommand[1]);
        await selectTask(taskId);
        return;
      }

      // Process input through the AI
      await processUserInput(userInput);
    } catch (err) {
      console.error('Error processing input:', err);
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    const messageClass = isUser ? 'bg-blue-100' : 'bg-gray-100';
    const alignClass = isUser ? 'ml-auto' : 'mr-auto';

    return (
      <div
        key={index}
        className={`max-w-3/4 rounded-lg p-3 mb-4 ${messageClass} ${alignClass}`}
      >
        <div className="font-semibold mb-1">
          {isUser ? 'You' : 'Tranquil'}
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    );
  };

  const renderTaskBadge = (task) => {
    const urgencyColors = {
      [URGENCY_LEVELS.LOW]: 'bg-gray-200',
      [URGENCY_LEVELS.MEDIUM_LOW]: 'bg-blue-200',
      [URGENCY_LEVELS.MEDIUM]: 'bg-yellow-200',
      [URGENCY_LEVELS.MEDIUM_HIGH]: 'bg-orange-200',
      [URGENCY_LEVELS.HIGH]: 'bg-red-200'
    };

    const statusColors = {
      [TASK_STATUS.PENDING]: 'border-gray-400',
      [TASK_STATUS.COMPLETED]: 'border-green-400',
      [TASK_STATUS.HALF_COMPLETED]: 'border-yellow-400'
    };

    return (
      <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm
        ${urgencyColors[task.urgency]} ${statusColors[task.status]} border-2`}>
        #{task.id} • Urgency {task.urgency}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {chatHistory.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <HypersphereButton onClick={handleGenerateReport} />
          </div>
        )}
        {chatHistory.map((message, index) => renderMessage(message, index))}
        {isLoading && (
          <div className="text-gray-500 italic">Tranquil is thinking...</div>
        )}
        {error && (
          <div className="text-red-500 p-3 rounded bg-red-100">
            Error: {error}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Current task indicator */}
      {currentTaskId && tasks.find(t => t.id === currentTaskId) && (
        <div className="px-4 py-2 bg-gray-100 border-t">
          {renderTaskBadge(tasks.find(t => t.id === currentTaskId))}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleClear}
            className="clear-button"
            disabled={isLoading || chatHistory.length === 0}
          >
            <TrashIcon className="button-icon" aria-hidden="true" />
            <span className="button-text">Clear</span>
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            <PaperAirplaneIcon className="button-icon" aria-hidden="true" />
            <span className="button-text">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 