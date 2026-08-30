(() => {
  'use strict';

  const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  const DEFAULT_OSM_HOST = 'tile.openstreetmap.org';
  const IS_CARPOOL_PUBLISHER = new URLSearchParams(window.location.search).get('categoria') === 'Carona compartilhada';

  function isIOSDevice() {
    const ua = navigator.userAgent || '';
    return /iPhone|iPad|iPod/i.test(ua)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function vectorMapsSupported(L) {
    if (isIOSDevice() && !IS_CARPOOL_PUBLISHER) return false;
    if (!window.maplibregl || typeof L.maplibreGL !== 'function') return false;
    if (typeof window.maplibregl.supported === 'function') {
      try { return window.maplibregl.supported(); } catch (_) { return false; }
    }
    try { return Boolean(document.createElement('canvas').getContext('webgl2')); } catch (_) { return false; }
  }

  function installOpenFreeMapBasemap() {
    const L = window.L;
    if (!L || typeof L.tileLayer !== 'function' || L.tileLayer.__nykutoOpenFreeMap) return;
    const originalTileLayer = L.tileLayer;
    function nykutoTileLayer(url, options = {}) {
      const isDefaultPublisherMap = typeof url === 'string' && url.includes(DEFAULT_OSM_HOST);
      if (!isDefaultPublisherMap || !vectorMapsSupported(L)) return originalTileLayer.call(L, url, options);
      let vectorLayer;
      try { vectorLayer = L.maplibreGL({ style: OPENFREEMAP_STYLE }); } catch (_) { return originalTileLayer.call(L, url, options); }
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
          } catch (_) {}
        };
        fallbackTimer = window.setTimeout(useRasterFallback, 8000);
        vectorMap.once('load', () => { settled = true; window.clearTimeout(fallbackTimer); });
        vectorMap.once('error', () => { if (typeof vectorMap.isStyleLoaded !== 'function' || !vectorMap.isStyleLoaded()) useRasterFallback(); });
      });
      return vectorLayer;
    }
    Object.assign(nykutoTileLayer, originalTileLayer);
    Object.defineProperty(nykutoTileLayer, '__nykutoOpenFreeMap', { value: true });
    L.tileLayer = nykutoTileLayer;
  }

  function loadLiveFeedback() {
    if (document.querySelector('script[data-nykuto-live-feedback]')) return;
    const script = document.createElement('script');
    script.src = '/anunciar/live-feedback.js?v=20260830-4';
    script.dataset.nykutoLiveFeedback = 'true';
    script.addEventListener('load', () => { document.documentElement.dataset.nykutoLiveFeedback = 'loaded'; }, { once: true });
    script.addEventListener('error', () => { document.documentElement.dataset.nykutoLiveFeedback = 'error'; }, { once: true });
    document.body.append(script);
  }

  installOpenFreeMapBasemap();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLiveFeedback, { once: true });
  } else {
    loadLiveFeedback();
  }
})();
