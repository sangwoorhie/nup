// react-app/src/pages/user/image/viewer/utils/openseadragon-fabricjs-overlay.js

import { Point } from 'fabric';

function initFabricJSOverlay(OpenSeadragon, { Canvas, StaticCanvas }) {
  if (!OpenSeadragon) {
    console.error('[openseadragon-canvas-overlay] requires OpenSeadragon');
    return;
  }

  OpenSeadragon.Viewer.prototype.fabricjsOverlay = function (options = {}) {
    this._fabricjsOverlayInfo = new Overlay(this, options.static || false);
    if (options.scale) {
      this._fabricjsOverlayInfo._scale = options.scale;
    } else {
      this._fabricjsOverlayInfo._scale = 1000;
    }

    return this._fabricjsOverlayInfo;
  };

  const counter = (function () {
    let i = 1;
    return function () {
      return i++;
    };
  })();

  class Overlay {
    constructor(viewer, staticCanvas) {
      const self = this;

      this._viewer = viewer;
      this._containerWidth = 0;
      this._containerHeight = 0;

      this._canvasdiv = document.createElement('div');
      this._canvasdiv.style.position = 'absolute';
      this._canvasdiv.style.left = '0px';
      this._canvasdiv.style.top = '0px';
      this._canvasdiv.style.width = '100%';
      this._canvasdiv.style.height = '100%';
      this._viewer.canvas.appendChild(this._canvasdiv);

      this._canvas = document.createElement('canvas');

      this._id = `osd-overlaycanvas-${counter()}`;
      this._canvas.setAttribute('id', this._id);
      this._canvasdiv.appendChild(this._canvas);
      this.resize();

      if (staticCanvas) {
        this._fabricCanvas = new StaticCanvas(this._canvas);
      } else {
        this._fabricCanvas = new Canvas(this._canvas);
      }

      this._fabricCanvas.selection = false;

      this._fabricCanvas.on('mouse:down', (options) => {
        if (options.target) {
          options.e.preventDefaultAction = true;
          options.e.preventDefault();
          options.e.stopPropagation();
        }
      });

      this._fabricCanvas.on('mouse:up', (options) => {
        if (options.target) {
          options.e.preventDefaultAction = true;
          options.e.preventDefault();
          options.e.stopPropagation();
        }
      });

      this._viewer.addHandler('update-viewport', () => {
        self.resize();
        self.resizeCanvas();
        self.render();
      });

      this._viewer.addHandler('open', () => {
        self.resize();
        self.resizeCanvas();
      });
      window.addEventListener('resize', () => {
        self.resize();
        self.resizeCanvas();
      });
    }
    canvas() {
      return this._canvas;
    }
    fabricCanvas() {
      return this._fabricCanvas;
    }
    clear() {
      this._fabricCanvas.clear();
    }
    render() {
      this._fabricCanvas.renderAll();
    }
    resize() {
      const viewerContainer = this._viewer.container;

      // Check if container exists and has valid dimensions before proceeding
      if (
        viewerContainer &&
        viewerContainer.clientWidth &&
        viewerContainer.clientHeight
      ) {
        if (this._containerWidth !== viewerContainer.clientWidth) {
          this._containerWidth = viewerContainer.clientWidth;
          this._canvasdiv.setAttribute('width', this._containerWidth);
          this._canvas.setAttribute('width', this._containerWidth);
        }

        if (this._containerHeight !== viewerContainer.clientHeight) {
          this._containerHeight = viewerContainer.clientHeight;
          this._canvasdiv.setAttribute('height', this._containerHeight);
          this._canvas.setAttribute('height', this._containerHeight);
        }
      } else {
        console.warn(
          'Viewer container is not available or has invalid dimensions.'
        );
      }
    }
    resizeCanvas() {
      const origin = new OpenSeadragon.Point(0, 0);
      const viewportZoom = this._viewer.viewport.getZoom(true);
      const viewportToImageZoom =
        this._viewer.viewport.viewportToImageZoom(viewportZoom);
      this._fabricCanvas.setWidth(this._containerWidth);
      this._fabricCanvas.setHeight(this._containerHeight);

      this._fabricCanvas.setZoom(viewportToImageZoom);

      const viewportWindowPoint =
        this._viewer.viewport.viewportToWindowCoordinates(origin);
      const x = Math.round(viewportWindowPoint.x);
      const y = Math.round(viewportWindowPoint.y);
      const canvasOffset = this._canvasdiv.getBoundingClientRect();

      const pageScroll = OpenSeadragon.getPageScroll();

      this._fabricCanvas.absolutePan(
        new Point(
          canvasOffset.left - x + pageScroll.x,
          canvasOffset.top - y + pageScroll.y
        )
      );
    }
  }
}

export default initFabricJSOverlay;
