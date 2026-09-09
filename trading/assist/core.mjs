// Human-confirmed simulation only. No broker, quote feed, strategy or autonomous fill.
export const KEY = 'nykuto-assisted-simulation-v1';
export const SPEC = Object.freeze({
  MNQ: { tick: .25, tickUSD: .5 }, MES: { tick: .25, tickUSD: 1.25 },
  MYM: { tick: 1, tickUSD: .5 }, MGC: { tick: .1, tickUSD: 1 }
});
export class AssistError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export function exact(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== keys.length || keys.some(k => !Object.hasOwn(value,k)))
    throw new AssistError('Champs incomplets ou non autorisés.');
}
function text(v, max, label, required = true) {
  if (typeof v !== 'string' || v.length > max || (required && !v.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v)) throw new AssistError(`${label} invalide.`);
  return v.trim();
}
function number(v, min, max, label, integer = false) {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max || (integer && !Number.isSafeInteger(v))) throw new AssistError(`${label} invalide.`);
  return v;
}
export function price(v, root) {
  const s = SPEC[root];
  number(v, .01, 1000000, 'Prix');
  if (!s || Math.abs(v / s.tick - Math.round(v / s.tick)) > 1e-6) throw new AssistError('Prix incompatible avec le tick du microcontrat.');
  return Math.round(v / s.tick);
}
export function context(input, now = Date.now()) {
  exact(input,['root','contract','timeframes','capturedAt','source','notes']);
  if (typeof input.root!=='string' || !Object.hasOwn(SPEC,input.root)) throw new AssistError('Choisis MNQ, MES, MYM ou MGC.');
  const contract = text(input.contract,20,'Échéance');
  if (!new RegExp(`^${input.root}-20\\d{2}(0[1-9]|1[0-2])$`).test(contract)) throw new AssistError('Échéance requise : ROOT-YYYYMM. Un symbole continu ne suffit pas.');
  number(input.capturedAt,Date.UTC(2000,0,1),now + 5000,'Heure de capture',true);
  if (!['declared-live','delayed','unknown','historical'].includes(input.source)) throw new AssistError('Précise la nature des données.');
  return { root:input.root,contract,timeframes:text(input.timeframes,80,'Unités de temps'),capturedAt:input.capturedAt,source:input.source,notes:text(input.notes,2000,'Contexte',false) };
}
export function ticket(input, now = Date.now()) {
  exact(input,['context','side','quantity','entry','stop','target','feePerSide','slippageTicks','riskBudget','quoteAt','analysis']);
  const ctx = context(input.context,now);
  if (!['long','short'].includes(input.side)) throw new AssistError('Choisis un sens ou reste en attente.');
  const quantity=number(input.quantity,1,20,'Quantité',true);
  const entryTicks=price(input.entry,ctx.root), stopTicks=price(input.stop,ctx.root), targetTicks=price(input.target,ctx.root);
  const d=input.side==='long'?1:-1;
  if ((entryTicks-stopTicks)*d<=0 || (targetTicks-entryTicks)*d<=0) throw new AssistError('Long : stop < entrée < objectif. Short : objectif < entrée < stop.');
  const feePerSide=number(input.feePerSide,0,100,'Frais par côté'), slippageTicks=number(input.slippageTicks,0,100,'Slippage',true);
  const riskBudget=number(input.riskBudget,.01,100000,'Budget de risque');
  number(input.quoteAt,ctx.capturedAt,now+5000,'Heure du prix saisi',true);
  const analysis=text(input.analysis,4000,'Analyse / justification');
  return { context:ctx,side:input.side,quantity,entry:input.entry,stop:input.stop,target:input.target,feePerSide,slippageTicks,riskBudget,quoteAt:input.quoteAt,analysis };
}
const money = value => Math.round((value + Number.EPSILON)*100)/100;
export function assess(input, now = Date.now()) {
  const t=ticket(input,now), s=SPEC[t.context.root], d=t.side==='long'?1:-1;
  const e=price(t.entry,t.context.root), st=price(t.stop,t.context.root), tp=price(t.target,t.context.root);
  const friction=(2*t.feePerSide+2*t.slippageTicks*s.tickUSD)*t.quantity;
  const risk=money(Math.abs(e-st)*s.tickUSD*t.quantity+friction);
  const reward=money(Math.abs(tp-e)*s.tickUSD*t.quantity-friction);
  const fillTicks=e+d*t.slippageTicks, fillPrice=money(fillTicks*s.tick);
  const blockers=[], warnings=[];
  if (risk>t.riskBudget+1e-8) blockers.push('Risque modélisé supérieur au budget.');
  if (reward<=0 || (tp-fillTicks)*d<=0 || fillPrice<=0) blockers.push('Objectif ou entrée invalide après les coûts.');
  if (t.context.source==='declared-live' && now-t.quoteAt>120000) blockers.push('Prix saisi ancien : relève et confirme un nouveau prix (moins de 2 minutes).');
  if (now-t.context.capturedAt>120000) warnings.push('Capture ancienne : revalider le contexte, pas seulement le prix.');
  if (t.context.source!=='declared-live') warnings.push('Données non vérifiées en direct : scénario hypothétique, pas forward test.');
  if (t.feePerSide===0 || t.slippageTicks===0) warnings.push('Frais ou slippage nuls : hypothèse optimiste à justifier.');
  return { ticket:t,risk,reward,friction:money(friction),ratio:reward/risk,fillPrice,blockers,warnings };
}
export function emptyBook() { return { version:1,trades:[] }; }
export function validBook(book) {
  if (!book || book.version!==1 || !Array.isArray(book.trades) || book.trades.length>500 || book.trades.some(t=>!t || typeof t.id!=='string' || !['open','closed'].includes(t.status))) throw new AssistError('Journal illisible : aucune donnée remplacée.',503);
  return book;
}
export function apply(book, command, now = Date.now()) {
  validBook(book);
  if (!command || typeof command!=='object' || Array.isArray(command)) throw new AssistError('Commande invalide.');
  if (command.action==='open') {
    exact(command,['action','id','ticket','confirmed']);
    if (command.confirmed!==true || typeof command.id!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(command.id)) throw new AssistError('Confirmation explicite et identifiant requis.');
    const t=ticket(command.ticket,now), previous=book.trades.find(x=>x.id===command.id);
    if (previous) {
      if (JSON.stringify(previous.ticket)!==JSON.stringify(t)) throw new AssistError('Identifiant déjà utilisé pour un autre ticket.',409);
      return { book,duplicate:true };
    }
    if (book.trades.length>=500) throw new AssistError('Journal de 500 tickets atteint ; exporte-le. Aucune suppression automatique.',409);
    if (book.trades.some(x=>x.status==='open')) throw new AssistError('Clôture la simulation ouverte avant une nouvelle entrée.',409);
    const a=assess(t,now);
    if (a.blockers.length) throw new AssistError(a.blockers.join(' '),422);
    const trade={id:command.id,mode:'assisted-simulation',status:'open',createdAt:new Date(now).toISOString(),ticket:t,entryFill:a.fillPrice,plannedRisk:a.risk,plannedReward:a.reward};
    return { book:{version:1,trades:[...book.trades,trade]},duplicate:false };
  }
  if (command.action==='close') {
    exact(command,['action','id','exit','observedAt','reason','confirmed']);
    if (command.confirmed!==true) throw new AssistError('Confirme la clôture simulée.');
    const trade=book.trades.find(x=>x.id===command.id);
    if (!trade) throw new AssistError('Ticket introuvable.',404);
    const t=trade.ticket, s=SPEC[t.context.root], d=t.side==='long'?1:-1;
    const ticks=price(command.exit,t.context.root);
    number(command.observedAt,t.quoteAt,now+5000,'Heure de sortie',true);
    const reason=text(command.reason,500,'Motif de clôture');
    const closure={exit:command.exit,observedAt:command.observedAt,reason};
    if (trade.status==='closed') {
      if (JSON.stringify(trade.closure)!==JSON.stringify(closure)) throw new AssistError('Ce ticket est déjà clôturé avec d’autres valeurs.',409);
      return {book,duplicate:true};
    }
    const exitFill=money((ticks-d*t.slippageTicks)*s.tick);
    if (exitFill<=0) throw new AssistError('Prix de sortie invalide après slippage.');
    const gross=money((price(exitFill,t.context.root)-price(trade.entryFill,t.context.root))*d*s.tickUSD*t.quantity);
    const fees=money(2*t.feePerSide*t.quantity), net=money(gross-fees);
    const closed={...trade,status:'closed',closedAt:new Date(now).toISOString(),closure,exitFill,gross,fees,net,r:net/trade.plannedRisk};
    return {book:{version:1,trades:book.trades.map(x=>x.id===trade.id?closed:x)},duplicate:false};
  }
  throw new AssistError('Action non autorisée. Aucun ordre broker disponible.');
}
export function makePrompt(ctx) {
  return `Analyse pédagogique de captures de futures pour une simulation manuelle Nykuto.\nContexte déclaré, non vérifié : ${JSON.stringify(ctx)}\nJe joins les images séparément. Ne prétends pas les avoir vues si elles manquent. Décris la tendance et la structure visibles, les niveaux lisibles et les indicateurs affichés. Sépare observations, hypothèses et informations manquantes. Donne des scénarios conditionnels haussier/baissier/attente, leurs déclencheurs et invalidations. N'invente ni cours actuel, ni carnet, ni volume, ni news, ni taux de confiance. Signale les prix illisibles et les captures anciennes. Demande de confirmer manuellement le contrat, l'heure et les niveaux avant un ticket. Aucun ordre à exécuter.`;
}
