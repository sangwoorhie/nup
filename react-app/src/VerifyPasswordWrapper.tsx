import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VerifyPassword from './pages/auth/VerifyPassword';

const VerifyPasswordWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = location.state?.next || '/user-profile';

  const handleSuccess = () => {
    navigate(nextPath);
  };

  return <VerifyPassword onSuccess={handleSuccess} />;
};

export default VerifyPasswordWrapper;
