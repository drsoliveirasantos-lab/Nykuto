// These are environment preferences, never authentication or execution adapters.
export const PROVIDERS = Object.freeze([
  { id: 'paper', name: 'TradingView Paper Trading', mark: 'P', category: 'simulation', type: 'Simulation', status: 'Sur TradingView', description: 'Des ordres virtuels pour t’entraîner manuellement. Ton bot Nykuto n’y est pas relié.' },
  { id: 'tradingview', name: 'TradingView', mark: 'TV', category: 'platform', type: 'Charting · alertes', status: 'Guide d’alertes disponible', description: 'Reçois tes alertes dans Trading HQ. Aucun import de trades ou de graphiques enregistrés.' },
  { id: 'lucid', name: 'Lucid Trading', mark: 'L', category: 'prop', type: 'Prop firm · futures', status: 'Connexion non disponible', description: 'L’accès dépend de ta plateforme et de ton fournisseur CQG ou Rithmic. Choisir Lucid ne crée aucun compte.' },
  { id: 'tradovate', name: 'Tradovate', mark: 'T', category: 'broker', type: 'Broker / plateforme', status: 'Connexion non disponible', description: 'Enregistre ton choix pour préparer une future intégration. Les positions et les trades ne sont pas importés.' },
  { id: 'ninjatrader', name: 'NinjaTrader', mark: 'N', category: 'broker', type: 'Broker / plateforme', status: 'Connexion non disponible', description: 'Enregistre ton environnement de trading. Aucun passage d’ordres depuis Trading HQ.' },
  { id: 'ibkr', name: 'Interactive Brokers (IBKR)', mark: 'IB', category: 'broker', type: 'Broker', status: 'Connexion non disponible', description: 'Tu peux enregistrer ce choix. L’accès aux données et au compte reste à intégrer.' },
  { id: 'other', name: 'Autre environnement', mark: '+', category: 'other', type: 'Choix personnel', status: 'À préciser', description: 'Indique le nom de ton broker ou de ta plateforme, sans identifiant de connexion.' }
]);

export function matchingProviders(query = '', category = 'all') {
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const needle = normalize(query.trim());
  return PROVIDERS.filter(p => (category === 'all' || p.category === category) && normalize(`${p.name} ${p.type}`).includes(needle));
}

export function selectionFor(preference) {
  const name = preference?.broker || '';
  return PROVIDERS.find(p => p.id !== 'other' && p.name === name)?.id || (name ? 'other' : '');
}

export function makePreference(previous, providerId, customName, mode) {
  const provider = PROVIDERS.find(p => p.id === providerId);
  if (!provider) throw new Error('Choisis un environnement avant d’enregistrer.');
  const broker = provider.id === 'other' ? String(customName || '').trim() : provider.name;
  if (!broker || broker.length > 80) throw new Error('Indique un nom entre 1 et 80 caractères.');
  if (!['paper', 'manual'].includes(mode)) throw new Error('Choisis Simulation ou Journal manuel.');
  return { tradingViewName: previous?.tradingViewName || '', broker, mode };
}
