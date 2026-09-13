const tabs = [...document.querySelectorAll('.lab-tabs [role="tab"]')];
const panes = [...document.querySelectorAll('.lab-view')];

function activate(id, focus = false) {
  for (const tab of tabs) {
    const selected = tab.getAttribute('aria-controls') === id;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  }
  for (const pane of panes) pane.hidden = pane.id !== id;
}

function followHash() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  const pane = target?.closest('.lab-view');
  if (!pane) { if (!id) activate('view-current'); return; }
  activate(pane.id);
  for (let parent = target.parentElement; parent && parent !== pane; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS') parent.open = true;
  }
  if (target !== pane) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
}

for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => {
    const id = tab.getAttribute('aria-controls');
    activate(id);
    history.pushState(null, '', `#${id}`);
  });
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].click(); tabs[next].focus();
  });
}
window.addEventListener('hashchange', followHash);
window.addEventListener('popstate', followHash);
followHash();
document.addEventListener('DOMContentLoaded', followHash, { once: true });
