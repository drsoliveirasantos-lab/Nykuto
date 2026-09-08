import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
export const users = [
  { id: '11111111-1111-4111-8111-111111111111', email: 'owner@example.com', role: 'owner' },
  { id: '22222222-2222-4222-8222-222222222222', email: 'tester-a@example.com', role: 'tester' },
  { id: '33333333-3333-4333-8333-333333333333', email: 'tester-b@example.com', role: 'tester' }
];
export function accountDatabase() {
  const sql = new DatabaseSync(':memory:'); sql.exec(readFileSync(new URL('../trading/migrations/0001_trading_accounts.sql', import.meta.url), 'utf8'));
  for (const user of users) sql.prepare('INSERT INTO trading_users(id,email,role,first_name,last_name,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(user.id, user.email, user.role, 'Test', user.role, new Date().toISOString(), new Date().toISOString());
  return { sql, prepare(query) { const statement = sql.prepare(query); return { bind(...params) { return { async first() { return statement.get(...params) || null; }, async all() { return { results: statement.all(...params) }; }, async run() { const result = statement.run(...params); return { meta: { changes: Number(result.changes) } }; } }; } }; } };
}
