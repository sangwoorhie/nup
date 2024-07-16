import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import IndividualSignup from './pages/auth/IndividualSignup';
import CorporateSignup from './pages/auth/CorporateSignup';
import UserProfile from './pages/individual-user/UserProfile';
import VerifyPasswordWrapper from './VerifyPasswordWrapper';
import UserUpdate from './pages/individual-user/UserUpdate';
import PasswordChange from './pages/individual-user/PasswordChange';
import Unregister from './pages/individual-user/Unregister';
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
    <Route path='/verify-password' element={<VerifyPasswordWrapper />} />
    <Route path='/user-update' element={<UserUpdate />} />
    <Route path='/password-change' element={<PasswordChange />} />
    <Route path='/unregister' element={<Unregister />} />
    {/* </Route> */}
  </Routes>
);

export default MainRoutes;
