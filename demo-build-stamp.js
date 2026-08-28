(() => {
  'use strict';
  const heading = document.querySelector('.nykuto-market-heading > div');
  const title = document.getElementById('demo-app-title');
  if (!heading || !title || heading.querySelector('[data-site-update-stamp]')) return;
  const stamp = document.createElement('small');
  stamp.dataset.siteUpdateStamp = 'true';
  stamp.textContent = 'Nykuto · última atualização: 28/08/2026 · 20:52';
  stamp.style.cssText = 'display:block;margin:5px 0 7px;color:#7d6a46;font-size:10px;font-weight:750;letter-spacing:.035em;line-height:1.25;';
  heading.insertBefore(stamp, title);
})();
