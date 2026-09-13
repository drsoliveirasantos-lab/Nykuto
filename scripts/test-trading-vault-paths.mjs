import test from 'node:test';
import assert from 'node:assert/strict';
import { ownerOnlyPath } from '../trading/functions/_middleware.js';

test('research authorization handles equivalent encoded and normalized asset paths', () => {
  for(const path of ['/lab','/lab/report.json','/%6cab/report.json','/lab%2freport.json','/lab%252freport.json','/%2flab/report.json','/unused/../historique/','/LAB/report.json','/models\\weights','/api/lab/history','/%','/public%3f%2f%2e%2e%2flab/report.json','/public%23%2f%2e%2e%2fhistorique/report.json','/%00lab']) {
    assert.equal(ownerOnlyPath(path),true,path);
  }
  for(const path of ['/','/account/','/replay/','/discipline/','/alerts/','/labelling/']) assert.equal(ownerOnlyPath(path),false,path);
});
