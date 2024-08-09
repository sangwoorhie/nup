import React from 'react';
import styled from 'styled-components';

const UserInfoModal = ({ user, onClose }) => {
  if (!user) return null;

  const formatPoints = (points) => {
    return `${new Intl.NumberFormat().format(points)}P`;
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>회원 정보</Title>
        <br />
        <ModalContent>
          <Row>
            <Label>이름 :</Label>
            <ReadOnlyInput type='text' value={user.username} readOnly />
          </Row>

          <Row>
            <Label>부서 :</Label>
            <ReadOnlyInput
              type='text'
              value={user.department || '-'}
              readOnly
            />
          </Row>

          <Row>
            <Label>직위 :</Label>
            <ReadOnlyInput type='text' value={user.position || '-'} readOnly />
          </Row>

          <Row>
            <Label>Email :</Label>
            <ReadOnlyInput type='text' value={user.email} readOnly />
          </Row>

          <Row>
            <Label>휴대전화 :</Label>
            <ReadOnlyInput type='text' value={user.phone} readOnly />
          </Row>

          <Row>
            <Label>비상 연락처 :</Label>
            <ReadOnlyInput
              type='text'
              value={user.emergency_phone || '-'}
              readOnly
            />
          </Row>

          <Row>
            <Label>포인트 :</Label>
            <ReadOnlyInput
              type='text'
              value={formatPoints(user.point)}
              readOnly
            />
          </Row>

          <Row>
            <Label>회원 가입일 :</Label>
            <ReadOnlyInput
              type='text'
              value={new Date(user.created_at).toLocaleDateString()}
              readOnly
            />
          </Row>
        </ModalContent>
        <ConfirmButtonContainer>
          <ConfirmButton onClick={onClose}>확인</ConfirmButton>
        </ConfirmButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default UserInfoModal;

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

const ConfirmButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 5px 20px;
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
