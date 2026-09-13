#!/usr/bin/env node
// Local read-only relay. Never log authentication tokens or forward broker credentials.
import { open, stat, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
const ORIGIN = 'https://trading.nykuto.com';
export function makeRequest(bar, userId, token) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(userId || '')) throw new Error('Identifiant Nykuto manquant ou invalide.');
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token || '')) throw new Error('Authentifie le relais avec un jeton Cloudflare Access personnel.');
  return { method:'POST', redirect:'manual', headers: {
    'Content-Type':'application/json', Origin:ORIGIN, 'X-Nykuto-Action':'account-write',
    'X-Nykuto-User':userId, 'cf-access-token':token
  }, body:JSON.stringify({action:'bar',bar}) };
}
export async function sendBar(bar, { userId, token, fetcher = fetch, pause = sleep } = {}) {
  const options = makeRequest(bar,userId,token);
  for (let attempt = 0; attempt < 4; attempt++) {
    let response;
    try { response = await fetcher(`${ORIGIN}/api/market`, { ...options, signal:AbortSignal.timeout(12000) }); }
    catch { if (attempt === 3) throw new Error('Réseau indisponible. Relais arrêté ; redémarre après correction.'); await pause(1000 * 2 ** attempt); continue; }
    if ([429,500,502,503,504].includes(response.status)) {
      await response.body?.cancel();
      if (attempt === 3) throw new Error('Serveur indisponible. Relais arrêté sans créer de succès fictif.');
      await pause(1000 * 2 ** attempt); continue;
    }
    if (response.status >= 300 && response.status < 400 || [401,403].includes(response.status)) {
      await response.body?.cancel(); throw new Error('Accès expiré ou refusé. Reconnecte Cloudflare Access puis redémarre le relais.');
    }
    if (!response.headers.get('content-type')?.includes('application/json')) { await response.body?.cancel(); throw new Error('Réponse non JSON : réception non confirmée.'); }
    const data = await response.json();
    if (!response.ok || data.accepted !== true || data.root !== bar.root || data.endMs !== bar.endMs)
      throw new Error(`Bougie non acceptée (HTTP ${response.status}). Vérifie schéma, échéance et ordre chronologique.`);
    return data;
  }
}
export async function run(file, userId) {
  if (!file) throw new Error('Usage : node relay.mjs CHEMIN_JSONL IDENTIFIANT_NYKUTO');
  const tokenFile = process.env.NYKUTO_ACCESS_TOKEN_FILE;
  if (!tokenFile) throw new Error('Définis NYKUTO_ACCESS_TOKEN_FILE vers le jeton personnel, hors du dépôt.');
  // Skip old backlog on first start. Exporter appends only closed bars after this point.
  let offset = (await stat(file)).size, pending = Buffer.alloc(0);
  console.log('Relais lecture seule. En attente de NOUVELLES bougies. Aucun ordre, aucun rattrapage historique.');
  while (true) {
    const info = await stat(file);
    if (info.size < offset) throw new Error('Fichier remplacé ou tronqué. Redémarre le relais pour éviter une lecture ambiguë.');
    if (info.size > 25 * 1024 * 1024) throw new Error('Limite locale 25 Mo atteinte. Archive le fichier hors Git puis redémarre.');
    if (info.size > offset) {
      const handle = await open(file,'r');
      try {
        const buffer = Buffer.alloc(Math.min(65536,info.size-offset));
        const { bytesRead } = await handle.read(buffer,0,buffer.length,offset); offset += bytesRead;
        pending = Buffer.concat([pending,buffer.subarray(0,bytesRead)]);
      } finally { await handle.close(); }
      let newline;
      while ((newline = pending.indexOf(10)) >= 0) {
        const line = pending.subarray(0,newline); pending = pending.subarray(newline+1);
        if (!line.toString('utf8').trim()) continue;
        if (line.length > 4096) throw new Error('Ligne supérieure à 4 Ko. Relais arrêté.');
        let bar; try { bar = JSON.parse(line.toString('utf8')); } catch { throw new Error('JSON local invalide. Relais arrêté.'); }
        const token = (await readFile(tokenFile,'utf8')).replace(/^\uFEFF/,'').trim();
        const result = await sendBar(bar,{userId,token});
        console.log(`Réception confirmée : ${result.root} ${new Date(result.endMs).toISOString()}${result.duplicate?' (doublon ignoré)':''}`);
      }
      if (pending.length > 4096) throw new Error('Ligne incomplète trop longue. Relais arrêté.');
    }
    await sleep(1000);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run(process.argv[2],process.argv[3]).catch(error => { console.error(error.message); process.exitCode = 1; });
}
