import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Paginator } from 'primereact/paginator';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { getUsedCoupons, removeCoupon } from '../../../services/userServices';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import refreshImage from '../../../assets/img/refresh_icon.png';

const MyCoupon = ({ isDarkMode, toggleDarkMode }) => {
  const [coupons, setCoupons] = useState([]);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeHeader, setActiveHeader] = useState('MY 포인트');
  const [userType, setUserType] = useState('');

  const fetchCoupons = useCallback(async (page = 1, size = 10) => {
    try {
      const { data } = await getUsedCoupons(page, size);
      setCoupons(data.items);
      setTotalRecords(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    }
  }, []);

  useEffect(() => {
    fetchCoupons(first / rows + 1, rows);
    const type = localStorage.getItem('userType');
    setUserType(type);
  }, [fetchCoupons, first, rows]);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    fetchCoupons(event.first / event.rows + 1, event.rows);
  };

  const handleRefresh = () => {
    fetchCoupons(first / rows + 1, rows);
    window.location.reload();
  };

  const handleDelete = async (id) => {
    console.log('Coupon ID to be deleted:', id);
    const confirmed = window.confirm('정말 삭제하시겠습니까?');
    if (confirmed) {
      try {
        await removeCoupon(id);
        alert('쿠폰이 삭제되었습니다.');
        fetchCoupons(first / rows + 1, rows);
      } catch (error) {
        console.error('Failed to delete coupon:', error);
      }
    }
  };

  const formatPoints = (points) => {
    return points.toLocaleString() + 'P';
  };

  return (
    <Container>
      <MainHeader
        setActiveHeader={setActiveHeader}
        userType={userType}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <SubHeaders activeHeader={activeHeader} userType={userType} />
      <Content isDarkMode={isDarkMode}>
        <Header>
          <Title>MY 쿠폰</Title>
          <ButtonContainer>
            <RefreshButton onClick={handleRefresh}>
              <img src={refreshImage} alt='새로고침' />
            </RefreshButton>
          </ButtonContainer>
        </Header>
        <StyledTable isDarkMode={isDarkMode}>
          <thead>
            <tr>
              <Th>쿠폰 명</Th>
              <Th>쿠폰 코드</Th>
              <Th>포인트</Th>
              <Th>사용 일자</Th>
              <Th>유효기간</Th>
              <Th>쿠폰 삭제</Th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <Tr key={coupon.code} isDarkMode={isDarkMode}>
                <Td isDarkMode={isDarkMode}>{coupon.coupon_name}</Td>
                <Td isDarkMode={isDarkMode}>{coupon.code}</Td>
                <Td isDarkMode={isDarkMode}>{formatPoints(coupon.point)}</Td>
                <Td isDarkMode={isDarkMode}>
                  {new Date(coupon.used_at).toLocaleDateString()}
                </Td>
                <Td isDarkMode={isDarkMode}>
                  {new Date(coupon.expiration_date).toLocaleDateString()}
                </Td>
                <Td isDarkMode={isDarkMode}>
                  <DeleteButton onClick={() => handleDelete(coupon.id)}>
                    삭제
                  </DeleteButton>
                </Td>
              </Tr>
            ))}
          </tbody>
        </StyledTable>
        <Pagination>
          <Paginator
            first={first}
            rows={rows}
            totalRecords={totalRecords}
            rowsPerPageOptions={[10, 20, 30]}
            onPageChange={onPageChange}
          />
        </Pagination>
      </Content>
      <Footer />
    </Container>
  );
};

export default MyCoupon;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const RefreshButton = styled.button`
  padding: 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
  }
`;

const StyledTable = styled.table`
  width: 80%;
  margin: 0 auto;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: 1px solid #ddd;
`;

const Tr = styled.tr`
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
`;

const DeleteButton = styled.button`
  padding: 5px 10px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#666' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: ${({ isDarkMode }) => (isDarkMode ? '#777' : '#e0e0e0')};
  }
`;

const Pagination = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
