import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import corporateIcon from '../../../assets/img/corporate.png';
import individualIcon from '../../../assets/img/individual.png';
import { RadioButton } from 'primereact/radiobutton';
import AddressModal from './AddressModal';

const UserSignupModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(null);
  const [memberType, setMemberType] = useState('기업회원');
  const [terms, setTerms] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    marketingAccepted: false,
    allAccepted: false, // For the 전체 약관에 동의합니다 checkbox
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profileImage: null,
    emergencyContact: '',
    // Corporate-specific fields
    corporateName: '',
    businessType: '',
    businessConditions: '',
    businessRegistrationNumber: '',
    businessLicense: null,
    address: '',
    detailedAddress: '',
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [corporateName, setCorporateName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessConditions, setBusinessConditions] = useState('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] =
    useState('');
  const [businessLicense, setBusinessLicense] = useState(null);
  const [address, setAddress] = useState('');
  const [isAddressPopupVisible, setIsAddressPopupVisible] = useState(false);
  const [detailedAddress, setDetailedAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setStep(2);
  };

  const handleTermsChange = (e) => {
    const { name, checked } = e.target;
    setTerms((prev) => ({ ...prev, [name]: checked }));
    if (name === 'allAccepted') {
      setTerms((prev) => ({
        termsAccepted: checked,
        privacyAccepted: checked,
        marketingAccepted: checked,
        allAccepted: checked,
      }));
    }
  };

  const renderLabel = (label) => {
    const mapping = {
      기업명: '기관명',
      '업종 명': '기관 유형',
      '업태 명': '기관 세부유형',
      '사업자 등록번호': '기관 고유번호',
      '사업자 등록증': '기관 등록증',
      주소: '주소',
    };

    return memberType === '기업회원' ? label : mapping[label];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (data) => {
    setAddress(data.address);
    setIsAddressPopupVisible(false);
  };

  const goToNextStep = () => {
    if (step === 2 && (!terms.termsAccepted || !terms.privacyAccepted)) {
      setAlertMessage('모든 필수 약관에 동의해주세요.');
      return;
    }
    setAlertMessage('');
    setStep(step + 1);
  };

  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  const submitSignup = async () => {
    const apiUrl =
      userType === 'individual'
        ? '/api/completeIndiSignUp'
        : '/api/completeCorpSignUp';

    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    if (profileImage) {
      data.append('profileImage', profileImage);
    }
    data.append('emergencyContact', formData.emergencyContact);

    // Corporate-specific data
    if (userType === 'corporate') {
      data.append('corporateName', formData.corporateName);
      data.append('businessType', formData.businessType);
      data.append('businessConditions', formData.businessConditions);
      data.append(
        'businessRegistrationNumber',
        formData.businessRegistrationNumber
      );
      data.append('address', `${formData.address} ${formData.detailedAddress}`);
      if (businessLicense) {
        data.append('businessLicense', formData.businessLicense);
      }
    }

    try {
      await axios.post(apiUrl, data);
      alert('회원가입 완료');
      onClose();
    } catch (error) {
      console.error('Error in signup:', error);
      setAlertMessage('회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>×</CloseButton>
        <ModalHeader>
          <Title>
            {step === 1
              ? '회원 유형 선택'
              : step === 2
                ? '약관 동의'
                : step === 3
                  ? userType === 'corporate'
                    ? '회원 정보 입력'
                    : '회원가입 완료'
                  : '사업자 정보 입력'}
          </Title>
        </ModalHeader>

        <ModalContent>
          {step === 1 && (
            <OptionContainer>
              <Option onClick={() => handleUserTypeSelection('individual')}>
                <Icon src={individualIcon} alt='개인 회원가입' />
                <OptionTitle>개인 회원가입</OptionTitle>
              </Option>
              <Option onClick={() => handleUserTypeSelection('corporate')}>
                <Icon src={corporateIcon} alt='사업자 회원가입' />
                <OptionTitle>사업자 회원가입</OptionTitle>
              </Option>
            </OptionContainer>
          )}

          {step === 2 && (
            <>
              <TermsSection>
                <TermsTitle>I. KO-MAPPER AI 이용 약관</TermsTitle>
                <TermsContainer>
                  {/* This is where you will display your actual terms content */}
                </TermsContainer>
                <CheckboxLabel>
                  <input
                    type='checkbox'
                    name='termsAccepted'
                    checked={terms.termsAccepted}
                    onChange={handleTermsChange}
                  />
                  이용 약관을 확인하였으며, 이에 동의합니다. (필수)
                </CheckboxLabel>
              </TermsSection>

              <TermsSection>
                <TermsTitle>II. 개인정보 수집 및 이용</TermsTitle>
                <TermsContainer>
                  {/* This is where you will display your actual privacy policy content */}
                </TermsContainer>
                <CheckboxLabel>
                  <input
                    type='checkbox'
                    name='privacyAccepted'
                    checked={terms.privacyAccepted}
                    onChange={handleTermsChange}
                  />
                  개인정보 수집 및 이용에 동의합니다. (필수)
                </CheckboxLabel>
              </TermsSection>

              <TermsSection>
                <TermsTitle>III. 개인정보 마케팅 활용</TermsTitle>
                <TermsContainer>
                  {/* This is where you will display your actual marketing usage terms */}
                </TermsContainer>
                <CheckboxLabel>
                  <input
                    type='checkbox'
                    name='marketingAccepted'
                    checked={terms.marketingAccepted}
                    onChange={handleTermsChange}
                  />
                  개인정보 마케팅 활용에 동의합니다. (선택)
                </CheckboxLabel>
              </TermsSection>

              <CheckboxLabel>
                <input
                  type='checkbox'
                  name='allAccepted'
                  checked={terms.allAccepted}
                  onChange={handleTermsChange}
                />
                전체 약관에 동의합니다.
              </CheckboxLabel>
            </>
          )}

          {step === 3 && (
            <>
              <SmallText>
                <RequiredIndicator>▶</RequiredIndicator>표시는 필수 입력
                항목입니다.
              </SmallText>
              <Row>
                <RequiredIndicator>▶</RequiredIndicator>
                <Label>이름</Label>
                <Input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Row>
              <Row>
                <RequiredIndicator>▶</RequiredIndicator>
                <Label>휴대전화</Label>
                <Input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Row>
              <Row>
                <Label>프로필 이미지</Label>
                <Input
                  id='profileImage'
                  type='file'
                  onChange={(e) => setProfileImage(e.target.files[0])}
                />
              </Row>
              <Row>
                <Label>비상 연락처</Label>
                <Input
                  type='tel'
                  name='emergencyContact'
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                />
              </Row>
            </>
          )}

          {userType === 'corporate' && step === 4 && (
            <>
              <SmallText>
                <RequiredIndicator>▶</RequiredIndicator>표시는 필수 입력
                항목입니다.
              </SmallText>
              <RadioButtonGroup>
                <RadioButtonContainer>
                  <RadioButton
                    inputId='corporate'
                    name='memberType'
                    value='기업회원'
                    onChange={(e) => setMemberType(e.value)}
                    checked={memberType === '기업회원'}
                  />
                  <RadioButtonLabel htmlFor='corporate'>
                    기업회원 (사업자등록증을 소유하고 있는 기업)
                  </RadioButtonLabel>
                </RadioButtonContainer>
                <RadioButtonContainer>
                  <RadioButton
                    inputId='institute'
                    name='memberType'
                    value='기관회원'
                    onChange={(e) => setMemberType(e.value)}
                    checked={memberType === '기관회원'}
                  />
                  <RadioButtonLabel htmlFor='institute'>
                    기관회원 (연구소, 학교, 공공기관 단체 등)
                  </RadioButtonLabel>
                </RadioButtonContainer>
              </RadioButtonGroup>
              <Row>
                <RequiredIndicator>▶</RequiredIndicator>
                <Label htmlFor='corporateName'>{renderLabel('기업명')}</Label>
                <Input
                  id='corporateName'
                  type='text'
                  value={corporateName}
                  onChange={(e) => setCorporateName(e.target.value)}
                  required
                />
              </Row>
              <Row>
                <RequiredIndicator>▶</RequiredIndicator>
                <Label htmlFor='businessType'>{renderLabel('업종 명')}</Label>
                <Input
                  id='businessType'
                  type='text'
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  required
                />
              </Row>
              <Row>
                <RequiredIndicator>▶</RequiredIndicator>
                <Label htmlFor='businessConditions'>
                  {renderLabel('업태 명')}
                </Label>
                <Input
                  id='businessConditions'
                  type='text'
                  value={businessConditions}
                  onChange={(e) => setBusinessConditions(e.target.value)}
                  required
                />
              </Row>
              <Row>
                <RequiredIndicator>▶</RequiredIndicator>
                <Label htmlFor='businessRegistrationNumber'>
                  {renderLabel('사업자 등록번호')}
                </Label>
                <Input
                  id='businessRegistrationNumber'
                  type='text'
                  value={businessRegistrationNumber}
                  onChange={(e) =>
                    setBusinessRegistrationNumber(e.target.value)
                  }
                  required
                />
              </Row>
              <Row>
                <RequiredIndicator>▶</RequiredIndicator>
                <Label htmlFor='businessLicense'>
                  {renderLabel('사업자 등록증')}
                </Label>
                <Input
                  id='businessLicense'
                  type='file'
                  onChange={(e) => setBusinessLicense(e.target.files[0])}
                />
              </Row>
              <Row>
                <RequiredIndicator>▶</RequiredIndicator>
                <Label htmlFor='address'>{renderLabel('주소')}</Label>
              </Row>
              <Row>
                <Input
                  id='address'
                  type='text'
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <CheckButton
                  type='button'
                  onClick={() => setIsAddressPopupVisible(true)}
                >
                  주소 검색
                </CheckButton>
              </Row>
              <Row>
                <Input
                  id='detailedAddress'
                  type='text'
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  placeholder='상세 주소를 입력하세요.'
                  required
                />
              </Row>
            </>
          )}

          {alertMessage && <AlertMessage>{alertMessage}</AlertMessage>}
        </ModalContent>

        <ModalFooter>
          <ButtonContainer>
            {step > 1 && <Button onClick={goToPreviousStep}>뒤로가기</Button>}
            {step > 1 && step < 3 && (
              <Button onClick={goToNextStep}>다음</Button>
            )}
            {step === 3 && userType === 'corporate' ? (
              <Button onClick={() => setStep(4)}>다음</Button>
            ) : (
              step === 4 && <Button onClick={submitSignup}>회원가입</Button>
            )}
          </ButtonContainer>
        </ModalFooter>

        <AddressModal
          isVisible={isAddressPopupVisible}
          onClose={() => setIsAddressPopupVisible(false)}
          onComplete={handleAddressSelect}
        />
      </ModalContainer>
    </ModalOverlay>
  );
};

export default UserSignupModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  height: 600px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background-color: #f8f8f8;
  padding: 15px;
  text-align: center;
  border-bottom: 1px solid #ddd;
`;

const ModalFooter = styled.div`
  padding: 10px;
  border-top: 1px solid #ddd;
  background-color: #f8f8f8;
`;

const Title = styled.h2`
  font-size: 20px;
  margin: 0;
`;

const ModalContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const OptionContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  margin-top: 180px;
`;

const Option = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  text-align: center;
`;

const OptionTitle = styled.span`
  color: #007bff;
  font-size: 16px;
`;

const Icon = styled.img`
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
`;

const TermsSection = styled.div`
  margin-bottom: 20px;
`;

const TermsTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const TermsContainer = styled.div`
  max-height: 150px;
  overflow-y: scroll;
  border: 1px solid #e0e0e0;
  padding: 10px;
  background-color: #f9f9f9;
`;

const CheckboxLabel = styled.label`
  display: block;
  margin-top: 10px; /* Ensures checkbox is spaced below the terms */
  font-size: 14px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  margin-top: 20px;
`;

const Label = styled.label`
  margin-right: 10px;
  flex: 1;
  white-space: nowrap; /* Ensures label stays on a single line */
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  flex: 2;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 5px 20px;
  border-radius: 5px;
  cursor: pointer;
`;

const AlertMessage = styled.p`
  color: red;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const RequiredIndicator = styled.span`
  color: red;
  margin-right: 5px;
`;

const SmallText = styled.span`
  font-size: 12px;
  margin-right: auto;
  margin-bottom: 20px;
`;

const RadioButtonGroup = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
`;

const RadioButtonContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const RadioButtonLabel = styled.label`
  margin-left: 8px;
  white-space: nowrap; /* Ensures radio button labels stay on a single line */
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
