# Profil de développement du bot après le Jeu 45

La sortie MNQ à 30 minutes est intégrée à une entrée de code réutilisable,
`research-bot.mjs::compareResearchBotMonth`. C'est un **profil expérimental**,
pas un remplacement de la référence ni une activation du site ou des ordres.
Il réutilise le moteur gelé du Jeu45 sans le modifier. Aucun filtre rejeté
n'est combiné avec la sortie, aucune taille n'est augmentée.

## Ce qui est appliqué

| Partie | Comportement |
|---|---|
| Nasdaq MNQ | Comparaison de la référence avec la sortie après six M5 complètes si le net estimé est ≤0, frais compris ; exécution à l'ouverture suivante, priorités stop/gap/risque conservées. |
| S&P MES | Cassure/retest et filtre RSI historiques conservés ; pas de sortie à 30 minutes. |
| Or MGC | Réintégration du range et entrée avant 11h New York conservées. |
| Portefeuille | Référence et candidat calculés ensemble, obligatoirement aux deux niveaux de coûts ; compte mensuel, risque maximal 100 USD et cible 2R conservés. |
| Évaluation | Attribution du delta aux trades communs, retirés et ajoutés ; gagnants sacrifiés, coûts, pertes dans la M5 d'entrée, gaps et sorties ambiguës. |
| Solidité des preuves | Compte des opportunités uniques entre scénarios de coûts et part du plus gros progrès ; aucun passage automatique en stratégie validée. |

Le code prépare les signaux depuis les historiques natifs validés et applique
les filtres MES/MGC et l'exclusion MYM avant comparaison. Les jours manquants
restent explicitement absents. `comparePreparedResearchBot` est le point de
test de plus bas niveau ; il attend des flux déjà préparés et ne constitue pas
un générateur de signaux autonome. Aucun endpoint d'ordres n'est ajouté.

Le périmètre exécutable reste janvier–août 2026. Une date future est refusée :
confirmer la candidate exigera un protocole distinct, une préparation fixée
avant observation et des données nouvelles. La collecte Jeu08 M15 existante
ne devient pas un test M5 de cette autre stratégie.

## Améliorations du diagnostic, appliquées aux résultats existants

`research-execution-diagnostics.mjs` vérifie l'arithmétique avant d'établir
les métriques. `research-bot-evidence.json` contient uniquement les agrégats
recalculés depuis l'archive privée Jeu45 contrôlée par taille et SHA-256.
Aucun trade individuel, prix ou horodatage fournisseur n'est publié.

- Gain observé : **+91 USD** normal et stress, provenant des **mêmes deux
  opportunités**. Le plus gros progrès représente 58,79 % de l'écart positif.
  Soustraire ce progrès laisse 37,50 USD : simple sensibilité arithmétique,
  pas simulation d'un portefeuille qui aurait refusé ce trade.
- Les gagnants conservent leur gain moyen. La perte moyenne normale passe de
  78,00 à 76,68 USD. Aucun gagnant sacrifié dans cet historique ; le test
  logiciel inclut volontairement un cas où cette sortie sacrifie un gagnant.
- Les 922 USD de coûts normaux restent identiques. MES apporte encore
  seulement 41,25 USD nets après 535 USD de coûts. La sortie MNQ ne résout
  pas cette faiblesse ; le filtre de coût1,5 rejeté n'est pas réintroduit.
- Les 27 pertes dans la M5 d'entrée restent présentes au normal. Zéro sortie
  ambiguë observée ici ne prouve pas la connaissance de l'ordre intrabougie.
  Spread et latence réels restent non observés, jamais remplacés par zéro.

La proportion de gains nécessaire à l'équilibre est une identité descriptive
calculée avec les gains/pertes moyens observés, hors trades plats. Elle reste
inconnue si l'une des deux catégories manque. Ce n'est ni une probabilité de
signal ni un seuil d'admission.

Ces diagnostics n'ajoutent aucun critère rétroactif au Jeu45 et ne changent
pas sa décision. Registre :109 configurations ; catalogue croisé :126 clés ;
zéro confirmation indépendante. Ce travail n'est pas un Jeu46.

## Utilisation et validation

Depuis la racine du dépôt, vérifier les agrégats **sans rejouer le marché** :

```sh
node scripts/audit-trading-research-bot.mjs /chemin/prive/jeu45/runs-private.json verify
node --test scripts/test-trading-research-bot.mjs
```

Le mode `create` du premier script produit uniquement la source agrégée
`research-bot-evidence.json` et refuse tout écrasement. Le mode par défaut
`verify` relit et compare exactement le fichier déjà présent.

Reproduction facultative d'un seul mois, après commit du code :

```sh
node scripts/check-trading-research-bot-month.mjs /chemin/prive/sources /chemin/prive/jeu45/runs-private.json june
```

Cette commande exige les sources épinglées et les119 dépendances du gel45,
puis compare quatre comptes entiers à l'archive déjà calculée. Elle ne cherche
aucun paramètre et n'écrit aucun résultat privé. La suite logicielle utilise
des cas synthétiques ; sa réussite n'est pas une preuve de profit.

## Prochaines améliorations proposées

Les mesures de coûts, d'effets sur les autres marchés et de concentration
sont désormais appliquées automatiquement par l'adaptateur. Les prochaines
modifications de stratégie doivent viser une faiblesse encore ouverte :

1. **Exécution réelle mesurée** : comparer les coûts supposés avec les frais,
   spread et glissement réellement enregistrés quand une source autorisée
   existe. Ne pas inventer ces données à partir des M5.
2. **Pertes dès l'entrée** : examiner la géométrie des retests rapportée à la
   volatilité passée, puis fixer une seule hypothèse. Le délai uniforme d'une
   M5 et le filtre d'extension1σ ont déjà été rejetés ; pas de réglage de leurs
   seuils sur ces mêmes mois.
3. **Confirmation MNQ** : appliquer exactement les30 minutes sur de nouvelles
   observations compatibles M5, en conservant le portefeuille de référence.

Ces trois étapes nécessitent encore leurs données ou leur protocole. Aucun
backtest supplémentaire, achat, collecte, déploiement ou ordre n'est lancé par
ce document ou par le diagnostic des archives.
