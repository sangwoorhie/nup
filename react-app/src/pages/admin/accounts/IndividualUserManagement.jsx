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
  getUserChargeRequest,
  getUserPointUse,
} from '../../../services/adminService';
import { Paginator } from 'primereact/paginator';
import refreshImage from '../../../assets/img/refresh_icon.png';
import { FaCheck } from 'react-icons/fa'; // Import check icon

const IndividualUserManagement = ({ isDarkMode, toggleDarkMode }) => {
  // State management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState('email');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [activeHeader, setActiveHeader] = useState('계정 관리');

  const [chargeHistory, setChargeHistory] = useState([]);
  const [chargeTotal, setChargeTotal] = useState(0);
  const [chargePage, setChargePage] = useState(0);
  const [chargePageSize, setChargePageSize] = useState(10);
  const [chargeTotalRecords, setChargeTotalRecords] = useState(0);

  const [useHistory, setUseHistory] = useState([]);
  const [useTotal, setUseTotal] = useState(0);
  const [usePage, setUsePage] = useState(0);
  const [usePageSize, setUsePageSize] = useState(10);
  const [useTotalRecords, setUseTotalRecords] = useState(0);
  const [showUseHistory, setShowUseHistory] = useState(false);

  // Fetch functions
  const fetchUsers = useCallback(
    async (criteria = '', value = '') => {
      const { data } = await getUsers(page + 1, pageSize, criteria, value);
      setUsers(data.items);
      setTotalRecords(data.total);
    },
    [page, pageSize]
  );

  const fetchChargeHistory = useCallback(
    async (userId) => {
      const { data } = await getUserChargeRequest(
        userId,
        chargePage + 1,
        chargePageSize
      );
      setChargeHistory(data.items);
      setChargeTotal(data.total);
      setChargeTotalRecords(data.total);
    },
    [chargePage, chargePageSize]
  );

  const fetchUseHistory = useCallback(
    async (userId) => {
      const { data } = await getUserPointUse(userId, usePage + 1, usePageSize);
      setUseHistory(data.items);
      setUseTotal(data.total);
      setUseTotalRecords(data.total);
    },
    [usePage, usePageSize]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers
  const handleSearch = async () => {
    try {
      await fetchUsers(searchCriteria, searchValue);
    } catch (error) {
      alert('검색어와 일치하는 회원이 존재하지 않습니다.');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') handleSearch();
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
    fetchUsers();
    window.location.reload(); // Reload the page
  };

  const handleViewChargeHistory = async (user) => {
    setSelectedUser(user);
    setShowUseHistory(false);
    await fetchChargeHistory(user.id);
  };

  const handleViewUseHistory = async (user) => {
    setSelectedUser(user);
    setShowUseHistory(true);
    await fetchUseHistory(user.id);
  };

  const handleBackToUserList = () => {
    setSelectedUser(null);
    setShowUseHistory(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  // JSX rendering
  if (selectedUser) {
    if (showUseHistory) {
      return (
        <Container>
          <MainHeader
            setActiveHeader={setActiveHeader}
            userType='admin'
            toggleDarkMode={toggleDarkMode}
            isDarkMode={isDarkMode}
          />
          <SubHeaders activeHeader={activeHeader} userType='admin' />
          <Header>
            <h2>{selectedUser.username} 회원의 포인트 사용 내역</h2>
          </Header>
          <UserContent isDarkMode={isDarkMode}>
            <MiddleWrapper>
              <TotalCount>총 {useTotal}건</TotalCount>
              <ButtonContainer>
                <button onClick={handleBackToUserList}>뒤로가기</button>
              </ButtonContainer>
            </MiddleWrapper>
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <th>사용 일시</th>
                    <th>이미지 장수</th>
                    <th>사용 포인트</th>
                    <th>사용 후 포인트</th>
                  </tr>
                </thead>
                <tbody>
                  {useHistory.map((record) => (
                    <tr key={record.id}>
                      <td>{formatDate(record.created_at)}</td>
                      <td>{record.detected_images_count}장</td>
                      <td>{formatPoints(Math.abs(record.point))}</td>
                      <td>{formatPoints(record.user_point_after)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination>
                <Paginator
                  first={usePage * usePageSize}
                  rows={usePageSize}
                  totalRecords={useTotalRecords}
                  rowsPerPageOptions={[10, 20, 30]}
                  onPageChange={(e) => {
                    setUsePage(e.page);
                    setUsePageSize(e.rows);
                    fetchUseHistory(selectedUser.id);
                  }}
                />
              </Pagination>
            </TableWrapper>
          </UserContent>
          <Footer />
        </Container>
      );
    } else {
      return (
        <Container>
          <MainHeader
            setActiveHeader={setActiveHeader}
            userType='admin'
            toggleDarkMode={toggleDarkMode}
            isDarkMode={isDarkMode}
          />
          <SubHeaders activeHeader={activeHeader} userType='admin' />
          <Header>
            <h2>{selectedUser.username} 회원의 포인트 충전 내역</h2>
            <div>잔여 포인트: {formatPoints(selectedUser.point)}</div>
          </Header>
          <UserContent isDarkMode={isDarkMode}>
            <MiddleWrapper>
              <TotalCount>총 {chargeTotal}건</TotalCount>
              <ButtonContainer>
                <button onClick={handleBackToUserList}>뒤로가기</button>
              </ButtonContainer>
            </MiddleWrapper>
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <th>충전 일시</th>
                    <th>충전 상태</th>
                    <th>충전 유형</th>
                    <th>온라인 영수증</th>
                    <th>충전 금액</th>
                    <th>충전 포인트</th>
                  </tr>
                </thead>
                <tbody>
                  {chargeHistory.map((record) => (
                    <tr key={record.id}>
                      <td>{formatDate(record.created_at)}</td>
                      <td>
                        {record.charge_status === 'pending'
                          ? '대기중'
                          : record.charge_status === 'confirmed'
                            ? '충전 완료'
                            : '반려'}
                      </td>
                      <td>
                        {record.charge_type === 'card'
                          ? '카드 충전'
                          : record.charge_type === 'cash'
                            ? '현금 충전'
                            : record.charge_type === 'paypal'
                              ? '페이팔 충전'
                              : '쿠폰 충전'}
                      </td>
                      <td>
                        <button>온라인 영수증</button>
                      </td>
                      <td>
                        {record.charge_type === 'coupon'
                          ? '-'
                          : formatCurrency(record.amount)}
                      </td>
                      <td>{formatPoints(record.point)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination>
                <Paginator
                  first={chargePage * chargePageSize}
                  rows={chargePageSize}
                  totalRecords={chargeTotalRecords}
                  rowsPerPageOptions={[10, 20, 30]}
                  onPageChange={(e) => {
                    setChargePage(e.page);
                    setChargePageSize(e.rows);
                    fetchChargeHistory(selectedUser.id);
                  }}
                />
              </Pagination>
            </TableWrapper>
          </UserContent>
          <Footer />
        </Container>
      );
    }
  }

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
              <th>비상 연락처</th>
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
                <TdEmail banned={user.banned} isDarkMode={isDarkMode}>
                  {user.email}
                </TdEmail>
                <td>{user.username}</td>
                <td>{user.phone}</td>
                <td>{user.emergency_phone}</td>
                <td>
                  <button onClick={() => handleViewChargeHistory(user)}>
                    충전 내역
                  </button>
                </td>
                <td>
                  <button onClick={() => handleViewUseHistory(user)}>
                    사용 내역
                  </button>
                </td>
                <td>{formatPoints(user.point)}</td>
                <td>{user.banned ? <FaCheck /> : ''}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination>
          <Paginator
            first={page * pageSize}
            rows={pageSize}
            totalRecords={totalRecords}
            rowsPerPageOptions={[10, 20, 30]}
            onPageChange={(e) => {
              setPage(e.page);
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

  button {
    cursor: pointer;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
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

const TdEmail = styled.td`
  color: ${({ banned, isDarkMode }) => {
    if (banned) {
      return 'red';
    }
    return isDarkMode ? 'white' : 'black';
  }};
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

const Header = styled.div`
  text-align: center;
  background-color: #33556d;
  padding: 50px;

  h2 {
    margin: 0;
    font-size: 32px;
    font-weight: bold;
    color: white;
  }
  div {
    margin-top: 20px;
    font-size: 16px;
    color: white;
  }
`;

const TotalCount = styled.div`
  font-size: 16px;
  display: inline-block;
`;

const MiddleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  width: 80%;
  margin: 0 auto;
`;

const UserContent = styled.div`
  flex: 1;
  padding: 20px;
  margin-top: 10px;
  background-color: white;
  width: 100%;
  margin: 0 auto;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
`;

const TableWrapper = styled.div`
  margin: 0 auto;
  width: 100%;
`;

const formatPoints = (points) =>
  points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'P';
const formatCurrency = (amount) =>
  amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원';
