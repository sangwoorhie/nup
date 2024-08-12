import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Calendar } from 'primereact/calendar';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import {
  getChargeHistory,
  deleteChargeHistory,
  getChargeHistoryByDateRange,
  getUserPoints,
  requestRefund, // Add this import
} from '../../../services/userServices'; // Added getUserPoints
import { Button } from 'primereact/button';
import UserPointModal from '../../../components/etc/modals/UserPointModal';
import 'primeicons/primeicons.css';

const ChargeHistory = () => {
  const [chargeHistory, setChargeHistory] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [userPoints, setUserPoints] = useState(0);
  const [activeHeader, setActiveHeader] = useState('MY 포인트');
  const [dates, setDates] = useState(null);
  const [showModal, setShowModal] = useState(false); // State for showing modal
  const [userData, setUserData] = useState(null); // State for storing user data
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fetchChargeHistory = async (page = 1, size = 10) => {
    try {
      const data = await getChargeHistory(page, size);
      setChargeHistory(data.items);
      setTotalRecords(data.total);
      setUserPoints(data.items[0]?.user_point || 0);
    } catch (error) {
      console.error('Failed to fetch charge history:', error);
    }
  };

  const fetchChargeHistoryByDateRange = async (
    start_date,
    end_date,
    page = 1,
    size = 10
  ) => {
    try {
      const data = await getChargeHistoryByDateRange(
        start_date,
        end_date,
        page,
        size
      );
      setChargeHistory(data.items);
      setTotalRecords(data.total);
      setUserPoints(data.items[0]?.user_point || 0);
    } catch (error) {
      console.error('Failed to fetch charge history by date range:', error);
    }
  };

  useEffect(() => {
    if (dates && dates[0] && dates[1]) {
      const start_date = new Date(dates[0]);
      start_date.setHours(0, 0, 0, 0);
      const end_date = new Date(dates[1]);
      end_date.setHours(23, 59, 59, 999);
      fetchChargeHistoryByDateRange(
        start_date.toISOString(),
        end_date.toISOString(),
        first / rows + 1,
        rows
      );
    } else {
      fetchChargeHistory(first / rows + 1, rows);
    }
  }, [first, rows, dates]);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') {
      return '0';
    }
    return number.toLocaleString('ko-KR');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const chargeStatusTemplate = (rowData) => {
    const statusMap = {
      confirmed: '충전 완료',
      pending: '대기중',
      rejected: '충전 실패',
    };
    return statusMap[rowData.charge_status] || rowData.charge_status;
  };

  const chargeTypeTemplate = (rowData) => {
    const typeMap = {
      coupon: '쿠폰',
      cash: '현금',
      card: '카드',
      paypal: '페이팔',
    };
    return typeMap[rowData.charge_type] || rowData.charge_type;
  };

  const chargeAmountTemplate = (data) => {
    if (data.charge_type === 'coupon') {
      return '-';
    }
    return data.amount === 0 ? '-' : `${formatNumber(data.amount)}원`;
  };

  const deleteRecord = async (id) => {
    try {
      if (!id) throw new Error('Invalid ID');
      const confirmed = window.confirm('정말 삭제하시겠습니까?');
      if (confirmed) {
        await deleteChargeHistory(id);
        fetchChargeHistory(first / rows + 1, rows); // Refresh the table
        alert('해당 충전 내역이 삭제되었습니다');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      alert(errorMessage);
      console.error('Failed to delete record:', error, errorMessage);
    }
  };

  const deleteTemplate = (rowData) => {
    return (
      <IconOnlyButton
        icon='pi pi-times'
        onClick={() => deleteRecord(rowData.id)}
      />
    );
  };

  // Function to handle refund button click
  const handleRefundButtonClick = async () => {
    try {
      const data = await getUserPoints(); // Fetch user points from the server
      setUserData(data);
      setShowModal(true); // Show the modal
    } catch (error) {
      console.error('Failed to fetch user points:', error);
    }
  };

  const handleRefund = async (formData) => {
    try {
      await requestRefund(formData);
      alert(
        '환불 신청이 성공적으로 접수되었습니다. 환불 내역에서 확인 가능합니다.'
      );
      setShowModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      alert(errorMessage);
      console.error('Failed to reject charges:', error, errorMessage);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <Container>
      <MainHeader
        setActiveHeader={setActiveHeader}
        userType='user'
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <SubHeaders activeHeader={activeHeader} userType='user' />
      <Header>
        <h2>KO-MAPPER AI 나의 포인트</h2>
        <h3>{formatNumber(userPoints)} 포인트</h3>
      </Header>
      <SecondHeader>
        <SecondHeaderTitle>충전 내역</SecondHeaderTitle>
      </SecondHeader>
      <Content isDarkMode={isDarkMode}>
        <MiddleWrapper>
          <TotalCount>총 {totalRecords}건</TotalCount>
          <RightAlignedWrapper>
            <StyledCalendar
              value={dates}
              onChange={(e) => setDates(e.value)}
              selectionMode='range'
              readOnlyInput
              placeholder='충전일자 기간선택'
              hideOnRangeSelection
              dateFormat='yy-mm-dd'
              showIcon
            />
            <ButtonWrapper>
              <RefundButton
                label='환불 신청'
                onClick={handleRefundButtonClick}
              />
            </ButtonWrapper>
          </RightAlignedWrapper>
        </MiddleWrapper>
        <TableWrapper>
          <DataTable value={chargeHistory} paginator={false}>
            <Column
              field='created_at'
              header='충전 일시'
              body={(rowData) => formatDate(rowData.created_at)}
            />
            <Column
              field='charge_status'
              header='충전 상태'
              body={chargeStatusTemplate}
            />
            <Column
              field='charge_type'
              header='충전 유형'
              body={chargeTypeTemplate}
            />
            <Column
              field='amount'
              header='충전 금액'
              body={chargeAmountTemplate}
            />
            <Column
              field='point'
              header='충전 포인트'
              body={(data) => `${formatNumber(data.point)}P`}
            />
            <Column
              header='온라인 영수증'
              body={() => <SmallButton label='온라인 영수증' />}
            />
            <Column header='삭제' body={deleteTemplate} />
          </DataTable>
          <br />
          <Paginator
            first={first}
            rows={rows}
            totalRecords={totalRecords}
            rowsPerPageOptions={[10, 20, 30]}
            onPageChange={onPageChange}
          />
        </TableWrapper>
      </Content>
      <Footer />
      {showModal && (
        <UserPointModal
          user={userData}
          onClose={() => setShowModal(false)}
          onRefund={handleRefund}
        />
      )}
    </Container>
  );
};

export default ChargeHistory;

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
  width: 80%;
  margin: 0 auto; /* Center the content */
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
`;

const Header = styled.div`
  text-align: center;
  /* margin-bottom: 20px; */
  background-color: #33556d;
  padding: 50px;

  h2 {
    margin: 0;
    font-size: 32px;
    font-weight: bold;
  }

  h3 {
    margin: 10px 0 0;
    font-size: 18px;
    color: white;
  }
`;

const SecondHeader = styled.div`
  text-align: center;
  padding: 20px;
  background-color: white;
  border-bottom: 1px solid #afafaf;
  margin-bottom: 10px;
`;

const SecondHeaderTitle = styled.h2`
  margin: 0;
`;

const MiddleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const RightAlignedWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; /* Added to ensure proper spacing */
`;

const TotalCount = styled.div`
  font-size: 16px;
`;

const TableWrapper = styled.div`
  margin: 0 auto;
  width: 100%; /* Adjusted to ensure it aligns with other elements */
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const SmallButton = styled(Button)`
  padding: 4px 8px;
  font-size: 12px;
`;

const RefundButton = styled(Button)`
  padding: 8px 14px;
  font-size: 12px;
  background-color: white;
  color: black;
  border: 1px solid #afafaf;
`;

const IconOnlyButton = styled(Button)`
  background-color: transparent;
  color: black;
  border: none;
  box-shadow: none;

  .pi {
    color: black;
  }

  &:hover {
    background-color: transparent;
  }
`;

const StyledCalendar = styled(Calendar)`
  font-size: 14px;

  input::placeholder {
    font-size: 14px;
  }
`;
