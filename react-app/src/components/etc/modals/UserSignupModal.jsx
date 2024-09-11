import React, { useState } from 'react';
import styled from 'styled-components';
import corporateIcon from '../../../assets/img/corporate.png';
import individualIcon from '../../../assets/img/individual.png';
import { RadioButton } from 'primereact/radiobutton';
import AddressModal from './AddressModal';
import {
  handleIndiSignUp,
  handleCorpSignUp,
} from '../../../services/authServices';

const UserSignupModal = ({ onClose, userId }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(null);
  const [memberType, setMemberType] = useState('기업회원');
  const [terms, setTerms] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    marketingAccepted: false,
    allAccepted: false,
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyContact: '',
    corporateName: '',
    businessType: '',
    businessConditions: '',
    businessRegistrationNumber: '',
    address: '',
    detailedAddress: '',
  });

  const [alertMessage, setAlertMessage] = useState('');
  const [businessLicense, setBusinessLicense] = useState(null);
  const [isAddressPopupVisible, setIsAddressPopupVisible] = useState(false);
  const [detailedAddress, setDetailedAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setStep(2);
  };

  const handleTermsChange = (e) => {
    const { name, checked } = e.target;
    setTerms((prev) => {
      const updatedTerms = { ...prev, [name]: checked };
      if (name === 'allAccepted') {
        return {
          termsAccepted: checked,
          privacyAccepted: checked,
          marketingAccepted: checked,
          allAccepted: checked,
        };
      }
      const allAccepted =
        updatedTerms.termsAccepted &&
        updatedTerms.privacyAccepted &&
        updatedTerms.marketingAccepted;

      return { ...updatedTerms, allAccepted };
    });
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
    setIsAddressPopupVisible(false);
  };

  const areRequiredFieldsFilled = () => {
    if (userType === 'corporate') {
      return (
        formData.name &&
        formData.phone &&
        formData.corporateName &&
        formData.businessType &&
        formData.businessConditions &&
        formData.businessRegistrationNumber &&
        formData.address &&
        businessLicense
      );
    }
    return formData.name && formData.phone;
  };

  const goToNextStep = () => {
    if (step === 2 && (!terms.termsAccepted || !terms.privacyAccepted)) {
      setAlertMessage('모든 필수 약관에 동의해주세요.');
      return;
    }

    if (step === 3 && userType === 'corporate') {
      if (!formData.name || !formData.phone) {
        alert('이름과 휴대전화는 필수 입력 사항입니다.');
        return;
      }
    }

    setAlertMessage('');
    setStep(step + 1);
  };

  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  const submitSignup = async () => {
    if (!areRequiredFieldsFilled()) {
      alert('모든 필수 입력사항을 입력해 주세요.');
      return;
    }

    const signupData = new FormData();
    signupData.append('username', formData.name);
    signupData.append('phone', formData.phone);
    signupData.append('emergency_phone', formData.emergencyContact);

    if (profileImage) {
      signupData.append('profile_image', profileImage);
    }

    if (userType === 'corporate') {
      signupData.append(
        'corporate_type',
        memberType === '기업회원' ? 'business' : 'organization'
      );
      signupData.append('corporate_name', formData.corporateName);
      signupData.append('business_type', formData.businessType);
      signupData.append('business_conditions', formData.businessConditions);
      signupData.append(
        'business_registration_number',
        formData.businessRegistrationNumber
      );
      signupData.append(
        'address',
        `${formData.address} ${detailedAddress}`.trim()
      );

      if (businessLicense) {
        signupData.append('business_license', businessLicense);
      }
    }

    try {
      let response;
      if (userType === 'individual') {
        response = await handleIndiSignUp(userId, signupData);
      } else if (userType === 'corporate') {
        response = await handleCorpSignUp(userId, signupData);
      }
      alert(response.message || '회원가입이 완료되었습니다.');
      onClose();
    } catch (error) {
      if (error.response) {
        alert(
          `회원가입 중 오류가 발생했습니다: ${error.response.data.message || error.response.statusText}`
        );
      } else if (error.request) {
        alert('서버로부터 응답이 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        alert(`회원가입 중 오류가 발생했습니다: ${error.message}`);
      }
    }
  };

  const getPlaceholder = (label) => {
    if (memberType === '기업회원') {
      switch (label) {
        case 'corporateName':
          return '기업명을 입력해주세요.';
        case 'businessType':
          return '업종명을 입력해주세요.';
        case 'businessConditions':
          return '업태명을 입력해주세요.';
        case 'businessRegistrationNumber':
          return '사업자 등록번호를 입력해주세요.';
        default:
          return '';
      }
    } else if (memberType === '기관회원') {
      switch (label) {
        case 'corporateName':
          return '기관명을 입력해주세요.';
        case 'businessType':
          return '기관 유형을 입력해주세요.';
        case 'businessConditions':
          return '기관 세부유형을 입력해주세요.';
        case 'businessRegistrationNumber':
          return '기관 고유번호를 입력해주세요.';
        default:
          return '';
      }
    }
    return '';
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
                : step === 3 && userType === 'corporate'
                  ? '회원 정보 입력'
                  : '회원가입 완료'}
          </Title>
        </ModalHeader>

        <ModalContent>
          {step === 1 && (
            <>
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
              <p
                style={{
                  textAlign: 'center',
                  marginTop: '150px',
                  fontSize: '14px',
                }}
              >
                회원가입 후 서비스를 이용하실 수 있습니다.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <TermsSection>
                <TermsTitle>I. KO-MAPPER AI 이용 약관</TermsTitle>
                <TermsContainer>
                  {/* Display your terms content here */}
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
                  {/* Display privacy policy content here */}
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
                  {/* Display marketing usage terms here */}
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
                  placeholder='실제 본명을 입력해주세요.'
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
                  placeholder='연락처를 입력해주세요.'
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
                  placeholder='비상 연락처를 입력해주세요.'
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
                  value={formData.corporateName}
                  onChange={(e) =>
                    setFormData({ ...formData, corporateName: e.target.value })
                  }
                  placeholder={getPlaceholder('corporateName')}
                  required
                />
              </Row>
              <Row>
                <RequiredIndicator>▶</RequiredIndicator>
                <Label htmlFor='businessType'>{renderLabel('업종 명')}</Label>
                <Input
                  id='businessType'
                  type='text'
                  value={formData.businessType}
                  onChange={(e) =>
                    setFormData({ ...formData, businessType: e.target.value })
                  }
                  placeholder={getPlaceholder('businessType')}
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
                  value={formData.businessConditions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessConditions: e.target.value,
                    })
                  }
                  placeholder={getPlaceholder('businessConditions')}
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
                  value={formData.businessRegistrationNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessRegistrationNumber: e.target.value,
                    })
                  }
                  placeholder={getPlaceholder('businessRegistrationNumber')}
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
                <Input
                  id='address'
                  type='text'
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
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
                  placeholder='상세 주소를 입력해주세요.'
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
            ) : (step === 4 && userType === 'corporate') ||
              (step === 3 && userType === 'individual') ? (
              <Button onClick={submitSignup}>회원가입</Button>
            ) : null}
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
  width: 450px;
  max-width: 90%;
  height: 650px;
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

const OptionTitle = styled.span`
  color: #007bff;
  font-size: 16px;
  transition:
    color 0.2s ease-in-out,
    font-weight 0.2s ease-in-out; /* Smooth transition */
`;

const Icon = styled.img`
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
  transition: transform 0.2s ease-in-out; /* Smooth transition */
`;

const Option = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  &:hover ${Icon} {
    transform: scale(1.1);
  }

  &:hover ${OptionTitle} {
    color: #0056b3; /* Change color on hover */
    font-weight: bold; /* Make text bold */
  }
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
  margin-top: 10px;
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
  white-space: nowrap;
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
  white-space: nowrap;
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
