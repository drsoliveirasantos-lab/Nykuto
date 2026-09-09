export function recordElement(record, sources, documentRef=document) {
  const element=(tag,text)=>{const el=documentRef.createElement(tag);el.textContent=text;return el;};
  const details=documentRef.createElement('details');details.className='knowledge-record';
  details.appendChild(element('summary',record.title));
  const body=documentRef.createElement('div');body.className='knowledge-record-body';
  body.appendChild(element('p',`${record.id} · Référence documentaire · aucune règle de trading activée`));
  const content=element('div',record.text);content.className='knowledge-text';body.appendChild(content);
  if(record.runtimeNote){const note=element('p',record.runtimeNote);note.className='knowledge-note';body.appendChild(note);}
  const list=documentRef.createElement('ul');
  for(const id of record.sourceIds){
    const source=sources.find(s=>s.id===id);if(!source)continue;
    let url;try{url=new URL(source.url);}catch{continue;}
    if(url.protocol!=='https:'||url.username||url.password)continue;
    const item=documentRef.createElement('li'),link=element('a',`${source.title} (${id})`);
    link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';item.appendChild(link);list.appendChild(item);
  }
  if(list.childNodes.length)body.appendChild(list);
  details.appendChild(body);return details;
}
