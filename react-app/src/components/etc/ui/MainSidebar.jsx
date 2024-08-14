import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import styled from 'styled-components';
import refreshIcon from '../../../assets/img/refresh_icon.png';
import AnalyzeModal from '../modals/AnalyzeModal';

const MainSidebar = ({
  visible,
  onHide,
  totalImages,
  selectedImages = [],
  onFileSelect,
  onDeleteSelected,
  images,
  onImageSelection,
  totalCost,
  point, // Ensure point is received here
  setSelectedImages,
  onRefresh,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allImageIds = images.map((image) => image.id);
      setSelectedImages(allImageIds);
    } else {
      setSelectedImages([]);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleAnalyzeClick = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Sidebar
        visible={visible}
        onHide={onHide}
        className='w-full md:w-20rem lg:w-30rem'
        modal={false}
        position='left'
        baseZIndex={1000}
        showCloseIcon={false}
      >
        <SidebarContent>
          <SidebarTitle>파일 입력</SidebarTitle>

          <ControlsRow>
            <FileListLabel>파일 목록</FileListLabel>
            <ButtonGroup>
              <SidebarButton
                onClick={() => document.getElementById('fileInput').click()}
              >
                파일 추가
              </SidebarButton>
              <SidebarButton onClick={onDeleteSelected}>
                선택 삭제
              </SidebarButton>
              <RefreshButton onClick={handleRefresh}>
                <img src={refreshIcon} alt='새로고침' />
              </RefreshButton>
            </ButtonGroup>
          </ControlsRow>

          <CheckboxRow>
            <input
              type='checkbox'
              onChange={handleSelectAll}
              checked={
                images.length > 0 && selectedImages.length === images.length
              }
            />
            <SelectText>Select {selectedImages.length}</SelectText>{' '}
            <TotalText>Total {totalImages}</TotalText>
          </CheckboxRow>

          <SidebarList>
            {images.map((image) => (
              <SidebarListItem key={image.id}>
                <input
                  type='checkbox'
                  checked={selectedImages.includes(image.id)}
                  onChange={() => onImageSelection(image.id)}
                />
                <span>{image.title}</span>
              </SidebarListItem>
            ))}
          </SidebarList>

          <SidebarFooter>
            <TotalCost>총 결제 포인트: {totalCost.toLocaleString()}P</TotalCost>
            <AnalyzeButton onClick={handleAnalyzeClick}>분석하기</AnalyzeButton>
          </SidebarFooter>
        </SidebarContent>
        <input
          id='fileInput'
          type='file'
          multiple
          style={{ display: 'none' }}
          onChange={(e) => onFileSelect(e.target.files)}
        />
      </Sidebar>
      <AnalyzeModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        point={point} // Pass the point prop to AnalyzeModal
        totalCost={totalCost}
      />
    </>
  );
};

const SidebarContent = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SidebarTitle = styled.h2`
  margin-bottom: 20px;
`;

const ControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const FileListLabel = styled.div`
  font-weight: bold;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 3px; // Space between buttons
`;

const SidebarButton = styled.button`
  padding: 4px 7px;
  background-color: #0056b3;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #004494;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
  margin-bottom: 10px;
  border-top: 1px solid #ddd;

  input[type='checkbox'] {
    margin-top: 15px; /* Lower the checkbox */
    margin-right: 5px;
    margin-right: 80px;
  }

  span {
    margin-left: 5px;
    margin-top: 10px; /* Ensure the text remains in its original position */
  }
`;

const SidebarList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 10px 0;
  border-top: 1px solid #ddd;
  overflow-y: auto;
  flex: 1;
`;

const SidebarListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;

  input {
    margin-right: 10px;
  }
`;

const SidebarFooter = styled.div`
  margin-top: auto; // Pushes footer to the bottom
  padding-top: 20px;
  border-top: 1px solid #ddd;
`;

const TotalCost = styled.div`
  margin-bottom: 15px;
  margin-left: 10px;
  font-weight: bold;
`;

const AnalyzeButton = styled.button`
  padding: 10px 20px;
  background-color: #0056b3;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;

  &:hover {
    background-color: #004494;
  }
`;

const TotalText = styled.span`
  font-weight: bold;
  color: blue;
  margin-left: 30px; /* Adjust the space as per your need */
`;

const SelectText = styled.span`
  margin-right: 10px;
  margin-left: 10px;
`;

const RefreshButton = styled.button`
  padding: 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  img {
    width: 10px;
    height: 10px;
  }
`;

export default MainSidebar;
