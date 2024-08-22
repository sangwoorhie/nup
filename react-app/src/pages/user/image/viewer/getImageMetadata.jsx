import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'primereact/button';
import { fetchImageMetadata } from '../../../../services/userServices'; // Add this import

const ViewerTools = ({ viewer }) => {
  const [isMetaVisible, setIsMetaVisible] = useState(false);
  const [imageMetadata, setImageMetadata] = useState(null); // Add this state

  const toggleMetaVisibility = async () => {
    setIsMetaVisible(!isMetaVisible);
    if (!isMetaVisible && viewer) {
      try {
        const imageId = viewer?.world?.getItemAt(0)?.source?.imageId; // Replace with the correct way to get imageId
        if (imageId) {
          const metadata = await fetchImageMetadata(imageId);
          setImageMetadata(metadata);
        }
      } catch (error) {
        console.error('Failed to fetch image metadata:', error);
      }
    }
  };

  return (
    <ToolsContainer>
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
