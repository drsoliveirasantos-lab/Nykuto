// Nykuto Trading — visible project status registry.
// Presentation-only: this file records the reviewed state and never activates
// a signal, Paper/Shadow execution, broker route or automatic promotion.

export const PROJECT_STATUS = Object.freeze({
  schema: 'nykuto-trading-project-status-v1',
  updatedAt: '2026-09-13',
  evidenceThrough: '2026-09-13',
  repository: {
    branch: 'feat/opportunity-census',
    reviewedBaseRevision: '5d8a683 + d32b7a0',
    note: 'Cette branche réunit le Census, le cycle TP1 et le sizing adaptatif avec le calendrier et l’audit publiés depuis feat/trading-hq-v1.'
  },
  sync: [
    {
      id: 'conversation',
      label: 'Conversation et décisions',
      state: 'synced',
      detail: 'Reprises jusqu’au Pine V15.1.1, au Time-Pace corrigé et à l’audit FAILED fourni le 12 septembre.'
    },
    {
      id: 'repository',
      label: 'Branche de recherche',
      state: 'implemented',
      detail: 'Opportunity Census, cycle de vie TP1 et sizing adaptatif relus sur feat/opportunity-census @ cb90c4f.'
    },
    {
      id: 'pine-source',
      label: 'Référence TradingView',
      state: 'external',
      detail: 'Partner Clean reste une référence externe. Audit actuel : code V15.1 fourni par Diego avec HUD V15.1.1 ; compilation et parité complètes encore à vérifier.'
    },
    {
      id: 'union-report',
      label: 'Union V15.1.1 + Time-Pace',
      state: 'pending',
      detail: 'Le rapport d’union au niveau des opportunités n’existe pas encore : aucune intégration Time-Pace au Pine n’est revendiquée.'
    }
  ],
  pine: {
    version: 'NYKUTO V15.1.1 PRO · Partner Clean',
    mode: 'Aide à la décision uniquement',
    scanner: 'Always-On Scanner',
    families: ['BASE', 'BOOST', 'EMA21', 'FAILED', 'FVG', 'VWAP'],
    rules: [
      'Aucun plafond de trades par jour dans le census ; FLOW_LATE reste un avertissement.',
      'Le signal le plus récent admis possède la Trade Map ; les marqueurs historiques restent visibles.',
      'Stop structurel avant sizing, maximum 5 MNQ et perte planifiée totale plafonnée à 500 $.',
      'Flat forcé à 16:45 ET ; les gaps ne déclenchent pas artificiellement TP ou SL.'
    ],
    executionAllowed: false
  },
  dataset: {
    market: 'MNQ',
    timeframe: 'M5 canonique',
    bars: 132650,
    from: '2024-10-27',
    through: '2026-09-11',
    opportunities: 11545,
    overallTp1Pct: 45.62,
    validation2026Tp1Pct: 46.80,
    tiers: [
      { id: 'standard', label: 'STANDARD', n: 9463, tp1Pct: 43.93 },
      { id: 'priority', label: 'PRIORITY', n: 1225, tp1Pct: 50.45 },
      { id: 'prime', label: 'PRIME', n: 857, tp1Pct: 57.41 }
    ]
  },
  timePace: {
    status: 'Test rétrospectif corrigé terminé · hors Pine',
    rules: [
      'Activity Surprise ≥ 1,3×',
      'Volume Surprise ≥ 1,0×',
      'Mouvement net des 15 premières minutes ≥ 0,2 ATR',
      'H1 POWER aligné',
      'M15 CORE aligné',
      'Géométrie de risque et temps de séance valides'
    ],
    results: [
      { tier: 'CORE', period: 'Développement 2024–2025', n: 260, tp1Pct: 53.85, tp2Pct: 36.54, tp3Pct: 25.38, ev1R: 0.071, ev2R: 0.124, ev3R: 0.090 },
      { tier: 'CORE', period: 'Validation 2026', n: 202, tp1Pct: 57.92, tp2Pct: 33.17, tp3Pct: 20.79, ev1R: 0.177, ev2R: 0.118, ev3R: 0.049 },
      { tier: 'POWER', period: 'Développement 2024–2025', n: 184, tp1Pct: 57.07, tp2Pct: 38.04, tp3Pct: 27.17, ev1R: 0.145, ev2R: 0.195, ev3R: 0.195 },
      { tier: 'POWER', period: 'Validation 2026', n: 153, tp1Pct: 56.86, tp2Pct: 31.37, tp3Pct: 19.61, ev1R: 0.147, ev2R: 0.088, ev3R: 0.009 },
      { tier: 'CONFIRMED ★★', period: 'Développement 2024–2025', n: 86, tp1Pct: 59.30, tp2Pct: 40.70, tp3Pct: 27.91, ev1R: 0.122, ev2R: 0.235, ev3R: 0.168 },
      { tier: 'CONFIRMED ★★', period: 'Validation 2026', n: 78, tp1Pct: 62.82, tp2Pct: 34.62, tp3Pct: 25.64, ev1R: 0.242, ev2R: 0.157, ev3R: 0.228 }
    ],
    decisions: [
      'POWER remplace M15 CORE par M15 POWER ; CONFIRMED ajoute pullback + retest EMA9 + reprise au même setup parent.',
      'Le pullback ou le retest EMA9 améliore le signal parent : il ne crée pas un deuxième BUY/SELL.',
      'Une impulsion ≥ 0,8 ATR devient PACE STRONG, pas une condition obligatoire.',
      'RSI directionnel ≥ 65 devient PACE RSI POWER, pas une condition obligatoire.',
      'Une extension EMA21 contrôlée peut devenir PACE MOMENTUM dans cette famille ; elle n’est pas automatiquement CHASE.',
      'TP1 reste la cible défendue du signal immédiat ; TP2 devient plus pertinent après CONFIRMED et TP3 n’est pas forcé.'
    ]
  },
  failedIntegrity: {
    status: 'Audit exploratoire · pas encore une règle V15.1.1',
    sourceBars: 103152,
    officialBarsRequired: 132650,
    diagnosis: 'Le pivot 2/2 peut rester ancien alors que le niveau a déjà été consommé. Un simple reclaim profond peut alors être étiqueté à tort FAILED BREAKOUT.',
    proposedStates: ['FAILED SWEEP ★', 'FAILED RECLAIM', 'DEEP RECLAIM ⚠', 'FAILED WATCH', 'FAILED CONFIRMED ★', 'RECLAIM LOST ⚠'],
    variants: [
      { label: 'Actuel reconstruit', n: 1221, tp1Pct: 49.55, devPct: 50.15, validationPct: 46.76 },
      { label: 'Vrai fresh sweep', n: 1040, tp1Pct: 49.71, devPct: 49.94, validationPct: 48.69 },
      { label: 'Fresh + pivot ≤ 8 bars', n: 863, tp1Pct: 50.87, devPct: 51.06, validationPct: 50.00 },
      { label: 'Fresh + âge ≤ 8 + sweep ≤ 0,5 ATR', n: 585, tp1Pct: 52.14, devPct: 52.07, validationPct: 52.48 },
      { label: 'Fresh + RSI directionnel ≥ 55', n: 291, tp1Pct: 53.26, devPct: 52.84, validationPct: 54.84 },
      { label: 'Fresh + M15 DI gap ≥ 15', n: 239, tp1Pct: 55.65, devPct: 54.17, validationPct: 61.70, note: '47 cas dans le bloc de validation disponible' }
    ],
    checks: ['Fresh Sweep', 'Level Consumed', 'Pivot Age', 'Sweep Depth / ATR', 'Reclaim Depth / ATR', 'Bars outside level', 'RSI Memory', 'RSI recovery', 'MACD reversal', 'M15 DI gap', 'M15 ADX slope', 'Local breakdown pressure', 'Obstacle devant en R', 'Next-bar hold', 'MFE / MAE']
  },
  repositoryResearch: [
    {
      label: 'Opportunity Census',
      state: 'implemented',
      detail: 'Compte toutes les opportunités qualifiées, même si un plan est déjà actif ; aucun plafond quotidien.'
    },
    {
      label: 'Setup lineage + libération TP1',
      state: 'implemented',
      detail: 'Un setupId empêche de recompter la même idée ; le slot de risque frais est libéré à TP1 ou à la clôture complète. Le runner restant suppose un stop à break-even.'
    },
    {
      label: 'Sizing adaptatif',
      state: 'implemented',
      detail: 'Recherche uniquement : EV empirique, taille d’échantillon et qualité déterminent un budget arrondi, sous le plafond absolu de 500 $.'
    },
    {
      label: 'Jeu 56 · micro-contexte 1 minute',
      state: 'protocol',
      detail: 'Protocole borné et gelé ; aucun résultat 1m n’est promu dans le Pine ou le moteur actif.'
    }
  ],
  nextTest: {
    id: 'v151-time-pace-exact-union',
    label: 'Union exacte V15.1.1 + Time-Pace',
    state: 'pending',
    blocker: 'Données archivées : 142 311 M5 corrigées, M15, H1 et M1. Étape suivante : parité du code fourni et reconstruction des opportunités avec parents causaux ; 11 545 non encore reproduites.',
    dedupeRule: 'Dédupliquer par setup parent causal, pas par simple proximité temporelle.',
    steps: [
      'Mesurer combien des 462 Time-Pace sont déjà dans BASE / BOOST / EMA21 / FAILED / FVG / VWAP.',
      'Compter les Time-Pace véritablement nouveaux.',
      'Identifier la famille qui capture chaque overlap.',
      'Calculer TP1 / TP2 / TP3 des Time-Pace uniques.',
      'Calculer TP1 / TP2 / TP3 des Time-Pace en overlap.',
      'Calculer l’union V15.1.1 + Time-Pace sans double comptage.',
      'Recalculer fréquence par jour, expectancy et répartition STANDARD / PRIORITY / PRIME.',
      'Décider seulement ensuite si Time-Pace passe en Shadow ou reste en recherche.'
    ]
  },
  boundaries: [
    'Broker non connecté ; aucun ordre réel envoyé.',
    'Paper Bot OFF et Shadow OFF.',
    'Les 11 545 opportunités sont un census analytique, pas 11 545 trades exécutables simultanément.',
    'Le replay séquentiel reste nécessaire pour le capital, les chevauchements, les frais, les gaps et les règles Lucid.',
    'Le plafond de 500 $ est un maximum de perte planifiée par position, jamais une mise obligatoire.',
    'Les résultats historiques et tests logiciels ne garantissent aucune rentabilité future.'
  ],
  timeline: [
    { date: '2026-09-13', title: 'Historique privé et première étape d’audit', detail: '97 blocs sauvegardés et relus ; calendrier M1/M5/M15/H1, 14 tests logiciels et diagnostics historiques. Pas encore de backtest complet du scanner.' },
    { date: '2026-09-13', title: 'Suivi consolidé publié', detail: 'Les données actuelles sont séparées des chiffres des anciens rapports à reproduire.' },
    { date: '2026-09-12', title: 'Sizing adaptatif ajouté au census', detail: 'Plafond 500 $, EV empirique, shrinkage par n et qualité ; recherche uniquement.' },
    { date: '2026-09-12', title: 'Cycle de vie TP1 et setup lineage', detail: 'Nouvelle opportunité possible après TP1/close sans ré-entrer le même setup parent.' },
    { date: '2026-09-12', title: 'Opportunity Census indépendant', detail: 'Toutes les opportunités distinctes sont visibles sans planActive ni plafond quotidien.' },
    { date: '2026-09-12', title: 'Time-Pace complet corrigé', detail: '462 CORE, 337 POWER et 164 CONFIRMED sur le M5 canonique ; intégration Pine encore bloquée par le test d’union.' },
    { date: '2026-09-12', title: 'Faiblesse FAILED identifiée', detail: 'Fresh sweep, niveau consommé, âge/profondeur du pivot et maintien du reclaim restent à valider sur l’historique officiel.' },
    { date: '2026-09-11', title: 'Pine V15.1.1 Partner Clean', detail: 'Référence TradingView actuelle fournie hors branche ; outil d’aide à la décision, sans broker.' },
    { date: '2026-09-11', title: 'Jeu 56 micro-1m gelé', detail: 'Le 1m reste un micro-contexte à mesurer, jamais une alerte autonome promue.' }
  ],
  sources: [
    { label: 'Calendrier et données actuelles', href: '../historique/' },
    { label: 'Audit du Pine fourni', href: '../historique/PINE_AUDIT.md' },
    { label: 'Protocole Opportunity Census', href: '../lab/OPPORTUNITY_CENSUS_PROTOCOL.md' },
    { label: 'Cycle de vie après TP1', href: '../lab/OPPORTUNITY_LIFECYCLE.md' },
    { label: 'Politique de sizing adaptatif', href: '../lab/ADAPTIVE_RISK_POLICY.md' },
    { label: 'Protocole Jeu 56', href: '../lab/JEU56_PROTOCOL.md' },
    { label: 'Pine V15.1.1 Partner Clean', detail: 'document fourni hors dépôt' },
    { label: 'Time-Pace Full History corrigé', detail: 'document fourni hors dépôt' },
    { label: 'Audit Failed Breakout Integrity', detail: 'conversation et micro-replay exploratoire fournis' }
  ]
});
