import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { RadioButton } from 'primereact/radiobutton';
import smileIcon from '../../assets/img/smile.png';
import {
  signupCorporate,
  sendAuthNumber,
  verifyAuthNumber,
} from '../../services/authServices';
import Footer from '../../components/etc/ui/Footer';
import AddressModal from '../../components/etc/modals/AddressModal';

const CorporateSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [allTermsAccepted, setAllTermsAccepted] = useState(false);
  const [email, setEmail] = useState('');
  const [emailProvider, setEmailProvider] = useState('@naver.com');
  const [isCustomEmailProvider, setIsCustomEmailProvider] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [corporateName, setCorporateName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessConditions, setBusinessConditions] = useState('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] =
    useState('');
  const [businessLicense, setBusinessLicense] = useState(null);
  const [address, setAddress] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [isAddressPopupVisible, setIsAddressPopupVisible] = useState(false);
  const [inputAuthNumber, setInputAuthNumber] = useState('');
  const [memberType, setMemberType] = useState('기업회원');
  const [timeLeft, setTimeLeft] = useState(0);
  const [authSent, setAuthSent] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const navigate = useNavigate();

  const handleCheckboxChange = (e, setFunction) => {
    setFunction(e.target.checked);
  };

  useEffect(() => {
    let timer;
    if (authSent && !authVerified && timeLeft > 0) {
      // Consider authVerified
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      clearInterval(timer);
      setAuthSent(false);
      setTimeLeft(0);
    }
    return () => clearInterval(timer);
  }, [authSent, authVerified, timeLeft]); // Add authVerified to dependencies

  const handleAllTermsChange = (e) => {
    const isChecked = e.target.checked;
    setAllTermsAccepted(isChecked);
    setTermsAccepted(isChecked);
    setPrivacyAccepted(isChecked);
    setMarketingAccepted(isChecked);
  };

  const handleNextClick = () => {
    if (currentStep === 1) {
      if (!termsAccepted || !privacyAccepted) {
        alert(
          'KO-MAPPER AI 이용 약관 및 개인정보 수집 및 이용은 필수 동의사항 입니다.'
        );
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!email || !password || !confirmPassword || !name || !phone) {
        alert('필수 입력 항목을 모두 입력하세요.');
        return;
      }
      if (password !== confirmPassword) {
        alert('비밀번호와 확인 비밀번호가 동일하지 않습니다.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (
        !corporateName ||
        !businessType ||
        !businessConditions ||
        !businessRegistrationNumber ||
        !address ||
        !detailedAddress
      ) {
        alert('필수 입력 항목을 모두 입력하세요.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleBackClick = () => {
    if (currentStep === 1) {
      const confirmCancel = window.confirm(
        '입력하신 정보는 저장되지 않습니다. 회원가입을 취소하시겠습니까?'
      );
      if (!confirmCancel) return;
      navigate('/signup');
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullAddress = `${address} ${detailedAddress}`;
    const formData = new FormData();
    formData.append('email', (email + emailProvider).toLowerCase());
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('username', name);
    formData.append('phone', phone);
    formData.append('emergency_phone', emergencyPhone || '');
    formData.append('corporate_name', corporateName);
    formData.append('business_type', businessType);
    formData.append('business_conditions', businessConditions);
    formData.append('business_registration_number', businessRegistrationNumber);
    formData.append('address', fullAddress);
    formData.append(
      'corporate_type',
      memberType === '기업회원' ? 'business' : 'organization'
    );
    if (profileImage) {
      formData.append('profile_image', profileImage);
    }
    if (businessLicense) {
      formData.append('business_license', businessLicense);
    }

    try {
      await signupCorporate(formData, setCurrentStep);
    } catch (error) {
      console.error('Error during corporate signup:', error);
      const message =
        error.response?.data?.message || error.message || 'Signup failed';
      alert(`Problem in Signup: ${message}`);
    }
  };

  const togglePasswordVisibility = (setVisibility) => {
    setVisibility((prevVisibility) => !prevVisibility);
  };

  const handleEmailProviderChange = (e) => {
    const value = e.target.value;
    if (value === '직접입력') {
      setIsCustomEmailProvider(true);
      setEmailProvider('');
    } else {
      setIsCustomEmailProvider(false);
      setEmailProvider(value);
    }
  };

  const handleCustomEmailProviderChange = (e) => {
    setEmailProvider(e.target.value.toLowerCase());
  };

  const handleSendAuthNumber = async () => {
    try {
      const fullEmail = `${email}${emailProvider}`;
      await sendAuthNumber(fullEmail);
      alert('인증번호가 전송되었습니다.');
      setAuthSent(true);
      setAuthVerified(false); // Reset authVerified state when sending a new auth number
      setTimeLeft(300); // 5 minutes countdown
    } catch (error) {
      alert(error.response?.data?.message || 'Error sending auth number.');
    }
  };

  const handleVerifyAuthNumber = async () => {
    try {
      const fullEmail = `${email}${emailProvider}`;
      await verifyAuthNumber(fullEmail, inputAuthNumber);
      alert('인증번호가 확인되었습니다.');
      setAuthVerified(true); // Set authVerified to true when verified
    } catch (error) {
      alert('올바른 인증번호가 아닙니다.');
    }
  };

  const handleAddressSelect = (data) => {
    setAddress(data.address);
    setIsAddressPopupVisible(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
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

  const getDescription = (label) => {
    const descriptions = {
      기관명: '*기관 등록증에 기재되어 있는 기관명을 입력해 주세요.',
      '기관 유형': '*기관 유형을 입력해 주세요.',
      '기관 세부유형': '*기관 세부 유형을 입력해 주세요.',
      '기관 고유번호':
        '*기관 등록번호 (사업자등록번호, 법인등록번호, 교육기관번호, 의료기관번호, 고유번호 등)을 입력해 주세요.',
      '기관 등록증':
        '기관 등록증 또는 증빙서류를 업로드 해주세요. 지원되는 파일 유형은 PDF, JPG, PNG이며, 파일 크기는 최대 10MB까지 가능합니다. 모든 글자가 또렷이 보이도록 선명한 스캔본을 업로드해주세요.',
    };

    const corporateDescriptions = {
      기업명: '*사업자등록증에 기재되어 있는 기업명을 입력해 주세요.',
      '업종 명': '*사업자등록증에 기재되어 있는 업종 명을 입력해 주세요.',
      '업태 명': '*사업자등록증에 기재되어 있는 업태 명을 입력해 주세요.',
      '사업자 등록번호':
        '*사업자등록증에 기재되어 있는 등록번호를 입력해 주세요.',
      '사업자 등록증':
        '*사업자등록증 스캔본에 기재된 번호는 사업자 등록번호와 동일해야 하며, 지원되는 파일 유형은 PDF, JPG, PNG입니다. 파일 크기는 최대 10MB까지 가능합니다. 모든 글자가 또렷이 보이도록 선명한 스캔본을 업로드해주세요.',
    };

    return memberType === '기관회원'
      ? descriptions[label]
      : corporateDescriptions[label];
  };

  return (
    <Container>
      <Header>KO-MAPPER AI</Header>
      <Steps>
        <Step $active={currentStep === 1}>
          <StepIcon>{currentStep > 1 ? '✓' : '1'}</StepIcon>
          <StepLabel>약관동의</StepLabel>
        </Step>
        <Step $active={currentStep === 2}>
          <StepIcon>{currentStep > 2 ? '✓' : '2'}</StepIcon>
          <StepLabel>회원정보입력</StepLabel>
        </Step>
        <Step $active={currentStep === 3}>
          <StepIcon>{currentStep > 3 ? '✓' : '3'}</StepIcon>
          <StepLabel>사업자정보입력</StepLabel>
        </Step>
        <Step $active={currentStep === 4}>
          <StepIcon>{currentStep === 4 ? '✓' : '4'}</StepIcon>
          <StepLabel>가입완료</StepLabel>
        </Step>
      </Steps>
      <br />
      <Content>
        {currentStep === 1 && (
          <div>
            <Title>약관 동의</Title>
            <div>
              KO-MAPPER AI 회원가입을 위해 아래 이용약관 및 개인정보 수집 이용
              등의 동의 확인 동의하여 주시기 바랍니다.
            </div>
            <TermsContainer>
              <Section>
                <h3>I. KO-MAPPER AI 이용 약관</h3>
                <Terms>
                  {/* Terms content here */}이용 약관이 들어갈 곳입니다.
                </Terms>
                <Checkbox
                  type='checkbox'
                  checked={termsAccepted}
                  onChange={(e) => handleCheckboxChange(e, setTermsAccepted)}
                />
                <Label>이용 약관을 확인하였으며, 이에 동의합니다. (필수)</Label>
              </Section>
              <Section>
                <h3>II. 개인정보 수집 및 이용</h3>
                <Terms>
                  {/* Privacy content here */}이용 약관이 들어갈 곳입니다.
                </Terms>
                <Checkbox
                  type='checkbox'
                  checked={privacyAccepted}
                  onChange={(e) => handleCheckboxChange(e, setPrivacyAccepted)}
                />
                <Label>
                  개인정보 수집 및 이용을 확인하였으며, 이에 동의합니다. (필수)
                </Label>
              </Section>
              <Section>
                <h3>III. 개인정보 마케팅 활용</h3>
                <Terms>
                  {/* Marketing content here */}이용 약관이 들어갈 곳입니다.
                </Terms>
                <Checkbox
                  type='checkbox'
                  checked={marketingAccepted}
                  onChange={(e) =>
                    handleCheckboxChange(e, setMarketingAccepted)
                  }
                />
                <Label>
                  개인정보 마케팅 활용을 확인하였으며, 이에 동의합니다. (선택)
                </Label>
              </Section>
              <Section>
                <Checkbox
                  type='checkbox'
                  checked={allTermsAccepted}
                  onChange={handleAllTermsChange}
                />
                <Label>전체 약관에 동의합니다.</Label>
              </Section>
            </TermsContainer>
            <ButtonContainer>
              <Button onClick={handleBackClick} $secondary>
                뒤로가기
              </Button>
              <Button onClick={handleNextClick}>확인</Button>
            </ButtonContainer>
          </div>
        )}
        {currentStep === 2 && (
          <Form onSubmit={handleSubmit}>
            <Title>회원정보 입력</Title>
            <SmallText>
              <RequiredIndicator>▶</RequiredIndicator>표시는 필수 입력
              항목입니다.
            </SmallText>
            <Table>
              <tbody>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='email'>E-mail</Label>
                    <InputWrapper>
                      <Input
                        id='email'
                        type='text'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <EmailProviderWrapper>
                        {isCustomEmailProvider ? (
                          <CustomEmailInput
                            type='text'
                            value={emailProvider}
                            onChange={handleCustomEmailProviderChange}
                            placeholder='직접 입력'
                            required
                          />
                        ) : (
                          <Select
                            value={emailProvider}
                            onChange={handleEmailProviderChange}
                          >
                            <option value='@naver.com'>@naver.com</option>
                            <option value='@chol.com'>@chol.com</option>
                            <option value='@gmail.com'>@gmail.com</option>
                            <option value='@daum.net'>@daum.net</option>
                            <option value='@hanmail.net'>@hanmail.net</option>
                            <option value='@kakao.com'>@kakao.com</option>
                            <option value='@nate.com'>@nate.com</option>
                            <option value='@yahoo.com'>@yahoo.com</option>
                            <option value='@yahoo.co.kr'>@yahoo.co.kr</option>
                            <option value='@hotmail.com'>@hotmail.com</option>
                            <option value='@icloud.com'>@icloud.com</option>
                            <option value='@outlook.com'>@outlook.com</option>
                            <option value='@dreamwiz.com'>@dreamwiz.com</option>
                            <option value='@empal.com'>@empal.com</option>
                            <option value='@freechal.com'>@freechal.com</option>
                            <option value='@hanafos.com'>@hanafos.com</option>
                            <option value='@hanmir.com'>@hanmir.com</option>
                            <option value='@hitel.net'>@hitel.net</option>
                            <option value='@korea.com'>@korea.com</option>
                            <option value='@lycos.co.kr'>@lycos.co.kr</option>
                            <option value='@netian.com'>@netian.com</option>
                            <option value='@paran.com'>@paran.com</option>
                            <option value='@komapper.ai'>@komapper.ai</option>
                            <option value='직접입력'>직접입력</option>
                          </Select>
                        )}
                      </EmailProviderWrapper>
                      <CheckButton type='button' onClick={handleSendAuthNumber}>
                        인증번호 발송
                      </CheckButton>
                    </InputWrapper>
                    <Description>
                      *E-mail을 통해 로그인할 수 있으며, 귀하의 거래명세서와
                      현금영수증 등 각종 문서 수신 및 비밀번호 분실 시 임시
                      비밀번호 발급 등 중요한 알림을 수신하는 데 사용되므로,
                      반드시 정확한 이메일 주소를 입력해주세요.
                    </Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='authNumber'>인증번호 확인</Label>
                    <InputWrapper>
                      <Input
                        id='authNumber'
                        type='text'
                        value={inputAuthNumber}
                        onChange={(e) => setInputAuthNumber(e.target.value)}
                        required
                      />
                      {authSent &&
                        !authVerified && ( // Hide timer if auth is verified
                          <Timer>
                            인증번호 유효시간 : {formatTime(timeLeft)}
                          </Timer>
                        )}
                      <CheckButton
                        type='button'
                        onClick={handleVerifyAuthNumber}
                      >
                        인증번호 확인
                      </CheckButton>
                    </InputWrapper>
                    <Description>
                      *입력하신 이메일로 전송받은 인증번호를 입력해 주세요.
                    </Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='password'>비밀번호</Label>
                    <InputWrapper>
                      <Input
                        id='password'
                        type={passwordVisible ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <ToggleVisibilityButton
                        type='button'
                        onClick={() =>
                          togglePasswordVisibility(setPasswordVisible)
                        }
                      >
                        {passwordVisible ? '👁' : '👁‍🗨'}
                      </ToggleVisibilityButton>
                    </InputWrapper>
                    <Description>
                      *영문 대문자, 소문자, 숫자 및 특수기호를 포함하여 최소 8자
                      이상, 최대 20자 이내로 구성된 비밀번호를 작성해 주세요.
                    </Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='confirmPassword'>비밀번호 확인</Label>
                    <InputWrapper>
                      <Input
                        id='confirmPassword'
                        type={confirmPasswordVisible ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <ToggleVisibilityButton
                        type='button'
                        onClick={() =>
                          togglePasswordVisibility(setConfirmPasswordVisible)
                        }
                      >
                        {confirmPasswordVisible ? '👁' : '👁‍🗨'}
                      </ToggleVisibilityButton>
                    </InputWrapper>
                    <Description>*비밀번호를 한번 더 입력해주세요.</Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='name'>이름</Label>
                    <InputWrapper>
                      <Input
                        id='name'
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </InputWrapper>
                    <Description>
                      *실제 본명을 한글로 입력해 주세요.
                    </Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='phone'>휴대전화</Label>
                    <InputWrapper>
                      <Input
                        id='phone'
                        type='tel'
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </InputWrapper>
                    <Description>
                      *'-'를 제외한 숫자만 입력해주세요.
                    </Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <OptionalIndicator>▶</OptionalIndicator>
                    <Label htmlFor='profileImage'>프로필 이미지</Label>
                    <InputWrapper>
                      <Input
                        id='profileImage'
                        type='file'
                        onChange={(e) => setProfileImage(e.target.files[0])}
                      />
                    </InputWrapper>
                    <Description>
                      *jpg, png, gif 등 이미지 파일만 등록해주세요.
                    </Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <OptionalIndicator>▶</OptionalIndicator>
                    <Label htmlFor='emergencyPhone'>비상 연락처</Label>
                    <InputWrapper>
                      <Input
                        id='emergencyPhone'
                        type='tel'
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                      />
                    </InputWrapper>
                    <Description>
                      *'-'를 제외한 숫자만 입력해주세요.
                    </Description>
                  </Cell>
                </Row>
              </tbody>
            </Table>
            <ButtonContainer>
              <Button onClick={handleBackClick} $secondary>
                뒤로가기
              </Button>
              <Button onClick={handleNextClick}>확인</Button>
            </ButtonContainer>
          </Form>
        )}
        {currentStep === 3 && (
          <Form onSubmit={handleSubmit}>
            <Title>사업자 정보 입력</Title>
            <SmallText>
              <RequiredIndicator>▶</RequiredIndicator>표시는 필수 입력
              항목입니다.
            </SmallText>
            <Table>
              <tbody>
                <Row>
                  <Cell>
                    <RadioButtonContainer>
                      <div className='flex align-items-center'>
                        <RadioButton
                          inputId='corporate'
                          name='memberType'
                          value='기업회원'
                          onChange={(e) => setMemberType(e.value)}
                          checked={memberType === '기업회원'}
                        />
                        <RadioButtonLabel htmlFor='corporate' className='ml-2'>
                          기업회원 (사업자등록증을 소유하고 있는 기업)
                        </RadioButtonLabel>
                      </div>
                      <div className='flex align-items-center'>
                        <RadioButton
                          inputId='institute'
                          name='memberType'
                          value='기관회원'
                          onChange={(e) => setMemberType(e.value)}
                          checked={memberType === '기관회원'}
                        />
                        <RadioButtonLabel htmlFor='institute' className='ml-2'>
                          기관회원 (연구소, 학교, 공공기관 단체 등)
                        </RadioButtonLabel>
                      </div>
                    </RadioButtonContainer>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='corporateName'>
                      {renderLabel('기업명')}
                    </Label>
                    <InputWrapper>
                      <Input
                        id='corporateName'
                        type='text'
                        value={corporateName}
                        onChange={(e) => setCorporateName(e.target.value)}
                        required
                      />
                    </InputWrapper>
                    <Description>
                      {getDescription(renderLabel('기업명'))}
                    </Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='businessType'>
                      {renderLabel('업종 명')}
                    </Label>
                    <InputWrapper>
                      <Input
                        id='businessType'
                        type='text'
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        required
                      />
                    </InputWrapper>
                    <Description>
                      {getDescription(renderLabel('업종 명'))}
                    </Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='businessConditions'>
                      {renderLabel('업태 명')}
                    </Label>
                    <InputWrapper>
                      <Input
                        id='businessConditions'
                        type='text'
                        value={businessConditions}
                        onChange={(e) => setBusinessConditions(e.target.value)}
                        required
                      />
                    </InputWrapper>
                    <Description>
                      {getDescription(renderLabel('업태 명'))}
                    </Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='businessRegistrationNumber'>
                      {renderLabel('사업자 등록번호')}
                    </Label>
                    <InputWrapper>
                      <Input
                        id='businessRegistrationNumber'
                        type='text'
                        value={businessRegistrationNumber}
                        onChange={(e) =>
                          setBusinessRegistrationNumber(e.target.value)
                        }
                        required
                      />
                    </InputWrapper>
                    <Description>
                      {getDescription(renderLabel('사업자 등록번호'))}
                    </Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='businessLicense'>
                      {renderLabel('사업자 등록증')}
                    </Label>
                    <InputWrapper>
                      <Input
                        id='businessLicense'
                        type='file'
                        onChange={(e) => setBusinessLicense(e.target.files[0])}
                      />
                    </InputWrapper>
                    <Description>
                      {getDescription(renderLabel('사업자 등록증'))}
                    </Description>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <RequiredIndicator>▶</RequiredIndicator>
                    <Label htmlFor='address'>{renderLabel('주소')}</Label>
                    <InputWrapper>
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
                    </InputWrapper>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <InputWrapper>
                      <Input
                        id='detailedAddress'
                        type='text'
                        value={detailedAddress}
                        onChange={(e) => setDetailedAddress(e.target.value)}
                        placeholder='상세 주소를 입력하세요.'
                        required
                      />
                    </InputWrapper>
                  </Cell>
                </Row>
              </tbody>
            </Table>
            <ButtonContainer>
              <Button onClick={handleBackClick} $secondary>
                뒤로가기
              </Button>
              <Button type='submit'>확인</Button>
            </ButtonContainer>
          </Form>
        )}
        {currentStep === 4 && (
          <div>
            <CompletionContainer>
              <FinalTitle>회원가입이 완료되었습니다!</FinalTitle>
              <Icon src={smileIcon} alt='회원가입 완료' />
              <CompletionMessage>
                <p>모든 회원가입절차가 완료되었습니다.</p>
                <p>로그인 후 모든 서비스를 이용할 수 있습니다.</p>
                <CenteredButton
                  type='button'
                  onClick={() => navigate('/login')}
                >
                  로그인 페이지로 이동
                </CenteredButton>
              </CompletionMessage>
            </CompletionContainer>
          </div>
        )}
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

const Header = styled.header`
  background-color: #0056b3;
  color: white;
  padding: 20px;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
`;

const Steps = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px; /* 20px below the header area */
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  color: ${(props) => (props.$active ? '#0056b3' : '#ccc')};
`;

const StepIcon = styled.div`
  width: 50px;
  height: 50px;
  border: 1px solid ${(props) => (props.$active ? '#0056b3' : '#ccc')};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
  font-size: 20px;
  font-weight: bold;
`;

const StepLabel = styled.div`
  font-size: 14px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 20px 20px 20px; /* Added padding bottom to increase space for the buttons */
`;

const Title = styled.h2`
  margin-bottom: 20px; /* Reduced margin */
  font-size: 24px;
  color: #1a1a1a;
`;

const FinalTitle = styled.h2`
  margin-bottom: 10px; /* Reduced margin */
  font-size: 24px;
  color: #1a1a1a;
  text-align: center;
`;

const CompletionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
`;

const TermsContainer = styled.div`
  width: 80%;
  max-width: 600px;
`;

const Section = styled.div`
  margin-bottom: 40px; /* Increased the margin to make the distance wider */
`;

const Terms = styled.div`
  height: 450px;
  width: 800px;
  overflow-y: scroll;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #f5f5f5;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #1a1a1a;
`;

const Form = styled.form`
  width: 80%;
  max-width: 800px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
`;

const Row = styled.tr`
  margin-bottom: 10px;
`;

const Cell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ccc;
  position: relative;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const CustomEmailInput = styled(Input)`
  margin-left: 10px;
`;

const EmailProviderWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px; /* Adjust margin for spacing */
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
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

const RequiredIndicator = styled.span`
  color: red;
  margin-right: 5px;
`;

const OptionalIndicator = styled.span`
  color: blue;
  margin-right: 5px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  width: 100%;
  margin-bottom: 20px; /* Added margin-bottom to increase space from the footer */
`;

const Button = styled.button`
  flex: 1;
  margin: 0 10px;
  padding: 10px 20px;
  background-color: ${(props) => (props.$secondary ? 'white' : '#0056b3')};
  color: ${(props) => (props.$secondary ? '#0056b3' : 'white')};
  border: ${(props) => (props.$secondary ? '1px solid #0056b3' : 'none')};
  cursor: pointer;
`;

const CenteredButton = styled(Button)`
  width: 500px; /* Adjust the width as needed */
  margin-top: 20px;
  align-self: center; /* Ensure the button is centered horizontally */
`;

const CompletionMessage = styled.div`
  text-align: center;
  font-size: 18px;
  color: #1a1a1a;
  margin-bottom: 20px;
`;

const Icon = styled.img`
  width: 300px;
  height: 300px;
  margin-bottom: 20px;
`;

const SmallText = styled.span`
  font-size: 12px;
  margin-right: auto;
`;

const RadioButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-inline-end: 80px;
  margin-inline-start: 50px;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const RadioButtonLabel = styled.label`
  margin-left: 3px;
  font-size: 12px;
`;

const Timer = styled.div`
  margin-left: 10px;
  font-size: 14px;
  color: black;
  pointer-events: none;
  user-select: none;
`;

export default CorporateSignup;
