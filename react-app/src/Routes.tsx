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
import ApiKey from './pages/individual-user/ApiKey';
import CorporateProfile from './pages/corporate-user/CorporateProfile';
import CorporateUpdate from './pages/corporate-user/CorporateUpdate';
import IndividualUserManagement from './pages/admin/accounts/IndividualUserManagement';
import CorporateUserManagement from './pages/admin/accounts/CorporateUserManagement';
import PointChargePage from './pages/user/point/PointChargePage';
import AdminUserManagement from './pages/admin/accounts/AdminUserManagement';
import ApiKeyManagement from './pages/admin/accounts/ApiKeyManagement';
import CouponIssuing from './pages/admin/coupons/CouponIssuing';
import CouponTemplateList from './pages/admin/coupons/CouponTemplateList';
import CouponCharge from './pages/user/point/CouponCharge';
import MyCoupon from './pages/user/point/MyCoupon';
import ChargeHistory from './pages/user/point/ChargeHistory';
import CashChargeRequest from './pages/admin/charge/CashChargeRequest';
import RefundManagement from './pages/admin/charge/RefundManagement';
import RefundHistory from './pages/user/point/RefundHistory';
// import PrivateRoutes from './components/routeRestriction/PrivateRoutes';
// import PublicRoutes from './components/routeRestriction/PublicRoutes';

interface MainRoutesProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const MainRoutes: React.FC<MainRoutesProps> = ({
  isDarkMode,
  toggleDarkMode,
}) => (
  <Routes>
    {/* <Route element={<PublicRoutes />}> */}
    <Route path='/' element={<LoginPage />} />
    <Route path='/login' element={<LoginPage />} />
    <Route path='/signup' element={<SignupPage />} />
    <Route path='/individual-signup' element={<IndividualSignup />} />
    <Route path='/corporate-signup' element={<CorporateSignup />} />
    {/* </Route> */}

    {/* <Route element={<PrivateRoutes />}> */}
    <Route
      path='/user-profile'
      element={
        <UserProfile isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      }
    />
    <Route
      path='/corporate-info'
      element={
        <CorporateProfile
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/verify-password'
      element={
        <VerifyPasswordWrapper
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/user-update'
      element={
        <UserUpdate isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      }
    />
    <Route
      path='/corporate-update'
      element={
        <CorporateUpdate
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/password-change'
      element={
        <PasswordChange
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/unregister'
      element={
        <Unregister isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      }
    />
    <Route
      path='/api-key'
      element={
        <ApiKey isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      }
    />
    <Route
      path='/individual-members'
      element={
        <IndividualUserManagement
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/corporate-members'
      element={
        <CorporateUserManagement
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/point-charge'
      element={
        <PointChargePage
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/admin-members'
      element={
        <AdminUserManagement
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/api-key-view'
      element={
        <ApiKeyManagement
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/coupon-issue'
      element={
        <CouponIssuing
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/coupon-view'
      element={
        <CouponTemplateList
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/coupon-register'
      element={
        <CouponCharge isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      }
    />
    <Route
      path='/my-coupons'
      element={
        <MyCoupon isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      }
    />
    <Route
      path='/charge-history'
      element={
        <ChargeHistory
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/cash-charge-request'
      element={
        <CashChargeRequest
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/refund-process'
      element={
        <RefundManagement
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    <Route
      path='/refund-history'
      element={
        <RefundHistory
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      }
    />
    {/* </Route> */}
  </Routes>
);

export default MainRoutes;
