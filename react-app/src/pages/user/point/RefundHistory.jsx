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
  getRefundHistory,
  getRefundHistoryByDateRange,
  cancelRefundRequests,
  deleteRefundRequests,
} from '../../../services/userServices';
import { Button } from 'primereact/button';
import RefundRequestModal from '../../../components/etc/modals/RefundRequestModal';

const RefundHistory = () => {
  const [refundHistory, setRefundHistory] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeHeader, setActiveHeader] = useState('MY 포인트');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [dates, setDates] = useState(null);
  const [selectedRefunds, setSelectedRefunds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReason, setModalReason] = useState('');

  const fetchRefundHistory = async (page = 1, size = 10) => {
    try {
      const data = await getRefundHistory(page, size);
      setRefundHistory(data.items);
      setTotalRecords(data.total);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;

      alert(`Error: ${errorMessage}`);
      console.error(error);
    }
  };

  const fetchRefundHistoryByDateRange = async (
    start_date,
    end_date,
    page = 1,
    size = 10
  ) => {
    try {
      const data = await getRefundHistoryByDateRange(
        start_date,
        end_date,
        page,
        size
      );
      setRefundHistory(data.items);
      setTotalRecords(data.total);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;

      alert(`Error: ${errorMessage}`);
      console.error(error);
    }
  };

  useEffect(() => {
    if (dates && dates[0] && dates[1]) {
      const start_date = new Date(dates[0]);
      start_date.setHours(0, 0, 0, 0);
      const end_date = new Date(dates[1]);
      end_date.setHours(23, 59, 59, 999);
      fetchRefundHistoryByDateRange(
        start_date.toISOString(),
        end_date.toISOString(),
        first / rows + 1,
        rows
      );
    } else {
      fetchRefundHistory(first / rows + 1, rows);
    }
  }, [first, rows, dates]);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const refundStatusTemplate = (rowData) => {
    if (rowData.is_cancelled) {
      return '환불 취소';
    }
    return rowData.is_refunded ? '환불 완료' : '환불 대기';
  };

  const formatPoints = (points) => {
    return points.toLocaleString() + 'P';
  };

  const handleCancelRefund = async () => {
    if (selectedRefunds.length === 0) {
      alert('환불 내역을 선택해주세요.');
      return;
    }

    const confirmed = window.confirm('해당 환불내역을 환불 취소 하시겠습니까?');
    if (confirmed) {
      try {
        await cancelRefundRequests(selectedRefunds.map((r) => r.id));
        // Refresh the refund history
        if (dates && dates[0] && dates[1]) {
          const start_date = new Date(dates[0]);
          start_date.setHours(0, 0, 0, 0);
          const end_date = new Date(dates[1]);
          end_date.setHours(23, 59, 59, 999);
          fetchRefundHistoryByDateRange(
            start_date.toISOString(),
            end_date.toISOString(),
            first / rows + 1,
            rows
          );
        } else {
          fetchRefundHistory(first / rows + 1, rows);
        }
        setSelectedRefunds([]);
        alert('취소되었습니다.');
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        alert(`Error: ${errorMessage}`);
        console.error(error);
      }
    }
  };
  const handleDeleteRefund = async () => {
    if (selectedRefunds.length === 0) {
      alert('환불 내역을 선택해주세요.');
      return;
    }

    const confirmed = window.confirm('해당 환불내역을 삭제하시겠습니까?');
    if (confirmed) {
      try {
        await deleteRefundRequests(selectedRefunds.map((r) => r.id));
        fetchRefundHistory(first / rows + 1, rows);
        setSelectedRefunds([]);
        alert('삭제되었습니다.');
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;

        alert(`Error: ${errorMessage}`);
        console.error(error);
      }
    }
  };

  const showReason = (reason) => {
    setModalReason(reason);
    setModalVisible(true);
  };

  const refundReasonTemplate = (rowData) => {
    return (
      <SmallButton
        label='보기'
        onClick={() => showReason(rowData.refund_request_reason)}
      />
    );
  };

  return (
    <Container>
      <MainHeader setActiveHeader={setActiveHeader} userType='user' />
      <SubHeaders activeHeader={activeHeader} userType='user' />
      <Header>
        <h2>KO-MAPPER AI 나의 환불 내역</h2>
      </Header>
      <SecondHeader>
        <SecondHeaderTitle>환불 내역</SecondHeaderTitle>
      </SecondHeader>
      <Content>
        <MiddleWrapper>
          <TotalCount>총 {totalRecords}건</TotalCount>
          <RightAlignedWrapper>
            <StyledCalendar
              value={dates}
              onChange={(e) => setDates(e.value)}
              selectionMode='range'
              readOnlyInput
              placeholder='환불일자 기간선택'
              hideOnRangeSelection
              dateFormat='yy-mm-dd'
              showIcon
            />
            <ButtonWrapper>
              <StyledButton label='환불 취소' onClick={handleCancelRefund} />
              <StyledButton label='삭제' onClick={handleDeleteRefund} />
            </ButtonWrapper>
          </RightAlignedWrapper>
        </MiddleWrapper>
        <TableWrapper>
          <DataTable
            value={refundHistory}
            paginator={false}
            selection={selectedRefunds}
            onSelectionChange={(e) => setSelectedRefunds(e.value)}
            selectionMode='checkbox'
          >
            <Column selectionMode='multiple' />
            <Column
              field='requested_at'
              header='환불 요청 일시'
              body={(rowData) => formatDate(rowData.requested_at)}
            />
            <Column
              field='is_refunded'
              header='환불 상태'
              body={refundStatusTemplate}
            />
            <Column
              field='requested_point'
              header='환불 포인트'
              body={(rowData) => formatPoints(rowData.requested_point)}
            />
            <Column
              field='rest_point'
              header='환불 후 잔여 포인트'
              body={(rowData) => formatPoints(rowData.rest_point)}
            />
            <Column
              field='refund_request_reason'
              header='환불 사유'
              body={refundReasonTemplate}
            />
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
      <RefundRequestModal
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        reason={modalReason}
      />
    </Container>
  );
};

export default RefundHistory;

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
`;

const Header = styled.div`
  text-align: center;
  background-color: #33556d;
  padding: 60px;

  h2 {
    margin: 0;
    font-size: 32px;
    font-weight: bold;
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

const StyledCalendar = styled(Calendar)`
  font-size: 14px;

  input::placeholder {
    font-size: 14px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StyledButton = styled(Button)`
  background-color: white;
  border: 1px solid #ccc;
  color: black;
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 4px;
  margin-right: 5px;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const SmallButton = styled(Button)`
  background-color: white;
  border: 1px solid #ccc;
  color: black;
  padding: 5px 8px;
  font-size: 10px;
  border-radius: 4px;

  &:hover {
    background-color: #f0f0f0;
  }
`;
