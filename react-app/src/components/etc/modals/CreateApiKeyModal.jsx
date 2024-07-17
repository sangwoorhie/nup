import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import { createApiKey } from '../../../services/apiKeysService';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    padding: '20px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
};

const CreateApiKeyModal = ({ isOpen, onRequestClose }) => {
  const [ips, setIps] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIps(''); // Reset the input field when the modal is closed
    }
  }, [isOpen]);

  const handleCreate = async () => {
    try {
      await createApiKey(ips.split(','));
      alert('요청하신 IP주소로 API Key가 발급되었습니다');
      onRequestClose();
    } catch (error) {
      alert(
        `API Key 발급에 실패했습니다: ${error.response?.data?.message || error.message}`
      );
      console.error('Failed to create API key:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <ModalContent>
        <h3>새 API Key 발급</h3>
        <br />
        <Input
          type='text'
          value={ips}
          onChange={(e) => setIps(e.target.value)}
          placeholder='API Key를 발급받을 IP 주소를 입력하세요'
        />
        <Description>
          * 이미 동일한 IP로 발급된 API Key가 있는 경우, 중복하여 발급할 수
          없습니다.
          <br />
          * 하나의 API Key에 단수 또는 복수 개의 IP 주소를 적용할 수 있습니다.
          IP 주소를 2개 이상 적용하실 경우, 콤마(",")로 구분해 주세요.
          <br />
          <br />
          예: 192.168.1.1, 192.168.1.2
        </Description>
        <ButtonContainer>
          <Button onClick={onRequestClose} secondary>
            취소
          </Button>
          <Button onClick={handleCreate}>발급</Button>
        </ButtonContainer>
      </ModalContent>
    </Modal>
  );
};

export default CreateApiKeyModal;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Description = styled.p`
  font-size: 12px;
  color: #666;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const Button = styled.button`
  padding: 10px 30px;
  margin: 5px;
  background-color: ${(props) => (props.secondary ? '#6c757d' : '#007bff')};
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => (props.secondary ? '#5a6268' : '#0056b3')};
  }
`;
