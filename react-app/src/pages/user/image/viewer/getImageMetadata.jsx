import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from 'primereact/sidebar';
import styled from 'styled-components';
import { fetchImageMetadata } from '../../../../services/userServices';

const MetadataContainer = ({ viewer, imageId, isVisible, onHide }) => {
  const [imageMetadata, setImageMetadata] = useState(null);

  const fetchMetadata = useCallback(async () => {
    if (viewer && imageId && isVisible && !imageMetadata) {
      try {
        const metadata = await fetchImageMetadata(imageId);
        setImageMetadata(metadata);
      } catch (error) {
        console.error('Failed to fetch image metadata:', error);
      }
    }
  }, [viewer, imageId, isVisible, imageMetadata]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return (
    <Sidebar visible={isVisible} position='right' onHide={onHide}>
      <h2>Image Metadata</h2>
      {imageMetadata ? (
        <StyledMetadataContainer>
          <ul>
            <li>Format: {imageMetadata.format}</li>
            <li>Width: {imageMetadata.width}px</li>
            <li>Height: {imageMetadata.height}px</li>
            <li>Focal Length: {imageMetadata.focalLength}mm</li>
            <li>Focal Length (35mm): {imageMetadata.focalLength35mm}mm</li>
            <li>Sensor Width: {imageMetadata.sensorWidth}mm</li>
            <li>Sensor Height: {imageMetadata.sensorHeight}mm</li>
          </ul>
        </StyledMetadataContainer>
      ) : (
        <p>Loading metadata...</p>
      )}
    </Sidebar>
  );
};

const StyledMetadataContainer = styled.div`
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

export default MetadataContainer;
