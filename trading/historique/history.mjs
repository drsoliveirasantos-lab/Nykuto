import { loadManifest, loadHistory, toCsv } from './history-source.mjs';
import { AUDIT } from './pine-audit.mjs';
const $ = id => document.getElementById(id), nf = new Intl.NumberFormat('fr-FR');
const date = t => new Date(t*1000).toLocaleDateString('fr-FR',{timeZone:'UTC'});
const node = (tag, value, cls='') => {const n=document.createElement(tag);n.textContent=value;n.className=cls;return n;};
let manifest;
const selected = () => manifest.datasets.find(d=>d.id===$('timeframe').value);
function months() {
  const prior=$('month').value, values=Object.keys(selected().monthly).sort().reverse();
  $('month').replaceChildren(...values.map(m=>{const option=node('option',new Date(m+'-01T00:00:00Z').toLocaleDateString('fr-FR',{month:'long',year:'numeric',timeZone:'UTC'}));option.value=m;return option;}));
  if(values.includes(prior))$('month').value=prior;
  render();
}
function render(){
  const dataset=selected(), month=$('month').value, [year,m]=month.split('-').map(Number), counts=dataset.monthly[month];
  $('monthSummary').textContent=`${nf.format(counts.count)} bougies ${dataset.id.toUpperCase()} · ${nf.format(counts.volumeCount)} avec volume`;
  const grid=$('calendar');grid.replaceChildren();
  const offset=(new Date(Date.UTC(year,m-1,1)).getUTCDay()+6)%7;
  for(let i=0;i<offset;i++)grid.append(node('span',''));
  const days=new Date(Date.UTC(year,m,0)).getUTCDate();
  for(let day=1;day<=days;day++){
    const d=`${month}-${String(day).padStart(2,'0')}`, values=dataset.daily[d], gap=dataset.id==='m1'&&d==='2026-06-18';
    const button=node('button','',gap?'is-gap':!values?'is-empty':values.volumeCount<values.count?'is-partial':'');button.type='button';button.setAttribute('aria-pressed','false');
    const label=!values?'Aucune bougie exportée':`${nf.format(values.count)} bougies, ${nf.format(values.volumeCount)} avec volume${gap?', 17 heures manquantes':''}`;
    button.setAttribute('aria-label',`${d} : ${label}`);button.append(node('strong',String(day)),node('small',!values?'—':`${gap?'⚠ ':values.volumeCount<values.count?'◐ ':'● '}${nf.format(values.count)}`));
    button.addEventListener('click',()=>{grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('dayDetail').textContent=`${d} UTC · ${label}.${gap?' M1 absent de 04:00 à 21:00 UTC.':''}${dataset.id==='m5'&&d==='2026-09-09'?' Trois M5 reconstituées depuis M1.':''}`;});grid.append(button);
  }
  $('dayDetail').textContent='Sélectionne un jour pour voir son détail.';
}
async function download(all){
  const dataset=selected(), month=$('month').value;
  $('downloadAll').disabled=true;$('downloadMonth').disabled=true;
  try{
    const from=all?-Infinity:Date.parse(month+'-01T00:00:00Z')/1000;
    const [y,m]=month.split('-').map(Number),to=all?Infinity:Date.UTC(y,m,1)/1000;
    const rows=await loadHistory(dataset,{from,to,progress:(i,total)=>{$('downloadState').textContent=`Chargement et vérification : ${i}/${total} blocs`;}});
    const url=URL.createObjectURL(new Blob([toCsv(rows)],{type:'text/csv;charset=utf-8'}));const a=node('a','');a.href=url;a.download=`MNQ_${dataset.id}_${all?'historique-complet':month}_${manifest.id}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
    $('downloadState').textContent=`${nf.format(rows.length)} bougies vérifiées et exportées. Volume absent laissé vide.`;
  }catch(e){$('downloadState').textContent=e.message;}finally{$('downloadAll').disabled=false;$('downloadMonth').disabled=false;}
}
for(const finding of AUDIT.findings.filter(f=>f.priority==='P0')){const article=node('article','','audit-finding');article.append(node('h3',finding.title),node('p',finding.impact));$('auditFindings').append(article);}
$('auditResults').textContent=AUDIT.resultSummary;
try{
  manifest=await loadManifest();
  for(const d of manifest.datasets){const article=node('article','','coverage-card');article.append(node('h3',d.id.toUpperCase()),node('p',`${nf.format(d.count)} bougies`),node('p',`${date(d.from)} → ${date(d.to)}`),node('small',`${nf.format(d.volumeCount)} avec volume · ${d.origin}`));$('coverageCards').append(article);}
  $('loadState').textContent='Historique sauvegardé · manifeste vérifié · données disponibles jusqu’au 11 septembre 2026.';
  $('datasetIdentity').textContent=`MNQ1! · version ${manifest.id} · horodatage d’ouverture UTC. Source : Archive(4).zip + Archive 3.zip, doublons compatibles fusionnés.`;
  months();$('timeframe').addEventListener('change',months);$('month').addEventListener('change',render);
  $('downloadMonth').disabled=false;$('downloadAll').disabled=false;$('downloadMonth').addEventListener('click',()=>download(false));$('downloadAll').addEventListener('click',()=>download(true));
}catch(e){$('loadState').textContent=e.message;$('loadState').setAttribute('role','alert');}
