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

  function installLargePhotoDecodeGuard() {
    const nativeCreateImageBitmap = window.createImageBitmap;
    if (typeof nativeCreateImageBitmap !== 'function' || nativeCreateImageBitmap.__nykutoPhotoGuard) return;

    async function guardedCreateImageBitmap(source, ...args) {
      const isLargePhoto = args.length === 0
        && source instanceof Blob
        && /^image\//i.test(source.type || '')
        && source.size >= 2 * 1024 * 1024;
      if (!isLargePhoto) return nativeCreateImageBitmap.call(window, source, ...args);
      try {
        return await nativeCreateImageBitmap.call(window, source, {
          resizeWidth: 2048,
          resizeQuality: 'high',
          imageOrientation: 'from-image'
        });
      } catch (_) {
        return nativeCreateImageBitmap.call(window, source);
      }
    }
    Object.defineProperty(guardedCreateImageBitmap, '__nykutoPhotoGuard', { value: true });
    window.createImageBitmap = guardedCreateImageBitmap;
  }

  function installNativePhotoFeedback() {
    const input = document.querySelector('[data-listing-form] input[name="photos"]');
    const preview = document.querySelector('[data-photo-preview]');
    const help = document.querySelector('[data-photo-help]');
    if (!input || !preview || !help || input.dataset.nativeFeedback === '1') return;
    input.dataset.nativeFeedback = '1';

    const style = document.createElement('style');
    style.textContent = '.nykuto-photo-preview figure[data-photo-state="checking"]{outline:4px solid #d8a536;outline-offset:-4px}.nykuto-photo-preview figure[data-photo-state="valid"]{outline:4px solid #21845f;outline-offset:-4px}.nykuto-photo-preview figure[data-photo-state="invalid"]{outline:4px solid #c84b3f;outline-offset:-4px}.nykuto-native-photo-badge{position:absolute;left:6px;bottom:6px;z-index:4;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#21845f;color:#fff;font-weight:900;box-shadow:0 2px 9px #0004}.nykuto-photo-preview figure[data-photo-state="invalid"] .nykuto-native-photo-badge{background:#c84b3f}.nykuto-photo-preview figure[data-photo-state="checking"] .nykuto-native-photo-badge{background:#d8a536;color:#332b10}';
    document.head.append(style);

    function mark(index, state) {
      const figure = preview.querySelectorAll('figure')[index];
      if (!figure) return;
      figure.dataset.photoState = state;
      let badge = figure.querySelector('.nykuto-native-photo-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'nykuto-native-photo-badge';
        figure.append(badge);
      }
      badge.textContent = state === 'valid' ? '✓' : state === 'invalid' ? '✕' : '…';
    }

    async function decodable(file) {
      let bitmap;
      let url;
      try {
        if (typeof createImageBitmap === 'function') {
          bitmap = await createImageBitmap(file);
          const ok = Boolean(bitmap.width && bitmap.height);
          bitmap.close?.();
          return ok;
        }
        url = URL.createObjectURL(file);
        const image = new Image();
        await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
        return Boolean(image.naturalWidth && image.naturalHeight);
      } catch (_) {
        return false;
      } finally {
        bitmap?.close?.();
        if (url) URL.revokeObjectURL(url);
      }
    }

    input.addEventListener('change', () => {
      const files = [...(input.files || [])].slice(0, 5);
      if (!files.length) return;
      help.textContent = `🟡 Verificando ${files.length} foto${files.length > 1 ? 's' : ''} agora…`;
      help.style.color = '#8a6a08';
      window.setTimeout(async () => {
        files.forEach((_, index) => mark(index, 'checking'));
        let failed = 0;
        for (let index = 0; index < files.length; index += 1) {
          const ok = await decodable(files[index]);
          if (!ok) failed += 1;
          mark(index, ok ? 'valid' : 'invalid');
        }
        if (failed) {
          help.textContent = `🔴 ${failed} foto${failed > 1 ? 's' : ''} com problema. Remova ou substitua antes de publicar.`;
          help.style.color = '#a33128';
        } else {
          help.textContent = `🟢 ${files.length} foto${files.length > 1 ? 's' : ''} pronta${files.length > 1 ? 's' : ''} para publicar.`;
          help.style.color = '#176746';
        }
        help.style.fontWeight = '900';
      }, 120);
    }, true);
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
    script.src = `/anunciar/live-feedback.js?v=20260828-4-${Date.now()}`;
    script.dataset.nykutoLiveFeedback = 'true';
    script.addEventListener('load', () => { document.documentElement.dataset.nykutoLiveFeedback = 'loaded'; }, { once: true });
    script.addEventListener('error', () => { document.documentElement.dataset.nykutoLiveFeedback = 'error'; }, { once: true });
    document.body.append(script);
  }

  installLargePhotoDecodeGuard();
  installOpenFreeMapBasemap();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { installNativePhotoFeedback(); loadLiveFeedback(); }, { once: true });
  } else {
    installNativePhotoFeedback();
    loadLiveFeedback();
  }
})();
