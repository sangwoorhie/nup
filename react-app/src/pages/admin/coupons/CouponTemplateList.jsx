import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Paginator } from 'primereact/paginator';
import refreshImage from '../../../assets/img/refresh_icon.png';
import {
  getCouponsByName,
  getCouponsByDateRange,
  deleteCouponTemplate,
  fetchCouponsByTemplateId,
  searchCoupons,
  deleteCoupons,
} from '../../../services/adminService';
import httpClient from '../../../services/httpClient';

const usePageChange = (callback) => {
  const [pageChanged, setPageChanged] = useState(false);

  useEffect(() => {
    if (pageChanged) {
      callback();
      setPageChanged(false);
    }
  }, [pageChanged, callback]);

  return () => setPageChanged(true);
};

const CouponTemplateList = () => {
  const [dates, setDates] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [criteria, setCriteria] = useState('all');
  const [activeHeader, setActiveHeader] = useState('쿠폰 관리');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const [selectedCouponIds, setSelectedCouponIds] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('code');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const templateCriteriaOptions = [
    { label: '전체조회', value: 'all' },
    { label: '유효쿠폰만 조회', value: 'non-expired' },
    { label: '만료쿠폰만 조회', value: 'expired' },
  ];

  const couponCriteriaOptions = [
    { label: '전체조회', value: 'all' },
    { label: '사용쿠폰만 조회', value: 'used' },
    { label: '미사용쿠폰만 조회', value: 'unused' },
  ];

  const fetchCoupons = useCallback(
    async (templateId) => {
      const response = await fetchCouponsByTemplateId(
        templateId,
        page,
        pageSize,
        criteria
      );
      setCoupons(response.data.items);
      setTotalRecords(response.data.total);
    },
    [page, pageSize, criteria]
  );

  useEffect(() => {
    if (selectedTemplate) {
      fetchCoupons(selectedTemplate);
    }
  }, [fetchCoupons, selectedTemplate]);

  const fetchCouponTemplates = useCallback(async () => {
    let response;
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      const [start, end] = dates;
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);

      response = await getCouponsByDateRange(
        startDate.toISOString(),
        endDate.toISOString(),
        page,
        pageSize
      );
    } else {
      response = await httpClient.get('/coupon-templates', {
        params: { page, size: pageSize, criteria },
      });
    }
    setTemplates(response.data.items);
    setTotalRecords(response.data.total);
  }, [page, pageSize, criteria, dates]);

  useEffect(() => {
    if (!selectedTemplate) {
      fetchCouponTemplates();
    }
  }, [fetchCouponTemplates, selectedTemplate]);

  const handlePageChange = (e) => {
    setPage(e.page + 1);
    setPageSize(e.rows);
    resetSearchTerm();
  };

  const handleTemplateSearch = async () => {
    if (searchTerm.trim() === '') {
      fetchCouponTemplates();
      return;
    }

    const response = await getCouponsByName(searchTerm);
    if (response.data.length === 0) {
      alert('해당 쿠폰명이 존재하지 않습니다.');
    } else {
      setTemplates(response.data);
    }
  };

  const handleCouponSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await searchCoupons(
        selectedTemplate,
        searchCriteria,
        searchTerm,
        page,
        pageSize
      );
      if (response.data.items.length === 0) {
        alert('해당 검색어와 일치하는 쿠폰이 존재하지 않습니다.');
      } else {
        setCoupons(response.data.items);
        setTotalRecords(response.data.total);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        '쿠폰을 검색하는 중 오류가 발생했습니다.';
      alert(errorMessage);
      console.error('Error searching coupons:', error, errorMessage);
    }
  };

  const handleDateRangeChange = (e) => {
    setDates(e.value);
  };

  const handleTemplateDelete = async () => {
    if (selectedTemplateIds.length === 0) {
      alert('삭제하실 쿠폰을 선택해 주세요.');
      return;
    }

    if (window.confirm('정말 삭제하시겠습니까?')) {
      await Promise.all(
        selectedTemplateIds.map((id) => deleteCouponTemplate(id))
      );
      alert('쿠폰 템플릿이 삭제되었습니다.');

      if (selectedTemplate) {
        fetchCoupons(selectedTemplate);
      } else {
        fetchCouponTemplates();
      }
    }
  };

  const handleCouponDelete = async () => {
    if (selectedCouponIds.length === 0) {
      alert('삭제하실 쿠폰을 선택해 주세요.');
      return;
    }

    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteCoupons(selectedTemplate, selectedCouponIds);
      alert('쿠폰이 삭제되었습니다.');
      fetchCoupons(selectedTemplate);
    }
  };

  const handleTemplateCheckboxChange = (id) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCouponCheckboxChange = (id) => {
    setSelectedCouponIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllTemplateChange = () => {
    if (selectedTemplateIds.length === templates.length) {
      setSelectedTemplateIds([]);
    } else {
      setSelectedTemplateIds(templates.map((template) => template.id));
    }
  };

  const handleSelectAllCouponChange = () => {
    if (selectedCouponIds.length === coupons.length) {
      setSelectedCouponIds([]);
    } else {
      setSelectedCouponIds(coupons.map((coupon) => coupon.id));
    }
  };

  const handleTemplateClick = (template, event) => {
    if (event.target.type === 'checkbox') return;
    setSelectedTemplate(template.id);
    setTemplateName(template.coupon_name);
    resetSearchTerm();
  };

  const handleBackButtonClick = () => {
    setSelectedTemplate(null);
    setCoupons([]);
    setTemplateName('');
    resetSearchTerm();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatPoints = (points) => {
    return `${points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}P`;
  };

  const resetSearchTerm = usePageChange(() => setSearchTerm(''));

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
        {selectedTemplate ? (
          <>
            <ActionBar>
              <LeftActions>
                <SearchSection>
                  <select
                    value={searchCriteria}
                    onChange={(e) => setSearchCriteria(e.target.value)}
                  >
                    <option value='code'>쿠폰 코드</option>
                    <option value='username'>사용회원 이름</option>
                  </select>
                  <input
                    type='text'
                    placeholder='검색어를 입력해 주세요'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCouponSearch();
                      }
                    }}
                  />
                  <SearchButton onClick={handleCouponSearch}>검색</SearchButton>
                </SearchSection>
              </LeftActions>
              <MiddleActions>
                <span>쿠폰 명: {templateName}</span>
              </MiddleActions>
              <RightActions>
                <Dropdown
                  value={criteria}
                  options={couponCriteriaOptions}
                  onChange={(e) => setCriteria(e.value)}
                  placeholder='전체조회'
                />
                <ActionButton onClick={handleCouponDelete}>
                  쿠폰 삭제
                </ActionButton>
                <RefreshButton onClick={() => fetchCoupons(selectedTemplate)}>
                  <img src={refreshImage} alt='새로고침' />
                </RefreshButton>
              </RightActions>
            </ActionBar>
            <Table>
              <thead>
                <tr>
                  <th>
                    <input
                      type='checkbox'
                      checked={selectedCouponIds.length === coupons.length}
                      onChange={handleSelectAllCouponChange}
                    />
                  </th>
                  <th>번호</th>
                  <th>쿠폰 코드</th>
                  <th>쿠폰 사용여부</th>
                  <th>쿠폰 사용일</th>
                  <th>사용회원 이름</th>
                  <th>E-mail</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon, index) => (
                  <tr key={`${coupon.id}-${index}`}>
                    <td>
                      <input
                        type='checkbox'
                        checked={selectedCouponIds.includes(coupon.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCouponCheckboxChange(coupon.id);
                        }}
                      />
                    </td>
                    <td>{(page - 1) * pageSize + index + 1}</td>
                    <td>{coupon.code}</td>
                    <td>{coupon.is_used ? '사용' : '미사용'}</td>
                    <td>{coupon.used_at ? formatDate(coupon.used_at) : ''}</td>
                    <td>{coupon.username}</td>
                    <td>{coupon.email}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <PaginationBackBar>
              <BackButton onClick={handleBackButtonClick}>뒤로가기</BackButton>
              <Pagination>
                <Paginator
                  first={(page - 1) * pageSize}
                  rows={pageSize}
                  totalRecords={totalRecords}
                  rowsPerPageOptions={[10, 20, 30]}
                  onPageChange={handlePageChange}
                />
              </Pagination>
            </PaginationBackBar>
          </>
        ) : (
          <>
            <ActionBar>
              <SearchSection>
                <input
                  type='text'
                  placeholder='쿠폰명을 입력해 주세요'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTemplateSearch();
                    }
                  }}
                />
                <SearchButton onClick={handleTemplateSearch}>검색</SearchButton>
              </SearchSection>
              <RightActions>
                <Dropdown
                  value={criteria}
                  options={templateCriteriaOptions}
                  onChange={(e) => setCriteria(e.value)}
                  placeholder='전체조회'
                />
                <CalendarContainer>
                  <StyledCalendar
                    value={dates}
                    onChange={handleDateRangeChange}
                    selectionMode='range'
                    placeholder='쿠폰 발급기간 선택'
                    readOnlyInput
                    hideOnRangeSelection
                    dateFormat='yy-mm-dd'
                    showIcon
                    icon={() => <i className='pi pi-calendar' />} // Add icon here
                  />
                </CalendarContainer>
                <ActionButton onClick={handleTemplateDelete}>
                  쿠폰 삭제
                </ActionButton>
                <RefreshButton onClick={() => window.location.reload()}>
                  <img src={refreshImage} alt='새로고침' />
                </RefreshButton>
              </RightActions>
            </ActionBar>
            <Table>
              <thead>
                <tr>
                  <th>
                    <input
                      type='checkbox'
                      checked={selectedTemplateIds.length === templates.length}
                      onChange={handleSelectAllTemplateChange}
                    />
                  </th>
                  <th>쿠폰 명</th>
                  <th>쿠폰 발행 수량</th>
                  <th>쿠폰 포인트</th>
                  <th>쿠폰 발급일</th>
                  <th>쿠폰 유효기간(만료일)</th>
                  <th>쿠폰 발급인</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <CouponTemplateRow
                    key={template.id}
                    onClick={(e) => handleTemplateClick(template, e)}
                  >
                    <td>
                      <input
                        type='checkbox'
                        checked={selectedTemplateIds.includes(template.id)}
                        onChange={() =>
                          handleTemplateCheckboxChange(template.id)
                        }
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                      />
                    </td>
                    <td>{template.coupon_name}</td>
                    <td>{template.quantity}</td>
                    <td>{formatPoints(template.point)}</td>
                    <td>
                      {new Date(template.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {new Date(template.expiration_date).toLocaleDateString()}
                    </td>
                    <td>{template.username}</td>
                  </CouponTemplateRow>
                ))}
              </tbody>
            </Table>
            <PaginationBackBar>
              <Pagination>
                <Paginator
                  first={(page - 1) * pageSize}
                  rows={pageSize}
                  totalRecords={totalRecords}
                  rowsPerPageOptions={[10, 20, 30]}
                  onPageChange={handlePageChange}
                />
              </Pagination>
            </PaginationBackBar>
          </>
        )}
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
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 80%;
  margin: 0 auto;
