import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'primereact/button';
import { fetchImageMetadata } from '../../../../services/userServices'; // Import your service

const ViewerTools = ({ viewer, imageId }) => {
  // Accept imageId as a prop
  const [isDamageVisible, setIsDamageVisible] = useState(true);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [isMetaVisible, setIsMetaVisible] = useState(false);
  const [imageMetadata, setImageMetadata] = useState(null); // New state for storing metadata
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

  const toggleMetaVisibility = async () => {
    setIsMetaVisible(!isMetaVisible);
    if (!isMetaVisible && viewer && imageId) {
      // Check if imageId is available
      try {
        const metadata = await fetchImageMetadata(imageId);
        setImageMetadata(metadata);
        console.log('Fetched metadata:', metadata); // Debugging: Log the metadata
      } catch (error) {
        console.error('Failed to fetch image metadata:', error);
      }
    } else {
      console.error('Image ID not found.');
    }
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
      {isMetaVisible && imageMetadata && (
        <MetadataContainer>
          <h4>Image Metadata</h4>
          <ul>
            <li>Format: {imageMetadata.format}</li>
            <li>Width: {imageMetadata.width}px</li>
            <li>Height: {imageMetadata.height}px</li>
            <li>Focal Length: {imageMetadata.focalLength}mm</li>
            <li>Focal Length (35mm): {imageMetadata.focalLength35mm}mm</li>
            <li>Sensor Width: {imageMetadata.sensorWidth}mm</li>
            <li>Sensor Height: {imageMetadata.sensorHeight}mm</li>
          </ul>
        </MetadataContainer>
      )}
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

const MetadataContainer = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 5px;
  ul {
    list-style-type: none;
    padding: 0;
    li {
      margin-bottom: 5px;
    }
  }
`;

export default ViewerTools;
