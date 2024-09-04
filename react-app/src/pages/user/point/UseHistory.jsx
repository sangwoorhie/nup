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
  getUseHistory,
  deleteChargeHistory,
  findUseHistoryByDateRange,
} from '../../../services/userServices';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';

const UseHistory = ({ isDarkMode, toggleDarkMode }) => {
  const [useHistory, setUseHistory] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [activeHeader, setActiveHeader] = useState('MY 포인트');
  const [dates, setDates] = useState(null);

  const fetchUseHistory = async (page = 1, size = 10) => {
    try {
      const data = await getUseHistory(page, size);
      setUseHistory(data.items);
      setTotalRecords(data.total);
    } catch (error) {
      console.error('Failed to fetch use history:', error);
    }
  };

  const fetchUseHistoryByDateRange = async (
    start_date,
    end_date,
    page = 1,
    size = 10
  ) => {
    try {
      const data = await findUseHistoryByDateRange(
        start_date,
        end_date,
        page,
        size
      );
      setUseHistory(data.items);
      setTotalRecords(data.total);
    } catch (error) {
      console.error('Failed to fetch use history by date range:', error);
    }
  };

  useEffect(() => {
    if (dates && dates[0] && dates[1]) {
      const start_date = new Date(dates[0]);
      start_date.setHours(0, 0, 0, 0);
      const end_date = new Date(dates[1]);
      end_date.setHours(23, 59, 59, 999);
      fetchUseHistoryByDateRange(
        start_date.toISOString(),
        end_date.toISOString(),
        first / rows + 1,
        rows
      );
    } else {
      fetchUseHistory(first / rows + 1, rows);
    }
  }, [first, rows, dates]);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const formatNumber = (number) => {
    return number.toLocaleString('ko-KR');
  };

  const useDateTemplate = (data) => {
    const date = new Date(data.created_at);
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(
      date.getHours()
    ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return formattedDate;
  };

  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);
  //   return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  // };

  const detectedImagesTemplate = (rowData) => {
    return `${rowData.detected_images_count}장`;
  };

  const usedPointsTemplate = (rowData) => {
    return `${formatNumber(Math.abs(rowData.point))}P`;
  };

  const afterUsePointsTemplate = (rowData) => {
    return `${formatNumber(rowData.user_point_after)}P`;
  };

  const deleteRecord = async (id) => {
    try {
      const confirmed = window.confirm('정말 삭제하시겠습니까?');
      if (confirmed) {
        await deleteChargeHistory(id);
        fetchUseHistory(first / rows + 1, rows); // Refresh the table
        alert('해당 사용 내역이 삭제되었습니다.');
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
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

  return (
    <Container isDarkMode={isDarkMode}>
      <MainHeader
        setActiveHeader={setActiveHeader}
        userType='user'
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <SubHeaders activeHeader={activeHeader} userType='user' />
      <Header>
        <h2>나의 포인트 사용내역</h2>
      </Header>
      <SecondHeader>
        <SecondHeaderTitle>사용 내역</SecondHeaderTitle>
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
              placeholder='사용일자 기간선택'
              hideOnRangeSelection
              dateFormat='yy-mm-dd'
              showIcon
            />
          </RightAlignedWrapper>
        </MiddleWrapper>
        <TableWrapper>
          <DataTable value={useHistory} paginator={false}>
            <Column
              field='created_at'
              header='사용 일시'
              body={useDateTemplate}
            />
            <Column
              field='detected_images_count'
              header='이미지 장수'
              body={detectedImagesTemplate}
            />
            <Column
              field='point'
              header='사용 포인트'
              body={usedPointsTemplate}
            />
            <Column
              field='user_point_after'
              header='사용 후 포인트'
              body={afterUsePointsTemplate}
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
    </Container>
  );
};

export default UseHistory;

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

const TableWrapper = styled.div`
  margin: 0 auto;
  width: 100%;
`;

const StyledCalendar = styled(Calendar)`
  font-size: 14px;

  input::placeholder {
    font-size: 14px;
  }
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

const SecondHeader = styled.div`
  text-align: center;
  padding: 20px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  border-bottom: 1px solid #afafaf;
`;

const SecondHeaderTitle = styled.h2`
  margin: 0;
`;
