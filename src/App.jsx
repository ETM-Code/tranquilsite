import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Chat from './components/Chat';
import TaskList from './components/TaskList';
import ProfileModal from './components/ProfileModal';
import Login from './components/Login';
import GmailCallback from './components/GmailCallback';
import './App.css';
import './components/ButtonStyles.css';
import { UserCircleIcon, ArrowPathIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { startGmailAuth, checkGmailStatus } from './services/gmail';
import { auth } from './firebase';

// ... existing code ... 