`;

const SearchSection = styled.div`
  display: flex;
  align-items: center;

  select {
    margin-right: 10px;
    padding: 5px;
    width: 150px;
    height: 36px;
  }

  input {
    margin-right: 10px;
    padding: 5px;
    width: 200px;
    height: 36px; /* Adjust the height to match the button */
  }
`;

const SearchButton = styled.button`
  height: 36px; /* Adjust the height to match the input */
  padding: 0 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const LeftActions = styled.div`
  display: flex;
  align-items: center;
`;

const MiddleActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;

  span {
    font-weight: bold;
    font-size: 18px;
  }
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;

  .p-dropdown {
    width: 150px;
    margin-left: 10px;
    font-size: 8px; /* Adjust the font size for the placeholder */
  }

  .p-calendar {
    width: 350px; /* Adjust the width of the Calendar */
    margin-left: 10px;
    font-size: 8px; /* Adjust the font size for the placeholder */
  }

  button {
    margin-left: 10px;
    padding: 10px;
    height: 36px; /* Adjust the height to match the RefreshButton */
    background-color: white;
    color: #007bff;
    border: 1px solid #007bff;
    border-radius: 4px;
    cursor: pointer;
  }
`;

const CalendarContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 250px; /* Adjust the width to fit your requirement */
`;

