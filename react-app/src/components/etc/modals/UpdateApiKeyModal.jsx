import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';

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

const UpdateApiKeyModal = ({
  isOpen,
  onRequestClose,
  apiKey,
  ips,
  updateFunction,
}) => {
  const [newIps, setNewIps] = useState(ips.join(','));

  useEffect(() => {
    setNewIps(ips.join(',')); // Update state when `ips` prop changes
  }, [ips]);

  const handleUpdate = async () => {
    try {
      await updateFunction(apiKey, { ips: newIps.split(',') });
      alert('IP 주소가 성공적으로 업데이트되었습니다');
      onRequestClose();
    } catch (error) {
      alert(
        `IP 주소 업데이트에 실패했습니다: ${error.response?.data?.message || error.message}`
      );
      console.error('Failed to update API key:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <ModalContent>
        <h3>IP 주소 수정</h3>
        <br />
        <Input
          type='text'
          value={newIps}
          onChange={(e) => setNewIps(e.target.value)}
          placeholder='수정할 IP 주소를 입력하세요.'
        />
        <Description>
          * 이미 동일한 IP로 발급된 API Key가 있는 경우, 중복하여 발급할 수
          없습니다.
          <br />
          * 하나의 API Key에 단수 또는 복수 개의 IP 주소를 적용할 수 있습니다.
          IP 주소를 2개 이상 적용하실 경우, 띄어쓰기 없이 콤마(",")로 구분해
          주세요.
          <br />
          <br />
          예: 192.168.1.1,192.168.1.2
        </Description>
        <ButtonContainer>
          <Button onClick={onRequestClose} secondary='true'>
            취소
          </Button>
          <Button onClick={handleUpdate}>수정</Button>
        </ButtonContainer>
      </ModalContent>
    </Modal>
  );
};

export default UpdateApiKeyModal;

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
