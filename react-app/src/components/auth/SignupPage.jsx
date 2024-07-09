import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import corporateIcon from "../../assets/img/corporate.png";
import individualIcon from "../../assets/img/individual.png";

const SignupPage = () => {
  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate("/");
  };

  const handleIndividualSignupClick = () => {
    navigate("/individual-signup");
  };

  const handleCorporateSignupClick = () => {
    navigate("/corporate-signup");
  };

  return (
    <Container>
      <Header>KO-MAPPER AI</Header>
      <Content>
        <Title>가입하실 회원 유형을 선택하세요.</Title>
        <Options>
          <Option onClick={handleIndividualSignupClick}>
            <IconWrapper>
              <Icon src={individualIcon} alt="개인 회원가입" />
            </IconWrapper>
            <OptionTitle>개인 회원가입 &gt;</OptionTitle>
          </Option>
          <Option onClick={handleCorporateSignupClick}>
            <IconWrapper>
              <Icon src={corporateIcon} alt="사업자 회원가입" />
            </IconWrapper>
            <OptionTitle>사업자 회원가입 &gt;</OptionTitle>
          </Option>
        </Options>
        <FooterText>
          이미 회원이신가요?{" "}
          <Link onClick={handleSignInClick}>
            <b>Sign In</b>
          </Link>
        </FooterText>
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

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h2`
  margin-bottom: 40px;
  font-size: 24px;
  color: #1a1a1a;
`;

const Options = styled.div`
  display: flex;
  justify-content: space-around;
  width: 80%;
`;

const Option = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`;

const IconWrapper = styled.div`
  width: 500px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f5f5f5;
  margin-bottom: 10px;
`;

const Icon = styled.img`
  width: 80px;
  height: 80px;
`;

const OptionTitle = styled.div`
  font-size: 18px;
  color: #0056b3;
`;

const FooterText = styled.div`
  margin-top: 60px;
  font-size: 16px;
  color: #1a1a1a;
`;

const Link = styled.span`
  color: #0056b3;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const Footer = styled.footer`
  background-color: #f1f1f1;
  padding: 10px;
  text-align: center;
  font-size: 14px;
  color: #888;
`;

export default SignupPage;
