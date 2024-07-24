import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MainHeader from '../../components/etc/ui/MainHeader';
import SubHeaders from '../../components/etc/ui/SubHeaders';
import Footer from '../../components/etc/ui/Footer';
import httpClient from '../../services/httpClient';
import { useNavigate } from 'react-router-dom';
import AddressModal from '../../components/etc/modals/AddressModal';

const CorporateUpdate = () => {
  const [corporateData, setCorporateData] = useState({});
  const [isAddressPopupVisible, setIsAddressPopupVisible] = useState(false);
  const [detailedAddress, setDetailedAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCorporateData = async () => {
      try {
        const { data } = await httpClient.get('/users/me/corp');
        setCorporateData(data);
      } catch (error) {
        console.error('Failed to fetch corporate data:', error);
      }
    };

    fetchCorporateData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCorporateData({
      ...corporateData,
      [name]: value,
    });
  };

  const handleAddressSelect = (data) => {
    setCorporateData({
      ...corporateData,
      address: data.address,
    });
    setIsAddressPopupVisible(false);
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        ...corporateData,
        address: `${corporateData.address} ${detailedAddress}`,
      };
      delete updateData.business_license_verified; // Remove unwanted fields
      await httpClient.patch('/users/me/corp', updateData);
      alert('사업자 정보가 변경되었습니다');
      navigate('/user-profile');
    } catch (error) {
      alert(error.response?.data?.message || error.message || '정보 변경 실패');
    }
  };

  const handleCancel = () => {
    alert('취소되었습니다');
    navigate('/user-profile');
  };

  return (
    <Container>
      <MainHeader setActiveHeader={() => {}} userType='corporate' />
      <SubHeaders activeHeader='User' userType='corporate' />
      <Content>
        <Title>사업자 정보 수정</Title>
        <Form>
          <Label>기업명</Label>
          <Input
            type='text'
            name='corporate_name'
            value={corporateData.corporate_name || ''}
            onChange={handleInputChange}
          />
          <Label>업종 명</Label>
          <Input
            type='text'
            name='business_type'
            value={corporateData.business_type || ''}
            onChange={handleInputChange}
          />
          <Label>업태 명</Label>
          <Input
            type='text'
            name='business_conditions'
            value={corporateData.business_conditions || ''}
            onChange={handleInputChange}
          />
          <Label>사업자 등록번호</Label>
          <Input
            type='text'
            name='business_registration_number'
            value={corporateData.business_registration_number || ''}
            onChange={handleInputChange}
          />
          <Label>사업자등록증</Label>
          <Input
            type='file'
            name='business_license'
            onChange={(e) =>
              setCorporateData({
                ...corporateData,
                business_license: e.target.files[0],
              })
            }
          />
          <Description>
            *사업자등록증 스캔본에 기재된 번호는 사업자 등록번호와 동일해야
            하며, 지원되는 파일 유형은 PDF, JPG, PNG입니다. 파일 크기는 최대
            10MB까지 가능합니다. 모든 글자가 또렷이 보이도록 선명한 스캔본을
            업로드해주세요.
          </Description>
          <Label>주소</Label>
          <InputWrapper>
            <Input
              type='text'
              name='address'
              value={corporateData.address || ''}
              onChange={handleInputChange}
              readOnly
            />
            <CheckButton
              type='button'
              onClick={() => setIsAddressPopupVisible(true)}
            >
              주소 검색
            </CheckButton>
          </InputWrapper>
          <Input
            type='text'
            name='detailedAddress'
            value={detailedAddress}
            onChange={(e) => setDetailedAddress(e.target.value)}
            placeholder='상세 주소를 입력하세요.'
          />
        </Form>
        <ButtonContainer>
          <Button onClick={handleCancel} secondary>
            취소
          </Button>
          <Button onClick={handleUpdate}>정보 수정</Button>
        </ButtonContainer>
      </Content>
      <Footer />
      <AddressModal
        isVisible={isAddressPopupVisible}
        onClose={() => setIsAddressPopupVisible(false)}
        onComplete={handleAddressSelect}
      />
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

const Form = styled.form`
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
  margin-bottom: 0px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  width: 100%;
  box-sizing: border-box;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  /* margin-bottom: 20px; Added margin-bottom for spacing */
`;

const CheckButton = styled.button`
  margin-left: 10px;
  padding: 10px;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 400px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: ${(props) => (props.secondary ? '#fff' : '#0056b3')};
  color: ${(props) => (props.secondary ? '#0056b3' : '#fff')};
  border: ${(props) => (props.secondary ? '1px solid #0056b3' : 'none')};
  border-radius: 5px;
  cursor: pointer;
  width: 48%;
  &:hover {
    background-color: ${(props) => (props.secondary ? '#f0f0f0' : '#003f7f')};
  }
`;

const Description = styled.p`
  font-size: 12px;
  color: #888;
  margin-top: 5px;
`;

export default CorporateUpdate;
