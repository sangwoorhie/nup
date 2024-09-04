import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getLogs } from '../../../services/adminService';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import { Paginator } from 'primereact/paginator';
import refreshImage from '../../../assets/img/refresh_icon.png';

const Log = ({ isDarkMode, toggleDarkMode }) => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeHeader, setActiveHeader] = useState('계정 관리');

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await getLogs(page, pageSize);
      setLogs(data.items);
      setTotalRecords(data.total);
    };
    fetchLogs();
  }, [page, pageSize]);

  const handleRefresh = () => {
    window.location.reload();
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
        <HeaderContainer>
          <TotalRecords>총 {totalRecords}건</TotalRecords>
          <ButtonContainer>
            <RefreshButton onClick={handleRefresh}>
              <img src={refreshImage} alt='새로고침' />
            </RefreshButton>
          </ButtonContainer>
        </HeaderContainer>
        <Table>
          <thead>
            <tr>
              <th>로그인 시각</th>
              <th>E-mail</th>
              <th>회원 유형</th>
              <th>IP 주소</th>
              <th>userAgent</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{new Date(log.loginTimestamp).toLocaleString()}</td>
                <td>{log.userEmail}</td>
                <td>{getUserTypeLabel(log.userType)}</td>
                <td>{log.ip}</td>
                <td>{log.userAgent}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination>
          <Paginator
            first={(page - 1) * pageSize}
            rows={pageSize}
            totalRecords={totalRecords}
            rowsPerPageOptions={[10, 20, 30]}
            onPageChange={(e) => {
              setPage(e.first / e.rows + 1);
              setPageSize(e.rows);
            }}
          />
        </Pagination>
      </Content>
      <Footer />
    </Container>
  );
};

const getUserTypeLabel = (userType) => {
  switch (userType) {
    case 'individual':
      return '개인회원';
    case 'corporate':
      return '사업자 회원';
    case 'admin':
      return '관리자 회원';
    default:
      return userType;
  }
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  margin: 0 auto 20px auto;
`;

const TotalRecords = styled.div`
  font-size: 16px;
  font-weight: bold;
`;

const Table = styled.table`
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  display: flex;
`;

const RefreshButton = styled.button`
  padding: 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
  }
`;

export default Log;
