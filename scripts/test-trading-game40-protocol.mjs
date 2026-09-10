import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {policy40Table,verifyPolicy40Protocol} from '../trading/lab/jeu40-protocol-table.mjs';
test('Game40 prose parameters match execution policy and reject a changed risk',async()=>{
 const protocol=await readFile('trading/lab/JEU40_PROTOCOL.md','utf8');
 assert.equal(verifyPolicy40Protocol(protocol),true);
 assert.throws(()=>verifyPolicy40Protocol(protocol.replace('| Risque maximal par trade USD | 100 |','| Risque maximal par trade USD | 500 |')),/differs/);
 assert.ok(policy40Table().includes('| Réinitialisation | new-account-each-month |'));
});
