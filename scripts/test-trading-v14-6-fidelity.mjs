import test from 'node:test';
import assert from 'node:assert/strict';
import {
  V14_6_FIDELITY_POLICY,
  fidelityPriorityScore,
  structureTier,
  breakStrength,
  swingScale,
  reversalWatch,
  annotateFidelity
} from '../trading/lab/v14-6-fidelity-priority.mjs';

test('V14.6 fidelity policy cannot auto-tune, gate or execute',()=>{
  assert.equal(V14_6_FIDELITY_POLICY.researchOnly,true);
  assert.equal(V14_6_FIDELITY_POLICY.probability,false);
  assert.equal(V14_6_FIDELITY_POLICY.hardGate,false);
  assert.equal(V14_6_FIDELITY_POLICY.autoTune,false);
  assert.equal(V14_6_FIDELITY_POLICY.executionAllowed,false);
});

test('priority score uses frozen screened weights and gives generic structure zero weight',()=>{
  const full=fidelityPriorityScore({reaction:true,participation:true,htf:true,momentum:true,impulse:true});
  assert.equal(full.score,5.5);
  assert.equal(full.priority,true);
  assert.equal(full.probability,null);
  const withoutReaction=fidelityPriorityScore({reaction:false,participation:true,htf:true,momentum:true,impulse:true,genericStructure:true});
  assert.equal(withoutReaction.score,3.5);
  assert.equal(withoutReaction.priority,false);
});

test('structure is BASIC for a simple HL/LH and CONFIRMED only for BOS/MSS',()=>{
  assert.equal(structureTier({basicSwing:true}),'BASIC');
  assert.equal(structureTier({bos:true,basicSwing:true}),'CONFIRMED');
  assert.equal(structureTier({mss:true}),'CONFIRMED');
  assert.equal(structureTier({}),'NONE');
});

test('0.30 ATR break and 0.20 ATR swing thresholds are tags, never admission rules',()=>{
  assert.deepEqual(breakStrength(0.29),{breakAtr:0.29,tag:'NORMAL',changesAdmission:false});
  assert.deepEqual(breakStrength(0.30),{breakAtr:0.30,tag:'STRONG',changesAdmission:false});
  assert.deepEqual(swingScale(0.19),{deltaAtr:0.19,tag:'MICRO',changesAdmission:false});
  assert.deepEqual(swingScale(0.20),{deltaAtr:0.20,tag:'CLEAR',changesAdmission:false});
});

test('reversal watch starts from confirmed LL/HH and lasts exactly eight bars',()=>{
  assert.equal(reversalWatch({side:'BUY',barsSinceConfirmedLL:0}).active,true);
  assert.equal(reversalWatch({side:'BUY',barsSinceConfirmedLL:7}).active,true);
  assert.equal(reversalWatch({side:'BUY',barsSinceConfirmedLL:8}).active,false);
  assert.equal(reversalWatch({side:'SELL',barsSinceConfirmedHH:7}).active,true);
  assert.equal(reversalWatch({side:'SELL',barsSinceConfirmedHH:null}).active,false);
});

test('combined annotation remains explanatory rather than a trade command',()=>{
  const out=annotateFidelity({
    side:'BUY',families:{reaction:true,participation:true,htf:true,momentum:true,impulse:true},
    mss:true,breakAtr:0.41,swingDeltaAtr:0.26,barsSinceConfirmedLL:3
  });
  assert.equal(out.priority.priority,true);
  assert.equal(out.structureTier,'CONFIRMED');
  assert.equal(out.break.tag,'STRONG');
  assert.equal(out.reversalWatch.active,true);
  assert.equal(out.hardGate,false);
  assert.equal(out.executionAllowed,false);
  assert.equal(out.probability,null);
});
