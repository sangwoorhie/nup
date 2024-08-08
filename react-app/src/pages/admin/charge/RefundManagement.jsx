import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import {
  getRefundRequests,
  completeRefundRequest,
  deleteRefundRequestAdmin,
  downloadImageAdmin,
} from '../../../services/adminService';
import { Button } from 'primereact/button';
import { saveAs } from 'file-saver';
import 'primeicons/primeicons.css';
import refreshImage from '../../../assets/img/refresh_icon.png';
import RefundRequestModal from '../../../components/etc/modals/RefundRequestModal';

const RefundManagement = () => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [activeHeader, setActiveHeader] = useState('결제 관리');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReason, setModalReason] = useState('');

  const fetchRefundRequests = async (page = 1, size = 10) => {
    try {
      const data = await getRefundRequests(page, size);
      setRefundRequests(data.items);
      setTotalRecords(data.total);
    } catch (error) {
      console.error('Failed to fetch refund requests:', error);
    }
  };

  useEffect(() => {
    fetchRefundRequests(first / rows + 1, rows);
  }, [first, rows]);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    fetchRefundRequests(event.page + 1, event.rows);
  };

  const handleCompleteRefund = async () => {
    if (selectedRequests.length === 0) {
      alert('환불 요청 건을 선택해 주세요.');
      return;
    }

    const confirmMessage = window.confirm(
      '환불 처리는, 실제로 환불이 이루어진 후에 해 주시기 바랍니다. 해당 환불 요청건을 환불처리 하시겠습니까?'
    );
    if (confirmMessage) {
      try {
        await completeRefundRequest(
          selectedRequests.map((request) => request.id)
        );
        fetchRefundRequests(first / rows + 1, rows);
        setSelectedRequests([]);
        alert('환불처리 되었습니다.');
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        alert(`Error: ${errorMessage}`);
        console.error('Failed to complete refund:', error);
      }
    }
  };

  const handleDeleteRefund = async () => {
    if (selectedRequests.length === 0) {
      alert('환불 요청 건을 선택해 주세요.');
      return;
    }

    const confirmMessage = window.confirm(
      '해당 환불 요청건을 삭제하시겠습니까?'
    );
    if (confirmMessage) {
      try {
        await deleteRefundRequestAdmin(
          selectedRequests.map((request) => request.id)
        );
        fetchRefundRequests(first / rows + 1, rows);
        setSelectedRequests([]);
        alert('삭제되었습니다.');
      } catch (error) {
        alert(`Error: ${error.message}`);
        console.error('Failed to delete refund:', error);
      }
    }
  };

  const handleRefresh = () => {
    fetchRefundRequests(first / rows + 1, rows);
    window.location.reload();
  };

  const onSelectionChange = (e) => {
    setSelectedRequests(e.value);
  };

  const formatPoints = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'P';
  };

  const showReason = (reason) => {
    setModalReason(reason);
    setModalVisible(true);
  };

  const formatRefundStatus = (rowData) => {
    if (rowData.is_cancelled) {
      return '환불 취소';
    }
    return rowData.is_refunded ? '환불 완료' : '환불 대기';
  };

  const handleDownload = async (refundRequestId) => {
    try {
      const { fileBuffer, fileName, mimeType } =
        await downloadImageAdmin(refundRequestId);
      const blob = new Blob([fileBuffer], { type: mimeType });
      saveAs(blob, fileName);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      alert(errorMessage);
      console.error('Failed to reject charges:', error, errorMessage);
    }
  };

  return (
    <Container>
      <MainHeader setActiveHeader={setActiveHeader} userType='admin' />
      <SubHeaders activeHeader={activeHeader} userType='admin' />
      <Header>
        <h2>환불 요청 목록</h2>
      </Header>
      <Content>
        <MiddleWrapper>
          <TotalCount>총 {totalRecords}건</TotalCount>
          <RightAlignedWrapper>
            <StyledButton label='환불 처리' onClick={handleCompleteRefund} />
            <StyledButton label='삭제' onClick={handleDeleteRefund} />
            <RefreshButton onClick={handleRefresh}>
              <img src={refreshImage} alt='새로고침' />
            </RefreshButton>
          </RightAlignedWrapper>
        </MiddleWrapper>
        <TableWrapper>
          <DataTable
            value={refundRequests}
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
            <Column field='requested_at' header='환불 요청 일시' />
            <Column
              field='is_refunded'
              header='환불 상태'
              body={formatRefundStatus}
            />
            <Column field='username' header='회원 이름' />
            <Column field='phone' header='회원 연락처' />
            <Column
              field='bank_account_copy'
              header='통장사본'
              body={(rowData) => (
                <SmallButton
                  label='다운로드'
                  onClick={() => handleDownload(rowData.id)}
                />
              )}
            />
            <Column
              field='requested_point'
              header='환불요청 포인트'
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
              body={(rowData) => (
                <SmallButton
                  label='보기'
                  onClick={() => showReason(rowData.refund_request_reason)}
                />
              )}
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

export default RefundManagement;

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
  margin: 0 auto;
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

const RefreshButton = styled.button`
  padding: 5px;
  background-color: transparent;
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
