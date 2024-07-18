import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VerifyPassword from './pages/auth/VerifyPassword';

const VerifyPasswordWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = location.state?.next || '/user-profile';
  const userType = location.state?.userType || 'individual'; // default to individual if not provided

  const handleSuccess = () => {
    navigate(nextPath, { state: { userType } }); // Pass userType on navigation
  };

  return <VerifyPassword onSuccess={handleSuccess} userType={userType} />;
};

export default VerifyPasswordWrapper;