const StyledCalendar = styled(Calendar)`
  width: 100%;
  margin-top: 5px;
  font-size: 14px;

  input::placeholder {
    font-size: 14px;
  }

  .p-inputtext {
    width: 100%; /* Full width */
  }

  .p-datepicker-trigger {
    position: absolute;
    top: 50%;
    right: 0; /* Remove right spacing */
    transform: translateY(-50%);
    cursor: pointer;
    color: #007bff; /* Match the button color */
    border: 1px solid #ced4da; /* Match the border color of StyledCalendar */
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

const PaginationBackBar = styled.div`
  display: flex;
  justify-content: space-between; /* Spread pagination and back button */
  align-items: center; /* Aligns the back button with pagination */
  width: 80%;
  margin: 0 auto;
  margin-top: 10px; /* Ensure it does not overlap with the table */
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
`;

const RefreshButton = styled.button`
  padding: 10px;
  height: 36px; /* Standard height for the button */
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  img {
    width: 20px;
    height: 18px;
  }
`;

const ActionButton = styled.button`
  height: 36px; /* Adjust the height to match the RefreshButton */
  padding: 0 10px;
  background-color: white;
  color: #007bff;
  border: 1px solid #007bff;
  border-radius: 4px;
  cursor: pointer;
`;

const BackButton = styled.button`
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const CouponTemplateRow = styled.tr`
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;
