import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MainHeader from '../../../components/etc/ui/MainHeader';
import SubHeaders from '../../../components/etc/ui/SubHeaders';
import MainSidebar from '../../../components/etc/ui/MainSidebar';
import Footer from '../../../components/etc/ui/Footer';
import { Button } from 'primereact/button';
import ImageViewer from './viewer/ImageViewer';
import {
  listImages,
  uploadImages,
  deleteImages,
  fetchSingleImage,
} from '../../../services/userServices';
import { ProgressSpinner } from 'primereact/progressspinner';

const FileInput = ({ isDarkMode, toggleDarkMode }) => {
  const [activeHeader, setActiveHeader] = useState('Ko-Detect');
  const [images, setImages] = useState([]);
  const [totalImages, setTotalImages] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [point, setPoint] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true); // Start loading
      try {
        const { images, total, totalCost, point } = await listImages();
        setImages(images);
        setTotalImages(total);
        setTotalCost(totalCost);
        setPoint(point);
      } catch (error) {
        console.error('Failed to fetch images:', error);
      } finally {
        setLoading(false); // End loading
      }
    };
    fetchImages();
  }, []);

  const handleFileSelect = async (files) => {
    setLoading(true); // Start loading
    try {
      const response = await uploadImages(files);
      setImages([...images, ...response.images]);
      setTotalImages(totalImages + response.images.length);
      setTotalCost(response.totalCost);
      setPoint(response.point);
    } catch (error) {
      console.error('Failed to upload images:', error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) {
      alert('이미지를 선택해주세요.');
      return;
    }

    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmDelete) return;

    setLoading(true); // Start loading
    try {
      await deleteImages(selectedImages);
      setImages(images.filter((image) => !selectedImages.includes(image.id)));
      setTotalImages(totalImages - selectedImages.length);
      setSelectedImages([]);
      setSelectedImage(null);
    } catch (error) {
      console.error('Failed to delete images:', error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleImageSelection = (imageId) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleImageClick = async (image) => {
    setLoading(true); // Start loading
    try {
      const imageUrl = await fetchSingleImage(image.id);
      setSelectedImage({ url: imageUrl, title: image.title });
    } catch (error) {
      console.error('Failed to fetch image data:', error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  const handleRefresh = async () => {
    setLoading(true); // Start loading
    try {
      const { images, total, totalCost, point } = await listImages();
      setImages(images);
      setTotalImages(total);
      setTotalCost(totalCost);
      setPoint(point);
    } catch (error) {
      console.error('Failed to refresh images:', error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <Container isDarkMode={isDarkMode}>
      <MainHeader
        setActiveHeader={setActiveHeader}
        userType='user'
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <SubHeaders
        activeHeader={activeHeader}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <Content isDarkMode={isDarkMode}>
        <StyledButton icon='pi pi-arrow-right' onClick={toggleSidebar} />
        <MainSidebar
          visible={sidebarVisible}
          onHide={() => setSidebarVisible(false)}
          totalImages={totalImages}
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          onFileSelect={handleFileSelect}
          onDeleteSelected={handleDeleteSelected}
          images={images}
          onImageSelection={handleImageSelection}
          onImageClick={handleImageClick} // Pass the click handler
          totalCost={totalCost}
          point={point}
          onRefresh={handleRefresh}
        />
        {loading && images.length > 0 ? (
          <LoadingContainer>
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            <LoadingMessage>Loading image...</LoadingMessage>
          </LoadingContainer>
        ) : selectedImage ? (
          <ImageViewerContainer>
            <ImageViewer
              imageUrl={selectedImage.url}
              imageId={selectedImage.id}
              isDarkMode={isDarkMode}
            />
          </ImageViewerContainer>
        ) : null}
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
  padding: 20px;
  margin-top: 10px;
  width: 100%;
  margin: 0 auto;
  background-color: ${({ isDarkMode }) => (isDarkMode ? '#212121' : '#fff')};
  color: ${({ isDarkMode }) => (isDarkMode ? '#fff' : '#000')};
  display: flex;
`;

const StyledButton = styled(Button)`
  margin-left: 20px;
  margin-top: 20px;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #00bcd4;
  border: none;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);

  .pi {
    font-size: 18px;
    color: white;
  }

  &:hover {
    background-color: #0097a7;
  }

  &:focus {
    outline: none;
    box-shadow: 0px 0px 0px 3px rgba(0, 188, 212, 0.5);
  }
`;

const ImageViewerContainer = styled.div`
  flex: 1;
  margin-left: 20px;
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const LoadingMessage = styled.div`
  margin-top: 10px;
  font-size: 1.2em;
  color: #666;
`;

export default FileInput;
