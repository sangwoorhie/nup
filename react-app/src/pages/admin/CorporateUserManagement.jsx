import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import MainHeader from '../../components/etc/ui/MainHeader';
import SubHeaders from '../../components/etc/ui/SubHeaders';
import Footer from '../../components/etc/ui/Footer';
import {
  getCorporateUsers,
  promoteUser,
  banUser,
  unbanUser,
  verifyBusinessLicense,
} from '../../services/adminService';
import { Paginator } from 'primereact/paginator';
import refreshImage from '../../assets/img/refresh_icon.png';

const CorporateUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState('corporate_name');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [activeHeader, setActiveHeader] = useState('계정 관리');

  const fetchUsers = useCallback(async (criteria = '', value = '') => {
    const { data } = await getCorporateUsers(page, pageSize, criteria, value);
    setUsers(data.items);
    setTotalRecords(data.total);
  }, [page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = async () => {
    try {
      await fetchUsers(searchCriteria, searchValue);
    } catch (error) {
      alert('검색어와 일치하는 회원이 존재하지 않습니다.');
    }
  };

  const handlePromote = async () => {
    if (selectedUserIds.length === 0) {
      alert('선택된 회원이 없습니다.');
      return;
    }

    if (window.confirm('관리자 회원으로 변경하시겠습니까?')) {
      for (const userId of selectedUserIds) {
        await promoteUser(userId);
      }
      fetchUsers(searchCriteria, searchValue);
      alert('선택한 회원이 관리자 회원으로 변경되었습니다.');
    }
  };

  const handleBan = async () => {
    if (selectedUserIds.length === 0) {
      alert('선택된 회원이 없습니다.');
      return;
    }

    const selectedUsers = users.filter((user) =>
      selectedUserIds.includes(user.id)
    );
    const allBanned = selectedUsers.every((user) => user.banned);

    const action = allBanned ? '계정정지 취소' : '계정정지';
    if (window.confirm(`${action} 하시겠습니까?`)) {
      for (const user of selectedUsers) {
        if (user.banned) {
          await unbanUser(user.id);
        } else {
          await banUser(user.id, { reason: '관리자에 의해 정지됨' });
        }
      }
      fetchUsers(searchCriteria, searchValue);
    }
  };

  const handleVerify = async () => {
    if (selectedUserIds.length === 0) {
      alert('선택된 회원이 없습니다.');
      return;
    }

    if (window.confirm('사업자 등록증을 확인하시겠습니까?')) {
      for (const userId of selectedUserIds) {
        await verifyBusinessLicense(userId);
      }
      fetchUsers(searchCriteria, searchValue);
      alert('선택한 회원의 사업자 등록증이 확인되었습니다.');
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  return (
    <Container>
      <MainHeader setActiveHeader={setActiveHeader} userType='admin' />
      <SubHeaders activeHeader={activeHeader} userType='admin' />
      <Content>
        <ActionBar>
          <SearchSection>
            <select
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value)}
            >
              <option value='corporate_name'>기업명</option>
              <option value='business_registration_number'>사업자 등록번호</option>
            </select>
            <input
              type='text'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder='검색어를 입력해 주세요'
            />
            <button onClick={handleSearch}>검색</button>
          </SearchSection>
          <ButtonContainer>
            <button onClick={handlePromote}>관리자 회원으로 변경</button>
            <button onClick={handleBan}>계정 정지</button>
            <button onClick={handleVerify}>사업자 등록증 확인</button>
            <RefreshButton onClick={() => fetchUsers(searchCriteria, searchValue)}>
              <img src={refreshImage} alt='새로고침' />
            </RefreshButton>
          </ButtonContainer>
        </ActionBar>
        <Table>
          <thead>
            <tr>
              <th></th>
              <th>기업명</th>
              <th>업종명</th>
              <th>업태명</th>
              <th>사업자 등록번호</th>
              <th>사업자 등록증</th>
              <th>사업자 등록증 확인여부</th>
              <th>주소</th>
              <th>회원 정보</th>
              <th>포인트 충전 내역</th>
              <th>포인트 사용 내역</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type='checkbox'
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                </td>
                <td>{user.corporate_name}</td>
                <td>{user.business_type}</td>
                <td>{user.business_conditions}</td>
                <td>{user.business_registration_number}</td>
                <td><a href={user.business_license} target='_blank'>PDF</a></td>
                <td>{user.business_license_verified ? '확인' : '미확인'}</td>
                <td>{user.address}</td>
                <td><button>회원 정보</button></td>
                <td><button>충전 내역</button></td>
                <td><button>사용 내역</button></td>
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
              fetchUsers(searchCriteria, searchValue);
            }}
          />
        </Pagination>
      </Content>
      <Footer />
    </Container>
  );
};

export default CorporateUserManagement;

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

const SearchSection = styled.div`
  display: flex;
  align-items: center;

  select {
    margin-right: 10px;
    padding: 5px;
    width: 150px;
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

const Table = styled.table`
  width: 100%;
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

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
