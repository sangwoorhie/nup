import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const SubHeaders = ({ activeHeader, userType }) => {
  const navigate = useNavigate();

  const handleNavigation = (destination) => {
    if (
      destination === '/user-update' ||
      destination === '/password-change' ||
      destination === '/unregister' ||
      destination === '/corporate-update'
    ) {
      navigate('/verify-password', {
        state: { next: destination, userType },
      });
    } else {
      navigate(destination, { state: { userType } });
    }
  };

  const renderSubOptions = () => {
    if (activeHeader === 'User') {
      if (userType === 'corporate') {
        return [
          { label: '내 정보', path: '/user-profile' },
          { label: '사업자 정보', path: '/corporate-info' },
          { label: '내 정보 수정', path: '/user-update' },
          { label: '사업자 정보 수정', path: '/corporate-update' },
          { label: '비밀번호 변경', path: '/password-change' },
          { label: 'API Key', path: '/api-key' },
          { label: '회원 탈퇴', path: '/unregister' },
        ];
      } else {
        return [
          { label: '내 정보', path: '/user-profile' },
          { label: '정보 수정', path: '/user-update' },
          { label: '비밀번호 변경', path: '/password-change' },
          { label: 'API Key', path: '/api-key' },
          { label: '회원 탈퇴', path: '/unregister' },
        ];
      }
    } else if (activeHeader === 'AI 모델') {
      return [
        { label: '파일 입력', path: '/file-input' },
        { label: '나의 주문함', path: '/my-orders' },
        { label: '분석 결과', path: '/analysis-results' },
      ];
    } else if (activeHeader === 'MY 포인트') {
      return [
        { label: '포인트 충전', path: '/point-charge' },
        { label: '충전 내역', path: '/charge-history' },
        { label: '사용 내역', path: '/usage-history' },
        { label: '쿠폰 등록', path: '/coupon-register' },
        { label: 'MY 쿠폰', path: '/my-coupons' },
        { label: '환불 내역', path: '/refund-history' },
      ];
    } else if (userType === 'admin') {
      if (activeHeader === '계정 관리') {
        return [
          { label: '개인 회원', path: '/individual-members' },
          { label: '사업자 회원', path: '/corporate-members' },
          { label: '관리자 회원', path: '/admin-members' },
          { label: 'API Key 조회', path: '/api-key-view' },
        ];
      } else if (activeHeader === '결제 관리') {
        return [
          { label: '개인 회원', path: '/individual-payments' },
          { label: '사업자 회원', path: '/corporate-payments' },
          { label: '환불 처리', path: '/refund-process' },
        ];
      } else if (activeHeader === '쿠폰 관리') {
        return [
          { label: '쿠폰 발행', path: '/coupon-issue' },
          { label: '쿠폰 조회', path: '/coupon-view' },
          { label: '폐기 쿠폰 관리', path: '/discarded-coupons' },
        ];
      } else if (activeHeader === 'AI모델 관리') {
        return [
          { label: 'Stable 모델', path: '/stable-models' },
          { label: 'Nightly 모델', path: '/nightly-models' },
        ];
      }
    }
    return [];
  };

  const subOptions = renderSubOptions();

  return (
    <Container>
      {subOptions.map((option) => (
        <SubOption
          key={option.label}
          onClick={() => handleNavigation(option.path)}
        >
          {option.label}
        </SubOption>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  background-color: #f1f1f1;
  padding: 10px 0;
`;

const SubOption = styled.div`
  margin: 0 20px;
  cursor: pointer;
  padding: 5px 10px;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export default SubHeaders;
