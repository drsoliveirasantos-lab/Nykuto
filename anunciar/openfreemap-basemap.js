(() => {
  'use strict';

  const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  const DEFAULT_OSM_HOST = 'tile.openstreetmap.org';

  function vectorMapsSupported(L) {
    if (!window.maplibregl || typeof L.maplibreGL !== 'function') return false;
    if (typeof window.maplibregl.supported === 'function') {
      try {
        return window.maplibregl.supported();
      } catch (_) {
        return false;
      }
    }
    try {
      return Boolean(document.createElement('canvas').getContext('webgl2'));
    } catch (_) {
      return false;
    }
  }

  function installOpenFreeMapBasemap() {
    const L = window.L;
    if (!L || typeof L.tileLayer !== 'function' || L.tileLayer.__nykutoOpenFreeMap) return;

    const originalTileLayer = L.tileLayer;

    function nykutoTileLayer(url, options = {}) {
      const isDefaultPublisherMap = typeof url === 'string' && url.includes(DEFAULT_OSM_HOST);
      if (!isDefaultPublisherMap || !vectorMapsSupported(L)) {
        return originalTileLayer.call(L, url, options);
      }

      let vectorLayer;
      try {
        vectorLayer = L.maplibreGL({ style: OPENFREEMAP_STYLE });
      } catch (_) {
        return originalTileLayer.call(L, url, options);
      }

      vectorLayer.once('add', (event) => {
        const leafletMap = event.target?._map;
        const vectorMap = vectorLayer.getMaplibreMap?.();
        if (!leafletMap || !vectorMap) return;

        let settled = false;
        let fallbackTimer = 0;
        const useRasterFallback = () => {
          if (settled) return;
          settled = true;
          window.clearTimeout(fallbackTimer);
          try {
            if (leafletMap.hasLayer(vectorLayer)) leafletMap.removeLayer(vectorLayer);
            originalTileLayer.call(L, url, options).addTo(leafletMap);
          } catch (_) {
            // The publisher remains usable even when neither remote map layer loads.
          }
        };

        fallbackTimer = window.setTimeout(useRasterFallback, 8000);
        vectorMap.once('load', () => {
          settled = true;
          window.clearTimeout(fallbackTimer);
        });
        vectorMap.once('error', () => {
          if (typeof vectorMap.isStyleLoaded !== 'function' || !vectorMap.isStyleLoaded()) useRasterFallback();
        });
      });

      return vectorLayer;
    }

    Object.assign(nykutoTileLayer, originalTileLayer);
    Object.defineProperty(nykutoTileLayer, '__nykutoOpenFreeMap', { value: true });
    L.tileLayer = nykutoTileLayer;
  }

  installOpenFreeMapBasemap();
})();
