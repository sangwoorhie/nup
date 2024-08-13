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
  getCashChargeRequests,
  getCashChargeRequestsByDateRange,
  confirmCharges,
  deleteChargeRequests,
} from '../../../services/adminService';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import refreshImage from '../../../assets/img/refresh_icon.png';

const CashChargeRequest = ({ isDarkMode, toggleDarkMode }) => {
  const [chargeRequests, setChargeRequests] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [dates, setDates] = useState(null);
  const [activeHeader, setActiveHeader] = useState('결제 관리');
  const [selectedRequests, setSelectedRequests] = useState([]);

  const fetchCashChargeRequests = async (
    page = 1,
    size = 10,
    startDate,
    endDate
  ) => {
    try {
      let data;
      if (startDate && endDate) {
        data = await getCashChargeRequestsByDateRange(
          page,
          size,
          startDate,
          endDate
        );
      } else {
        data = await getCashChargeRequests(page, size);
      }
      setChargeRequests(data.items);
      setTotalRecords(data.total);
    } catch (error) {
      console.error('Failed to fetch cash charge requests:', error);
    }
  };

  useEffect(() => {
    const startDate = dates ? new Date(dates[0]) : null;
    const endDate = dates ? new Date(dates[1]) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999);
    fetchCashChargeRequests(
      first / rows + 1,
      rows,
      startDate?.toISOString(),
      endDate?.toISOString()
    );
  }, [first, rows, dates]);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    const startDate = dates ? new Date(dates[0]) : null;
    const endDate = dates ? new Date(dates[1]) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999);
    fetchCashChargeRequests(
      event.page + 1,
      event.rows,
      startDate?.toISOString(),
      endDate?.toISOString()
    );
  };

  const onDateChange = (e) => {
    setDates(e.value);
  };

  const formatNumber = (number) => {
    if (typeof number !== 'number') {
      return '0';
    }
    return number.toLocaleString('ko-KR');
  };

  const chargeStatusTemplate = (rowData) => {
    const statusMap = {
      confirmed: '충전 완료',
      pending: '대기중',
      rejected: '반려',
    };
    return statusMap[rowData.charge_status] || rowData.charge_status;
  };

  const chargeAmountTemplate = (data) => {
    return data.point === 0 ? '-' : `${formatNumber(data.point)}원`;
  };

  const chargeDateTemplate = (data) => {
    return new Date(data.created_at).toISOString().split('T')[0];
  };

  const handleConfirm = async () => {
    if (selectedRequests.length === 0) {
      alert('충전할 요청건을 선택해 주세요.');
      return;
    }

    const confirmMessage = window.confirm(
      '해당 요청건에 대해 충전을 하기 전, 반드시 정확한 충전 요청 금액의 입금 확인 및 계좌주 명을 확인 후, 포인트 충전을 진행하시기 바랍니다. 포인트 충전을 진행하시겠습니까?'
    );
    if (confirmMessage) {
      try {
        await confirmCharges(
          selectedRequests.map((request) => ({
            id: request.id,
            status: 'confirmed',
          }))
        );
        const startDate = dates ? new Date(dates[0]) : null;
        const endDate = dates ? new Date(dates[1]) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);
        fetchCashChargeRequests(
          first / rows + 1,
          rows,
          startDate?.toISOString(),
          endDate?.toISOString()
        );
        setSelectedRequests([]);
        alert('포인트가 충전되었습니다.');
      } catch (error) {
        const errorMessage =
          '대기 중 상태에 있는 충전 요청 건만 변경 가능합니다.' ||
          error.response?.data?.message ||
          error.message;

        alert(`Error: ${errorMessage}`);
        console.error('Failed to confirm charges:', error);
      }
    }
  };

  const handleReject = async () => {
    if (selectedRequests.length === 0) {
      alert('반려할 요청건을 선택해 주세요.');
      return;
    }

    const confirmMessage = window.confirm('해당 요청건을 반려하시겠습니까?');
    if (confirmMessage) {
      try {
        await confirmCharges(
          selectedRequests.map((request) => ({
            id: request.id,
            status: 'rejected',
          }))
        );
        const startDate = dates ? new Date(dates[0]) : null;
        const endDate = dates ? new Date(dates[1]) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);
        fetchCashChargeRequests(
          first / rows + 1,
          rows,
          startDate?.toISOString(),
          endDate?.toISOString()
        );
        setSelectedRequests([]);
        alert('해당 요청건이 반려되었습니다.');
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        alert(errorMessage);
        console.error('Failed to reject charges:', error, errorMessage);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedRequests.length === 0) {
      alert('삭제할 요청건을 선택해 주세요.');
      return;
    }

    const confirmMessage = window.confirm('정말 삭제하시겠습니까?');
    if (confirmMessage) {
      try {
        await deleteChargeRequests(
          selectedRequests.map((request) => request.id)
        );
        const startDate = dates ? new Date(dates[0]) : null;
        const endDate = dates ? new Date(dates[1]) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);
        fetchCashChargeRequests(
          first / rows + 1,
          rows,
          startDate?.toISOString(),
          endDate?.toISOString()
        );
        setSelectedRequests([]);
        alert('삭제되었습니다.');
      } catch (error) {
        alert(`Error: ${error.message}`);
        console.error('Failed to delete charges:', error);
      }
    }
  };

  const handleRefresh = () => {
    const startDate = dates ? new Date(dates[0]) : null;
    const endDate = dates ? new Date(dates[1]) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999);
    fetchCashChargeRequests(
      first / rows + 1,
      rows,
      startDate?.toISOString(),
      endDate?.toISOString()
    );
    window.location.reload();
  };

  const onSelectionChange = (e) => {
    setSelectedRequests(e.value);
  };

  return (
    <Container isDarkMode={isDarkMode}>
      <MainHeader
        setActiveHeader={setActiveHeader}
        userType='admin'
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <SubHeaders activeHeader={activeHeader} userType='admin' />
      <Header>
        <h2>현금 포인트 충전 요청 목록</h2>
      </Header>
      <Content isDarkMode={isDarkMode}>
        <MiddleWrapper>
          <TotalCount>총 {totalRecords}건</TotalCount>
          <RightAlignedWrapper>
            <CalendarContainer>
              <StyledCalendar
                value={dates}
                onChange={onDateChange}
                selectionMode='range'
                placeholder='조회 기간 선택'
                readOnlyInput
                hideOnRangeSelection
                dateFormat='yy-mm-dd'
                showIcon
                icon={() => <i className='pi pi-calendar' />}
              />
            </CalendarContainer>
            <StyledButton label='포인트 충전' onClick={handleConfirm} />
            <StyledButton label='반려' onClick={handleReject} />
            <StyledButton label='삭제' onClick={handleDelete} />
            <RefreshButton onClick={handleRefresh}>
              <img src={refreshImage} alt='새로고침' />
            </RefreshButton>
          </RightAlignedWrapper>
        </MiddleWrapper>
        <TableWrapper>
          <DataTable
            value={chargeRequests}
            paginator={false}
            selection={selectedRequests}
            onSelectionChange={onSelectionChange}
            dataKey='id'
          >
            <Column
              selectionMode='multiple'
              style={{ width: '3em' }}
              body={() => <Checkbox />}
            />
            <Column
              field='created_at'
              header='충전 요청 일시'
              body={chargeDateTemplate}
            />
            <Column
              field='charge_status'
              header='충전 상태'
              body={chargeStatusTemplate}
            />
            <Column field='username' header='회원 이름' />
            <Column field='account_holder_name' header='계좌주 이름' />
            <Column
              field='point'
              header='충전 요청 금액'
              body={chargeAmountTemplate}
            />
            <Column field='email' header='E-mail' />
            <Column field='phone' header='연락처' />
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
    </Container>
  );
};

export default CashChargeRequest;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  margin-top: 10px;
  width: 80%;
  margin: 0 auto;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
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
  gap: 10px;
`;

const TotalCount = styled.div`
  font-size: 16px;
`;

const CalendarContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 250px;
`;

const StyledCalendar = styled(Calendar)`
  width: 100%;
  font-size: 14px;

  input::placeholder {
    font-size: 14px;
  }

  .p-inputtext {
    width: 100%;
  }

  .p-datepicker-trigger {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    cursor: pointer;
    color: #007bff;
    border: 1px solid #ced4da;
  }
`;

const TableWrapper = styled.div`
  margin: 0 auto;
  width: 100%;
`;

const StyledButton = styled(Button)`
  background-color: white;
  border: 1px solid #ccc;
  color: black;
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 4px;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const RefreshButton = styled.button`
  padding: 5px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 20px;
  height: 20px;
  border: 1px solid #ccc;
  border-radius: 3px;
  appearance: none;
  cursor: pointer;

  &:checked {
    background-color: #007bff;
    border-color: #007bff;
  }

  &:checked::after {
    content: '✔';
    display: block;
    text-align: center;
    color: white;
    font-size: 14px;
  }
`;
