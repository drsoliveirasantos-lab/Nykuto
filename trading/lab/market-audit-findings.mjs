export const MARKET_AUDIT_FINDINGS = Object.freeze({
  MES: '23 trades observés, dont un seul en août. La base perd avant même les coûts. Priorité : revoir la qualité des retours et distinguer les directions ; le résultat d’août seul est trop petit pour choisir un filtre.',
  MGC: 'Le retour après cassure échouée demande une lecture différente d’un suivi de tendance. Les entrées avant 11 h sont positives dans les trois périodes ; celles de 11 h à midi sont négatives. Piste prioritaire à tester séparément, avec un nouveau replay commun.',
  MNQ: 'Le résultat positif de janvier–février se dégrade ensuite, jusqu’à −289 $ en août. Les six pertes d’août n’atteignent pas +1R : avancer la protection à ce même seuil ne les sauverait pas. Priorité : qualité des entrées et stabilité du contexte.',
  MYM: 'Les trois périodes sont négatives. La protection a produit deux sorties à zéro dans janvier–avril, sans rendre le profil rentable. Priorité : comparer explicitement une autre famille d’entrées et sa contribution au compte commun.'
});
export const AUDIT_REASON_LABELS = Object.freeze({ occupied: 'Compte occupé', simultaneous: 'Autre signal simultané admis',
  dailyEntries: 'Deux entrées quotidiennes utilisées', sideLimit: 'Sens déjà utilisé sur ce marché', dailyBrake: 'Frein quotidien',
  tradeRisk: 'Risque par trade excessif', dailyBudget: 'Budget quotidien insuffisant', floorReserve: 'Réserve du seuil insuffisante',
  netReward: 'Gain potentiel net insuffisant', invalidStop: 'Stop non admissible', returnedInside: 'Retour dans la zone', outsideRange: 'Entrée hors de la zone' });
