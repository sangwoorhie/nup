import React, { useState } from 'react';
import styled from 'styled-components';
import { Divider } from 'primereact/divider';

const UserPointModal = ({ user, onClose, onRefund }) => {
  const [requestedPoint, setRequestedPoint] = useState('');
  const [bankAccountCopy, setBankAccountCopy] = useState(null);
  const [refundRequestReason, setRefundRequestReason] = useState('');
  const [agreed, setAgreed] = useState(false); // Add state for checkbox

  if (!user) return null;

  const formatNumber = (number) => {
    if (typeof number !== 'number') {
      return '0';
    }
    return number.toLocaleString('ko-KR') + 'P';
  };

  const handleRefund = () => {
    if (!agreed) {
      alert('환불 규정에 동의해주세요');
      return;
    }
    const formData = new FormData();
    formData.append('requested_point', requestedPoint);
    if (bankAccountCopy) {
      formData.append('bank_account_copy', bankAccountCopy); // Correct file handling
    }
    formData.append('refund_request_reason', refundRequestReason);
    onRefund(formData);
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>환불 신청</Title>
        <br />
        <ModalContent>
          <Row>
            <Label>이름 :</Label>
            <ReadOnlyInput type='text' value={user.username} readOnly />
          </Row>

          <Row>
            <Label>전체 포인트 :</Label>
            <ReadOnlyInput
              type='text'
              value={formatNumber(user.total_point)}
              readOnly
            />
          </Row>

          <Row>
            <Label>현금충전 포인트 :</Label>
            <ReadOnlyInput
              type='text'
              value={formatNumber(user.cash_point)}
              readOnly
            />
          </Row>
          <Divider />
          <Row>
            <Label>환불신청 포인트:</Label>
            <Input
              type='number'
              value={requestedPoint}
              onChange={(e) => setRequestedPoint(e.target.value)}
            />
          </Row>
          <Row>
            <Label>통장 사본:</Label>
            <Input
              type='file'
              onChange={(e) => setBankAccountCopy(e.target.files[0])}
            />
          </Row>
          <Row>
            <Label>환불요청 사유:</Label>
            <TextArea
              value={refundRequestReason}
              onChange={(e) => setRefundRequestReason(e.target.value)}
            />
          </Row>
          <Divider />
          <DescriptionText>
            <h3>환불 규정</h3>
            • 포인트와 금액은 1포인트 = 1원 비율입니다.
            <br />• 회원님께서 현금으로 충전하신 포인트만 환불 신청 가능합니다.
            <br />• 통장 사본은 jpg, png, gif 등 이미지 파일만 등록해 주세요.
            <br />• 통장 사본에는 반드시 계좌주명, 은행명, 계좌번호가 표기되어
            있어야 합니다.
            <br />• 통장사본 변경 등 환불신청 변경을 원하실 경우, 환불취소
            하시고 다시 신청해 주세요.
            <br />• 환불신청 후, 입금까지 영업일 기준 약 3-5일이 소요됩니다.
          </DescriptionText>
          <Row>
            <Checkbox
              type='checkbox'
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <AgreementText>
              환불 규정을 숙지하였으며 이에 동의합니다.
            </AgreementText>
          </Row>
          <ButtonContainer>
            <CancelButton onClick={onClose}>취소</CancelButton>
            <ActionButton onClick={handleRefund}>환불 신청</ActionButton>
          </ButtonContainer>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default UserPointModal;

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
  width: 500px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 20px;
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
  font-size: 14px;
`;

const ReadOnlyInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  background-color: #f9f9f9;
  flex: 2;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  flex: 2;
`;

const TextArea = styled.textarea`
  padding: 8px;
  height: 140px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 100%;
  flex: 2;
`;

const DescriptionText = styled.p`
  font-size: 12px;
  color: #888;
  margin: 10px 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ActionButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 5px 20px;
  border-radius: 5px;
  cursor: pointer;
  width: 100px;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  background: white;
  color: #007bff;
  border: 1px solid #007bff;
  padding: 8px 20px;
  border-radius: 5px;
  cursor: pointer;
  width: 100px;
  margin-top: 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const AgreementText = styled.span`
  font-size: 12px;
  color: #3d3d3d;
`;
