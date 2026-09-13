(() => {
  'use strict';
  const moduleIds=['dashboard','risk','journal','plan'];
  const modules=moduleIds.map(id=>document.getElementById(id)).filter(Boolean);
  let nav=document.querySelector('.section-nav');
  if(!nav){nav=document.createElement('nav');nav.className='section-nav';document.querySelector('.topbar')?.after(nav);}
  nav.id='siteNavigation';nav.setAttribute('aria-label','Navigation du Trading HQ');
  const entries=[
    [modules.length?'#dashboard':'/#dashboard','Dashboard',false],
    [modules.length?'#risk':'/#risk','Risque',false],
    [modules.length?'#journal':'/#journal','Journal',false],
    [modules.length?'#plan':'/#plan','Plan',false],
    ['/analysis/','Analyse',true],['/models/','Modèles et sources',true],['/assist/','Trade assisté',false],['/replay/','Replay',false],['/lab/','Lab',true],['/historique/','Historique',true],['/suivi/','Suivi',true],
    ['/discipline/','Avant un trade',false],['/alerts/','Alertes',false],
    ['/connections/','Connexions',false],['/live/','Flux Lucid',true],['/account/#feedback','Retours',false],['/account/','Mon compte',false],['/cdn-cgi/access/logout','Déconnexion',false]
  ];
  const links=entries.map(([href,label,ownerOnly])=>{const a=document.createElement('a');a.href=href;a.textContent=label;if(ownerOnly){a.hidden=true;a.dataset.ownerOnly='true';}return a;});
  nav.replaceChildren(...links);
  window.Nykuto?.ready.then(()=>{
    for(const link of links.filter(item=>item.dataset.ownerOnly)){
      if(window.Nykuto.user?.role==='owner')link.hidden=false;
      else link.remove();
    }
  }).catch(()=>{});
  const menu=document.createElement('button');menu.type='button';menu.className='site-menu';menu.setAttribute('aria-controls',nav.id);
  nav.before(menu);
  let expanded=false;
  const mobile=window.matchMedia('(max-width:720px)');
  function closeMenu(){expanded=false;syncMenu();}
  function syncMenu(){nav.classList.toggle('is-collapsed',mobile.matches&&!expanded);menu.setAttribute('aria-expanded',String(expanded));}
  function markCurrent(id){
    let label='Navigation';
    nav.querySelectorAll('a').forEach(a=>{
      const url=new URL(a.href),path=location.pathname.replace(/\/$/,'')||'/';
      const active=modules.length?a.getAttribute('href')===`#${id}`
        : (url.pathname.replace(/\/$/,'')||'/')===path && (path==='/account'?url.hash===(location.hash==='#feedback'?location.hash:''):!url.hash);
      a.classList.toggle('is-active',active);
      if(active){a.setAttribute('aria-current',modules.length?'location':'page');label=a.textContent;}else a.removeAttribute('aria-current');
    });
    menu.textContent=`Menu · ${label}`;
  }
  function showModule(id,focus=false){
    if(!modules.length||!moduleIds.includes(id))return;
    modules.forEach(section=>{const selected=section.id===id;section.classList.toggle('is-module-hidden',!selected);section.setAttribute('aria-hidden',String(!selected));});
    markCurrent(id);
    if(focus){const heading=document.querySelector(`#${id} h2`);heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}
    window.scrollTo({top:0,behavior:'auto'});
  }
  menu.addEventListener('click',()=>{expanded=!expanded;syncMenu();});
  nav.addEventListener('keydown',event=>{if(event.key==='Escape'&&mobile.matches){closeMenu();menu.focus();}});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  // Keep the journal shortcut, skip link and browser history consistent with the menu.
  document.addEventListener('click',event=>{
    const a=event.target.closest('a[href^="#"]');
    if(!a||!modules.length)return;
    const id=a.getAttribute('href').slice(1);
    if(!moduleIds.includes(id)||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();if(location.hash!==`#${id}`)history.pushState(null,'',`#${id}`);showModule(id,true);
  });
  function current(){const id=moduleIds.includes(location.hash.slice(1))?location.hash.slice(1):'dashboard';if(modules.length)showModule(id);else markCurrent();}
  window.addEventListener('hashchange',current);window.addEventListener('popstate',current);
  mobile.addEventListener('change',closeMenu);syncMenu();current();
  const header=document.querySelector('.topbar');
  if(header){const size=()=>document.documentElement.style.setProperty('--topbar-height',`${header.getBoundingClientRect().height}px`);new ResizeObserver(size).observe(header);size();}
})();
