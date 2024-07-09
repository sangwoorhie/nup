import React, { useState } from "react";
import styled from "styled-components";
import backgroundImage from "../../assets/img/background_img.jpg";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isAPIKeyLogin, setIsAPIKeyLogin] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <Container>
      <Overlay>
        <LogoWrapper>
          <Logo>Ko</Logo>
          <Logo>Mapper</Logo>
          <Logo>AI</Logo>
          <Tagline>"We Make the World Digital Twins"</Tagline>
        </LogoWrapper>
        <FormWrapper>
          {isResetPassword ? (
            <ResetPasswordForm>
              <Title>Reset Password</Title>
              <SubTitle>비밀번호를 잊으셨나요?</SubTitle>
              <Description>
                귀하의 계정과 연결된 E-mail 주소를 입력하면 기존 비밀번호를 재
                설정할 수 있는 링크를 보내드립니다.
              </Description>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="E-mail" />
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Name" />
              <Button>Reset Password</Button>
              <LinkWrapper>
                <Link onClick={() => setIsResetPassword(false)}>
                  E-mail 로그인
                </Link>
                <Link onClick={handleSignUpClick}>회원가입</Link>
              </LinkWrapper>
            </ResetPasswordForm>
          ) : (
            <>
              <Title>Welcome!</Title>
              <SubTitle>Sign in to continue</SubTitle>
              <Form>
                {isAPIKeyLogin ? (
                  <>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input id="apiKey" type="text" placeholder="API Key" />
                    <Button>Sign In</Button>
                    <LinkWrapper>
                      <Link onClick={() => setIsAPIKeyLogin(false)}>
                        E-mail 로그인
                      </Link>
                      <Link onClick={handleSignUpClick}>회원가입</Link>
                    </LinkWrapper>
                  </>
                ) : (
                  <>
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="E-mail" />
                    <Label htmlFor="password">Password</Label>
                    <InputWrapper>
                      <Input
                        id="password"
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Password"
                      />
                      <ToggleVisibilityButton
                        type="button"
                        onClick={togglePasswordVisibility}
                      >
                        {passwordVisible ? "👁" : "👁‍🗨"}
                      </ToggleVisibilityButton>
                    </InputWrapper>
                    <Button>Sign In</Button>
                    <LinkWrapper>
                      <Link onClick={() => setIsAPIKeyLogin(true)}>
                        API-Key 로그인
                      </Link>
                      <Link onClick={() => setIsResetPassword(true)}>
                        비밀번호찾기
                      </Link>
                      <Link onClick={handleSignUpClick}>회원가입</Link>
                    </LinkWrapper>
                  </>
                )}
              </Form>
            </>
          )}
        </FormWrapper>
      </Overlay>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Overlay = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40%;
  width: 90%;
  max-width: 1200px;
`;

const LogoWrapper = styled.div`
  text-align: left;
`;

const Logo = styled.h1`
  font-size: 64px; // Increased font size
  margin: 0;
  color: #1a1a1a;
  &:nth-child(1) {
    color: #0056b3;
  }
  &:nth-child(2) {
    color: #000000;
  }
  &:nth-child(3) {
    color: #0056b3;
  }
`;

const Tagline = styled.p`
  font-size: 24px; // Increased font size
  margin: 10px 0 0 0;
  color: #0056b3;
`;

const FormWrapper = styled.div`
  width: 100%;
  height: 90%;
  max-width: 500px; // Adjusted max-width
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9); // Less translucent background
  border-radius: 10px; // Optional: to give rounded corners
`;

const Title = styled.h2`
  font-size: 36px;
  margin-bottom: 10px;
  color: #0056b3;
`;

const SubTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 20px;
  color: #1a1a1a;
`;

const Description = styled.p`
  font-size: 14px;
  color: #1a1a1a;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const ResetPasswordForm = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #1a1a1a;
  margin-top: 10px;
`;

const Input = styled.input`
  padding: 10px;
  margin: 5px 0 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  box-sizing: border-box;
  position: relative;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ToggleVisibilityButton = styled.button`
  position: absolute;
  right: 10px;
  top: 40%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
`;

const Button = styled.button`
  padding: 10px;
  margin: 10px 0;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const LinkWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Link = styled.span`
  color: #0056b3;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

export default LoginPage;
