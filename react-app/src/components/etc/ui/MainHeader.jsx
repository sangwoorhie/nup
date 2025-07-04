import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../services/authServices';
import KMP_Logo from '../../../assets/img/kmplogo_fit.png';
import 'primeicons/primeicons.css';
import userIcon from '../../../assets/img/individual.png';

const MainHeader = ({
  setActiveHeader,
  userType,
  toggleDarkMode,
  isDarkMode,
}) => {
  const navigate = useNavigate();
  const [activeMainOption, setActiveMainOption] = useState('');

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout(navigate);
      alert('로그아웃 되었습니다.');
    }
  };

  const handleMainOptionClick = (key) => {
    setActiveMainOption(key);
    setActiveHeader(key);
  };

  const renderMainOptions = () => {
    if (userType === 'admin') {
      return [
        { label: '계정 관리', key: '계정 관리' },
        { label: '결제 관리', key: '결제 관리' },
        { label: '쿠폰 관리', key: '쿠폰 관리' },
        { label: 'AI모델 관리', key: 'AI모델 관리' },
      ];
    } else {
      return [
        { label: 'Ko-Detect', key: 'Ko-Detect' },
        { label: '조사 이미지', key: '조사 이미지' },
        { label: 'MY 포인트', key: 'MY 포인트' },
      ];
    }
  };

  const mainOptions = renderMainOptions();

  return (
    <Container>
      <LeftSection>
        <Logo src={KMP_Logo} alt='Logo' />
        <MainOptions>
          {mainOptions.map((option) => (
            <MainOption
              key={option.key}
              onClick={() => handleMainOptionClick(option.key)}
              active={activeMainOption === option.key}
            >
              {option.label}
            </MainOption>
          ))}
        </MainOptions>
      </LeftSection>
      <UserActions>
        <DarkModeLabel>Dark Mode</DarkModeLabel>
        <ToggleSwitch>
          <input
            type='checkbox'
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          <span className='slider'></span>
        </ToggleSwitch>
        <LogoutButton onClick={handleLogout}>
          로그아웃
          <i className='pi pi-sign-out' style={{ marginLeft: '10px' }}></i>
        </LogoutButton>
        <UserIconWrapper>
          <UserIcon src={userIcon} onClick={() => setActiveHeader('User')} />
        </UserIconWrapper>
      </UserActions>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0056b3;
  padding: 10px 20px;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  height: 30px;
  margin-right: 20px;
`;

const MainOptions = styled.div`
  margin-left: 20px;
  display: flex;
`;

const MainOption = styled.div`
  color: white;
  margin-right: 20px;
  cursor: pointer;
  padding: 5px 10px;
  transition: background-color 0.3s;
  background-color: ${({ active }) =>
    active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
`;

const UserIconWrapper = styled.div`
  width: 35px;
  height: 35px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition:
    background-color 0.3s,
    transform 0.3s;

  &:hover {
    background-color: #aaa;
    transform: scale(1.1);
  }
`;

const UserIcon = styled.img`
  width: 90%;
  height: 90%;
  border-radius: 50%;
  cursor: pointer;
`;

const LogoutButton = styled.button`
  background: none;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 15px;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
  margin-right: 10px;

  & input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  & .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
  }

  & .slider:before {
    position: absolute;
    content: '';
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  & input:checked + .slider {
    background-color: #2196f3;
  }

  & input:checked + .slider:before {
    transform: translateX(14px);
  }
`;

const DarkModeLabel = styled.span`
  color: white;
  font-size: 12px;
  margin-right: 10px;
`;

export default MainHeader;
