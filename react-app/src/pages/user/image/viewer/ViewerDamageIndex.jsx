import React, { useState } from 'react';
import styled from 'styled-components';
import { Checkbox } from 'primereact/checkbox';

const ViewerDamageIndex = ({ isDarkMode }) => {
  const [damageTypes, setDamageTypes] = useState([
    { name: '균열', key: 'crack', checked: true },
    { name: '박리·박락', key: 'spalling', checked: true },
    { name: '철근노출', key: 'rebar', checked: true },
    { name: '백태', key: 'efflorescence', checked: true },
  ]);

  const onDamageTypeChange = (e) => {
    let _damageTypes = damageTypes.map((type) =>
      type.key === e.value.key ? { ...type, checked: e.checked } : type
    );
    setDamageTypes(_damageTypes);
    // Here you would implement logic to show/hide damage types on the image
  };

  return (
    <DamageIndexContainer>
      {damageTypes.map((type) => (
        <DamageTypeItem key={type.key} isDarkMode={isDarkMode}>
          <Checkbox
            inputId={type.key}
            name='damage'
            value={type}
            onChange={onDamageTypeChange}
            checked={type.checked}
          />
          <label htmlFor={type.key}>{type.name}</label>
        </DamageTypeItem>
      ))}
    </DamageIndexContainer>
  );
};

const DamageIndexContainer = styled.div`
  position: absolute;
  left: 50px;
  bottom: 20px; /* Moved from top to bottom */
  /* background-color: rgba(255, 255, 255, 0.8); */
  padding: 10px;
  border-radius: 5px;
`;

const DamageTypeItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;

  label {
    margin-left: 5px;
    color: ${({ isDarkMode }) =>
      isDarkMode ? '#000' : '#000'}; /* Always black */
  }
`;

export default ViewerDamageIndex;
