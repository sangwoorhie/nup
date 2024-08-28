import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import OpenSeadragon from 'openseadragon';
import initFabricJSOverlay from './utils/openseadragon-fabricjs-overlay';
import ViewerTools from './ViewerTools';
import ViewerZoomControl from './ViewerZoomControl';
import ViewerNavigator from './ViewerNavigator';
import ViewerDamageIndex from './ViewerDamageIndex';
import { Canvas, StaticCanvas } from 'fabric';

initFabricJSOverlay(OpenSeadragon, { Canvas, StaticCanvas });

const ImageViewer = ({ imageUrl, isDarkMode, imageId }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const viewerRef = useRef(null);
  const viewerInstanceRef = useRef(null);

  const initializeViewer = useCallback(() => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.destroy();
    }

    if (viewerRef.current && imageUrl) {
      viewerInstanceRef.current = OpenSeadragon({
        element: viewerRef.current,
        tileSources: {
          type: 'image',
          url: imageUrl,
          imageId: imageId,
        },
        showNavigationControl: false,
        showRotationControl: false,
        gestureSettingsMouse: { clickToZoom: false },
        minZoomImageRatio: 0.1,
        maxZoomPixelRatio: 10,
        visibilityRatio: 1,
        wrapHorizontal: false,
        constrainDuringPan: true,
      });

      viewerInstanceRef.current.addHandler('open', function () {
        if (viewerInstanceRef.current && viewerInstanceRef.current.viewport) {
          viewerInstanceRef.current.viewport.goHome(true);
        }
      });

      viewerInstanceRef.current.fabricjsOverlay({ static: false, scale: 1 });
    }
  }, [imageUrl, imageId]);

  useEffect(() => {
    initializeViewer();

    return () => {
      if (viewerInstanceRef.current) {
        viewerInstanceRef.current.destroy();
      }
    };
  }, [initializeViewer]);

  const getViewerInstance = useCallback(() => viewerInstanceRef.current, []);

  return (
    <ViewerContainer>
      <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />
      <ViewerTools viewer={getViewerInstance()} imageId={imageId} />
      <ViewerZoomControl
        viewer={getViewerInstance()}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />
      <ViewerNavigator viewer={getViewerInstance()} />
      <ViewerDamageIndex isDarkMode={isDarkMode} />
    </ViewerContainer>
  );
};

const ViewerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1; // Ensure this is lower than the modal's z-index
`;

export default ImageViewer;
