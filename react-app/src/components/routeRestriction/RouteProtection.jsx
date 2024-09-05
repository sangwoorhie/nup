import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

// Assuming you have a function to check if the user is authenticated
const useAuth = () => {
  const user = localStorage.getItem('user'); // Example, adjust based on your app
  return user !== null; // Modify this as per your logic
};

export const PrivateRoutes = () => {
  const isAuthenticated = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />;
};

export const PublicRoutes = () => {
  const isAuthenticated = useAuth();
  return !isAuthenticated ? <Outlet /> : <Navigate to='/user-profile' />;
};
