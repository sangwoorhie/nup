// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import IndividualSignup from './components/auth/IndividualSignup';
import CorporateSignup from './components/auth/CorporateSignup';
import UserProfile from './components/users/UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/individual-signup' element={<IndividualSignup />} />
        <Route path='/corporate-signup' element={<CorporateSignup />} />
        <Route path='/user-profile' element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
