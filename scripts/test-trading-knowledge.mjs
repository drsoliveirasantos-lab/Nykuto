import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildKnowledge } from './build-trading-knowledge.mjs';
import { retrieveKnowledge, knowledgeContext, explainAnalysis } from '../trading/knowledge/knowledge-core.mjs';
import { loadKnowledge } from '../trading/knowledge/knowledge-loader.mjs';
import { createAnalysisKnowledge } from '../trading/knowledge/analysis-knowledge.mjs';
import { recordElement } from '../trading/knowledge/knowledge-view.mjs';

const bytes=readFileSync(new URL('../trading/knowledge/catalogue.json',import.meta.url));
const catalogue=JSON.parse(bytes);
test('all imported documents reproduce the catalogue with namespaced sources and inactive proposals',()=>{
  assert.deepEqual(buildKnowledge(),catalogue);
  assert.deepEqual(catalogue.counts,{rsiConcepts:56,priceActionConcepts:43,newsResources:77,records:205,sourceReferences:135,distinctSourceUrls:128,rsiAcceptanceSpecifications:24,priceActionAcceptanceSpecifications:36,newsAcceptanceSpecifications:24,rsiHypotheses:6});
  for(const r of catalogue.records){assert.equal(r.executionAllowed,false);assert.equal(r.profitabilityValidated,false);for(const id of r.sourceIds)assert(catalogue.sources.some(s=>s.id===id));}
  assert(catalogue.sources.some(s=>s.id==='rsi:S01'));assert(catalogue.sources.some(s=>s.id==='price-action:S01'));
});
test('retrieval finds RSI, candle and news references without pretending to have live news',()=>{
  assert.equal(retrieveKnowledge(catalogue,{query:'surachat survente',pack:'rsi',limit:1})[0].id,'rsi:K06');
  assert(retrieveKnowledge(catalogue,{query:'englobante',pack:'price-action'}).some(r=>r.id==='price-action:BULLISH_BODY_ENGULF_BOUNDARY_V1'));
  assert(retrieveKnowledge(catalogue,{query:'FOMC',pack:'news'}).some(r=>r.id==='news:fed_fomc'));
  assert.deepEqual(retrieveKnowledge(catalogue,{query:'zzznomatchzzz'}),[]);
  assert.throws(()=>retrieveKnowledge(catalogue,{limit:Infinity}));
  const context=knowledgeContext(catalogue,['news:fed_fomc','news:fed_fomc']);
  assert.equal(context.records.length,1);assert.equal(context.executionAllowed,false);assert.equal(context.newsState,'not_connected');assert.equal(context.modelTrained,false);assert.equal(context.guardrails.length,5);
});
test('analysis retrieval respects raw RSI boundaries and does not silently substitute definitions',()=>{
  const result={structure:'Mixte',patterns:['Englobante haussière'],events:[]};
  for(const [value,zone] of [[29.99999,'Survente'],[30,'Intermédiaire'],[70,'Intermédiaire'],[70.00001,'Surachat'],[null,'Inconnu'],[undefined,'Inconnu']]){
    const output=explainAnalysis(catalogue,result,{rsi:[{value}]});assert.equal(output.observations.zone,zone);
    assert(output.records.some(r=>r.id==='price-action:BULLISH_BODY_ENGULF_BOUNDARY_V1'));assert.equal(output.executionAllowed,false);
  }
  const flat=explainAnalysis(catalogue,result,{rsi:[{value:50}]});assert.match(flat.records.find(r=>r.id==='rsi:K04').runtimeNote,/Convention actuelle/);
  const mss=explainAnalysis(catalogue,{...result,events:[{kind:'MSS potentiel'}]},{rsi:[]});assert(!mss.records.some(r=>r.id==='price-action:CHOCH_V1'));
});
test('loader rejects unavailable, truncated or modified knowledge',async()=>{
  assert.deepEqual(await loadKnowledge(async()=>new Response(bytes)),catalogue);
  await assert.rejects(loadKnowledge(async()=>new Response('',{status:503})));
  await assert.rejects(loadKnowledge(async()=>new Response(bytes.subarray(1))));
  const modified=Buffer.from(bytes);modified[100]^=1;await assert.rejects(loadKnowledge(async()=>new Response(modified)));
});
class Element{
  constructor(tag){this.tagName=tag;this.childNodes=[];this.hidden=false;this.textContent='';this.events={};}
  appendChild(child){this.childNodes.push(child);return child;}
  replaceChildren(...children){this.childNodes=children;}
  addEventListener(type,fn){this.events[type]=fn;}
}
const documentStub={createElement:tag=>new Element(tag)};
test('research text remains text and unsafe source URLs are never linked',()=>{
  const record={id:'example',title:'<img onerror=alert(1)>',text:'<script>fake()</script>',sourceIds:['bad','good']};
  const item=recordElement(record,[{id:'bad',url:'javascript:alert(1)',title:'bad'},{id:'good',url:'https://example.com/source',title:'good'}],documentStub);
  const flatten=node=>[node,...node.childNodes.flatMap(flatten)];const nodes=flatten(item);
  assert.equal(nodes.filter(n=>n.tagName==='a').length,1);assert(nodes.some(n=>n.textContent===record.text));assert(!nodes.some(n=>n.tagName==='script'));
});
test('analysis switches, clearing and retry do not display stale knowledge',async()=>{
  const prior=globalThis.document;globalThis.document=documentStub;
  try{
    const elements={panel:new Element('section'),status:new Element('p'),records:new Element('div'),retry:new Element('button')};
    let resolve;const controller=createAnalysisKnowledge(elements,()=>new Promise(done=>{resolve=done;}));
    const result={structure:'Mixte',patterns:[],events:[]};
    const first=controller.show(result,{rsi:[{value:80}]});const second=controller.show(result,{rsi:[{value:20}]});resolve(catalogue);await Promise.all([first,second]);
    assert.match(elements.status.textContent,/Survente/);assert.doesNotMatch(elements.status.textContent,/Surachat/);
    controller.clear();assert.equal(elements.panel.hidden,true);assert.equal(elements.records.childNodes.length,0);
    let resolveAfterClear;const late=createAnalysisKnowledge(elements,()=>new Promise(done=>{resolveAfterClear=done;}));
    const pending=late.show(result,{rsi:[{value:80}]});late.clear();resolveAfterClear(catalogue);await pending;assert.equal(elements.panel.hidden,true);assert.equal(elements.records.childNodes.length,0);
    let attempts=0;const recover=createAnalysisKnowledge(elements,async()=>{if(!attempts++)throw Error('missing');return catalogue;});
    await recover.show(result,{rsi:[]});assert.equal(elements.retry.hidden,false);assert.equal(elements.records.childNodes.length,0);
    await recover.show(result,{rsi:[]});assert.match(elements.status.textContent,/Inconnu/);assert.equal(elements.retry.hidden,true);
  }finally{globalThis.document=prior;}
});
