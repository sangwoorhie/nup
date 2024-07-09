import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import smileIcon from "../../assets/img/smile.png";

const IndividualSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const [email, setEmail] = useState("");
  const [emailProvider, setEmailProvider] = useState("@naver.com");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [phone, setPhone] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const navigate = useNavigate();

  const handleCheckboxChange = (e, setFunction) => {
    setFunction(e.target.checked);
  };

  const handleNextClick = () => {
    if (currentStep === 1) {
      if (!termsAccepted || !privacyAccepted) {
        alert(
          "KO-MAPPER AI 이용 약관 및 개인정보 수집 및 이용은 필수 동의사항 입니다."
        );
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBackClick = () => {
    if (currentStep === 1) {
      navigate("/signup"); // Adjust this path to the correct signup page route
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email + emailProvider);
    formData.append("password", password);
    formData.append("name", name);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }
    formData.append("phone", phone);
    formData.append("emergencyPhone", emergencyPhone);

    // Perform registration logic here with formData

    navigate("/");
  };

  const togglePasswordVisibility = (setVisibility) => {
    setVisibility((prevVisibility) => !prevVisibility);
  };

  return (
    <Container>
      <Header>KO-MAPPER AI</Header>
      <Steps>
        <Step active={currentStep === 1}>
          <StepIcon>{currentStep > 1 ? "✓" : "1"}</StepIcon>
          <StepLabel>약관동의</StepLabel>
        </Step>
        <Step active={currentStep === 2}>
          <StepIcon>{currentStep > 2 ? "✓" : "2"}</StepIcon>
          <StepLabel>회원정보입력</StepLabel>
        </Step>
        <Step active={currentStep === 3}>
          <StepIcon>{currentStep === 3 ? "✓" : "3"}</StepIcon>
          <StepLabel>가입완료</StepLabel>
        </Step>
      </Steps>
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
                <h3>KO-MAPPER AI 이용 약관</h3>
                <Terms>{/* Terms content here */}</Terms>
                <Checkbox
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => handleCheckboxChange(e, setTermsAccepted)}
                />
                <Label>이용 약관을 확인하였으며, 이에 동의합니다. (필수)</Label>
              </Section>
              <Section>
                <h3>개인정보 수집 및 이용</h3>
                <Terms>{/* Privacy content here */}</Terms>
                <Checkbox
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => handleCheckboxChange(e, setPrivacyAccepted)}
                />
                <Label>
                  개인정보 수집 및 이용을 확인하였으며, 이에 동의합니다. (필수)
                </Label>
              </Section>
              <Section>
                <h3>개인정보 마케팅 활용</h3>
                <Terms>{/* Marketing content here */}</Terms>
                <Checkbox
                  type="checkbox"
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
            <Table>
              <tbody>
                <tr>
                  <td>
                    <RequiredIndicator>▶</RequiredIndicator>
                  </td>
                  <td>
                    <Label htmlFor="email">E-mail</Label>
                  </td>
                  <td colSpan="2">
                    <InputWrapper>
                      <Input
                        id="email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <EmailProviderWrapper>
                        {emailProvider === "직접입력" ? (
                          <CustomEmailInput
                            type="text"
                            value={emailProvider}
                            onChange={(e) => setEmailProvider(e.target.value)}
                            placeholder="직접 입력"
                            required
                          />
                        ) : (
                          <Select
                            value={emailProvider}
                            onChange={(e) => setEmailProvider(e.target.value)}
                          >
                            <option value="@naver.com">@naver.com</option>
                            <option value="@gmail.com">@gmail.com</option>
                            <option value="@daum.net">@daum.net</option>
                            <option value="직접입력">직접입력</option>
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
                  </td>
                </tr>
                <tr>
                  <td>
                    <RequiredIndicator>▶</RequiredIndicator>
                  </td>
                  <td>
                    <Label htmlFor="password">비밀번호</Label>
                  </td>
                  <td colSpan="2">
                    <InputWrapper>
                      <Input
                        id="password"
                        type={passwordVisible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <ToggleVisibilityButton
                        type="button"
                        onClick={() =>
                          togglePasswordVisibility(setPasswordVisible)
                        }
                      >
                        {passwordVisible ? "👁" : "👁‍🗨"}
                      </ToggleVisibilityButton>
                    </InputWrapper>
                    <Description>
                      *영문과 숫자, 특수기호로 구성하여 최소 8자 이상 가능
                    </Description>
                  </td>
                </tr>
                <tr>
                  <td>
                    <RequiredIndicator>▶</RequiredIndicator>
                  </td>
                  <td>
                    <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  </td>
                  <td colSpan="2">
                    <InputWrapper>
                      <Input
                        id="confirmPassword"
                        type={confirmPasswordVisible ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <ToggleVisibilityButton
                        type="button"
                        onClick={() =>
                          togglePasswordVisibility(setConfirmPasswordVisible)
                        }
                      >
                        {confirmPasswordVisible ? "👁" : "👁‍🗨"}
                      </ToggleVisibilityButton>
                    </InputWrapper>
                  </td>
                </tr>
                <tr>
                  <td>
                    <RequiredIndicator>▶</RequiredIndicator>
                  </td>
                  <td>
                    <Label htmlFor="name">이름</Label>
                  </td>
                  <td colSpan="2">
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <OptionalIndicator>▶</OptionalIndicator>
                  </td>
                  <td>
                    <Label htmlFor="profileImage">프로필 이미지</Label>
                  </td>
                  <td colSpan="2">
                    <Input
                      id="profileImage"
                      type="file"
                      onChange={(e) => setProfileImage(e.target.files[0])}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <RequiredIndicator>▶</RequiredIndicator>
                  </td>
                  <td>
                    <Label htmlFor="phone">휴대전화</Label>
                  </td>
                  <td colSpan="2">
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <OptionalIndicator>▶</OptionalIndicator>
                  </td>
                  <td>
                    <Label htmlFor="emergencyPhone">비상연락처</Label>
                  </td>
                  <td colSpan="2">
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
            <ButtonContainer>
              <Button onClick={handleBackClick} secondary>
                뒤로가기
              </Button>
              <Button type="submit">확인</Button>
            </ButtonContainer>
          </Form>
        )}
        {currentStep === 3 && (
          <div>
            <CompletionContainer>
              <FinalTitle>회원가입이 완료되었습니다!</FinalTitle>
              <Icon src={smileIcon} alt="회원가입 완료" />
              <CompletionMessage>
                <p>모든 회원가입절차가 완료되었습니다.</p>
                <p>로그인 후 모든 서비스를 이용할 수 있습니다.</p>
              </CompletionMessage>
            </CompletionContainer>
            <Button onClick={handleSubmit}>로그인 페이지로 이동</Button>
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
  color: ${(props) => (props.active ? "#0056b3" : "#ccc")};
`;

const StepIcon = styled.div`
  width: 50px;
  height: 50px;
  border: 2px solid ${(props) => (props.active ? "#0056b3" : "#ccc")};
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
`;

const Description = styled.p`
  font-size: 12px;
  color: #888;
  margin-top: 5px;
`;

const RequiredIndicator = styled.span`
  color: red;
`;

const OptionalIndicator = styled.span`
  color: blue;
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
  background-color: ${(props) => (props.secondary ? "white" : "#0056b3")};
  color: ${(props) => (props.secondary ? "#0056b3" : "white")};
  border: ${(props) => (props.secondary ? "1px solid #0056b3" : "none")};
  cursor: pointer;
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

export default IndividualSignup;
