import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VerifyPassword from './pages/auth/VerifyPassword';

interface VerifyPasswordWrapperProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const VerifyPasswordWrapper: React.FC<VerifyPasswordWrapperProps> = ({
  isDarkMode,
  toggleDarkMode,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = location.state?.next || '/user-profile';
  const userType = location.state?.userType || 'individual'; // default to individual if not provided
  const initialActiveSubOption = location.state?.initialActiveSubOption || '';

  const handleSuccess = () => {
    navigate(nextPath, { state: { userType, initialActiveSubOption } }); // Pass userType on navigation
  };

  return (
    <VerifyPassword
      onSuccess={handleSuccess}
      userType={userType}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
    />
  );
};

export default VerifyPasswordWrapper;
