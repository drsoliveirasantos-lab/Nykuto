import { KEY, AssistError, exact, validBook, emptyBook, apply } from './core.mjs';
import { aiConfigured } from './vision.mjs';
export async function loadBook(db,userId) {
  const row=await db.prepare('SELECT value, revision FROM trading_state WHERE user_id = ? AND state_key = ?').bind(userId,KEY).first();
  if (!row) return {book:emptyBook(),revision:0};
  try { return {book:validBook(JSON.parse(row.value)),revision:row.revision}; }
  catch { throw new AssistError('Journal illisible. Aucune donnée remplacée.',503); }
}
export async function saveCommand(db,userId,input,now=Date.now()) {
  exact(input,['revision','command']);
  if (!Number.isSafeInteger(input.revision)||input.revision<0) throw new AssistError('Révision invalide.');
  const current=await loadBook(db,userId);
  const next=apply(current.book,input.command,now);
  if (next.duplicate) return {...current,saved:true,duplicate:true};
  if (input.revision!==current.revision) throw new AssistError('Une autre page a modifié les simulations. Actualise sans remplacer tes saisies.',409);
  const value=JSON.stringify(next.book), date=new Date(now).toISOString();
  if (new TextEncoder().encode(value).length>2000000) throw new AssistError('Journal plein : exporte-le. Aucun ticket effacé.',409);
  const result=current.revision===0
    ? await db.prepare('INSERT INTO trading_state(user_id,state_key,value,revision,updated_at) VALUES(?,?,?,1,?) ON CONFLICT(user_id,state_key) DO NOTHING').bind(userId,KEY,value,date).run()
    : await db.prepare('UPDATE trading_state SET value = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND state_key = ? AND revision = ?').bind(value,date,userId,KEY,current.revision).run();
  if (result.meta.changes!==1) throw new AssistError('Sauvegarde concurrente : actualise et vérifie le ticket avant de réessayer.',409);
  return {book:next.book,revision:current.revision+1,saved:true,duplicate:false};
}
export function createHandler(accounts) {
  const {member,mutation,body,handle,json,AccountError}=accounts;
  return c=>handle(async()=>{
    const user=await member(c), db=c.env.TRADING_USERS;
    try {
      if (c.request.method==='GET') return json({userId:user.id,...await loadBook(db,user.id),aiConfigured:aiConfigured(c.env)&&user.role==='owner',brokerConnected:false,autonomousBot:false});
      if (c.request.method!=='POST') throw new AssistError('Méthode non autorisée.',405);
      mutation(c.request,user);
      return json({userId:user.id,...await saveCommand(db,user.id,await body(c.request,16000))});
    } catch(e) { if(e instanceof AssistError) throw new AccountError(e.message,e.status); throw e; }
  });
}
