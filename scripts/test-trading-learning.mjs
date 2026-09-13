import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const read=p=>readFile(new URL('../'+p,import.meta.url)),cents=n=>Math.round(n*100)/100;
test('learning audit reconciles all six archived reference months without treating added knowledge as performance',async()=>{
 const a=JSON.parse(await read('trading/lab/research-learning-audit.json')),r=JSON.parse(await read('trading/lab/jeu37-report.json')),archive=JSON.parse(await read('trading/lab/jeu37-archive.json'));
 assert.equal(a.sourceSha256,archive.files.find(f=>f.name==='runs-private.json').sha256);assert.equal(a.independent,false);assert.equal(a.executionAllowed,false);assert.equal(a.months.length,6);
 for(const m of a.months){const c=r.views.find(v=>v.variant==='fixed100'&&v.month===m.month).costs[m.cost];
  for(const k of ['trades','wins','losses','net','mean','winRate','averageWin','averageLoss'])assert.equal(m[k],c[k]);
  assert.equal(cents(m.gross-m.costs),m.net);assert.equal(Object.values(m.exits).reduce((n,x)=>n+x,0),m.trades);assert.ok(m.lossesOnEntryBar<=m.losses);assert.equal(m.neededMeanFor4000,cents(4000/m.trades));
  for(const x of m.markets){const old=c.contributions.find(y=>y.symbol===x.symbol);assert.equal(x.net,old.net);assert.equal(x.wins,old.wins);assert.equal(x.trades,old.trades);assert.ok(x.missingContext<=x.trades);}
 }
 const normal=a.months.filter(m=>m.cost==='normal');assert.deepEqual(normal.map(m=>m.lossesOnEntryBar),[3,3,5]);assert.equal(normal.reduce((n,m)=>n+m.exits.Stop,0),25);
 assert.ok(a.months.filter(m=>m.month==='july').every(m=>m.markets.every(x=>x.missingContext===0)));
});
test('obstacle campaign preserves its original freeze and durable lessons remain linked',async()=>{
 const f=JSON.parse(await read('trading/lab/jeu38-freeze.json'));
 for(const [path,sha]of Object.entries(f.files))assert.equal(createHash('sha256').update(await read(path)).digest('hex'),sha,path);
 const lessons=(await read('trading/lab/RESEARCH_LESSONS.md')).toString(),html=(await read('trading/lab/index.html')).toString();
 assert.ok(lessons.includes('zéro confirmation indépendante'));assert.ok(html.includes('id="learning38Game"'));
});
