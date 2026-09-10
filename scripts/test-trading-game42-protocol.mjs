import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {verifyPolicy42Protocol} from '../trading/lab/jeu42-protocol-table.mjs';
import {review42} from '../trading/lab/jeu42-diagnostic.mjs';
import {JEU40_MONTHS} from '../trading/lab/jeu40-policy.mjs';
test('Game42 policy prose matches execution and rejects a changed volume rule',async()=>{
 const p=await readFile('trading/lab/JEU42_PROTOCOL.md','utf8');assert.equal(verifyPolicy42Protocol(p),true);
 assert.throws(()=>verifyPolicy42Protocol(p.replace('| Précision du volume relatif | 1000000 |','| Précision du volume relatif | 1000 |')),/differs/);
});
test('Game42 data preparation is exactly the frozen Game40 preparation',async()=>{
 const original=await readFile('trading/lab/jeu40-diagnostic.mjs','utf8'),copy=await readFile('trading/lab/jeu41-preparation.mjs','utf8');
 const expected=original.slice(original.indexOf('function contexts40('),original.indexOf('export function calendar40(')).replace('function contexts40','export function contexts40').replace('function filtered40','export function filtered40');
 assert.equal(copy.slice(copy.indexOf('export function contexts40(')),expected);
});
test('Game42 review checks every month and cost without choosing by a favorable average',()=>{
 const cells=JEU40_MONTHS.flatMap(m=>['normal','stress'].map(cost=>({month:m.id,cost,delta:0,net:1,drawdown:100,referenceDrawdown:100,status:'incomplete'})));
 assert.equal(review42(cells).descriptiveGatePassed,false);cells[0].delta=10;assert.equal(review42(cells).descriptiveGatePassed,true);
 cells[1].delta=-1;assert.equal(review42(cells).descriptiveGatePassed,false);cells[1].delta=0;cells[15].drawdown=101;assert.equal(review42(cells).descriptiveGatePassed,false);
 assert.equal(review42(cells).selection,null);assert.equal(review42(cells).executionAllowed,false);assert.throws(()=>review42(cells.slice(1)),/Sixteen/);
});
