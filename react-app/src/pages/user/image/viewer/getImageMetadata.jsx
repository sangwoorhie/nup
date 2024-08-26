import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from 'primereact/sidebar';
import styled from 'styled-components';
import {
  fetchImageMetadata,
  modifyImageMetadata,
  modifyAllImagesMetadata,
} from '../../../../services/userServices'; // Import the necessary services
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { ProgressSpinner } from 'primereact/progressspinner'; // Import the ProgressSpinner

const MetadataContainer = ({ viewer, imageId, isVisible, onHide }) => {
  const [imageMetadata, setImageMetadata] = useState(null);
  const [distance, setDistance] = useState(0); // For storing 촬영거리 value
  const [gsd, setGsd] = useState(''); // For storing GSD value
  const [isGsdEditable, setIsGsdEditable] = useState(false); // For checkbox state
  const [loading, setLoading] = useState(true); // State to manage loading

  const fetchMetadata = useCallback(async () => {
    if (viewer && imageId && isVisible && !imageMetadata) {
      try {
        setLoading(true); // Set loading to true before fetching
        const metadata = await fetchImageMetadata(imageId);
        setImageMetadata(metadata);
        setDistance(metadata.altitudeUsed || 0);
        setGsd(metadata.gsd || '');
      } catch (error) {
        console.error('Failed to fetch image metadata:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    }
  }, [viewer, imageId, isVisible, imageMetadata]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const handleApply = async () => {
    const confirmApply = window.confirm(
      '변경사항을 해당 사진에 적용하시겠습니까?'
    );
    if (confirmApply) {
      try {
        await modifyImageMetadata(imageId, { gsd, altitudeUsed: distance });
        alert('변경사항이 성공적으로 적용되었습니다.');
      } catch (error) {
        console.error('Failed to apply changes:', error);
        alert('변경사항을 적용하는 중 오류가 발생했습니다.');
      }
    }
  };

  const handleApplyAll = async () => {
    const confirmApplyAll = window.confirm(
      '변경사항을 전체 사진에 적용하시겠습니까?'
    );
    if (confirmApplyAll) {
      try {
        await modifyAllImagesMetadata({ gsd, altitudeUsed: distance });
        alert('모든 이미지에 변경사항이 성공적으로 적용되었습니다.');
      } catch (error) {
        console.error('Failed to apply changes to all images:', error);
        alert('모든 이미지에 변경사항을 적용하는 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Sidebar visible={isVisible} position='right' onHide={onHide}>
      <SidebarTitle>이미지 상세정보</SidebarTitle>
      <Divider />
      {loading ? ( // Show the spinner while loading
        <LoadingContainer>
          <ProgressSpinner />
        </LoadingContainer>
      ) : (
        imageMetadata && (
          <StyledMetadataContainer>
            <h3>이미지 메타정보</h3>
            <ul>
              <li>
                <span className='title'>Type</span>
                <span className='value'>
                  {imageMetadata.format.toUpperCase()}
                </span>
              </li>
              <li>
                <span className='title'>pixelXDimension</span>
                <span className='value'>{imageMetadata.width}px</span>
              </li>
              <li>
                <span className='title'>pixelYDimension</span>
                <span className='value'>{imageMetadata.height}px</span>
              </li>
              <li>
                <span className='title'>
                  focalLength <StyledRedAsterisk>*</StyledRedAsterisk>
                </span>
                <span className='value'>{imageMetadata.focalLength}mm</span>
              </li>
              <li>
                <span className='title'>
                  focalLength35mm <StyledRedAsterisk>*</StyledRedAsterisk>
                </span>
                <span className='value'>{imageMetadata.focalLength35mm}mm</span>
              </li>
              <li>
                <span className='title'>sensorWidth</span>
                <span className='value'>{imageMetadata.sensorWidth}mm</span>
              </li>
              <li>
                <span className='title'>sensorHeight</span>
                <span className='value'>{imageMetadata.sensorHeight}mm</span>
              </li>
            </ul>
            <Divider />
            <StyledAnalysisSection>
              <br />
              <div className='analysis-header'>
                <h3>수치 해석</h3>
                <div className='buttons'>
                  <Button
                    label='적용'
                    className='p-button-sm'
                    onClick={handleApply}
                  />{' '}
                  {/* Apply button */}
                  <Button
                    label='일괄적용'
                    className='p-button-sm'
                    onClick={handleApplyAll}
                  />{' '}
                  {/* Apply All button */}
                </div>
              </div>
              <ul>
                <li>
                  <span className='title'>촬영거리(m)</span>
                  <InputText
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className='value input-narrow'
                  />
                </li>
                <li>
                  <span className='title'>GSD(cm/px)</span>
                  {isGsdEditable ? (
                    <InputText
                      value={gsd}
                      onChange={(e) => setGsd(e.target.value)}
                      className='value input-narrow'
                    />
                  ) : (
                    <span className='value'>{gsd || '-'}</span>
                  )}
                </li>
                <li>
                  <span className='title'>GSD 수치 직접 입력</span>
                  <Checkbox
                    checked={isGsdEditable}
                    onChange={(e) => setIsGsdEditable(e.checked)}
                    inputId='gsdEditable'
                  />
                </li>
              </ul>
            </StyledAnalysisSection>
          </StyledMetadataContainer>
        )
      )}
    </Sidebar>
  );
};

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const StyledMetadataContainer = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 5px;

  h3 {
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: bold;
  }

  ul {
    list-style-type: none;
    padding: 0;
    li {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      font-size: 14px;
      color: #333;
      align-items: center;
    }
    .title {
      font-weight: bold;
      text-align: left;
    }
    .value {
      text-align: right;
      padding-left: 20px;
    }
    .input-narrow {
      width: 80px; /* Narrower width for input fields */
    }
  }
`;

const StyledAnalysisSection = styled.div`
  margin-top: 10px;

  .analysis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;

    h3 {
      margin: 0;
      font-size: 16px;
    }

    .buttons {
      display: flex;
      gap: 10px;

      .p-button-sm {
        padding: 0.25rem 1rem;
        font-size: 12px;
      }
    }
  }

  ul {
    margin-top: 10px;
  }
`;
const StyledRedAsterisk = styled.span`
  color: red;
`;

const SidebarTitle = styled.h2`
  margin-bottom: 20px;
`;

export default MetadataContainer;
