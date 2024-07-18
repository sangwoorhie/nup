import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { InputSwitch } from 'primereact/inputswitch';
import { Paginator } from 'primereact/paginator';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { listApiKeys, toggleApiKeyStatus } from '../../services/apiKeysService';
import UpdateApiKeyModal from '../../components/etc/modals/UpdateApiKeyModal';
import CreateApiKeyModal from '../../components/etc/modals/CreateApiKeyModal';
import MainHeader from '../../components/etc/ui/MainHeader';
import SubHeaders from '../../components/etc/ui/SubHeaders';
import Footer from '../../components/etc/ui/Footer';
import refreshImage from '../../assets/img/refresh_icon.png';

const ApiKey = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState(null);
  const [activeHeader, setActiveHeader] = useState('User');
  const [userType, setUserType] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchApiKeys = useCallback(async (page = 1, size = 10) => {
    try {
      const { data } = await listApiKeys(page, size);
      setApiKeys(data.items); // Remove the incorrect is_active setting
      setTotalRecords(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys(first / rows + 1, rows);
    const type = localStorage.getItem('userType');
    setUserType(type);
  }, [fetchApiKeys, first, rows]);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    fetchApiKeys(event.first / event.rows + 1, event.rows);
  };

  const handleToggleStatus = async (apiKey) => {
    try {
      const response = await toggleApiKeyStatus(apiKey);
      const updatedApiKeys = apiKeys.map((key) =>
        key.api_key === apiKey
          ? { ...key, is_active: response.data.is_active }
          : key
      );
      setApiKeys(updatedApiKeys);
    } catch (error) {
      console.error('Failed to toggle API key status:', error);
    }
  };

  const handleRefresh = () => {
    fetchApiKeys(first / rows + 1, rows);
    window.location.reload();
  };

  return (
    <Container>
      <MainHeader setActiveHeader={setActiveHeader} userType={userType} />
      <SubHeaders activeHeader={activeHeader} userType={userType} />
      <br />
      <Content>
        <Header>
          <Title>API Key 관리</Title>
          <ButtonContainer>
            <Button onClick={() => setCreateModalOpen(true)}>
              새 API Key 발급
            </Button>
            <RefreshButton onClick={handleRefresh}>
              <img src={refreshImage} alt='새로고침' />
            </RefreshButton>
          </ButtonContainer>
        </Header>
        <StyledTable>
          <thead>
            <tr>
              <Th>API Key</Th>
              <Th>IP 주소</Th>
              <Th>오늘 사용량(Token)</Th>
              <Th>누적 사용량(Token)</Th>
              <Th>생성일</Th>
              <Th>상태 (활성/정지)</Th>
              <Th>IP주소 수정</Th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <Tr key={key.api_key}>
                <Td>{key.api_key}</Td>
                <Td>{key.ips.join(', ')}</Td>
                <Td>{key.today_usage}</Td>
                <Td>{key.total_usage}</Td>
                <Td>{new Date(key.created_at).toLocaleDateString()}</Td>
                <Td>
                  <InputSwitch
                    checked={key.is_active}
                    onChange={() => handleToggleStatus(key.api_key)}
                  />
                </Td>
                <Td>
                  <ActionButton
                    onClick={() => {
                      setCurrentApiKey(key.api_key);
                      setUpdateModalOpen(true);
                    }}
                  >
                    수정
                  </ActionButton>
                </Td>
              </Tr>
            ))}
          </tbody>
        </StyledTable>
        <Pagination>
          <Paginator
            first={first}
            rows={rows}
            totalRecords={totalRecords}
            rowsPerPageOptions={[10, 20, 30]}
            onPageChange={onPageChange}
          />
        </Pagination>
        {currentApiKey && (
          <UpdateApiKeyModal
            isOpen={updateModalOpen}
            onRequestClose={() => setUpdateModalOpen(false)}
            apiKey={currentApiKey}
            ips={
              apiKeys.find((key) => key.api_key === currentApiKey)?.ips || []
            }
          />
        )}
        <CreateApiKeyModal
          isOpen={createModalOpen}
          onRequestClose={() => setCreateModalOpen(false)}
        />
      </Content>
      <Footer />
    </Container>
  );
};

export default ApiKey;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  background-color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const RefreshButton = styled.button`
  padding: 10px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
  }
`;

const StyledTable = styled.table`
  width: 80%;
  margin: 0 auto;
  border-collapse: collapse;
  background-color: #fff;
`;

const Th = styled.th`
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: 1px solid #ddd;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
`;

const ActionButton = styled.button`
  padding: 5px 10px;
  background-color: #fff;
  color: #000;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const Pagination = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
