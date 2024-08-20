import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import httpClient from '../../../services/httpClient';
import CouponModal from '../../../components/etc/modals/CouponModal';

const CouponCharge = ({ isDarkMode, toggleDarkMode }) => {
  const [couponCode, setCouponCode] = useState('');
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const userType = localStorage.getItem('userType') || 'individual';
  const [activeHeader, setActiveHeader] = useState('MY 포인트');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleCouponCodeChange = (e) => setCouponCode(e.target.value);

  const handleCouponSubmit = async () => {
    try {
      const response = await httpClient.get(
        `/coupons/coupon-code?code=${couponCode}`
      );
      setModalData(response.data);
      setShowModal(true);
    } catch (error) {
      alert('해당 쿠폰이 존재하지 않습니다.');
    }
  };

  const handleModalClose = () => setShowModal(false);

  const handleCouponApply = async () => {
    try {
      await httpClient.post('/coupons/apply', { code: couponCode });
      alert('쿠폰이 성공적으로 적용되었습니다.');
      setShowModal(false);
      navigate('/my-coupons'); // Navigate to MyCoupon.jsx
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || '쿠폰 적용에 실패했습니다.';
      alert(errorMessage);
    }
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
        <Form>
          <Title>쿠폰 등록</Title>
          <br />
          <CouponInput
            type='text'
            value={couponCode}
            onChange={handleCouponCodeChange}
            placeholder='쿠폰 코드를 입력해주세요.'
          />
          <SubmitButton onClick={handleCouponSubmit}>등록</SubmitButton>
        </Form>
        <CouponGuidelines>
          <li>* 쿠폰은 한 번 사용 후 재사용이 불가능합니다.</li>
          <li>* 쿠폰 등록 시 유효한 포인트로 전환됩니다.</li>
          <li>* 쿠폰 유효기간 이후에는 사용할 수 없습니다.</li>
          <li>* 쿠폰 포인트는 환불할 수 없습니다.</li>
        </CouponGuidelines>
        {showModal && (
          <CouponModal
            data={modalData}
            onClose={handleModalClose}
            onApply={handleCouponApply}
          />
        )}
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
  color: #000; /* Ensures text color remains black */
`;

const CouponInput = styled.input`
  width: 300px;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const SubmitButton = styled.button`
  background-color: #0056b3;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
`;

const CouponGuidelines = styled.ul`
  list-style-type: none;
  padding: 0;
  font-size: 14px; /* Adjusted font size */
  li {
    margin-bottom: 10px;
  }
`;

const Form = styled.div`
  margin-top: 60px;
  background: #f9f9f9;
  width: 400px;
  height: 250px;
  padding: 40px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default CouponCharge;
