import { JEU19_PUBLIC } from './jeu19-public.mjs';
import { JEU20_PUBLIC } from './jeu20-public.mjs';
export async function verifyMultimarketReport(buffer,game){
  const expected=game===19?JEU19_PUBLIC:game===20?JEU20_PUBLIC:null;
  if(!expected||buffer.byteLength!==expected.bytes||!globalThis.crypto?.subtle)throw new Error('Unverifiable report');
  const digest=await crypto.subtle.digest('SHA-256',buffer),sha=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(sha!==expected.sha256)throw new Error('Report fingerprint mismatch');
  const v=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));
  if(v.schema!==expected.schema||v.freezeSha256!==expected.freezeSha256||v.protocolSha256!==expected.protocolSha256||v.confirmed!==false||v.policy?.brokerEnabled!==false||v.policy?.paperEnabled!==false||v.policy?.liveFeed!==false||v.audit?.passed!==true||v.results?.length!==(game===19?8:1))throw new Error('Invalid research report');
  const results=[...v.results,...(v.holdout.result?[v.holdout.result]:[])];
  for(const r of results)if(r.confirmed!==false||r.windows?.length!==2||r.checks?.length!==8||r.researchPassed!==r.checks.every(c=>c.pass)||!Number.isFinite(r.diagnostic?.normal?.net)||!Number.isFinite(r.diagnostic?.stress?.net))throw new Error('Invalid scenario');
  if(game===19&&(v.selection.id!==null||v.holdout.status!=='not-opened'))throw new Error('Unexpected selection');
  if(game===20&&(v.selection.id!=='MYM/pullback'||v.holdout.status!=='evaluated-once'||v.holdout.result.researchPassed!==false))throw new Error('Unexpected validation status');
  return v;
}
