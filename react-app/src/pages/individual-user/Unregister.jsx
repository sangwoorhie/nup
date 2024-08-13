import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import MainHeader from '../../components/etc/ui/MainHeader';
import SubHeaders from '../../components/etc/ui/SubHeaders';
import httpClient from '../../services/httpClient';
import Footer from '../../components/etc/ui/Footer';

const Unregister = ({ isDarkMode, toggleDarkMode }) => {
  const [activeHeader, setActiveHeader] = useState('User');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType || 'individual'; // default to individual if not provided

  const handleUnregister = async () => {
    if (!termsAccepted) {
      alert('회원 탈퇴에 동의하여 주시기 바랍니다.');
      return;
    }

    const confirmDelete = window.confirm(
      '확인 버튼을 누르시면 회원 탈퇴처리 됩니다. 정말 탈퇴하시겠습니까?'
    );
    if (!confirmDelete) return;

    try {
      await httpClient.delete('/users/me');
      alert(
        '정상적으로 회원탈퇴 되었습니다. 그 동안 저희 서비스를 이용해 주셔서 감사드리오며, 앞으로도 더 나은 서비스로 보답할 수 있도록 노력하겠습니다.'
      );
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || error.message || '회원 탈퇴 실패');
    }
  };

  const handleCancel = () => {
    alert('취소되었습니다.');
    navigate('/user-profile', { state: { userType } }); // Pass userType on navigation
  };

  return (
    <Container>
      <MainHeader
        setActiveHeader={setActiveHeader}
        userType={userType}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <SubHeaders activeHeader={activeHeader} userType={userType} />
      <Content isDarkMode={isDarkMode}>
        <Title isDarkMode={isDarkMode}>회원 탈퇴</Title>
        <Form>
          <TermsContainer isDarkMode={isDarkMode}>
            <Section>
              <SectionTitle isDarkMode={isDarkMode}>
                KO-MAPPER AI 회원 탈퇴
              </SectionTitle>
              <Terms>
                <p>
                  <strong>1. 회원정보 삭제:</strong>
                  <br />
                  회원탈퇴가 완료되면, 회원님의 모든 개인 정보는 즉시 영구
                  삭제됩니다. 이는 복구가 불가능합니다.
                </p>

                <p>
                  <strong>2. 결제 내역 및 환불:</strong>
                  <br />
                  탈퇴 시 미사용 결제 내역은 자동으로 소멸됩니다. 결제가 완료된
                  주문에 대한 환불이 필요한 경우, 탈퇴 전에 고객센터에 문의해
                  주시기 바랍니다.
                </p>

                <p>
                  <strong>3. 쿠폰 및 포인트:</strong>
                  <br />
                  보유하신 쿠폰과 포인트는 탈퇴와 동시에 소멸되며, 재가입 후에도
                  복구되지 않습니다.
                </p>

                <p>
                  <strong>4. 업로드된 사진 및 콘텐츠:</strong>
                  <br />
                  회원님이 업로드한 모든 사진과 콘텐츠는 탈퇴 후에도 사이트에
                  남아 있을 수 있습니다. 탈퇴 전에 직접 삭제하시기를
                  권장드립니다.
                </p>

                <p>
                  <strong>5. 서비스 이용 기록:</strong>
                  <br />
                  법률에 따라 보관이 필요한 일부 정보는 일정 기간 저장된 후
                  삭제됩니다. 작성하신 게시글, 댓글 등은 삭제되지 않으며, 필요
                  시 개별적으로 삭제해 주셔야 합니다.
                </p>

                <p>
                  <strong>6. 재가입 제한:</strong>
                  <br />
                  동일 이메일로 재가입을 원하실 경우, 탈퇴 후 30일이 지나야
                  가능합니다.
                </p>
              </Terms>
              <Checkbox
                type='checkbox'
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
              />
              <Label isDarkMode={isDarkMode}>
                위 내용을 모두 확인하였으며, 회원 탈퇴에 동의합니다. (필수)
              </Label>
            </Section>
          </TermsContainer>
          <ButtonContainer>
            <CancelButton onClick={handleCancel}>취소</CancelButton>
            <DeleteButton onClick={handleUnregister}>회원 탈퇴</DeleteButton>
          </ButtonContainer>
        </Form>
      </Content>
      <Footer />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#fff' : '#000'}; /* Make text white in dark mode */
`;

const Form = styled.div`
  width: 80%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
`;

const TermsContainer = styled.div`
  width: 100%;
  margin-top: 20px;
  color: #000; /* Ensure text color in TermsContainer is black, regardless of dark mode */
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h3`
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#fff' : '#000'}; /* Make text white in dark mode */
`;

const Terms = styled.div`
  height: 450px;
  width: 100%;
  overflow-y: scroll;
  border: 1px solid #ccc;
  padding: 20px;
  background-color: #f5f5f5;
  font-size: 14px;
  line-height: 1.5;
  color: #000; /* Ensure text color in Terms is black */
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const Label = styled.label`
  font-size: 14px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#fff' : '#000'}; /* Make label text white in dark mode */
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px;
  width: 350px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const CancelButton = styled(Button)`
  background-color: #fff;
  color: #0056b3;
  border: 1px solid #0056b3;
`;

const DeleteButton = styled(Button)`
  background-color: #d9534f;
  color: white;
`;

export default Unregister;
