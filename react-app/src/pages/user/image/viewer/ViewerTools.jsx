import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'primereact/button';

const ViewerTools = ({ viewer }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const toggleDamageVisibility = () => {
    setIsVisible(!isVisible);
    // Implement damage visibility toggle logic here
  };

  const toggleImageVisibility = () => {
    setIsImageVisible(!isImageVisible);
    if (viewer) {
      viewer.world.getItemAt(0).setOpacity(isImageVisible ? 0 : 1);
    }
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
    // Implement filter visibility toggle logic here
  };

  const toggleMeasure = () => {
    setIsMeasuring(!isMeasuring);
    // Implement measure toggle logic here
  };

  return (
    <ToolsContainer>
      <Button
        icon={`pi ${isVisible ? 'pi-eye' : 'pi-eye-slash'}`}
        onClick={toggleDamageVisibility}
        tooltip='손상 표시'
      />
      <Button
        icon={`pi ${isImageVisible ? 'pi-image' : 'pi-file'}`}
        onClick={toggleImageVisibility}
        tooltip='이미지 표시'
      />
      <Button
        icon={`pi ${isFilterVisible ? 'pi-filter-fill' : 'pi-filter'}`}
        onClick={toggleFilterVisibility}
        tooltip='필터 표시'
      />
      <Button
        icon={`pi ${isMeasuring ? 'pi-ruler' : 'pi-arrows-h'}`}
        onClick={toggleMeasure}
        tooltip='측정'
      />
    </ToolsContainer>
  );
};

const ToolsContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export default ViewerTools;
