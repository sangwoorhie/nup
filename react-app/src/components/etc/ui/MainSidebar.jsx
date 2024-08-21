import React, { useState, useEffect } from 'react';
import { Sidebar } from 'primereact/sidebar';
import styled from 'styled-components';
import { ProgressSpinner } from 'primereact/progressspinner';
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
  point,
  setSelectedImages,
  onRefresh,
  onImageClick,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [clickedImage, setClickedImage] = useState(null);
  const [totalSelectedCost, setTotalSelectedCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const totalCost = images
      .filter((image) => selectedImages.includes(image.id))
      .reduce((sum, image) => sum + image.cost, 0);
    setTotalSelectedCost(totalCost);
  }, [selectedImages, images]);

  useEffect(() => {
    if (images.length > 0) {
      setIsLoading(false); // Set loading to false once images are loaded
    }
  }, [images]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allImageIds = images.map((image) => image.id);
      setSelectedImages(allImageIds);
    } else {
      setSelectedImages([]);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true); // Set loading to true when refresh is triggered
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

  const handleImageClick = (image) => {
    setClickedImage(image.id);
    if (onImageClick) {
      onImageClick(image);
    }
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
                <i className='pi pi-refresh' />
              </RefreshButton>
            </ButtonGroup>
          </ControlsRow>

          {isLoading ? (
            <LoadingContainer>
              <ProgressSpinner />
              <LoadingMessage>Loading data, please wait...</LoadingMessage>
            </LoadingContainer>
          ) : (
            <>
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
                    <ImageName
                      onMouseEnter={() => setHoveredImage(image.id)}
                      onMouseLeave={() => setHoveredImage(null)}
                      onClick={() => handleImageClick(image)}
                      isHovered={hoveredImage === image.id}
                      isClicked={clickedImage === image.id}
                    >
                      {image.title}
                    </ImageName>
                  </SidebarListItem>
                ))}
              </SidebarList>
            </>
          )}

          <SidebarFooter>
            <TotalCost>
              총 결제 포인트: {totalSelectedCost.toLocaleString()}P
            </TotalCost>
            <AnalyzeButton onClick={handleAnalyzeClick}>
              분석 실행
            </AnalyzeButton>
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
        point={point}
        totalCost={totalSelectedCost} // Pass the selected images' total cost
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
  margin-left: 20px;
  margin-top: 10px;
`;

const SelectText = styled.span`
  margin-right: 10px;
  margin-top: 10px;
  margin-left: 10px;
`;

const RefreshButton = styled.button`
  padding: 10px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  .pi.pi-refresh {
    font-size: 16px;
  }
`;

const ImageName = styled.span`
  cursor: pointer;
  text-decoration: none; /* Remove underline */
  background-color: ${(props) =>
    props.isClicked ? '#004494' : props.isHovered ? '#34609e' : 'transparent'};
  color: ${(props) =>
    props.isClicked ? '#fff' : 'inherit'}; /* White text if clicked */

  &:hover {
    background-color: ${(props) =>
      props.isClicked ? '#004494' : '#34609e'}; /* Lighter shade of #004494 */
    color: #fff; /* White text on hover */
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
`;

const LoadingMessage = styled.div`
  margin-top: 10px;
  font-size: 16px;
  color: #555;
`;

export default MainSidebar;
