import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doubleCheckPassword } from '../../services/userServices';
import styled from 'styled-components';
import MainHeader from '../../components/etc/ui/MainHeader';
import SubHeaders from '../../components/etc/ui/SubHeaders';
import Footer from '../../components/etc/ui/Footer';

const VerifyPassword = ({ onSuccess, userType }) => {
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [activeHeader, setActiveHeader] = useState('User');
  const navigate = useNavigate();
  const location = useLocation();
  const email = localStorage.getItem('userEmail') || '';
  const nextPath = location.state?.next || '/user-profile';

  const handlePasswordCheck = async () => {
    try {
      const message = await doubleCheckPassword(password);
      alert(message);
      setPassword(''); // Clear the password input
      onSuccess(nextPath); // Navigate to the desired path
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancel = () => {
    alert('취소되었습니다.');
    setPassword('');
    navigate('/user-profile'); // Navigate back to profile or any other page on cancel
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevVisible) => !prevVisible);
  };

  return (
    <Container>
      <MainHeader setActiveHeader={setActiveHeader} userType={userType} />
      <SubHeaders activeHeader={activeHeader} userType={userType} />
      <Content>
        <Title>회원정보 확인</Title>
        <div>본인 인증이 필요한 기능입니다.</div>
        <div>본인 인증을 위해 비밀번호를 입력해 주세요.</div>
        <br />
        <Form>
          <Label>
            E-mail:
            <Input type='text' value={email} readOnly />
          </Label>
          <Label>
            비밀번호:
            <InputWrapper>
              <Input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <ToggleVisibilityButton
                type='button'
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? '👁' : '👁‍🗨'}
              </ToggleVisibilityButton>
            </InputWrapper>
          </Label>
          <ButtonContainer>
            <Button onClick={handleCancel} white>
              취소
            </Button>
            <Button onClick={handlePasswordCheck}>확인</Button>
          </ButtonContainer>
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
  margin-top: 10px;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const Form = styled.div`
  background: #f9f9f9;
  width: 400px;
  height: 300px;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Label = styled.label`
  margin-bottom: 10px;
  font-weight: bold;
  width: 100%;
  text-align: left;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center; /* Keep elements in the same line */
  width: 100%; /* Ensure the wrapper takes full width */
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  width: 100%; /* Make the input take full width */
  box-sizing: border-box; /* Ensure padding and border are included in the width */
`;

const ToggleVisibilityButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: -30px; /* Position the eye icon inside the input */
  transform: translateY(-7px); /* Adjust the vertical position of the button */
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const Button = styled.button`
  padding: 10px 30px;
  margin: 5px;
  background-color: ${(props) => (props.white ? 'white' : '#0056b3')};
  color: ${(props) => (props.white ? '#0056b3' : 'white')};
  border: ${(props) => (props.white ? '1px solid #ccc' : 'none')};
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
  &:hover {
    background-color: ${(props) => (props.white ? '#f0f0f0' : '#003f7f')};
  }
`;

export default VerifyPassword;
