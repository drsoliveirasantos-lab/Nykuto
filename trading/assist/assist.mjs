import { SPEC, context, assess, makePrompt } from './core.mjs';
const $=id=>document.getElementById(id), usd=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD'}).format(n);
let session=null, snapshot=null, prepared=null, images=[], mutating=false, refreshing=false, aiBusy=false, imageVersion=0;
const numeric=id=>$(id).value.trim()===''?NaN:Number($(id).value);
const timestamp=id=>new Date($(id).value).getTime();
const localNow=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,19);};
const message=text=>{$('status').textContent=text;};
function readContext(){return context({root:$('root').value,contract:$('contract').value,timeframes:$('timeframes').value,capturedAt:timestamp('capturedAt'),source:$('source').value,notes:$('notes').value});}
function readTicket(){return {context:readContext(),side:$('side').value,quantity:numeric('quantity'),entry:numeric('entry'),stop:numeric('stop'),target:numeric('target'),feePerSide:numeric('feePerSide'),slippageTicks:numeric('slippageTicks'),riskBudget:numeric('riskBudget'),quoteAt:timestamp('quoteAt'),analysis:$('analysis').value};}
function gate(){
  $('openSimulation').disabled=mutating||!snapshot||!prepared||!$('confirmed').checked;
  $('closeButton').disabled=mutating||!snapshot;
  $('askAI').disabled=aiBusy||!snapshot?.aiConfigured||!images.length||!$('consent').checked;
}
function invalidate(){prepared=null;$('confirmed').checked=false;$('review').replaceChildren();gate();}
function updateSpec(){const s=SPEC[$('root').value];$('spec').textContent=`1 tick = ${s.tick} point · ${usd(s.tickUSD)} par micro. La limite de 20 est celle du simulateur, pas une autorisation Lucid.`;}
function paragraph(text,parent,className=''){const p=document.createElement('p');p.textContent=text;p.className=className;parent.append(p);}
async function api(path,options={}){
  if(!session)throw new Error('Compte non chargé.');
  const data=await window.Nykuto.api(path,options);
  if(data.userId&&data.userId!==session.id)throw new Error('Le compte a changé. Recharge la page.');
  return data;
}
function renderBook(){
  const book=snapshot.book, closed=book.trades.filter(t=>t.status==='closed'), active=book.trades.find(t=>t.status==='open');
  $('summary').textContent=`${closed.length} clôture(s) · résultat net déclaré : ${usd(closed.reduce((s,t)=>s+t.net,0))}. Aucun résultat live vérifié.`;
  $('trades').replaceChildren(...book.trades.slice().reverse().map(t=>{
    const card=document.createElement('article'), h=document.createElement('h3');
    h.textContent=`${t.ticket.context.root} · ${t.ticket.side==='long'?'Long':'Short'} × ${t.ticket.quantity} · ${t.status==='open'?'Simulation ouverte':'Simulation clôturée'}`;card.append(h);
    paragraph(`${t.ticket.context.contract} · entrée simulée ${t.entryFill} · stop prévu ${t.ticket.stop} · objectif ${t.ticket.target}`,card);
    paragraph(`Risque modélisé ${usd(t.plannedRisk)} · ${new Date(t.createdAt).toLocaleString('fr-FR')}`,card,'meta');
    if(t.status==='closed')paragraph(`Sortie simulée ${t.exitFill} · brut après slippage ${usd(t.gross)} · frais ${usd(t.fees)} · net ${usd(t.net)}`,card);
    const detail=document.createElement('details'), label=document.createElement('summary');label.textContent='Analyse et hypothèses enregistrées';detail.append(label);
    paragraph(t.ticket.analysis,detail);paragraph(`Données : ${t.ticket.context.source} · frais/côté ${usd(t.ticket.feePerSide)} · slippage/côté ${t.ticket.slippageTicks} tick(s).`,detail,'meta');card.append(detail);return card;
  }));
  $('closeForm').hidden=!active;
  $('activeTrade').textContent=active?`${active.ticket.context.contract} · ${active.ticket.side} × ${active.ticket.quantity} · entrée ${active.entryFill}`:'';
  $('export').disabled=false;
  $('aiStatus').textContent=snapshot.aiConfigured?'Analyse API configurée côté serveur ; nécessite ton accord pour chaque envoi.':'Analyse API non configurée pour ce compte. Utilise la demande à copier dans ChatGPT, sans abonnement API supplémentaire pour cette page.';
  gate();
}
async function refresh(){
  if(refreshing||mutating)return;refreshing=true;$('refresh').disabled=true;
  try{snapshot=await api('/api/assist/');renderBook();message('Journal privé chargé. Les nouvelles saisies ne sont pas sauvegardées avant confirmation.');}
  catch(e){snapshot=null;gate();message(`Journal non vérifié : ${e.message}`);}
  finally{refreshing=false;$('refresh').disabled=false;}
}
$('plan').addEventListener('input',event=>{if(['confirmed','consent'].includes(event.target.id)){gate();return;}invalidate();if(event.target.id==='root')updateSpec();});
$('quoteNow').addEventListener('click',()=>{$('quoteAt').value=localNow();invalidate();});
$('promptButton').addEventListener('click',()=>{try{$('prompt').value=makePrompt(readContext());$('copyPrompt').disabled=false;message('Demande prête. Joins aussi les images dans notre conversation ; le texte seul ne les transmet pas.');}catch(e){message(e.message);}});
$('copyPrompt').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('prompt').value);message('Demande copiée. Ajoute les captures séparément dans ChatGPT.');}catch{$('prompt').focus();$('prompt').select();message('Copie manuellement le texte sélectionné.');}});
$('plan').addEventListener('submit',event=>{
  event.preventDefault();invalidate();
  try{
    const a=assess(readTicket());
    paragraph(`Entrée simulée après slippage : ${a.fillPrice} · risque ${usd(a.risk)} · gain prévu net ${usd(a.reward)} · gain/risque ${a.ratio.toFixed(2)}`, $('review'));
    for(const w of a.warnings)paragraph(w,$('review'));
    for(const b of a.blockers)paragraph(b,$('review'),'error');
    if(!a.blockers.length){prepared={action:'open',id:crypto.randomUUID(),ticket:a.ticket,confirmed:true};paragraph('Ticket cohérent selon tes saisies. Relis-le puis coche la confirmation.',$('review'));}
    gate();
  }catch(e){message(e.message);}
});
$('openSimulation').addEventListener('click',async()=>{
  if(!prepared||!snapshot||!$('confirmed').checked||mutating)return;
  mutating=true;gate();const command=structuredClone(prepared);
  try{
    const data=await api('/api/assist/',{method:'POST',body:JSON.stringify({revision:snapshot.revision,command})});
    snapshot={...snapshot,...data};renderBook();invalidate();message('Simulation enregistrée dans ton compte. Aucun ordre envoyé à un broker.');
  }catch(e){message(`Enregistrement non confirmé : ${e.message} Actualise le journal avant de créer un autre ticket.`);}
  finally{mutating=false;gate();}
});
$('closeForm').addEventListener('submit',async event=>{
  event.preventDefault();if(mutating||!snapshot)return;
  const active=snapshot.book.trades.find(t=>t.status==='open');if(!active)return;
  mutating=true;gate();
  try{
    const command={action:'close',id:active.id,exit:numeric('exit'),observedAt:timestamp('exitAt'),reason:$('reason').value,confirmed:$('closeConfirmed').checked};
    const data=await api('/api/assist/',{method:'POST',body:JSON.stringify({revision:snapshot.revision,command})});
    snapshot={...snapshot,...data};renderBook();$('closeForm').reset();message('Clôture simulée sauvegardée. Résultat calculé avec les frais et le slippage du ticket.');
  }catch(e){message(`Clôture non confirmée : ${e.message} Actualise le journal avant de réessayer.`);}
  finally{mutating=false;gate();}
});
$('refresh').addEventListener('click',refresh);
$('export').addEventListener('click',()=>{
  if(!snapshot)return;
  const file=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),source:'User-declared assisted simulation; not verified live results',...snapshot.book},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download='nykuto-simulations-assistees.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
