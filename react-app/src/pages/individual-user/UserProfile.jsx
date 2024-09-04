import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MainHeader from '../../components/etc/ui/MainHeader';
import SubHeaders from '../../components/etc/ui/SubHeaders';
import httpClient from '../../services/httpClient';
import Footer from '../../components/etc/ui/Footer';
import userIcon from '../../assets/img/individual.png';

const UserProfile = ({ isDarkMode, toggleDarkMode }) => {
  const [activeHeader, setActiveHeader] = useState('User');
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const type = localStorage.getItem('userType');
        setUserType(type);

        const endpoint =
          type === 'corporate' ? '/users/me/corp' : '/users/me/indi';
        const { data } = await httpClient.get(endpoint);
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return <div>Loading...</div>;
  }

  const getUserTypeLabel = () => {
    if (userType === 'corporate') return '사업자 회원';
    if (userType === 'admin') return '관리자 회원';
    if (userType === 'individual') return '개인 회원';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  return (
    <Container>
      <MainHeader
        setActiveHeader={setActiveHeader}
        userType={userType}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <SubHeaders activeHeader={activeHeader} userType={userType} />
      <Content isDarkMode={isDarkMode}>
        <Title>내 정보</Title>
        <ProfileImage
          src={userData.profile_image || userIcon} // Provide a default image URL if profile_image is null
          alt='Profile Image'
        />
        <Form>
          <Label>이름</Label>
          <Input type='text' value={userData.username} readOnly />
          <Label>회원 유형</Label>
          <Input type='text' value={getUserTypeLabel()} readOnly />
          <Label>E-mail</Label>
          <Input type='text' value={userData.email} readOnly />
          <Label>휴대전화</Label>
          <Input type='text' value={userData.phone} readOnly />
          <Label>비상 연락처</Label>
          <Input
            type='text'
            value={userData.emergency_phone || '(없음)'}
            readOnly
          />
          <Label>회원 가입일</Label>
          <Input type='text' value={formatDate(userData.created_at)} readOnly />
        </Form>
      </Content>
      <Footer />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  border-radius: 50%;
  margin-bottom: 20px;
  object-fit: cover;
`;

const Form = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-top: 10px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
`;

export default UserProfile;
