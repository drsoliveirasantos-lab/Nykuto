import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {verifyPolicy41Protocol} from '../trading/lab/jeu41-protocol-table.mjs';
import {review41} from '../trading/lab/jeu41-diagnostic.mjs';
import {JEU40_MONTHS} from '../trading/lab/jeu40-policy.mjs';
test('Game41 policy prose matches execution and rejects a changed net threshold',async()=>{
 const p=await readFile('trading/lab/JEU41_PROTOCOL.md','utf8');assert.equal(verifyPolicy41Protocol(p),true);
 assert.throws(()=>verifyPolicy41Protocol(p.replace('| Minimum gain net / perte prévue | 1.5 |','| Minimum gain net / perte prévue | 1 |')),/differs/);
});
test('Game41 data preparation is exactly the frozen Game40 preparation',async()=>{
 const original=await readFile('trading/lab/jeu40-diagnostic.mjs','utf8'),copy=await readFile('trading/lab/jeu41-preparation.mjs','utf8');
 const expected=original.slice(original.indexOf('function contexts40('),original.indexOf('export function calendar40(')).replace('function contexts40','export function contexts40').replace('function filtered40','export function filtered40');
 assert.equal(copy.slice(copy.indexOf('export function contexts40(')),expected);
});
test('Game41 review checks every month and cost without choosing by a favorable average',()=>{
 const cells=JEU40_MONTHS.flatMap(m=>['normal','stress'].map(cost=>({month:m.id,cost,delta:0,net:1,drawdown:100,referenceDrawdown:100,status:'incomplete'})));
 assert.equal(review41(cells).descriptiveGatePassed,false);cells[0].delta=10;assert.equal(review41(cells).descriptiveGatePassed,true);
 cells[1].delta=-1;assert.equal(review41(cells).descriptiveGatePassed,false);cells[1].delta=0;cells[15].drawdown=101;assert.equal(review41(cells).descriptiveGatePassed,false);
 assert.equal(review41(cells).selection,null);assert.equal(review41(cells).executionAllowed,false);assert.throws(()=>review41(cells.slice(1)),/Sixteen/);
});
