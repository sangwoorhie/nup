import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import MainHeader from '../../components/etc/ui/MainHeader';
import SubHeaders from '../../components/etc/ui/SubHeaders';
import httpClient from '../../services/httpClient';
import Footer from '../../components/etc/ui/Footer';

const UserUpdate = () => {
  const [activeHeader, setActiveHeader] = useState('User');
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const type = localStorage.getItem('userType');
        setUserType(type);

        const endpoint =
          type === 'corporate' ? '/users/me/corp' : '/users/me/indi';
        const { data } = await httpClient.get(endpoint);
        setUserData(data);
        setUsername(data.username);
        setPhone(data.phone);
        setEmergencyPhone(data.emergency_phone);
        setProfileImage(data.profile_image);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    try {
      await httpClient.patch('/users/me/indi', {
        username,
        phone,
        emergency_phone: emergencyPhone,
        profile_image: profileImage,
      });
      alert('내 정보가 변경되었습니다');
      navigate('/user-profile');
    } catch (error) {
      alert(error.response?.data?.message || error.message || '정보 변경 실패');
    }
  };

  const handleCancel = () => {
    alert('취소되었습니다');
    navigate('/user-profile');
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  const getUserTypeLabel = () => {
    if (userType === 'corporate') return '사업자 회원';
    if (userType === 'admin') return '관리자 회원';
    if (userType === 'individual') return '개인 회원';
    return '회원';
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
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
        <Title>정보 수정</Title>
        <UserTypeLabel>{getUserTypeLabel()}</UserTypeLabel>
        <ProfileImageContainer>
          <ProfileImage src={profileImage} alt='Profile' />
          <ImageUploadLabel>
            <ImageUploadInput
              type='file'
              accept='image/*'
              onChange={handleImageUpload}
            />
            📷
          </ImageUploadLabel>
        </ProfileImageContainer>
        <Form>
          <Label>이름</Label>
          <Input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Description>
            * 이름을 한글로 입력해 주세요. (필수 입력사항)
          </Description>
          <Label>휴대전화</Label>
          <Input
            type='text'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Description>
            *'-'를 제외한 숫자만 입력해주세요. (필수 입력사항)
          </Description>
          <Label>비상 연락처</Label>
          <Input
            type='text'
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
          />
          <Description>
            *'-'를 제외한 숫자만 입력해주세요. (선택 입력사항)
          </Description>
        </Form>
        <br />
        <ButtonContainer>
          <CancelButton onClick={handleCancel}>취소</CancelButton>
          <UpdateButton onClick={handleUpdate}>내 정보 변경</UpdateButton>
        </ButtonContainer>
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

const UserTypeLabel = styled.h3`
  margin-bottom: 20px;
  color: #555;
`;

const ProfileImageContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  border-radius: 50%;
`;

const ImageUploadLabel = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: #000;
  color: #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const ImageUploadInput = styled.input`
  display: none;
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
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 400px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px;
  width: 190px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background-color: #fff;
  color: #0056b3;
  border: 1px solid #0056b3;
`;

const UpdateButton = styled(Button)`
  background-color: #0056b3;
  color: white;
`;

const Description = styled.p`
  font-size: 12px;
  color: #888;
  margin-top: 5px;
`;

export default UserUpdate;
