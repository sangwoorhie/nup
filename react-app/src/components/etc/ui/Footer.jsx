import React from 'react';
import styled from 'styled-components';

const Footer = () => (
  <FooterContainer>
    Copyright &copy; {new Date().getFullYear()} ㈜KO-MAPPER Co.,Ltd rights
    reserved.
  </FooterContainer>
);

const FooterContainer = styled.footer`
  background-color: #f1f1f1;
  padding: 10px;
  text-align: center;
  font-size: 14px;
  color: #888;
`;

export default Footer;
