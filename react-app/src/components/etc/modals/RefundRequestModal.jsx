import React from 'react';
import styled from 'styled-components';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const RefundRequestModal = ({ visible, onHide, reason }) => {
  return (
    <Dialog
      visible={visible}
      style={{ width: '500px' }}
      onHide={onHide}
      header='환불 사유'
    >
      <Content>
        <Textarea value={reason} readOnly />
        <ButtonWrapper>
          <StyledButton label='확인' onClick={onHide} />
        </ButtonWrapper>
      </Content>
    </Dialog>
  );
};

export default RefundRequestModal;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 200px;
  resize: none;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const StyledButton = styled(Button)`
  background-color: #001f3f;
  color: white;
  border: none;
  font-size: 0.8em; /* Adjust font size to make it smaller */
  padding: 0.5em 1em; /* Adjust padding to make it smaller */
`;
