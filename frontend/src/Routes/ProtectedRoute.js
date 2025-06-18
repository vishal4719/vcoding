import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './../Authentication/AuthContext';
import TestResultPage from '../Admin/TestResultPage';

export function UserRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  return children;
}

export function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || !user.role || !user.role.includes('ADMIN')) return <Navigate to="/" />;
  return children;
}