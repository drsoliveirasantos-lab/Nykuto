import {MODES,dateKey,monthInfo,shiftMonth,prepareJournal,monthlyPerformance} from './performance-core.mjs';
const el=id=>document.getElementById(`perf${id}`),key='nykuto-trading-trades-v1';
const number=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2});
const formatR=n=>`${n>0?'+':''}${number.format(n)} R`;
const dayLabel=day=>new Intl.DateTimeFormat('fr-FR',{dateStyle:'full',timeZone:'UTC'}).format(new Date(`${day}T12:00:00Z`));
let report=null,selection=null,prepared=null;
function tone(node,n){node.classList.remove('perf-up','perf-down');if(n>0)node.classList.add('perf-up');else if(n<0)node.classList.add('perf-down');}
function child(tag,text,cls){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;}
function showDay(day){
  selection=day;const d=report.days.find(d=>d.day===day);if(!d)return;
  el('DayTitle').textContent=dayLabel(day);
  el('DaySummary').textContent=d.rows.length?`${d.rows.length} trade${d.rows.length>1?'s':''} · ${formatR(d.total)}`:'Aucun trade enregistré pour ce jour et ce filtre.';
  el('DayRows').replaceChildren(...d.rows.map(t=>{
    const row=document.createElement('tr');
    const time=new Intl.DateTimeFormat('fr-FR',{timeZone:el('Zone').value,hour:'2-digit',minute:'2-digit'}).format(new Date(t.time));
    [time+(t.legacyDate?' *':''),t.asset||'Non renseigné',t.side||'Non renseigné',formatR(t.r),MODES[t.mode],t.setup||'—',t.note||'—'].forEach((v,i)=>{const td=child('td',v);if(i===3)tone(td,t.r);row.appendChild(td);});return row;
  }));
  el('DayTable').hidden=!d.rows.length;
  el('Calendar').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.day===day)));
}
function curve(){
  const values=[0,...report.days.map(d=>d.cumulative)],lo=Math.min(0,...values),hi=Math.max(0,...values),range=hi-lo||1;
  const x=i=>20+i/(values.length-1)*300,y=v=>130-(v-lo)/range*105;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 340 158');svg.setAttribute('role','img');svg.setAttribute('aria-label',`Résultat cumulé du mois : ${formatR(report.total)}. Minimum à la fin d’une journée : ${formatR(lo)}. Maximum : ${formatR(hi)}.`);
  const node=(tag,attrs)=>{const n=document.createElementNS(svg.namespaceURI,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));svg.appendChild(n);return n;};
  node('line',{x1:20,x2:320,y1:y(0),y2:y(0),stroke:'#53667d','stroke-dasharray':'3 4'});
  if(report.count)node('polyline',{points:values.map((v,i)=>`${x(i)},${y(v)}`).join(' '),fill:'none',stroke:report.total<0?'#ff9696':'#62e5bc','stroke-width':2.5,'stroke-linejoin':'round'});
  node('text',{x:20,y:13,fill:'#b8c8d9','font-size':11}).textContent=`Max ${formatR(hi)}`;
  node('text',{x:20,y:153,fill:'#b8c8d9','font-size':11}).textContent=`Min ${formatR(lo)}`;
  el('Curve').replaceChildren(svg);el('CurveEmpty').hidden=report.count>0;
}
function render(){
  try{
    prepared=prepareJournal(window.Nykuto.read(key,[]),el('Zone').value);
    report=monthlyPerformance(prepared,el('Month').value,el('Mode').value);
    el('Content').hidden=false;
    el('Count').textContent=String(report.count);el('Total').textContent=report.count?formatR(report.total):'—';tone(el('Total'),report.total);
    el('Win').textContent=report.winRate===null?'—':`${number.format(report.winRate)} %`;
    el('WinNote').textContent=`${report.wins} gagnants · ${report.losing} perdants · ${report.flat} à zéro`;
    el('Average').textContent=report.average===null?'—':formatR(report.average);
    el('Ratio').textContent=!report.count?'—':report.ratio!==null?number.format(report.ratio):report.gains>0?'Sans perte':'—';
    el('Drawdown').textContent=report.count?`${number.format(report.drawdown)} R`:'—';
    el('Streak').textContent=report.count?String(report.maxLosingStreak):'—';
    el('MonthTitle').textContent=new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${el('Month').value}-01T12:00:00Z`));
    const notices=[`${MODES[el('Mode').value]} · heures ${el('Zone').value}.`];
    if(!report.count)notices.push('Aucun trade pour cette période : change de mois ou ajoute un trade dans le Journal.');
    if(report.legacyDates)notices.push(`${report.legacyDates} ancienne(s) entrée(s) : date d’enregistrement utilisée, marquée * dans le détail.`);
    if(report.unknownModes)notices.push(`${report.unknownModes} trade(s) avec mode non renseigné.`);
    if(prepared.excluded)notices.push(`${prepared.excluded} entrée(s) invalide(s) ou en double exclue(s) du tableau de bord.`);
    el('Status').textContent=notices.join(' ');
    el('Previous').disabled=el('Month').value==='1900-01';el('Next').disabled=el('Month').value==='2100-12';
    const cells=Array.from({length:report.offset},()=>{const div=document.createElement('div');div.className='perf-blank';div.setAttribute('aria-hidden','true');return div;});
    report.days.forEach(d=>{
      const b=child('button','',`perf-day${d.rows.length?' perf-has-trades':''}`);b.type='button';b.dataset.day=d.day;tone(b,d.total);
      b.setAttribute('aria-label',`${dayLabel(d.day)}, ${d.rows.length?`${d.rows.length} trades, ${formatR(d.total)}`:'aucun trade'}`);
      b.append(child('span',String(Number(d.day.slice(-2))),'perf-day-number'),child('strong',d.rows.length?formatR(d.total):'—'),child('span',`${d.rows.length} trade${d.rows.length>1?'s':''}`,'perf-day-count'));
      b.addEventListener('click',()=>showDay(d.day));cells.push(b);
    });
    el('Calendar').replaceChildren(...cells);curve();
    if(!selection?.startsWith(el('Month').value)||!report.days.some(d=>d.day===selection))selection=report.days.findLast(d=>d.rows.length)?.day||`${el('Month').value}-01`;
    showDay(selection);
  }catch(error){report=null;el('Content').hidden=true;el('Previous').disabled=true;el('Next').disabled=true;el('Status').textContent=error.message;}
}
function setMonth(value){try{monthInfo(value);el('Month').value=value;selection=null;render();}catch(error){el('Status').textContent=error.message;}}
try{
  await window.Nykuto.ready;
  const zone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
  [...new Set([zone,'America/Asuncion','America/New_York','Europe/Paris','UTC'])].forEach(value=>{const o=child('option',value);o.value=value;el('Zone').appendChild(o);});
  prepared=prepareJournal(window.Nykuto.read(key,[]),zone);
  el('Month').value=(prepared.rows.at(-1)?.day||dateKey(Date.now(),zone)).slice(0,7);
  el('Inputs').disabled=false;
  el('Month').addEventListener('change',()=>{selection=null;render();});el('Mode').addEventListener('change',render);
  el('Zone').addEventListener('change',()=>{selection=null;render();});
  el('Previous').addEventListener('click',()=>setMonth(shiftMonth(el('Month').value,-1)));
  el('Next').addEventListener('click',()=>setMonth(shiftMonth(el('Month').value,1)));
  el('Today').addEventListener('click',()=>setMonth(dateKey(Date.now(),el('Zone').value).slice(0,7)));
  window.addEventListener('nykuto:journal-updated',render);
  render();
}catch(error){el('Status').textContent=error.message;el('Content').hidden=true;}
