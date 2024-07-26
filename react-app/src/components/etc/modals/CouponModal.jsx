import React from 'react';
import styled from 'styled-components';

const CouponModal = ({ data, onClose, onApply }) => {
  return (
    <ModalOverlay>
      <ModalContainer>
        <Title>쿠폰 등록</Title>
        <StyledParagraph>쿠폰을 등록하시겠습니까?</StyledParagraph>
        <StyledParagraph>
          등록 버튼을 누르면 해당 쿠폰이 포인트로 전환됩니다.
        </StyledParagraph>
        <br />
        <ModalContent>
          <Row>
            <Label>쿠폰 명 :</Label>
            <ReadOnlyInput type='text' value={data.coupon_name} readOnly />
          </Row>
          <Row>
            <Label>쿠폰 코드 :</Label>
            <ReadOnlyInput type='text' value={data.code} readOnly />
          </Row>
          <Row>
            <Label>포인트 :</Label>
            <ReadOnlyInput type='text' value={data.point} readOnly />
          </Row>
          <Row>
            <Label>유효 기간 :</Label>
            <ReadOnlyInput type='text' value={data.expiration_date} readOnly />
          </Row>
        </ModalContent>
        <ButtonContainer>
          <CancelButton onClick={onClose}>취소</CancelButton>
          <ApplyButton onClick={onApply}>등록</ApplyButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

const StyledParagraph = styled.p`
  font-size: 14px; /* Set your desired font size here */
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 20px;
  margin-bottom: 20px;
`;

const ModalContent = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Label = styled.label`
  margin-right: 10px;
  flex: 1;
`;

const ReadOnlyInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  background-color: #f9f9f9;
  flex: 2;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ApplyButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 40px;
  border-radius: 5px;
  cursor: pointer;
`;

const CancelButton = styled.button`
  background-color: #ccc;
  color: white;
  border: none;
  padding: 5px 40px;
  border-radius: 5px;
  cursor: pointer;
`;

export default CouponModal;
