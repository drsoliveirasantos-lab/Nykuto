# Modèles et sources Nykuto — bilan du 10 septembre 2026

Le catalogue de l'autre conversation était enregistré sous
`Catalogue_Nykuto_modeles_preentraines_2026-09-09.md`. Il disait explicitement
que les poids n'avaient pas été téléchargés et qu'aucun modèle n'était intégré.
Les deux autres ZIP étaient des dossiers de recherche RSI et actualités.

## Ajouts effectifs

- `/models/` : bilan, catalogue de 56 fiches RSI/tendances et 77 fiches sources
  d'actualités, recherche locale, association de requêtes et résultats Kronos.
- `/analysis/` : export explicite des seules bougies MNQ sélectionnées avec
  empreinte SHA-256 et quatre heures de début futures dans la même séance cash.
  À la clôture de séance, choisir un point antérieur ; aucune séance suivante
  n'est inventée. Ni export ni import ne contacte un fournisseur extérieur.
- `/assist/` : consignes enrichies pour les divergences confirmées, les zones
  RSI, les régimes et la provenance/heure/révision des annonces. Ces consignes
  servent au texte copié et à l'API vision optionnelle déjà existante.
  Aucun détecteur numérique de divergence ou flux news actif n'est ajouté.
- `scripts/run-trading-kronos.py` : adaptateur local séparé, chargé exclusivement
  depuis les fichiers audités. Les poids sont archivés dans le pack privé
  `Nykuto_Kronos_mini_verifie_2026-09-10.zip`, hors Git et hors assets du site.
  Le code, tokenizer et modèle sont épinglés et chargés strictement.

Les indicateurs RSI14, EMA9/21, pivots, HH/HL, BOS/MSS, bougies englobantes,
volume et Bollinger existaient déjà. Les fiches ne sont pas des paramètres
exécutables ; la proposition de la fiche K04 ne modifie pas le RSI=50 de
Nykuto sur série plate. Les anciens jeux, registres et règles de risque restent
les références, avec leur historique intact.

## Ce que Kronos-mini a réellement apporté au test K1

24 fenêtres fixées avant les prévisions, 64 bougies M15 d'entrée et 4 bougies
à prévoir. Source MNQU6 privée du Jeu09, contrôlée par empreinte et validation
complète du calendrier. Les prix futurs sont absents des requêtes au modèle.

| Période | Fenêtres | MAE Kronos, points | MAE dernière clôture constante, points |
|---|---:|---:|---:|
| Juin | 8 | 113,12 | 89,16 |
| Juillet | 8 | 81,99 | 82,84 |
| Août | 8 | 41,75 | 31,63 |
| Total | 24 | 78,95 | 67,88 |

MAE : moyenne des erreurs absolues sur les quatre clôtures, sans arrondi aux
ticks. Plus bas est meilleur. Globalement, Kronos est **16,3 % moins précis**
que le témoin dans cet essai. Il améliore légèrement juillet mais dégrade juin
et août. Le critère préétabli de progrès dans chaque mois échoue.

24 calculs ont abouti et toutes les clôtures sont finies. Deux fenêtres ont
au moins une bougie OHLC incohérente (5 bougies sur 96 au total). Les sorties
brutes ne sont pas réparées : l'import les refuse. Leurs clôtures sont incluses
dans la MAE pour ne pas effacer les mauvais essais. La direction finale est
correcte sur 13/24 fenêtres ; ce n'est pas un taux de trades gagnants.

Le chargement initial CPU prend environ 1,42 s, puis la médiane par fenêtre
est 0,043 s sur cet environnement à deux threads. Ce n'est pas une mesure
de latence sur le Mac de Diego, ni une estimation de performance en direct.

**Décision : conserver le modèle en laboratoire, sans l'adopter comme filtre
de prise de position.** Aucun bénéfice supplémentaire, win rate de stratégie
ou rentabilité n'a été mesuré. Pas de réentraînement effectué. Ce petit test
sur historique déjà vu ne constitue pas une confirmation indépendante.
MES, MYM et MGC ne sont pas évalués ici, même si le format d'entrée les accepte.

## Révisions et sources

- [Kronos-mini](https://huggingface.co/NeoQuasar/Kronos-mini) :
  `f4e68697d9d5aed55cef5c96aabc3376bcad9f81` ; 4 108 032 paramètres.
- [Tokenizer-2k](https://huggingface.co/NeoQuasar/Kronos-Tokenizer-2k) :
  `26966d0035065a0cae0ebad7af8ece35bc1fb51c` ; 3 958 042 paramètres.
- [Code](https://github.com/shiyu-coder/Kronos/tree/67b630e67f6a18c9e9be918d9b4337c960db1e9a) :
  `67b630e67f6a18c9e9be918d9b4337c960db1e9a`.
- Deux fichiers de poids safetensors : 32 283 152 octets au total, licence MIT.
- [Article](https://arxiv.org/html/2508.02739v1) : préentraînement annoncé
  jusqu'à juin 2024 ; le tableau de données ne démontre pas d'entraînement
  sur les quatre microcontrats CME de Nykuto. Corpus brut non audité ici.
- [FFM Hugging Face](https://huggingface.co/johnamcruz/futures-foundation-model)
  décrit des poids historiques v2 tandis que
  [GitHub actuel](https://github.com/johnamcruz/Futures-Foundation-Model)
  décrit Chronos-2 Small/LoRA. Pas téléchargé ni intégré dans cette livraison.
- Kronos-small reste catalogué, sans installation ni test.

Les fiches sources de 2026-09-09 sont conservées comme documentation datée,
sans revalidation globale des 107 références ni automatisation de leur accès.
Les 77 fiches news ne représentent pas 77 organismes indépendants.

## Reproduction et limites de l'intégration

Décompresser le pack modèle dans un dossier séparé et suivre son README pour
installer les dépendances CPU/Mac. L'environnement n'est pas embarqué dans le
site Cloudflare. Exécuter ensuite avec le Python de cet environnement :

```sh
python scripts/run-trading-kronos.py --assets-dir /chemin/vers/pack-modele --input selection.json --output resultat.json
```

L'export/import impose 32–512 bougies, 1–4 pas futurs, contrat natif,
OHLCV finis, tick d'entrée, séquence intrajournalière sans trou, données closes,
séance cash 9h30–16h New York et empreinte concordante. Cette borne horaire
ne certifie pas le calendrier de jours fériés d'un fichier externe ; l'export
Analyse utilise son calendrier source déjà vérifié. Le volume monétaire absent
est explicitement mis à zéro. Les volumes natifs sont conservés. Les heures sont
converties de secondes UTC vers New York pour le modèle, sans décaler les prix.

Les sorties ne sont ni arrondies aux ticks ni des prix exécutables. L'empreinte
associe des fichiers ; elle ne certifie pas l'origine d'une prévision importée.
La page refuse les OHLC incohérents, horizons ou révisions incompatibles.
Elle n'a aucun appel de courtage ni écriture dans le journal ou la stratégie.

Le protocole K1 est conservé dans [PROTOCOL.md](PROTOCOL.md), gelé au commit
`81b35a2` avant les inférences. Le [registre](registry.json) contient les
mesures non arrondies, hashes et versions. Les requêtes, sorties et réalisations
détaillées sont archivées dans `Nykuto_Kronos_K1_diagnostic_prive_2026-09-10.zip`,
jamais dans le dépôt public. Ces mesures ne remplacent pas un backtest comparatif
de stratégie avec commissions, slippage, drawdown et test prospectif.
