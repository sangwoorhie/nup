import React, { useState } from 'react';
import styled from 'styled-components';
import MainHeader from '../../components/etc/ui/MainHeader';
import SubHeaders from '../../components/etc/ui/SubHeaders';
import Footer from '../../components/etc/ui/Footer';
import { sendChargeEmail } from '../../services/userServices';

const PointChargePage = () => {
  const [amount, setAmount] = useState('');
  const [chargeType, setChargeType] = useState('CASH');
  const [step, setStep] = useState(1);
  const [accountHolderName, setAccountHolderName] = useState('');
  const [activeHeader, setActiveHeader] = useState('MY 포인트');

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    if (!isNaN(value) && Number(value) >= 0) {
      setAmount(Number(value).toLocaleString());
    }
  };

  const handleButtonClick = (increment) => {
    const value = amount.replace(/,/g, '');
    const newValue = Number(value) + increment;
    setAmount(newValue.toLocaleString());
  };

  const handleChargeClick = () => {
    const value = Number(amount.replace(/,/g, ''));
    if (value < 10000 || value % 10000 !== 0) {
      alert(
        '충전할 수 있는 최소 금액은 10,000원 이며, 10,000원 단위로만 충전이 가능합니다.'
      );
    } else if (chargeType === 'CASH') {
      setStep(2);
    }
  };

  const handleSendEmail = async () => {
    try {
      const data = await sendChargeEmail(
        Number(amount.replace(/,/g, '')),
        accountHolderName
      );
      alert(data.message);
    } catch (error) {
      alert(error.message);
      console.error('Failed to send email:', error);
    }
  };

  return (
    <Container>
      <MainHeader setActiveHeader={setActiveHeader} userType='individual' />
      <SubHeaders activeHeader={activeHeader} userType='individual' />
      <Content>
        {step === 1 ? (
          <Step>
            <Title>KO-MAPPER AI 로 충전 하기</Title>
            <InputArea>
              <input
                type='text'
                value={amount}
                onChange={handleAmountChange}
                placeholder='충전할 금액을 입력해 주세요'
              />
            </InputArea>
            <ButtonsArea>
              {[10000, 50000, 100000, 1000000].map((increment) => (
                <button
                  key={increment}
                  onClick={() => handleButtonClick(increment)}
                >
                  +{(increment / 10000).toLocaleString()}만
                </button>
              ))}
            </ButtonsArea>
            <RadioArea>
              <RadioButton>
                <input
                  type='radio'
                  checked={chargeType === 'CASH'}
                  onChange={() => setChargeType('CASH')}
                />
                현금 충전
              </RadioButton>
              <RadioButton>
                <input
                  type='radio'
                  checked={chargeType === 'CARD'}
                  onChange={() => setChargeType('CARD')}
                />
                카드 충전
              </RadioButton>
              <RadioButton>
                <input
                  type='radio'
                  checked={chargeType === 'PAYPAL'}
                  onChange={() => setChargeType('PAYPAL')}
                />
                Pay-pal 충전
              </RadioButton>
            </RadioArea>
            <SmallComment>
              *쿠폰으로 포인트 충전은 MY 쿠폰에서 가능합니다.
            </SmallComment>
            <br />
            <ChargeButton onClick={handleChargeClick}>충전하기</ChargeButton>
          </Step>
        ) : (
          <Step>
            <Title>현금 충전 안내</Title>
            <AmountDisplay>충전 금액: {amount}원</AmountDisplay>
            <InputArea>
              <label>입금자 명 (개인이름/회사이름)</label>
              <input
                type='text'
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder='입금자 명을 입력하세요'
              />
            </InputArea>

            <DepositInfo>
              <p>
                입금자 정보는 정확한 입금 정보 확인을 위한 용도로 사용되오니,
                정확히 기입해 주세요.
              </p>
              <p>
                이메일 발송 버튼을 누르면 고객님의 이메일로 KO-MAPPER AI 전용
                입금계좌 정보가 전송되오며, 위의 충전 금액을 입금해주시면
                됩니다.
              </p>
              <p>
                개인 회원의 경우 현금영수증이 자동 발급되며, 사업자 회원의 경우
                세금계산서가 자동 발급됩니다.
              </p>
              <p>
                입금 확인 후 영업일 기준 최대 1-2일 이내에 포인트가 적립됩니다.
              </p>
              <p>이메일에 기재된 입금 기한에 맞추어 입금 부탁드립니다.</p>
              <p>
                이메일 발송 버튼 클릭 후, 약간의 시간이 소요되오니 기다려
                주세요.
              </p>
              <p>감사합니다.</p>
              <br />
            </DepositInfo>
            <ActionButtons>
              <button onClick={() => setStep(1)}>취소 (뒤로가기)</button>
              <button onClick={handleSendEmail}>이메일 발송</button>
            </ActionButtons>
          </Step>
        )}
      </Content>
      <Footer />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: white;
`;

const Step = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 40px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
`;

const InputArea = styled.div`
  width: 100%;
  margin-bottom: 20px;
  input {
    width: 100%;
    padding: 15px;
    border: none;
    border-bottom: 2px solid #ccc;
    text-align: right;
    font-size: 24px;
  }
`;

const ButtonsArea = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
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

const RadioArea = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 10px;
`;

const RadioButton = styled.label`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
  font-size: 18px;
  input {
    margin-right: 10px;
  }
`;

const SmallComment = styled.p`
  font-size: 12px;
  color: #888;
  text-align: right;
  margin-bottom: 20px;
`;

const ChargeButton = styled.button`
  width: 100%;
  padding: 15px 0;
  font-size: 18px;
  background: #0056b3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #004494;
  }
`;

const AmountDisplay = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
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

const DepositInfo = styled.div`
  font-size: 16px;
  color: #555;
  p {
    margin-bottom: 10px;
  }
`;

export default PointChargePage;
