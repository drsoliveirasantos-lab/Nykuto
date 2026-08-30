(() => {
  'use strict';

  const form = document.querySelector('[data-listing-form]');
  if (!form) return;
  const photoInput = form.elements.photos;
  const photoPreview = form.querySelector('[data-photo-preview]');
  const photoHelp = form.querySelector('[data-photo-help]');
  if (!photoInput || !photoPreview || !photoHelp) return;

  const MAX_PHOTO_COUNT = 2;
  let photoRun = 0;
  let validationQueue = Promise.resolve();
  const style = document.createElement('style');
  style.textContent = `
    .nykuto-photo-preview figure.nykuto-photo-checking{outline:3px solid #d8a536;outline-offset:-3px}
    .nykuto-photo-preview figure.nykuto-photo-valid{outline:3px solid #21845f;outline-offset:-3px}
    .nykuto-photo-preview figure.nykuto-photo-invalid{outline:3px solid #c84b3f;outline-offset:-3px}
    .nykuto-photo-state{position:absolute;left:5px;bottom:5px;z-index:4;min-width:30px;height:30px;padding:0 7px;display:flex;align-items:center;justify-content:center;border-radius:999px;background:#fff;color:#183d34;font-size:13px;font-weight:900;box-shadow:0 2px 8px rgba(0,0,0,.18)}
    .nykuto-photo-valid .nykuto-photo-state{background:#21845f;color:#fff}
    .nykuto-photo-invalid .nykuto-photo-state{background:#c84b3f;color:#fff}
    .nykuto-photo-checking .nykuto-photo-state{background:#d8a536;color:#2d260f}
    .nykuto-field-help.is-valid{color:#176746;font-weight:800}
    .nykuto-field-help.is-invalid{color:#9f3027;font-weight:800}
  `;
  document.head.append(style);

  function photoFigures() {
    return [...photoPreview.querySelectorAll('figure')];
  }

  function setPhotoState(index, state, text) {
    const figure = photoFigures()[index];
    if (!figure) return;
    figure.classList.remove('nykuto-photo-checking', 'nykuto-photo-valid', 'nykuto-photo-invalid');
    figure.classList.add(`nykuto-photo-${state}`);
    let badge = figure.querySelector('.nykuto-photo-state');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nykuto-photo-state';
      badge.setAttribute('aria-hidden', 'true');
      figure.append(badge);
    }
    badge.textContent = state === 'valid' ? '✓' : state === 'invalid' ? '✕' : '…';
    figure.setAttribute('aria-label', text);
  }

  function failureText(error, index) {
    const photo = `Foto ${index + 1}`;
    if (error?.message === 'PHOTO_RAW_DECODE_FAILED') return `${photo}: ProRAW/DNG não pôde ser convertido neste aparelho`;
    if (error?.message === 'PHOTO_DECODE_FAILED') return `${photo}: formato não reconhecido neste aparelho`;
    if (error?.message === 'PHOTO_ENCODE_FAILED') return `${photo}: não pôde ser reduzida neste aparelho`;
    if (error?.message === 'PHOTO_TOO_LARGE') return `${photo}: não pôde ficar abaixo do limite`;
    return `${photo}: não pôde ser processada`;
  }

  async function validatePhotosNow(run, files, pipeline) {
    const failures = [];
    for (let index = 0; index < files.length; index += 1) {
      if (run !== photoRun) return;
      try {
        const optimized = await pipeline.optimizePhoto(files[index], index);
        if (run !== photoRun) return;
        if (!optimized?.size || optimized.size > pipeline.maxBytes) throw new Error('PHOTO_TOO_LARGE');
        pipeline.showPreview?.(index, optimized);
        setPhotoState(index, 'valid', `Foto ${index + 1}: pronta para publicar`);
      } catch (error) {
        if (run !== photoRun) return;
        const message = failureText(error, index);
        failures.push(message);
        setPhotoState(index, 'invalid', message);
      }
    }

    photoHelp.classList.add(failures.length ? 'is-invalid' : 'is-valid');
    photoHelp.textContent = failures.length
      ? `${failures.join(' · ')}. Remova ou substitua a foto marcada em vermelho.`
      : `✓ ${files.length} foto${files.length > 1 ? 's' : ''} verificada${files.length > 1 ? 's' : ''} e pronta${files.length > 1 ? 's' : ''} para publicação.`;
  }

  function schedulePhotoValidation() {
    const run = ++photoRun;
    const pipeline = window.NykutoPhotoPipeline;
    if (typeof pipeline?.optimizePhoto !== 'function') return;
    const files = (pipeline.selectedFiles?.() || [...(photoInput.files || [])]).slice(0, MAX_PHOTO_COUNT);
    if (!files.length) return;
    photoHelp.classList.remove('is-valid', 'is-invalid');
    photoHelp.textContent = `Verificando ${files.length} foto${files.length > 1 ? 's' : ''}…`;
    files.forEach((_, index) => setPhotoState(index, 'checking', `Foto ${index + 1}: verificando`));
    validationQueue = validationQueue
      .catch(() => undefined)
      .then(() => validatePhotosNow(run, files, pipeline));
  }

  photoPreview.addEventListener('nykuto:photos-rendered', schedulePhotoValidation);
  window.setTimeout(schedulePhotoValidation, 0);
})();
