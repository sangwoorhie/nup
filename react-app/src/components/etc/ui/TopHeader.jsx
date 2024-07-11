// src/components/layout/TopHeader.jsx
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const TopHeader = ({ setActiveHeader }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/'); // Adjust this path to the correct login page route
  };

  return (
    <Container>
      <MainOptions>
        <MainOption onClick={() => setActiveHeader('AI 모델')}>
          AI 모델
        </MainOption>
        <MainOption onClick={() => setActiveHeader('조사 이미지')}>
          조사 이미지
        </MainOption>
        <MainOption onClick={() => setActiveHeader('MY 포인트')}>
          MY 포인트
        </MainOption>
      </MainOptions>
      <UserActions>
        <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        <UserIcon onClick={() => setActiveHeader('User')} />
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

const MainOptions = styled.div`
  display: flex;
`;

const MainOption = styled.div`
  color: white;
  margin-right: 20px;
  cursor: pointer;
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
`;

const UserIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: #ccc;
  border-radius: 50%;
  margin-right: 10px;
`;

const LogoutButton = styled.button`
  background: none;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 15px;
`;

export default TopHeader;
