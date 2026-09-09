// Document retrieval only; numeric detectors and risk policies remain authoritative.
const normalize = text => String(text).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
const tokens = text => [...new Set(normalize(text).match(/[a-z0-9]+/g)||[])].slice(0,24);

export function retrieveKnowledge(catalogue, {query='',pack='',limit=12}={}) {
  if (!Number.isInteger(limit)||limit<1||limit>250||typeof query!=='string'||query.length>1000||!['','rsi','price-action','news'].includes(pack)) throw Error('Recherche invalide.');
  const terms=tokens(query);
  return catalogue.records.filter(r=>!pack||r.pack===pack).map(record=>{
    const title=normalize(`${record.id} ${record.title}`), body=normalize(`${record.category} ${record.text}`);
    const score=terms.reduce((sum,t)=>sum+(title.includes(t)?8:body.includes(t)?1:0),0);
    return {record,score};
  }).filter(r=>!terms.length||r.score>0).sort((a,b)=>b.score-a.score||a.record.id.localeCompare(b.record.id)).slice(0,limit).map(({record})=>record);
}

export function knowledgeContext(catalogue, ids) {
  const selected=[...new Set(ids)].map(id=>catalogue.records.find(r=>r.id===id)).filter(Boolean);
  const refs=new Set(selected.flatMap(r=>r.sourceIds));
  return {version:catalogue.version,mode:'documentary_only',executionAllowed:false,modelTrained:false,newsState:'not_connected',
    guardrails:[...catalogue.guardrails],records:selected,sources:catalogue.sources.filter(s=>refs.has(s.id))};
}

export function explainAnalysis(catalogue, result, indicators) {
  const value=indicators.rsi.at(-1)?.value;
  const known=typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100;
  const zone=!known?'Inconnu':value<30?'Survente':value>70?'Surachat':'Intermédiaire';
  const ids=['rsi:K06','rsi:K20','rsi:K36','price-action:POLICY'];
  const patterns={Doji:'DOJI','Forme de marteau':'HAMMER','Longue mèche haute':'SHOOTING_STAR'};
  for (const p of result.patterns) {
    if(p.startsWith('Englobante')) ids.push(`price-action:${p.endsWith('haussière')?'BULLISH_BODY_ENGULF_BOUNDARY_V1':'BEARISH_BODY_ENGULF_BOUNDARY_V1'}`);
    else if(patterns[p])ids.push(`price-action:${patterns[p]}`);
  }
  if(result.events.at(-1)?.kind==='BOS')ids.push('price-action:BOS_V1');
  if(result.events.at(-1)?.kind==='MSS potentiel')ids.push('rsi:K22');
  // A displayed 50 alone cannot establish a flat series; describe the convention without asserting flatness.
  if(value===50)ids.push('rsi:K04');
  return {...knowledgeContext(catalogue,ids),observations:{rsi:known?value:null,zone,structure:result.structure},
    caveats:['La forme observée est séparée de son interprétation : le contexte exigé par une fiche peut manquer.',
      'Les divergences, failure swings et autres figures non calculées ne sont pas déclarés présents sur ce graphique.']};
}
