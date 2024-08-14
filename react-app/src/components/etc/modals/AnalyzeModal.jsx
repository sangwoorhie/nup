import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

const AnalyzeModal = ({ visible, onClose, point, totalCost }) => {
  const navigate = useNavigate(); // Initialize navigate

  if (!visible) return null;

  const handleConfirmClick = () => {
    if (point < totalCost) {
      const confirmCharge = window.confirm(
        '현재 회원님의 포인트가 결제 포인트보다 부족합니다. 포인트를 충전하시겠습니까?'
      );
      if (confirmCharge) {
        navigate('/point-charge'); // Redirect to PointChargePage
      }
    } else {
      // Continue with the analysis process
      // Add the logic for the analysis process here
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>분석 실행</ModalTitle>
        <InputRow>
          <Label>현재 포인트 :</Label>
          <ReadOnlyInput
            type='text'
            value={`${point.toLocaleString()}P`}
            readOnly
          />
        </InputRow>
        <InputRow>
          <Label>결제 포인트 :</Label>
          <ReadOnlyInput
            type='text'
            value={`${totalCost.toLocaleString()}P`}
            readOnly
          />
        </InputRow>
        <ModalText>분석을 실행하시겠습니까?</ModalText>
        <CheckboxGroup>
          <CheckboxLabel>
            <input type='checkbox' defaultChecked /> 균열
          </CheckboxLabel>
          <CheckboxLabel>
            <input type='checkbox' defaultChecked /> 박리·박락
          </CheckboxLabel>
          <CheckboxLabel>
            <input type='checkbox' defaultChecked /> 철근노출
          </CheckboxLabel>
          <CheckboxLabel>
            <input type='checkbox' defaultChecked /> 백태
          </CheckboxLabel>
        </CheckboxGroup>
        <ButtonGroup>
          <CancelButton onClick={onClose}>취소</CancelButton>
          <ConfirmButton onClick={handleConfirmClick}>확인</ConfirmButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 80%;
  text-align: center;
  color: black; /* Ensures text remains black */
`;

const ModalTitle = styled.h2`
  margin-bottom: 20px;
  color: black; /* Ensures text remains black */
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  justify-content: center;
`;

const Label = styled.label`
  margin-right: 10px;
  font-weight: bold;
  color: black; /* Ensures text remains black */
`;

const ReadOnlyInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  width: 60%;
  background-color: #f9f9f9;
  text-align: right;
  color: black; /* Ensures text remains black */
`;

const ModalText = styled.p`
  margin-bottom: 20px;
  font-size: 15px;
  color: black; /* Ensures text remains black */
`;

const CheckboxGroup = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 50px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: black; /* Ensures text remains black */

  input {
    margin-right: 5px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CancelButton = styled.button`
  background-color: #ccc;
  padding: 10px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const ConfirmButton = styled.button`
  background-color: #0056b3;
  color: #fff;
  padding: 10px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #004494;
  }
`;

export default AnalyzeModal;
