import { KNOWLEDGE_PIN } from './catalogue-pin.mjs';

export async function loadKnowledge(fetcher=fetch) {
  const response=await fetcher(new URL('./catalogue.json',import.meta.url),{cache:'no-store',credentials:'same-origin'});
  if (!response.ok) throw Error('Base documentaire indisponible. Réessaie.');
  const bytes=await response.arrayBuffer();
  if(bytes.byteLength!==KNOWLEDGE_PIN.bytes)throw Error('Base documentaire incomplète.');
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(hash!==KNOWLEDGE_PIN.sha256)throw Error('La version de la base documentaire ne correspond pas.');
  const catalogue=JSON.parse(new TextDecoder().decode(bytes));
  if(catalogue.mode!=='documentary_only'||catalogue.executionAllowed!==false||catalogue.newsConnected!==false)throw Error('Statut documentaire invalide.');
  return catalogue;
}
