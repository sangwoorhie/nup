import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { InputSwitch } from 'primereact/inputswitch';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import { Paginator } from 'primereact/paginator';
import refreshImage from '../../../assets/img/refresh_icon.png';
import {
  listApiKeysAdmin,
  toggleApiKeyStatusAdmin,
  updateApiKeyIpsAdmin,
  listApiKeysSearchAdmin, // Import the search function
} from '../../../services/apiKeysService';
import UpdateApiKeyModal from '../../../components/etc/modals/UpdateApiKeyModal'; // Import the modal

const ApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState('email');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeHeader, setActiveHeader] = useState('계정 관리');
  const [userType, setUserType] = useState('');
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState(null);

  const fetchApiKeys = useCallback(
    async (page = 1, size = 10, criteria = '', value = '') => {
      try {
        const { data } = await (criteria && value
          ? listApiKeysSearchAdmin(page, size, criteria, value)
          : listApiKeysAdmin(page, size));
        if (data.items.length === 0) {
          alert('검색어와 일치하는 API 키가 존재하지 않습니다.');
        }
        setApiKeys(data.items);
        setTotalRecords(data.total);
      } catch (error) {
        console.error('Failed to fetch API keys:', error);
      }
    },
    []
  );

  useEffect(() => {
    fetchApiKeys();
    const type = localStorage.getItem('userType');
    setUserType(type);
  }, [fetchApiKeys]);

  const handleToggleStatus = async (apiKey) => {
    try {
      const response = await toggleApiKeyStatusAdmin(apiKey);
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

  const handleSearch = async () => {
    try {
      await fetchApiKeys(page, pageSize, searchCriteria, searchValue);
    } catch (error) {
      console.error('Failed to search API keys:', error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRefresh = () => {
    fetchApiKeys(page, pageSize, searchCriteria, searchValue);
    window.location.reload();
  };

  const handleUpdateIps = (apiKey) => {
    setCurrentApiKey(apiKey);
    setUpdateModalOpen(true);
  };

  return (
    <Container>
      <MainHeader setActiveHeader={setActiveHeader} userType={userType} />
      <SubHeaders activeHeader={activeHeader} userType={userType} />
      <Content>
        <ActionBar>
          <SearchSection>
            <select
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value)}
            >
              <option value='email'>E-mail</option>
              <option value='username'>이름(기업명)</option>
              <option value='apikey'>API-Key</option>
            </select>
            <input
              type='text'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='검색어를 입력해 주세요'
            />
            <button onClick={handleSearch}>검색</button>
          </SearchSection>
          <ButtonContainer>
            <RefreshButton onClick={handleRefresh}>
              <img src={refreshImage} alt='새로고침' />
            </RefreshButton>
          </ButtonContainer>
        </ActionBar>
        <StyledTable>
          <thead>
            <tr>
              <Th>API Key</Th>
              <Th>IP 주소</Th>
              <Th>오늘 사용량 (Token)</Th>
              <Th>누적 사용량 (Token)</Th>
              <Th>생성일</Th>
              <Th>상태 (활성/정지)</Th>
              <Th>IP 주소 수정</Th>
              <Th>사용자(기업) 이름</Th>
              <Th>Email</Th>
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
                  <button onClick={() => handleUpdateIps(key.api_key)}>
                    수정
                  </button>
                </Td>
                <Td>{key.username}</Td>
                <Td>{key.email}</Td>
              </Tr>
            ))}
          </tbody>
        </StyledTable>
        <Pagination>
          <Paginator
            first={(page - 1) * pageSize}
            rows={pageSize}
            totalRecords={totalRecords}
            rowsPerPageOptions={[10, 20, 30]}
            onPageChange={(e) => {
              setPage(e.first / e.rows + 1);
              setPageSize(e.rows);
              fetchApiKeys(
                e.first / e.rows + 1,
                e.rows,
                searchCriteria,
                searchValue
              );
            }}
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
            updateFunction={updateApiKeyIpsAdmin} // Pass the update function
          />
        )}
      </Content>
      <Footer />
    </Container>
  );
};

export default ApiKeyManagement;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  margin-top: 10px;
  background-color: white;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 80%;
  margin: 0 auto;
`;

const SearchSection = styled.div`
  display: flex;
  align-items: center;

  select {
    margin-right: 10px;
    padding: 5px;
    width: 100px;
  }

  input {
    margin-right: 10px;
    padding: 5px;
    width: 200px;
  }

  button {
    padding: 5px 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
`;

const StyledTable = styled.table`
  width: 80%;
  margin: 0 auto;
  margin-top: 10px;
  border-collapse: collapse;
  margin-bottom: 20px;

  th,
  td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: center;
  }

  th {
    background-color: #007bff;
    color: white;
  }
`;

const Th = styled.th`
  padding: 10px;
  background-color: #007bff;
  color: #fff;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;

  button {
    margin-left: 10px;
    padding: 5px 10px;
    background-color: white;
    color: #007bff;
    border: 1px solid #007bff;
    border-radius: 4px;
    cursor: pointer;
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
`;
