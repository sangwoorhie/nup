import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {
  login,
  loginWithApiKey,
  resetPassword,
  handleGoogleLogin,
} from '../../services/authServices';
import styled from 'styled-components';
import backgroundImage from '../../assets/img/background_img.jpg';
import UserSignupModal from '../../components/etc/modals/UserSignupModal';

const LoginPage = () => {
  const [isAPIKeyLogin, setIsAPIKeyLogin] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [showSignupModal, setShowSignupModal] = useState(false); // New state for modal visibility
  const [userType, setUserType] = useState(null); // New state for user type
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const handleSignUpClick = (e) => {
    navigate('/signup');
    e.preventDefault();
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    try {
      if (isAPIKeyLogin) {
        const payload = { apiKey };
        await loginWithApiKey(payload, navigate);
      } else {
        const payload = { email, password };
        await login(payload, navigate);
      }
      alert('로그인 되었습니다.');
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (isAPIKeyLogin) {
        alert('올바른 API Key가 아닙니다.');
      } else {
        alert('E-mail 또는 비밀번호가 올바르지 않습니다.');
      }
      console.error('Login failed:', error, errorMessage);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    try {
      const response = await resetPassword({ email, username });
      alert(response.message);
    } catch (error) {
      alert('비밀번호 재설정 요청에 실패했습니다.');
      console.error('Reset password failed:', error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { isNewUser, userId, userType } = await handleGoogleLogin(
        credentialResponse.credential,
        navigate
      );
      if (isNewUser) {
        setUserId(userId);
        setUserType(userType);
        setShowSignupModal(true);
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google login failed. Please try again.');
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failed:', error);
    alert('Google login failed. Please try again.');
  };

  const handleNaverLogin = () => {
    console.log('Naver Login Clicked');
    // setShowSignupModal(true); // Open the signup modal when Naver login is clicked
  };

  const handleModalClose = () => {
    setShowSignupModal(false); // Function to close the modal
  };

  return (
    <Container>
      <Overlay>
        <LogoWrapper>
          <Logo>
            <span className='highlight'>K</span>
            <span className='normal'>o</span>
          </Logo>
          <Logo>
            <span className='highlight'>M</span>
            <span className='normal'>apper</span>
          </Logo>
          <Logo>
            <span className='highlight'>A</span>
            <span className='normal'>I</span>
          </Logo>
          <Tagline>"We Make the World Digital Twins"</Tagline>
        </LogoWrapper>
        <FormWrapper>
          {isResetPassword ? (
            <ResetPasswordForm>
              <Title>Reset Password</Title>
              <SubTitle>비밀번호를 잊으셨나요?</SubTitle>
              <Description>
                귀하의 계정과 연결된 E-mail 주소와 이름을 입력하면 임시
                비밀번호를 발급하여 보내드립니다. 로그인 후 비밀번호를 변경해
                주세요.
              </Description>
              <Label htmlFor='email'>E-mail</Label>
              <Input
                id='email'
                type='email'
                placeholder='E-mail'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                type='text'
                placeholder='Name'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button onClick={handleResetPassword}>Reset Password</Button>
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
                    <Label htmlFor='apiKey'>API Key</Label>
                    <Input
                      id='apiKey'
                      type='text'
                      placeholder='API Key'
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      autoComplete='off'
                    />
                    <Button onClick={handleSignIn}>Sign In</Button>
                    <LinkWrapper>
                      <Link onClick={() => setIsAPIKeyLogin(false)}>
                        E-mail 로그인
                      </Link>
                      <Link onClick={handleSignUpClick}>회원가입</Link>
                    </LinkWrapper>
                  </>
                ) : (
                  <>
                    <Label htmlFor='email'>E-mail</Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='E-mail'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete='email'
                    />
                    <Label htmlFor='password'>Password</Label>
                    <InputWrapper>
                      <Input
                        id='password'
                        type={passwordVisible ? 'text' : 'password'}
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete='current-password'
                      />
                      <ToggleVisibilityButton
                        type='button'
                        onClick={togglePasswordVisibility}
                      >
                        {passwordVisible ? '👁' : '👁‍🗨'}
                      </ToggleVisibilityButton>
                    </InputWrapper>
                    <Button onClick={handleSignIn}>Sign In</Button>
                    <LoginButtonWrapper>
                      <GoogleLoginButtonWrapper>
                        <GoogleLogin
                          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                          onSuccess={handleGoogleSuccess}
                          onFailure={handleGoogleFailure}
                          cookiePolicy={'single_host_origin'}
                        />
                        {showSignupModal && (
                          <UserSignupModal
                            onClose={() => setShowSignupModal(false)}
                            userId={userId}
                            userType={userType}
                          />
                        )}
                      </GoogleLoginButtonWrapper>
                      <NaverLoginButtonWrapper onClick={handleNaverLogin}>
                        <img
                          src='naver_login.png' // 네이버 로그인 이미지 경로로 변경 필요
                          alt='Naver Login'
                        />
                      </NaverLoginButtonWrapper>
                    </LoginButtonWrapper>
                    <br />
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
      {showSignupModal && <UserSignupModal onClose={handleModalClose} />}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh; /* Ensure consistent height */
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const Overlay = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: auto;
  width: 90%;
  max-width: 1200px;
  min-height: 60%; /* Adjust as necessary */
  box-sizing: border-box;
  overflow: hidden;
`;

const LogoWrapper = styled.div`
  text-align: left;
  flex: 1;
`;

const FormWrapper = styled.div`
  flex: 1;
  max-width: 500px;
  height: 55vh;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-sizing: border-box;
  overflow: hidden;
`;

const Logo = styled.h1`
  font-size: 4rem;
  margin: 0;
  color: #1a1a1a;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  .highlight {
    color: #0056b3;
  }

  .normal {
    color: #000000;
  }
`;

const Tagline = styled.p`
  font-size: 1.5rem;
  margin: 10px 0 0 0;
  color: #0056b3;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 10px;
  color: #0056b3;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
`;

const SubTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #1a1a1a;
`;

const Description = styled.p`
  font-size: 1rem;
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
  font-size: 1rem;
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

const LoginButtonWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const GoogleLoginButtonWrapper = styled.div`
  flex: 1;
  margin-right: 10px;
`;

const NaverLoginButtonWrapper = styled.div`
  flex: 1;
  margin-left: 10px;
  background-color: #03c75a;
  border: none;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  text-align: center;
`;

export default LoginPage;
