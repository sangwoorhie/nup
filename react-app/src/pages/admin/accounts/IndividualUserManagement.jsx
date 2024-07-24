import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import {
  getUsers,
  promoteUser,
  banUser,
  unbanUser,
} from '../../../services/adminService';
import { Paginator } from 'primereact/paginator';
import refreshImage from '../../../assets/img/refresh_icon.png';
import { FaCheck } from 'react-icons/fa'; // Import check icon
import isPropValid from '@emotion/is-prop-valid';

const IndividualUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState('email');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [activeHeader, setActiveHeader] = useState('계정 관리');

  const fetchUsers = useCallback(
    async (criteria = '', value = '') => {
      const { data } = await getUsers(page, pageSize, criteria, value);
      setUsers(data.items);
      setTotalRecords(data.total);
    },
    [page, pageSize]
  );

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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePromote = async () => {
    if (selectedUserIds.length === 0) {
      alert('선택된 회원이 없습니다.');
      return;
    }

    if (window.confirm('관리자 회원으로 변경하시겠습니까?')) {
      for (const userId of selectedUserIds) {
        try {
          await promoteUser(userId);
        } catch (error) {
          console.error('Error promoting user:', error);
        }
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

    if (window.confirm('계정 정지/해제를 하시겠습니까?')) {
      for (const user of selectedUsers) {
        try {
          if (user.banned) {
            await unbanUser(user.id);
          } else {
            await banUser(user.id, { reason: '관리자에 의해 정지됨' });
          }
        } catch (error) {
          alert(
            `사용자 ${user.username}의 상태를 변경할 수 없습니다. ${error.response?.data?.message || error.message}`
          );
        }
      }
      fetchUsers(searchCriteria, searchValue);
      alert('선택한 회원의 계정 상태가 변경되었습니다.');
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleRefresh = () => {
    window.location.reload(); // Reload the page
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
              <option value='email'>E-mail</option>
              <option value='username'>이름</option>
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
            <button onClick={handlePromote}>관리자 회원으로 변경</button>
            <button onClick={handleBan}>계정 정지/해제</button>
            <RefreshButton onClick={handleRefresh}>
              <img src={refreshImage} alt='새로고침' />
            </RefreshButton>
          </ButtonContainer>
        </ActionBar>
        <Table>
          <thead>
            <tr>
              <th></th>
              <th>E-mail</th>
              <th>이름</th>
              <th>휴대전화</th>
              <th>비상연락처</th>
              <th>포인트 충전 내역</th>
              <th>포인트 사용 내역</th>
              <th>잔여 포인트</th>
              <th>계정 정지여부</th>
              <th>회원 가입일자</th>
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
                <TdEmail banned={user.banned ? 'true' : undefined}>
                  {user.email}
                </TdEmail>
                <td>{user.username}</td>
                <td>{user.phone}</td>
                <td>{user.emergency_phone}</td>
                <td>
                  <button>충전 내역</button>
                </td>
                <td>
                  <button>사용 내역</button>
                </td>
                <td>{user.point}</td>
                <td>{user.banned ? <FaCheck /> : ''}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
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

export default IndividualUserManagement;

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

const TdEmail = styled.td.withConfig({
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'banned',
})`
  color: ${({ banned }) => (banned === 'true' ? 'red' : 'black')};
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
  width: 80%;
  margin: 0 auto;
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
