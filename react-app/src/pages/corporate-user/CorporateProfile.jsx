import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import httpClient from '../../services/httpClient';
import MainHeader from '../../components/etc/ui/MainHeader';
import SubHeaders from '../../components/etc/ui/SubHeaders';
import Footer from '../../components/etc/ui/Footer';

const CorporateProfile = () => {
  const [CorporateProfile, setCorporateProfile] = useState(null);
  const [activeHeader, setActiveHeader] = useState('User');
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    const fetchCorporateProfile = async () => {
      try {
        const response = await httpClient.get('/users/me/corp');
        setCorporateProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch corporate info:', error);
      }
    };

    fetchCorporateProfile();
  }, []);

  if (!CorporateProfile) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <MainHeader setActiveHeader={setActiveHeader} userType={userType} />
      <SubHeaders activeHeader={activeHeader} userType={userType} />
      <Content>
        <Title>사업자 정보</Title>
        <Form>
          <FormItem>
            <Label>기업 명</Label>
            <Input
              type='text'
              value={CorporateProfile.corporate_name}
              readOnly
            />
          </FormItem>
          <FormItem>
            <Label>업종 코드</Label>
            <Input
              type='text'
              value={CorporateProfile.industry_code}
              readOnly
            />
          </FormItem>
          <FormItem>
            <Label>업종 명</Label>
            <Input
              type='text'
              value={CorporateProfile.business_type}
              readOnly
            />
          </FormItem>
          <FormItem>
            <Label>업태 명</Label>
            <Input
              type='text'
              value={CorporateProfile.business_conditions}
              readOnly
            />
          </FormItem>
          <FormItem>
            <Label>사업자 등록번호</Label>
            <Input
              type='text'
              value={CorporateProfile.business_registration_number}
              readOnly
            />
          </FormItem>
          <FormItem>
            <Label>사업자등록증 스캔본</Label>
            <a
              href={CorporateProfile.business_license}
              target='_blank'
              rel='noopener noreferrer'
            >
              View Document
            </a>
          </FormItem>
          <FormItem>
            <Label>주소</Label>
            <Input type='text' value={CorporateProfile.address} readOnly />
          </FormItem>
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
  width: 400px;
  display: flex;
  flex-direction: column;
`;

const FormItem = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-right: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 5px;
  background-color: #f9f9f9;
`;

export default CorporateProfile;
