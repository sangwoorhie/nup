import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import httpClient from '../../services/httpClient';
import MainHeader from '../../components/etc/ui/MainHeader';
import SubHeaders from '../../components/etc/ui/SubHeaders';
import Footer from '../../components/etc/ui/Footer';
import { saveAs } from 'file-saver';
import 'primeicons/primeicons.css';

const CorporateProfile = ({ isDarkMode, toggleDarkMode }) => {
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

  const handleDownload = async () => {
    try {
      const response = await httpClient.get(`/users/business-license`, {
        responseType: 'blob',
      });
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]
        : 'business_license.pdf';
      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      saveAs(blob, filename);
    } catch (error) {
      console.error('Failed to download business license:', error);
    }
  };

  const renderLabel = (label) => {
    const mapping = {
      기업명: '기관명',
      '업종 명': '기관 유형',
      '업태 명': '기관 세부유형',
      '사업자 등록번호': '기관 고유번호',
      '사업자 등록증': '기관 등록증',
    };

    return CorporateProfile.corporate_type === 'organization'
      ? mapping[label]
      : label;
  };

  if (!CorporateProfile) {
    return <div>Loading...</div>;
  }

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
        <Title>사업자 정보</Title>
        <Form>
          <FormItem>
            <Label>{renderLabel('기업명')}</Label>
            <Input
              type='text'
              name='corporate_name'
              value={CorporateProfile.corporate_name}
              readOnly
            />
          </FormItem>
          <FormItem>
            <Label>{renderLabel('업종 명')}</Label>
            <Input
              type='text'
              name='business_type'
              value={CorporateProfile.business_type}
              readOnly
            />
          </FormItem>
          <FormItem>
            <Label>{renderLabel('업태 명')}</Label>
            <Input
              type='text'
              name='business_conditions'
              value={CorporateProfile.business_conditions}
              readOnly
            />
          </FormItem>
          <FormItem>
            <Label>{renderLabel('사업자 등록번호')}</Label>
            <Input
              type='text'
              value={CorporateProfile.business_registration_number}
              readOnly
            />
          </FormItem>
          <FormItem>
            <Label>{renderLabel('사업자 등록증')}</Label>
            <ButtonLink onClick={handleDownload}>
              Download {renderLabel('사업자 등록증')}
              <i className='pi pi-download' style={{ marginLeft: '3px' }}></i>
            </ButtonLink>
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
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
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

const ButtonLink = styled.button`
  background: none;
  border: none;
  color: blue;
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
  padding: 0;
`;

export default CorporateProfile;
