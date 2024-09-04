import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import Footer from '../../../components/etc/ui/Footer';
import {
  getCostingSettings,
  setCostingLogic,
} from '../../../services/adminService';
import { ProgressSpinner } from 'primereact/progressspinner';

const CostSetting = ({ isDarkMode, toggleDarkMode }) => {
  const [dividingNumber, setDividingNumber] = useState(100);
  const [cuttingOffValue, setCuttingOffValue] = useState(1000);
  const [newDividingNumber, setNewDividingNumber] = useState(dividingNumber);
  const [newCuttingOffValue, setNewCuttingOffValue] = useState(cuttingOffValue);
  const [activeHeader, setActiveHeader] = useState('결제 관리');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCostingSettings = async () => {
      try {
        setLoading(true);
        const response = await getCostingSettings();
        setDividingNumber(response.dividingNumber);
        setCuttingOffValue(response.cuttingOffValue);
        setNewDividingNumber(response.dividingNumber);
        setNewCuttingOffValue(response.cuttingOffValue);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching costing settings:', error);
        setLoading(false);
      }
    };

    fetchCostingSettings();
  }, []);

  const handleCostSettingChange = async () => {
    const confirmationMessage = `변경 배율 : ${newDividingNumber}, 변경 절사 단위 : ${newCuttingOffValue}P 로 변경하시겠습니까?`;
    if (window.confirm(confirmationMessage)) {
      try {
        setLoading(true);
        await setCostingLogic({
          dividingNumber: newDividingNumber,
          cuttingOffValue: newCuttingOffValue,
        });
        setDividingNumber(newDividingNumber);
        setCuttingOffValue(newCuttingOffValue);
        setLoading(false);
        alert('가격 설정 로직이 성공적으로 변경되었습니다.');
      } catch (error) {
        console.error('Error setting costing logic:', error);
        setLoading(false);
        const errorMessage = error.response?.data?.message || error.message;
        alert(errorMessage);
      }
    }
  };

  const handleCancelClick = () => {
    alert('취소되었습니다.');
    window.location.reload();
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Container>
      <MainHeader
        setActiveHeader={setActiveHeader}
        userType='admin'
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
      />
      <SubHeaders
        activeHeader={activeHeader}
        userType='admin'
        activeMainOption='가격 설정'
      />
      <Header>
        <h2>포인트 가격 설정</h2>
      </Header>
      <Content isDarkMode={isDarkMode}>
        {loading && (
          <LoadingOverlay>
            <SpinnerContainer>
              <ProgressSpinner />
            </SpinnerContainer>
          </LoadingOverlay>
        )}
        <ContentWrapper isDarkMode={isDarkMode}>
          <Title isDarkMode={isDarkMode}>로직 변경</Title>
          <Explanation isDarkMode={isDarkMode}>
            이미지 파일의 장당 포인트 가격 설정 로직은 다음과 같은 방식으로
            이루어집니다. 이미지 파일의 가격이 너무 높거나 너무 낮은 경우, 가격
            설정에서 배율 또는 절사 단위를 변경함으로써 조절할 수 있습니다.
            하지만 절사 단위가 배율 계산된 값보다 크게 설정될 수는 없으며, 가격
            설정 변경으로 인해 단일 이미지 파일의 최종 금액이 0포인트 이하로
            설정될 수는 없습니다.
          </Explanation>
          <CalculationLogic isDarkMode={isDarkMode}>
            <Logic isDarkMode={isDarkMode}>
              <strong>사진 가로길이</strong> x <strong>세로길이(pixel)</strong>{' '}
              ÷ <strong>배율</strong> = <strong>결과값</strong> -{' '}
              <strong>절사 단위 </strong> = <strong>최종 금액</strong>
            </Logic>
            <br />
            <p>
              - 배율은 100의 단위로 100이상, 10000이하만 가능합니다. (100, 200,
              300, ... 10000)
            </p>
            <p>
              - 배율로 나눈 값이 소수점으로 나오는 경우에는 소수점 버림 처리
              합니다.
            </p>
            <p>
              - 절사 단위는 100, 1,000, 10,000, 100,000P 단위로만 절사
              가능합니다.
            </p>
            <br />
            <p>
              예1 ) 배율이 10, 절사 단위가 100P인 경우.
              <br />
              사진 A = 247x342(pixel) ÷ 10(배율) = 8,447 - 100P 미만 절사 =
              8,400P
              <br />
              사진 B = 757x310(pixel) ÷ 10(배율) = 23,467 - 100P 미만 절사 =
              23,400P
            </p>
            <br />
            <p>
              예2 ) 배율이 100, 절사 단위가 1,000P인 경우.
              <br />
              사진 C = 1920x1080(pixel) ÷ 100(배율) = 20,736 - 1,000P 미만 절사
              = 20,000P
              <br />
              사진 D = 3840x2160(pixel) ÷ 100(배율) = 82,944 - 1,000P 미만 절사
              = 82,000P
            </p>
            <br />
            <p>
              예3 ) 배율이 1000, 절사 단위가 10,000P인 경우.
              <br />
              사진 E = 8000x6000(pixel) ÷ 1000(배율) = 48,000 - 10,000P 미만
              절사 = 40,000P
              <br />
              사진 F = 7000x3000(pixel) ÷ 1000(배율) = 21,000 - 10,000P 미만
              절사 = 20,000P
            </p>
          </CalculationLogic>
          <FormGroup>
            <Label isDarkMode={isDarkMode}>현재 배율</Label>
            <Input
              type='text'
              value={formatNumber(dividingNumber)}
              readOnly
              isDarkMode={isDarkMode}
            />
            <Label isDarkMode={isDarkMode}>현재 절사 단위</Label>
            <Input
              type='text'
              value={formatNumber(cuttingOffValue)}
              readOnly
              isDarkMode={isDarkMode}
            />
          </FormGroup>
          <FormGroup>
            <Label isDarkMode={isDarkMode}>변경 배율</Label>
            <Input
              type='number'
              value={newDividingNumber}
              onChange={(e) =>
                setNewDividingNumber(
                  Math.max(
                    100,
                    Math.min(
                      10000,
                      Math.floor(Number(e.target.value) / 100) * 100
                    )
                  )
                )
              }
              step={100}
              min={100}
              max={10000}
              isDarkMode={isDarkMode}
            />
            <Label isDarkMode={isDarkMode}>변경 절사 단위</Label>
            <Select
              value={newCuttingOffValue}
              onChange={(e) => setNewCuttingOffValue(Number(e.target.value))}
              isDarkMode={isDarkMode}
            >
              <option value={100}>100</option>
              <option value={1000}>1,000</option>
              <option value={10000}>10,000</option>
              <option value={100000}>100,000</option>
            </Select>
          </FormGroup>
          <ButtonWrapper>
            <CancelButton onClick={handleCancelClick}>취소</CancelButton>
            <ConfirmButton onClick={handleCostSettingChange}>
              가격 설정
            </ConfirmButton>
          </ButtonWrapper>
        </ContentWrapper>
      </Content>
      <Footer />
    </Container>
  );
};

