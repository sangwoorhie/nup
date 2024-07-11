import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import smileIcon from '../../assets/img/smile.png';
import { signupIndividual } from '../../services/authServices';

const IndividualSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
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
  const navigate = useNavigate();

  const handleCheckboxChange = (e, setFunction) => {
    setFunction(e.target.checked);
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
      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBackClick = () => {
    if (currentStep === 1) {
      navigate('/signup'); // Adjust this path to the correct signup page route
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: email + emailProvider,
      password,
      confirmPassword,
      username: name,
      phone,
      emergency_phone: emergencyPhone,
      profile_image: profileImage ? URL.createObjectURL(profileImage) : '',
    };

    await signupIndividual(payload, navigate);
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
    setEmailProvider(e.target.value);
  };

  return (
    <Container>
      <Header>KO-MAPPER AI</Header>
      <Steps>
        <Step active={currentStep === 1}>
          <StepIcon>{currentStep > 1 ? '✓' : '1'}</StepIcon>
          <StepLabel>약관동의</StepLabel>
        </Step>
        <Step active={currentStep === 2}>
          <StepIcon>{currentStep > 2 ? '✓' : '2'}</StepIcon>
          <StepLabel>회원정보입력</StepLabel>
        </Step>
        <Step active={currentStep === 3}>
          <StepIcon>{currentStep === 3 ? '✓' : '3'}</StepIcon>
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
                <Terms>{/* Terms content here */}</Terms>
                <Checkbox
                  type='checkbox'
                  checked={termsAccepted}
                  onChange={(e) => handleCheckboxChange(e, setTermsAccepted)}
                />
                <Label>이용 약관을 확인하였으며, 이에 동의합니다. (필수)</Label>
              </Section>
              <Section>
                <h3>II. 개인정보 수집 및 이용</h3>
                <Terms>{/* Privacy content here */}</Terms>
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
                <Terms>{/* Marketing content here */}</Terms>
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
            </TermsContainer>
            <ButtonContainer>
              <Button onClick={handleBackClick} secondary>
                뒤로가기
              </Button>
              <Button onClick={handleNextClick}>확인</Button>
            </ButtonContainer>
          </div>
        )}
        {currentStep === 2 && (
          <Form onSubmit={handleNextClick}>
            <Title>회원정보 입력</Title>
            <SmallText>
              <RequiredIndicator>▶</RequiredIndicator>표시는 필수 입력
              항목입니다.
            </SmallText>
            <Table>
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
                          <option value='@gmail.com'>@gmail.com</option>
                          <option value='@daum.net'>@daum.net</option>
                          <option value='@hanmail.net'>@hanmail.net</option>
                          <option value='@kakao.com'>@kakao.com</option>
                          <option value='@hotmail.com'>@hotmail.com</option>
                          <option value='@icloud.com'>@icloud.com</option>
                          <option value='@nate.com'>@nate.com</option>
                          <option value='@yahoo.co.kr'>@yahoo.co.kr</option>
                          <option value='직접입력'>직접입력</option>
                        </Select>
                      )}
                    </EmailProviderWrapper>
                    <CheckButton>중복확인</CheckButton>
                  </InputWrapper>
                  <Description>
                    *E-mail을 통해 로그인할 수 있으며, 귀하의 거래명세서와
                    현금영수증 등 각종 문서 및 중요한 알림을 수신하는 데
                    사용되므로, 정확한 이메일 주소를 입력해주세요.
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
                    *영문과 숫자, 특수기호로 구성하여 최소 8자 이상 가능합니다.
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
                  <Description>*실제 본명을 한글로 입력해 주세요.</Description>
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
                  <Description>*'-'를 제외한 숫자만 입력해주세요.</Description>
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
                </Cell>
              </Row>
              <Row>
                <Cell>
                  <OptionalIndicator>▶</OptionalIndicator>
                  <Label htmlFor='emergencyPhone'>비상연락처</Label>
                  <InputWrapper>
                    <Input
                      id='emergencyPhone'
                      type='tel'
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                    />
                  </InputWrapper>
                  <Description>*'-'를 제외한 숫자만 입력해주세요.</Description>
                </Cell>
                <br />
              </Row>
            </Table>
            <ButtonContainer>
              <Button onClick={handleBackClick} secondary>
                뒤로가기
              </Button>
              <Button type='submit'>확인</Button>
            </ButtonContainer>
          </Form>
        )}
        {currentStep === 3 && (
          <div>
            <CompletionContainer>
              <FinalTitle>회원가입이 완료되었습니다!</FinalTitle>
              <br />
              <br />
              <Icon src={smileIcon} alt='회원가입 완료' />
              <CompletionMessage>
                <p>모든 회원가입절차가 완료되었습니다.</p>
                <p>로그인 후 모든 서비스를 이용할 수 있습니다.</p>
                <CenteredButton onClick={handleSubmit}>
                  로그인 페이지로 이동
                </CenteredButton>
              </CompletionMessage>
            </CompletionContainer>
          </div>
        )}
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
  color: ${(props) => (props.active ? '#0056b3' : '#ccc')};
`;

const StepIcon = styled.div`
  width: 50px;
  height: 50px;
  border: 2px solid ${(props) => (props.active ? '#0056b3' : '#ccc')};
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
  align-items: center; /* Keep elements in the same line */
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
  background-color: ${(props) => (props.secondary ? 'white' : '#0056b3')};
  color: ${(props) => (props.secondary ? '#0056b3' : 'white')};
  border: ${(props) => (props.secondary ? '1px solid #0056b3' : 'none')};
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

const Footer = styled.footer`
  background-color: #f1f1f1;
  padding: 10px;
  text-align: center;
  font-size: 14px;
  color: #888;
`;

const SmallText = styled.span`
  font-size: 12px;
  margin-right: auto;
`;

export default IndividualSignup;
