// src/components/Chat.jsx
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TASK_STATUS, URGENCY_LEVELS } from '../constants/endpoints';
import HypersphereButton from './HypersphereButton';
import './GeometricButton.css';
import './ButtonStyles.css';
import './Chat.css';
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
    clearChatHistory,
    setChatHistory
  } = useApp();

  const [input, setInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, streamingMessage]);

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

      // Add user message immediately
      const userMessage = { role: 'user', content: userInput };
      setChatHistory(prev => [...prev, userMessage]);

      // Start streaming
      setIsStreaming(true);
      setStreamingMessage('');

      // Process input through the AI with streaming
      await processUserInput(userInput, (chunk) => {
        if (chunk.content) {
          setStreamingMessage(prev => prev + chunk.content);
        }
      });

      // Add final message to chat history and clear streaming
      const finalMessage = { role: 'assistant', content: streamingMessage };
      setChatHistory(prev => [...prev, finalMessage]);
      setStreamingMessage('');
      setIsStreaming(false);
    } catch (err) {
      console.error('Error processing input:', err);
      setIsStreaming(false);
    }
  };

  const handleClear = () => {
    clearChatHistory();
    setStreamingMessage('');
    setIsStreaming(false);
    setInput('');
  };

  const handleGenerateReport = async () => {
    try {
      clearError();
      await processUserInput("Generate a report");
    } catch (err) {
      console.error('Error generating report:', err);
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    return (
      <div
        key={index}
        className={`chat-message ${isUser ? 'user' : 'bot'} fade-in`}
      >
        <div className="message-content">
          <div className="message-sender">{isUser ? 'You' : 'Tranquil'}</div>
          <div className="message-text">{message.content}</div>
        </div>
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
      <div className={`task-badge ${urgencyColors[task.urgency]} ${statusColors[task.status]}`}>
        #{task.id} • Urgency {task.urgency}
      </div>
    );
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>Chat</h2>
        {currentTaskId && tasks.find(t => t.id === currentTaskId) && (
          renderTaskBadge(tasks.find(t => t.id === currentTaskId))
        )}
      </div>

      <div className="chat-messages">
        {chatHistory.length === 0 ? (
          <div className="empty-state">
            <HypersphereButton onClick={handleGenerateReport} />
          </div>
        ) : (
          <>
            {chatHistory.map((message, index) => renderMessage(message, index))}
            {isStreaming && (
              <div className="chat-message bot fade-in">
                <div className="message-content">
                  <div className="message-sender">Tranquil</div>
                  <div className="message-text">{streamingMessage}</div>
                </div>
              </div>
            )}
            {isLoading && !isStreaming && (
              <div className="loading-message">Tranquil is thinking...</div>
            )}
            {error && (
              <div className="error-message">
                Error: {error}
              </div>
            )}
          </>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <div className="button-group">
              <button
                type="button"
                onClick={handleClear}
                className="clear-button"
                disabled={isLoading || chatHistory.length === 0}
              >
                <TrashIcon className="button-icon" />
                Clear
              </button>
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || !input.trim()}
              >
                <PaperAirplaneIcon className="button-icon" />
                Send
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat; 