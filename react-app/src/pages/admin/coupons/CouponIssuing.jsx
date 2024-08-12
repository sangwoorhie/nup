import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Calendar } from 'primereact/calendar';
import { FaCalendarAlt } from 'react-icons/fa';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import styled from 'styled-components';
import { createCouponTemplate } from '../../../services/adminService';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

const CouponIssuing = () => {
  const [activeHeader, setActiveHeader] = useState('쿠폰 관리');
  const [couponName, setCouponName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [point, setPoint] = useState('');
  const [expirationDate, setExpirationDate] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navigate = useNavigate(); // Initialize the navigate function

  const handleSubmit = async () => {
    const today = new Date().setHours(0, 0, 0, 0);
    if (
      expirationDate &&
      new Date(expirationDate).setHours(0, 0, 0, 0) <= today
    ) {
      alert('유효기간(만료일)은 오늘 이후의 날짜부터 가능합니다.');
      return;
    }

    if (window.confirm('쿠폰을 발행하시겠습니까?')) {
      try {
        await createCouponTemplate({
          coupon_name: couponName,
          quantity: Number(quantity),
          point: Number(point),
          expiration_date: expirationDate,
        });
        alert('쿠폰이 발행되었습니다.');
        navigate('/coupon-view'); // Navigate to CouponTemplateList page
      } catch (error) {
        const backendMessage =
          error.response?.data?.message || '쿠폰 발행에 실패했습니다.';
        alert(backendMessage);
        console.error(error);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <Container>
      <MainHeader
        setActiveHeader={setActiveHeader}
        userType='admin'
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <SubHeaders activeHeader={activeHeader} userType='admin' />
      <Content isDarkMode={isDarkMode}>
        <Title>쿠폰 발행</Title>
        <Form>
          <Label>쿠폰 명</Label>
          <Input
            type='text'
            value={couponName}
            onChange={(e) => setCouponName(e.target.value)}
            placeholder='쿠폰 명을 입력해 주세요'
          />
          <Label>쿠폰 발행 수량</Label>
          <Input
            type='number'
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder='쿠폰 발행 수량을 숫자로만 주세요'
          />
          <Label>포인트</Label>
          <Input
            type='number'
            value={point}
            onChange={(e) => setPoint(e.target.value)}
            placeholder='쿠폰의 포인트를 숫자로만 입력해 주세요'
          />
          <Label>유효기간(만료일) 설정</Label>
          <CalendarContainer>
            <StyledCalendar
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.value)}
              dateFormat='yy-mm-dd'
              placeholder='쿠폰의 유효기간을 설정해 주세요'
              showIcon
              icon={<FaCalendarAlt />}
            />
            <CalendarIcon
              onClick={() =>
                document.querySelector('.p-datepicker-trigger').click()
              }
            >
              <FaCalendarAlt />
            </CalendarIcon>
          </CalendarContainer>
          <br />
          <SubmitButton onClick={handleSubmit}>쿠폰 발행</SubmitButton>
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
`;

const Form = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-top: 20px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  font-size: 14px;

  &::placeholder {
    font-size: 14px;
  }
`;

const CalendarContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledCalendar = styled(Calendar)`
  width: 100%;
  margin-top: 5px;
  font-size: 14px;

  input::placeholder {
    font-size: 14px;
  }

  .p-inputtext {
    width: calc(100% - 30px); // Adjust width to leave space for the icon
    padding-right: 30px; // Ensure text does not overlap with the icon
  }
`;

const CalendarIcon = styled.div`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
  /* color: #fff; // Set the color to white */

  &:hover {
    color: #000;
  }
`;

const SubmitButton = styled.button`
  margin-top: 20px;
  padding: 10px;
  background-color: #0056b3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

export default CouponIssuing;
