import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),hash=b=>createHash('sha256').update(b).digest('hex');
test('Game27 preserves its freeze, all failures, monthly reconciliation and privacy boundary',async()=>{
  const raw=await readFile(new URL('trading/lab/jeu27-report.json',root));
  assert.equal(hash(raw),'8ed896cdb39335d3af3d0cdba221b919e6afe29660a460b9e2baac5f59890b9b');
  const r=JSON.parse(raw),freezeRaw=await readFile(new URL('trading/lab/jeu27-freeze.json',root));
  assert.equal(hash(freezeRaw),r.freezeSha256);
  for(const [path,sha]of Object.entries(JSON.parse(freezeRaw).files))assert.equal(hash(await readFile(new URL(path,root))),sha,path);
  assert.equal(r.results.length,12);assert.equal(r.selection,null);assert.equal(r.confirmed,false);
  assert.ok(r.results.every(x=>!x.researchPassed&&x.researchPassed===Object.values(x.checks).every(Boolean)));
  assert.equal(r.audit.baselineReproductions,8);
  for(const x of r.results)for(const w of x.windows){assert.equal(w.complete,w.expected===w.scored);assert.equal(w.account===null,!w.complete);}
  assert.equal(r.monthlyMYM[0].months.reduce((s,m)=>s+m.net,0),-424.5);
  assert.equal(r.monthlyMYM[1].months.reduce((s,m)=>s+m.net,0),-340.5);
  function privacy(value){if(!value||typeof value!=='object')return;for(const [key,v]of Object.entries(value)){assert.ok(!['entryTime','entry','stopPrice','balanceAfter','ticker'].includes(key),'Private trade data in public report');if(key==='trades')assert.equal(typeof v,'number');privacy(v);}}
  privacy(r);
  const ledger=JSON.parse(await readFile(new URL('trading/lab/research-ledger.json',root)));
  assert.equal(ledger.entries.filter(x=>x.game<27).length,57);
  assert.deepEqual(ledger.entries.filter(x=>x.game===27).map(x=>x.id),r.results.map(x=>x.id));
  const html=await readFile(new URL('trading/lab/index.html',root),'utf8');
  assert.ok(html.includes('id="diagnosticGame"'));assert.ok(html.includes('19 sorties au stop'));
});
