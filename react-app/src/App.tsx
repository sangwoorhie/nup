import React, { useState, useEffect } from 'react';
import './css/App.css';
import MainRoutes from './Routes';

function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return JSON.parse(localStorage.getItem('isDarkMode') || 'false');
  });

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode: boolean) => !prevMode);
  };

  return (
    <div className='app'>
      <MainRoutes isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
    </div>
  );
}

export default App;
