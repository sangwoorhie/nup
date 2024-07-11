import React from 'react';
import useAuth from '../../utils/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoutes = () => {
  const isLoggedIn = useAuth();
  return isLoggedIn ? <Navigate to='/user-info' /> : <Outlet />;
};

export default PublicRoutes;
