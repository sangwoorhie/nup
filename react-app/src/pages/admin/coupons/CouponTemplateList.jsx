import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Paginator } from 'primereact/paginator';
import httpClient from '../../../services/httpClient';

const CouponTemplateList = () => {
  const [dates, setDates] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [criteria, setCriteria] = useState('all');
  const [activeHeader, setActiveHeader] = useState('쿠폰 관리');

  const criteriaOptions = [
    { label: '전체조회', value: 'all' },
    { label: '유효쿠폰만 조회', value: 'non-expired' },
    { label: '만료쿠폰만 조회', value: 'expired' },
  ];

  const fetchCoupons = useCallback(async () => {
    const response = await httpClient.get('/coupon-templates', {
      params: { page, size: pageSize, criteria },
    });
    setCoupons(response.data.items);
    setTotalRecords(response.data.total);
  }, [page, pageSize, criteria]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handlePageChange = (e) => {
    setPage(e.page + 1);
    setPageSize(e.rows);
  };

  return (
    <Container>
      <MainHeader setActiveHeader={setActiveHeader} userType='admin' />
      <SubHeaders activeHeader={activeHeader} userType='admin' />
      <Content>
        <ActionBar>
          <CalendarContainer>
            <Calendar
              value={dates}
              onChange={(e) => setDates(e.value)}
              selectionMode='range'
              readOnlyInput
              hideOnRangeSelection
              dateFormat='yy-mm-dd'
            />
          </CalendarContainer>
          <Dropdown
            value={criteria}
            options={criteriaOptions}
            onChange={(e) => setCriteria(e.value)}
            placeholder='전체조회'
          />
        </ActionBar>
        <Table>
          <thead>
            <tr>
              <th>쿠폰 명</th>
              <th>쿠폰 발행 수량</th>
              <th>쿠폰 포인트</th>
              <th>쿠폰 발급일</th>
              <th>쿠폰 유효기간(만료일)</th>
              <th>쿠폰 발급인</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>{coupon.coupon_name}</td>
                <td>{coupon.quantity}</td>
                <td>{coupon.point}</td>
                <td>{new Date(coupon.created_at).toLocaleDateString()}</td>
                <td>{new Date(coupon.expiration_date).toLocaleDateString()}</td>
                <td>{coupon.username}</td>
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
            onPageChange={handlePageChange}
          />
        </Pagination>
      </Content>
      <Footer />
    </Container>
  );
};

export default CouponTemplateList;

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

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 80%;
  margin: 0 auto;
`;

const CalendarContainer = styled.div`
  display: flex;
  align-items: center;
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
`;
