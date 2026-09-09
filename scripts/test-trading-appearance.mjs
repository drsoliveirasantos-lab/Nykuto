import test from 'node:test';
import assert from 'node:assert/strict';
import {validateState,STATE_KEYS} from '../trading/account/account-service.mjs';
import {APPEARANCE_KEY,DEFAULT_COLORS,foreground} from '../trading/performance/appearance-core.mjs';
test('Calendar appearance is a bounded account state, without arbitrary CSS or extra fields',()=>{
  assert.ok(STATE_KEYS.has(APPEARANCE_KEY));
  assert.deepEqual(JSON.parse(validateState(APPEARANCE_KEY,DEFAULT_COLORS)),DEFAULT_COLORS);
  for(const bad of [null,[],{}, {...DEFAULT_COLORS,positive:'red'}, {...DEFAULT_COLORS,background:'url(https://example.com)'},{...DEFAULT_COLORS,other:'#ffffff'}])assert.throws(()=>validateState(APPEARANCE_KEY,bad));
});
test('Calendar chooses readable text for black, white, red and green backgrounds',()=>{
  assert.equal(foreground('#000000'),'#ffffff');assert.equal(foreground('#ffffff'),'#000000');
  assert.equal(foreground('#ff0000'),'#000000');assert.equal(foreground('#00ff00'),'#000000');
});
