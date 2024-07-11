// Routes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import IndividualSignup from './pages/auth/IndividualSignup';
import CorporateSignup from './pages/auth/CorporateSignup';
import UserProfile from './pages/users/UserProfile';
// import PrivateRoutes from './components/routeRestriction/PrivateRoutes';
// import PublicRoutes from './components/routeRestriction/PublicRoutes';

const MainRoutes = () => (
  <Routes>
    {/* <Route element={<PublicRoutes />}> */}
    <Route path='/' element={<LoginPage />} />
    <Route path='/login' element={<LoginPage />} />
    <Route path='/signup' element={<SignupPage />} />
    <Route path='/individual-signup' element={<IndividualSignup />} />
    <Route path='/corporate-signup' element={<CorporateSignup />} />
    {/* </Route> */}

    {/* <Route element={<PrivateRoutes />}> */}
    <Route path='/user-profile' element={<UserProfile />} />
    {/* </Route> */}
  </Routes>
);

export default MainRoutes;
