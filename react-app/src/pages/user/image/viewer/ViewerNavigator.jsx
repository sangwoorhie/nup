import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import OpenSeadragon from 'openseadragon';

const ViewerNavigator = ({ viewer }) => {
  const navigatorRef = useRef(null);

  useEffect(() => {
    if (!viewer || !navigatorRef.current) return;

    const navigatorElement = navigatorRef.current;

    const navigator = OpenSeadragon({
      id: 'navigator-inner',
      element: navigatorElement,
      showNavigationControl: false,
      showNavigator: true,
      navigatorAutoFade: false,
      width: 200,
      height: 150,
    });

    const openHandler = function () {
      if (viewer.world.getItemCount() > 0) {
        navigator.open(viewer.world.getItemAt(0).source);
      }
    };

    viewer.addHandler('open', openHandler);

    viewer.addControl(navigatorElement, {
      anchor: OpenSeadragon.ControlAnchor.BOTTOM_LEFT,
    });

    return () => {
      viewer.removeControl(navigatorElement);
      viewer.removeHandler('open', openHandler);
      navigator.destroy();
    };
  }, [viewer]);

  return (
    <NavigatorContainer>
      <div ref={navigatorRef} id='navigator-inner' />
    </NavigatorContainer>
  );
};

const NavigatorContainer = styled.div`
  position: absolute;
  left: 10px;
  bottom: 10px;
  width: 200px;
  height: 150px;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
`;

export default ViewerNavigator;
