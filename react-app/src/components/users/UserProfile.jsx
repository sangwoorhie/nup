// src/components/auth/UserProfile.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import TopHeader from '../../utils/TopHeader';
import SubHeaders from '../../utils/SubHeaders';

//http://localhost:3000/user-profile
const UserProfile = () => {
  const [activeHeader, setActiveHeader] = useState('User');

  return (
    <Container>
      <TopHeader setActiveHeader={setActiveHeader} />
      <SubHeaders activeHeader={activeHeader} />
      <Content>
        <Title>내 정보</Title>
        <ProfileImage />
        <Form>
          <Label>이름</Label>
          <Input type='text' value='홍길동' readOnly />
          <Label>회원 유형</Label>
          <Input type='text' value='일반 회원' readOnly />
          <Label>E-mail</Label>
          <Input type='text' value='honggildong@komapper.ai' readOnly />
          <Label>휴대전화</Label>
          <Input type='text' value='010-0000-0000' readOnly />
          <Label>비상 연락처</Label>
          <Input type='text' value='010-0000-0000 (없을 경우 공란)' readOnly />
        </Form>
      </Content>
      <Footer>
        copyright © 2024 (주)KO-MAPPER. Co., Ltd All rights reserved.
      </Footer>
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

const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  background-color: #ccc;
  border-radius: 50%;
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

const Input = styled.input`
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
`;

const Footer = styled.footer`
  background-color: #f1f1f1;
  padding: 10px;
  text-align: center;
  font-size: 14px;
  color: #888;
`;

export default UserProfile;
