// src/components/layout/SubHeaders.jsx
import React from 'react';
import styled from 'styled-components';

const SubHeaders = ({ activeHeader }) => {
  const renderSubOptions = () => {
    switch (activeHeader) {
      case 'AI 모델':
        return ['파일입력', '나의 주문함', '분석 결과'];
      case 'MY 포인트':
        return [
          '포인트 충전',
          '충전 내역',
          '사용 내역',
          '쿠폰 등록',
          'MY 쿠폰',
          '환불 내역',
        ];
      case 'User':
        return [
          '내 정보',
          '정보 수정',
          '비밀번호 변경',
          'API Key',
          '회원 탈퇴',
        ];
      default:
        return [];
    }
  };

  return (
    <Container>
      {renderSubOptions().map((option) => (
        <SubOption key={option}>{option}</SubOption>
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
`;

export default SubHeaders;
