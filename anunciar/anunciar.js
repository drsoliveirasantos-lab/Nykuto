(() => {
  const statusButton = document.querySelector('[data-manager-action="status"]');
  const mediaButton = document.querySelector('[data-manager-action="media"]');
  const status = document.querySelector('[data-manager-status]');
  const previewImage = document.querySelector('[data-announce-preview-image]');
  const feedback = document.querySelector('[data-manager-feedback]');
  let reserved = false;
  let alternateCover = false;

  statusButton?.addEventListener('click', () => {
    reserved = !reserved;
    status.textContent = reserved ? 'Reservado' : 'Publicado';
    status.classList.toggle('is-reserved', reserved);
    feedback.textContent = reserved ? 'NYK-CDE-01 marcado como reservado.' : 'NYK-CDE-01 publicado novamente.';
  });

  mediaButton?.addEventListener('click', () => {
    alternateCover = !alternateCover;
    previewImage.src = alternateCover
      ? '/assets/demo-imobiliaria/local-premium-09.webp'
      : '/assets/demo-imobiliaria/local-premium-08.webp';
    feedback.textContent = alternateCover ? 'Nova imagem definida como capa.' : 'Capa original restaurada.';
  });
})();
