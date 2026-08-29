(() => {
  'use strict';

  const form = document.querySelector('[data-listing-form]');
  if (!form) return;
  const photoInput = form.elements.photos;
  const photoPreview = form.querySelector('[data-photo-preview]');
  const photoHelp = form.querySelector('[data-photo-help]');
  const addressInput = form.elements.address;
  const destinationInput = form.elements.rideDestination;
  const addressButton = form.querySelector('[data-address-search]');
  const destinationButton = form.querySelector('[data-ride-destination-search]');
  const locationResults = form.querySelector('[data-location-results]');
  const locationStatus = form.querySelector('[data-location-status]');
  const mapElement = form.querySelector('[data-listing-map]');
  const isCarpool = new URLSearchParams(location.search).get('categoria') === 'Carona compartilhada';
  let suggestionTimer = 0;
  let suggestionController = null;
  let reverseController = null;
  let photoRun = 0;
  const MAX_PHOTO_COUNT = 2;

  const style = document.createElement('style');
  style.textContent = `
    .nykuto-photo-preview figure.nykuto-photo-checking{outline:3px solid #d8a536;outline-offset:-3px}
    .nykuto-photo-preview figure.nykuto-photo-valid{outline:3px solid #21845f;outline-offset:-3px}
    .nykuto-photo-preview figure.nykuto-photo-invalid{outline:3px solid #c84b3f;outline-offset:-3px}
    .nykuto-photo-state{position:absolute;left:5px;bottom:5px;min-width:27px;height:27px;padding:0 7px;display:flex;align-items:center;justify-content:center;border-radius:999px;background:#fff;color:#183d34;font-size:12px;font-weight:900;box-shadow:0 2px 8px rgba(0,0,0,.18)}
    .nykuto-photo-valid .nykuto-photo-state{background:#21845f;color:#fff}
    .nykuto-photo-invalid .nykuto-photo-state{background:#c84b3f;color:#fff}
    .nykuto-photo-checking .nykuto-photo-state{background:#d8a536;color:#2d260f}
    .nykuto-field-help.is-valid{color:#176746;font-weight:800}
    .nykuto-field-help.is-invalid{color:#9f3027;font-weight:800}
    .nykuto-live-suggestions{margin-top:5px;display:grid;gap:4px}
    .nykuto-live-suggestions button{min-height:46px;padding:8px 10px;display:grid;gap:2px;border:1px solid #d7e1dc;border-radius:10px;background:#fff;color:#183d34;text-align:left;cursor:pointer}
    .nykuto-live-suggestions strong{font-size:10px}.nykuto-live-suggestions small{overflow:hidden;color:#71817b;font-size:8px;text-overflow:ellipsis;white-space:nowrap}
  `;
  document.head.append(style);

  function photoFigures() { return [...photoPreview.querySelectorAll('figure')]; }
  function setPhotoState(index, state, text) {
    const figure = photoFigures()[index];
    if (!figure) return;
    figure.classList.remove('nykuto-photo-checking', 'nykuto-photo-valid', 'nykuto-photo-invalid');
    figure.classList.add(`nykuto-photo-${state}`);
    let badge = figure.querySelector('.nykuto-photo-state');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nykuto-photo-state';
      figure.append(badge);
    }
    badge.textContent = state === 'valid' ? '✓' : state === 'invalid' ? '✕' : '…';
    badge.title = text;
    figure.setAttribute('aria-label', text);
  }

  async function canOptimize(file) {
    let source;
    let cleanup = () => {};
    try {
      const sharedPipeline = window.NykutoPhotoPipeline;
      if (typeof sharedPipeline?.optimizePhoto === 'function') {
        const optimized = await sharedPipeline.optimizePhoto(file, 0);
        return Boolean(optimized?.size && optimized.size <= sharedPipeline.maxBytes);
      }
      if ('createImageBitmap' in window) {
        source = await createImageBitmap(file);
        cleanup = () => source.close?.();
      } else {
        const url = URL.createObjectURL(file);
        const image = new Image();
        cleanup = () => URL.revokeObjectURL(url);
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = url;
        });
        source = image;
      }
      const width0 = source.width || source.naturalWidth;
      const height0 = source.height || source.naturalHeight;
      if (!width0 || !height0) return false;
      const scale = Math.min(1, 1200 / Math.max(width0, height0));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width0 * scale));
      canvas.height = Math.max(1, Math.round(height0 * scale));
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) return false;
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', .72));
      return Boolean(blob && blob.size > 0);
    } catch (_) {
      return false;
    } finally {
      cleanup();
    }
  }

  async function validatePhotosNow() {
    const run = ++photoRun;
    const files = [...(photoInput.files || [])].slice(0, MAX_PHOTO_COUNT);
    if (!files.length) return;
    photoHelp.classList.remove('is-valid', 'is-invalid');
    photoHelp.textContent = `Verificando ${files.length} foto${files.length > 1 ? 's' : ''}…`;
    files.forEach((_, index) => setPhotoState(index, 'checking', `Foto ${index + 1}: verificando`));
    const results = [];
    for (let index = 0; index < files.length; index += 1) {
      const valid = await canOptimize(files[index]);
      if (run !== photoRun) return;
      results.push(valid);
      setPhotoState(index, valid ? 'valid' : 'invalid', valid ? `Foto ${index + 1}: pronta para publicar` : `Foto ${index + 1}: não pôde ser processada`);
    }
    const failed = results.filter((value) => !value).length;
    photoHelp.classList.add(failed ? 'is-invalid' : 'is-valid');
    photoHelp.textContent = failed
      ? `${failed} foto${failed > 1 ? 's' : ''} com problema (vermelho). Remova ou substitua antes de publicar.`
      : `✓ ${results.length} foto${results.length > 1 ? 's' : ''} verificada${results.length > 1 ? 's' : ''} e pronta${results.length > 1 ? 's' : ''} para publicação.`;
  }

  function publicLabel(result) {
    const a = result.address || {};
    const district = a.neighbourhood || a.suburb || a.quarter || a.city_district || a.road;
    const city = a.city || a.town || a.municipality || a.village;
    return [district, city].filter(Boolean).join(', ') || result.display_name || 'Local escolhido';
  }

  async function nominatimSearch(query, signal) {
    const params = new URLSearchParams({ q: query, format: 'jsonv2', addressdetails: '1', limit: '5', countrycodes: 'py,br', viewbox: '-55.0,-24.9,-54.3,-25.8', bounded: '1', 'accept-language': 'pt-BR' });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { Accept: 'application/json' }, signal });
    if (!response.ok) throw new Error('SEARCH_FAILED');
    const payload = await response.json();
    return Array.isArray(payload) ? payload : [];
  }

  function suggestionsBox(input) {
    let box = input.closest('.nykuto-field')?.querySelector('.nykuto-live-suggestions');
    if (!box) {
      box = document.createElement('div');
      box.className = 'nykuto-live-suggestions';
      box.setAttribute('role', 'listbox');
      input.closest('.nykuto-field')?.append(box);
    }
    return box;
  }

  function scheduleSuggestions(input, triggerButton) {
    window.clearTimeout(suggestionTimer);
    const query = input.value.trim();
    const box = suggestionsBox(input);
    if (query.length < 3) { box.replaceChildren(); return; }
    suggestionTimer = window.setTimeout(async () => {
      suggestionController?.abort();
      suggestionController = new AbortController();
      try {
        const results = await nominatimSearch(query, suggestionController.signal);
        if (input.value.trim() !== query) return;
        box.replaceChildren();
        results.forEach((result) => {
          const button = document.createElement('button');
          button.type = 'button';
          const strong = document.createElement('strong');
          const small = document.createElement('small');
          strong.textContent = publicLabel(result);
          small.textContent = result.display_name;
          button.append(strong, small);
          button.addEventListener('click', () => {
            input.value = result.display_name;
            box.replaceChildren();
            input.dispatchEvent(new Event('input', { bubbles: true }));
            window.setTimeout(() => triggerButton?.click(), 0);
          });
          box.append(button);
        });
      } catch (error) {
        if (error.name !== 'AbortError') box.replaceChildren();
      }
    }, 650);
  }

  async function reverseGeocode(lat, lon, target) {
    reverseController?.abort();
    reverseController = new AbortController();
    try {
      const params = new URLSearchParams({ lat, lon, format: 'jsonv2', addressdetails: '1', zoom: '18', 'accept-language': 'pt-BR' });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, { headers: { Accept: 'application/json' }, signal: reverseController.signal });
      if (!response.ok) return;
      const result = await response.json();
      const display = result.display_name || publicLabel(result);
      if (!display) return;
      target.value = display;
      target.dispatchEvent(new Event('change', { bubbles: true }));
      if (target === addressInput && locationStatus) locationStatus.textContent = `Ponto definido · ${publicLabel(result)}.`;
    } catch (_) { /* Manual map placement remains valid without reverse lookup. */ }
  }

  photoInput?.addEventListener('change', () => window.setTimeout(validatePhotosNow, 80));
  addressInput?.addEventListener('input', () => scheduleSuggestions(addressInput, addressButton));
  destinationInput?.addEventListener('input', () => scheduleSuggestions(destinationInput, destinationButton));

  mapElement?.addEventListener('click', () => {
    window.setTimeout(() => {
      if (isCarpool && mapElement.dataset.mapPoint === 'destination') {
        const lat = form.elements.rideDestinationLatitude?.value;
        const lon = form.elements.rideDestinationLongitude?.value;
        if (lat && lon && destinationInput) void reverseGeocode(lat, lon, destinationInput);
      } else {
        const lat = form.elements.latitude?.value;
        const lon = form.elements.longitude?.value;
        if (lat && lon && addressInput) void reverseGeocode(lat, lon, addressInput);
      }
    }, 180);
  });
})();