async function jpeg(file){
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024)throw new Error('Utilise une capture PNG, JPEG ou WebP de 8 Mo maximum.');
  const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Lecture image impossible.'));r.readAsDataURL(file);});
  const img=new Image();img.src=data;await img.decode();
  if(!img.naturalWidth||img.naturalWidth*img.naturalHeight>24000000)throw new Error('Image trop grande. Recadre le graphique avant de l’ajouter.');
  const scale=Math.min(1,1920/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);
  const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
  const result=canvas.toDataURL('image/jpeg',.85);canvas.width=canvas.height=1;
  if(result.length>900000)throw new Error('Capture encore trop volumineuse. Recadre sans rendre les prix illisibles.');
  return result;
}
$('images').addEventListener('change',async()=>{
  const version=++imageVersion;images=[];invalidate();$('previews').replaceChildren();$('aiOutput').textContent='';$('consent').checked=false;gate();
  try{
    const files=[...$('images').files];if(files.length>3)throw new Error('Trois captures maximum.');
    const result=[];for(const f of files)result.push(await jpeg(f));if(version!==imageVersion)return;images=result;
    images.forEach((src,i)=>{const fig=document.createElement('figure'),img=document.createElement('img'),cap=document.createElement('figcaption');img.src=src;img.alt=`Capture de graphique ${i+1}`;cap.textContent=`Capture ${i+1} · locale, non sauvegardée`;fig.append(img,cap);$('previews').append(fig);});
    $('imageStatus').textContent=`${images.length} capture(s) prête(s). Renseigne leur heure réelle ; l’import ne prouve pas leur fraîcheur.`;
  }catch(e){if(version===imageVersion)$('imageStatus').textContent=e.message;}
  finally{gate();}
});
$('askAI').addEventListener('click',async()=>{
  if(aiBusy||!snapshot?.aiConfigured||!images.length||!$('consent').checked)return;
  try{
    const ctx=readContext(),sentVersion=imageVersion,imagesCopy=[...images];aiBusy=true;gate();$('aiOutput').textContent='Analyse demandée…';
    const data=await api('/api/assist/analyze',{method:'POST',signal:AbortSignal.timeout(55000),body:JSON.stringify({context:ctx,images:imagesCopy,consent:true})});
    const changed=sentVersion!==imageVersion||JSON.stringify(ctx)!==JSON.stringify(readContext());
    $('aiOutput').textContent=`${changed?'ATTENTION : contexte modifié depuis l’envoi.\n':''}Analyse de la capture du ${new Date(ctx.capturedAt).toLocaleString('fr-FR')} · ${data.model}\n\n${data.analysis}\n\nRelis et résume les éléments retenus dans la justification. Aucun ticket n’a été rempli.`;
  }catch(e){$('aiOutput').textContent=`Analyse non confirmée : ${e.message}`;}
  finally{aiBusy=false;$('consent').checked=false;gate();}
});
$('timezone').textContent=`Les heures saisies utilisent le fuseau de cet appareil : ${Intl.DateTimeFormat().resolvedOptions().timeZone}.`;
updateSpec();
try{if(!window.Nykuto)throw new Error('Session non initialisée. Recharge le site.');await window.Nykuto.ready;session=window.Nykuto.user;await refresh();}catch(e){message(e.message);gate();}