export default CostSetting;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.75);
  z-index: 9999;
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContentWrapper = styled.div`
  padding: 20px;
  margin-top: 10px;
  width: 60%;
  margin: 0 auto;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? '#000' : '#fff'}; // Set background to black in dark mode
  border: 1px solid #ddd;
  border-radius: 8px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#fff' : '#333'}; // Set text color to white in dark mode
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#fff' : '#333'}; // Adjust title color in dark mode
`;

const Explanation = styled.p`
  margin-bottom: 20px;
  margin-top: 60px;
  font-size: 16px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#fff' : '#333'}; // Adjust explanation text color in dark mode
  line-height: 1.5;
`;

const CalculationLogic = styled.div`
  background-color: ${({ isDarkMode }) =>
    isDarkMode
      ? '#333'
      : '#f9f9f9'}; // Darker background for calculation logic in dark mode
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 40px;
  margin-bottom: 40px;
  p {
    margin: 0;
    font-size: 16px;
    color: ${({ isDarkMode }) =>
      isDarkMode ? '#fff' : '#333'}; // Adjust paragraph text color in dark mode
    line-height: 1.5;
  }
  strong {
    font-weight: bold;
    color: ${({ isDarkMode }) =>
      isDarkMode ? '#fff' : '#333'}; // Ensure strong text is white in dark mode
  }
  span {
    color: ${({ isDarkMode }) =>
      isDarkMode
        ? '#fff'
        : '#333'}; // Ensure span elements are also white in dark mode
  }
`;

const FormGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center; // Align items vertically centered
  margin-bottom: 20px;
  gap: 10px; // Adjust gap as needed for spacing between Label and Input
`;

const Label = styled.label`
  flex-shrink: 0;
  width: 150px;
  font-size: 14px;
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#fff' : '#333'}; // Adjust label color in dark mode
  text-align: right;
  margin-right: 10px;
`;

const Input = styled.input`
  width: 500px;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? '#555' : '#f9f9f9'}; // Darker input background in dark mode
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#fff' : '#000'}; // Adjust input text color in dark mode
  &:read-only {
    background-color: ${({ isDarkMode }) =>
      isDarkMode
        ? '#444'
        : '#e9ecef'}; // Darker read-only input background in dark mode
    color: ${({ isDarkMode }) =>
      isDarkMode
        ? '#ccc'
        : '#6c757d'}; // Adjust read-only text color in dark mode
  }
`;

const Select = styled.select`
  width: 500px;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: ${({ isDarkMode }) =>
    isDarkMode ? '#555' : '#f9f9f9'}; // Darker select background in dark mode
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#fff' : '#000'}; // Adjust select text color in dark mode
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
  margin-top: 100px;
  button {
    flex: 1;
    margin: 0 10px;
    padding: 15px 0;
    font-size: 18px;
    border: 1px solid #ccc;
    background: #f5f5f5;
    cursor: pointer;
    &:hover {
      background: #e0e0e0;
    }
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  color: #333;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  color: black;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
`;

const Logic = styled.div`
  font-size: 18px;
  margin-bottom: 20px;
  text-decoration: underline;
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#fff' : '#0056b3'}; // Ensure text color is white in dark mode

  strong {
    color: ${({ isDarkMode }) =>
      isDarkMode
        ? '#fff'
        : '#0056b3'}; // Ensure strong tags also have white color in dark mode
    font-weight: bold;
  }
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
