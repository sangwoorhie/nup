import React, { useState } from 'react';
import styled from 'styled-components';
import MainHeader from '../../components/etc/ui/MainHeader';
import SubHeaders from '../../components/etc/ui/SubHeaders';
import httpClient from '../../services/httpClient';
import Footer from '../../components/etc/ui/Footer';

const PasswordChange = () => {
  const [activeHeader, setActiveHeader] = useState('User');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] =
    useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await httpClient.post('/users/me/change-password', {
        newPassword,
        newPasswordConfirm: confirmNewPassword,
      });
      alert(response.data.message);
    } catch (error) {
      alert(
        error.response?.data?.message || error.message || '비밀번호 변경 실패'
      );
    }
  };

  const togglePasswordVisibility = (setVisibility) => {
    setVisibility((prevVisibility) => !prevVisibility);
  };

  return (
    <Container>
      <MainHeader setActiveHeader={setActiveHeader} userType={'individual'} />
      <SubHeaders activeHeader={activeHeader} userType={'individual'} />
      <Content>
        <Title>비밀번호 변경</Title>
        <Form>
          <Label>새 비밀번호</Label>
          <InputWrapper>
            <Input
              type={newPasswordVisible ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <ToggleVisibilityButton
              type='button'
              onClick={() => togglePasswordVisibility(setNewPasswordVisible)}
            >
              {newPasswordVisible ? '👁' : '👁‍🗨'}
            </ToggleVisibilityButton>
          </InputWrapper>
          <Description>
            *영문 대문자, 소문자, 숫자 및 특수기호를 포함하여 최소 8자 이상,
            최대 20자 이내로 구성된 비밀번호를 작성해 주세요.
          </Description>
          <Label>새 비밀번호 확인</Label>
          <InputWrapper>
            <Input
              type={confirmNewPasswordVisible ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <ToggleVisibilityButton
              type='button'
              onClick={() =>
                togglePasswordVisibility(setConfirmNewPasswordVisible)
              }
            >
              {confirmNewPasswordVisible ? '👁' : '👁‍🗨'}
            </ToggleVisibilityButton>
          </InputWrapper>
          <Description>* 새 비밀번호와 동일하게 입력해 주세요.</Description>
          <Button onClick={handleChangePassword}>변경</Button>
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
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const Form = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-top: 10px;
  font-weight: bold;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center; /* Keep elements in the same line */
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
`;

const ToggleVisibilityButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: -30px; /* Position the eye icon inside the input */
`;

const Description = styled.p`
  font-size: 12px;
  color: #888;
  margin-top: 5px;
`;

const Button = styled.button`
  padding: 10px;
  margin-top: 20px;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

export default PasswordChange;
