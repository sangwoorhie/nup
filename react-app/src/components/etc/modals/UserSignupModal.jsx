import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import corporateIcon from '../../../assets/img/corporate.png';
import individualIcon from '../../../assets/img/individual.png';

const UserSignupModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(null);
  const [terms, setTerms] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    marketingAccepted: false,
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profileImage: null,
    emergencyContact: '',
    businessInfo: {},
  });
  const [alertMessage, setAlertMessage] = useState('');

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setStep(2);
  };

  const handleTermsChange = (e) => {
    const { name, checked } = e.target;
    setTerms((prev) => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: e.target.files[0],
    }));
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
    if (formData.profileImage) {
      data.append('profileImage', formData.profileImage);
    }
    data.append('emergencyContact', formData.emergencyContact);

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
        <Title>
          {step === 1
            ? '회원 유형 선택'
            : step === 2
              ? '약관 동의'
              : '회원 정보 입력'}
        </Title>
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
            <TermsContainer>
              <CheckboxLabel>
                <input
                  type='checkbox'
                  name='termsAccepted'
                  checked={terms.termsAccepted}
                  onChange={handleTermsChange}
                />
                이용 약관을 확인하였으며, 이에 동의합니다. (필수)
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type='checkbox'
                  name='privacyAccepted'
                  checked={terms.privacyAccepted}
                  onChange={handleTermsChange}
                />
                개인정보 수집 및 이용에 동의합니다. (필수)
              </CheckboxLabel>
              <CheckboxLabel>
                <input
                  type='checkbox'
                  name='marketingAccepted'
                  checked={terms.marketingAccepted}
                  onChange={handleTermsChange}
                />
                개인정보 마케팅 활용에 동의합니다. (선택)
              </CheckboxLabel>
            </TermsContainer>
          )}

          {step === 3 && (
            <>
              <Row>
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
                <FileInput
                  type='file'
                  name='profileImage'
                  onChange={handleFileChange}
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

          {alertMessage && <AlertMessage>{alertMessage}</AlertMessage>}
        </ModalContent>
        <ButtonContainer>
          {step > 1 && <Button onClick={goToPreviousStep}>뒤로가기</Button>}
          {step < 3 && <Button onClick={goToNextStep}>다음</Button>}
          {step === 3 && <Button onClick={submitSignup}>회원가입</Button>}
        </ButtonContainer>
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
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 20px;
  margin-bottom: 20px;
`;

const ModalContent = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const OptionContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
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

const TermsContainer = styled.div`
  margin-bottom: 20px;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  padding: 10px;
`;

const CheckboxLabel = styled.label`
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Label = styled.label`
  margin-right: 10px;
  flex: 1;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  flex: 2;
`;

const FileInput = styled.input`
  margin-bottom: 10px;
  padding: 5px;
  font-size: 14px;
  flex: 2;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
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
