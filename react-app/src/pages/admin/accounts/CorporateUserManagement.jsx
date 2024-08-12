import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import {
  getCorporateUsers,
  banCorporateUser,
  unbanCorporateUser,
  verifyBusinessLicense,
  downloadBusinessLicenseAdmin,
} from '../../../services/adminService';
import { Paginator } from 'primereact/paginator';
import refreshImage from '../../../assets/img/refresh_icon.png';
import { FaCheck } from 'react-icons/fa';
import UserInfoModal from '../../../components/etc/modals/UserInfoModal';

const CorporateUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState('corporate_name');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(0); // Changed to 0-based index
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [activeHeader, setActiveHeader] = useState('계정 관리');
  const [selectedUser, setSelectedUser] = useState(null); // State to manage selected user
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch functions
  const fetchUsers = useCallback(
    async (criteria = '', value = '') => {
      try {
        const { data } = await getCorporateUsers(
          page + 1,
          pageSize,
          criteria,
          value
        ); // Page is 1-based index
        setUsers(data.items);
        setTotalRecords(data.total);
      } catch (error) {
        if (error.response?.status === 404) {
          // setUsers([]);
          // setTotalRecords(0);
          alert('해당 조건에 맞는 기업을 찾을 수 없습니다.');
        } else {
          console.error('Error fetching corporate users:', error);
          const errorMessage = error.response?.data?.message || error.message;
          alert(errorMessage);
        }
      }
    },
    [page, pageSize]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDownload = async (corporateId) => {
    try {
      const { fileBuffer, fileName } =
        await downloadBusinessLicenseAdmin(corporateId);
      const blob = new Blob([fileBuffer], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(link.href); // Cleanup
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      alert('파일을 다운로드할 수 없습니다. ' + errorMessage);
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      alert('검색어를 입력해 주세요.');
      return;
    }
    try {
      await fetchUsers(searchCriteria, searchValue);
    } catch (error) {
      if (error.response?.status === 404) {
        alert('해당 조건에 맞는 기업을 찾을 수 없습니다.');
      } else {
        const errorMessage = error.response?.data?.message || error.message;
        alert('에러가 발생했습니다: ' + errorMessage);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') handleSearch();
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
            await unbanCorporateUser(user.id);
          } else {
            await banCorporateUser(user.id, { reason: '관리자에 의해 정지됨' });
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

  const handleVerify = async () => {
    if (selectedUserIds.length === 0) {
      alert('선택된 회원이 없습니다.');
      return;
    }

    if (window.confirm('사업자 등록증을 확인하시겠습니까?')) {
      for (const corporateId of selectedUserIds) {
        try {
          await verifyBusinessLicense(corporateId);
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          alert(errorMessage);
        }
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

  const handleRefresh = () => {
    fetchUsers();
    window.location.reload(); // Reload the page
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
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
        <ActionBar>
          <SearchSection>
            <select
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value)}
            >
              <option value='corporate_name'>기업(기관)명</option>
              <option value='business_registration_number'>
                사업자(기관) 등록번호
              </option>
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
            <button onClick={handleBan}>계정 정지/해제</button>
            <button onClick={handleVerify}>사업자 등록증 확인</button>
            <RefreshButton onClick={handleRefresh}>
              <img src={refreshImage} alt='새로고침' />
            </RefreshButton>
          </ButtonContainer>
        </ActionBar>
        <Table>
          <thead>
            <tr>
              <th></th>
              <th>기업(기관)명</th>
              <th>업종명(기관 유형)</th>
              <th>업태명(기관 세부유형)</th>
              <th>사업자 등록번호(기관 고유번호)</th>
              <th>사업자(기관) 등록증</th>
              <th>사업자 등록증 확인여부</th>
              <th>주소</th>
              <th>회원 정보</th>
              <th>계정 정지여부</th>
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
                <TdCorporateName banned={user.banned ? 'true' : undefined}>
                  {user.corporate_name}
                </TdCorporateName>
                <td>{user.business_type}</td>
                <td>{user.business_conditions}</td>
                <td>{user.business_registration_number}</td>
                <td>
                  <button onClick={() => handleDownload(user.id)}>
                    다운로드
                  </button>
                </td>
                <td>{user.business_license_verified ? '확인' : '미확인'}</td>
                <td>{user.address}</td>
                <td>
                  <button onClick={() => setSelectedUser(user)}>
                    회원 정보
                  </button>
                </td>
                <td>{user.banned ? <FaCheck /> : ''}</td>
                <td>
                  <button>충전 내역</button>
                </td>
                <td>
                  <button>사용 내역</button>
                </td>
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
      <UserInfoModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
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
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
`;

const SearchSection = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px; /* Adjusted margin for alignment */

  select {
    margin-right: 10px;
    padding: 5px;
    width: 100px; /* Adjusted width */
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
  width: 80%; /* Adjusted width */
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
  width: 80%; /* Adjusted width */
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
  width: 80%; /* Adjusted width */
  margin: 0 auto;
`;

const TdCorporateName = styled.td`
  color: ${({ banned }) => (banned === 'true' ? 'red' : 'black')};
`;
