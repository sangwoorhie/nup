import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'primereact/button';
import MetadataContainer from './getImageMetadata';

const ViewerTools = ({ viewer, imageId }) => {
  const [isDamageVisible, setIsDamageVisible] = useState(true);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [isMetaVisible, setIsMetaVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const toggleDamageVisibility = () => {
    setIsDamageVisible(!isDamageVisible);
  };

  const toggleImageVisibility = () => {
    setIsImageVisible(!isImageVisible);
    if (viewer) {
      viewer.world.getItemAt(0).setOpacity(isImageVisible ? 0 : 1);
    }
  };

  const toggleMetaVisibility = () => {
    setIsMetaVisible(!isMetaVisible);
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const toggleMeasure = () => {
    setIsMeasuring(!isMeasuring);
  };

  return (
    <ToolsContainer>
      <Button
        icon={`pi ${isDamageVisible ? 'pi-eye' : 'pi-eye-slash'}`}
        onClick={toggleDamageVisibility}
        tooltip='손상 표시'
      />
      <Button
        icon={`pi ${isImageVisible ? 'pi-image' : 'pi-file'}`}
        onClick={toggleImageVisibility}
        tooltip='이미지 표시'
      />
      <Button
        icon={`pi ${isMetaVisible ? 'pi-info-circle' : 'pi-info'}`}
        onClick={toggleMetaVisibility}
        tooltip='메타 데이터 표시'
      />
      <MetadataContainer
        viewer={viewer}
        imageId={imageId}
        isVisible={isMetaVisible}
        onHide={() => setIsMetaVisible(false)}
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
