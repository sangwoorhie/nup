import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';

const ViewerZoomControl = ({ viewer, zoomLevel, setZoomLevel }) => {
  useEffect(() => {
    if (viewer) {
      const updateZoom = () => {
        setZoomLevel(viewer.viewport.getZoom());
      };
      viewer.addHandler('zoom', updateZoom);
      return () => viewer.removeHandler('zoom', updateZoom);
    }
  }, [viewer, setZoomLevel]);

  const handleZoomIn = () => {
    if (viewer && viewer.viewport) {
      viewer.viewport.zoomBy(1.5);
    }
  };

  const handleZoomOut = () => {
    if (viewer && viewer.viewport) {
      viewer.viewport.zoomBy(0.75);
    }
  };

  const handleZoomHome = () => {
    if (viewer && viewer.viewport) {
      viewer.viewport.goHome();
    }
  };

  const handleSliderChange = (e) => {
    if (viewer && viewer.viewport) {
      setZoomLevel(e.value);
      viewer.viewport.zoomTo(e.value);
    }
  };

  return (
    <ZoomControlContainer>
      <Button icon='pi pi-home' onClick={handleZoomHome} tooltip='초기 위치' />
      <Button icon='pi pi-plus' onClick={handleZoomIn} tooltip='확대' />
      <SliderContainer>
        <Slider
          value={zoomLevel}
          onChange={handleSliderChange}
          orientation='vertical'
          min={0.1}
          max={5}
          step={0.1}
        />
      </SliderContainer>
      <Button icon='pi pi-minus' onClick={handleZoomOut} tooltip='축소' />
    </ZoomControlContainer>
  );
};

const ZoomControlContainer = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
`;

const SliderContainer = styled.div`
  height: 100px;
  display: flex;
  justify-content: center;
`;

export default ViewerZoomControl;
