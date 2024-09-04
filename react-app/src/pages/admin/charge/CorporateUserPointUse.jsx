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
  getCorporateUsersPaymentHistory,
  findCorporateUsersPaymentHistoryByDateRange,
} from '../../../services/adminService';
import 'primeicons/primeicons.css';

const CorporateUserPointUse = ({ isDarkMode, toggleDarkMode }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeHeader, setActiveHeader] = useState('결제 관리');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [dates, setDates] = useState(null);

  useEffect(() => {
    const startDate = dates ? new Date(dates[0]) : null;
    const endDate = dates ? new Date(dates[1]) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999);
    fetchPaymentHistory(
      first / rows + 1,
      rows,
      startDate?.toISOString(),
      endDate?.toISOString()
    );
  }, [first, rows, dates]);

  const fetchPaymentHistory = async (
    page = 1,
    size = 10,
    startDate,
    endDate
  ) => {
    try {
      let data;
      if (startDate && endDate) {
        data = await findCorporateUsersPaymentHistoryByDateRange(
          page,
          size,
          startDate,
          endDate
        );
      } else {
        data = await getCorporateUsersPaymentHistory(page, size);
      }
      setPaymentHistory(data.items);
      setTotalRecords(data.total);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    }
  };

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    const startDate = dates ? new Date(dates[0]) : null;
    const endDate = dates ? new Date(dates[1]) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999);
    fetchPaymentHistory(
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
    return number ? `${Math.abs(number).toLocaleString('ko-KR')}P` : '0P';
  };

  const formatImageCount = (count) => {
    return `${count}장`;
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
        <h2>사업자 회원 결제 목록</h2>
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
                dateFormat='yy-mm-dd'
                showIcon
              />
            </CalendarContainer>
          </RightAlignedWrapper>
        </MiddleWrapper>
        <TableWrapper>
          <DataTable value={paymentHistory} paginator={false}>
            <Column
              field='created_at'
              header='결제 일시'
              body={(rowData) => {
                const date = new Date(rowData.created_at);
                const formattedDate = `${date.getFullYear()}-${String(
                  date.getMonth() + 1
                ).padStart(
                  2,
                  '0'
                )}-${String(date.getDate()).padStart(2, '0')} ${String(
                  date.getHours()
                ).padStart(
                  2,
                  '0'
                )}:${String(date.getMinutes()).padStart(2, '0')}`;
                return formattedDate;
              }}
            />
            <Column field='corporate_name' header='기업명(기관명)' />
            <Column field='username' header='담당자 이름' />
            <Column field='email' header='E-mail' />
            <Column
              field='detected_images_count'
              header='결제 장수'
              body={(rowData) =>
                formatImageCount(rowData.detected_images_count)
              }
            />
            <Column
              field='point'
              header='결제 포인트'
              body={(rowData) => formatNumber(rowData.point)}
            />
            <Column
              field='user_point_after'
              header='결제 후 사용자 포인트'
              body={(rowData) => formatNumber(rowData.user_point_after)}
            />
          </DataTable>
          <br />
          <Paginator
            first={first}
            rows={rows}
            totalRecords={totalRecords}
            onPageChange={onPageChange}
            rowsPerPageOptions={[10, 20, 30]}
          />
        </TableWrapper>
      </Content>
      <Footer />
    </Container>
  );
};

export default CorporateUserPointUse;

// Styled components are used here for layout and aesthetics
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
