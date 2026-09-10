# Jeu 39 — Horaires et Kronos réellement testés

**Décision : les deux variantes sont non retenues. La référence à 100 $ reste la référence de recherche.** Le filtre horaire améliore juillet et août mais dégrade juin. Kronos retire des gagnants, dégrade juin et août aux coûts normaux, et génère trois prévisions OHLC invalides. Aucun objectif de 4 000 USD ni retrait personnel simulé de 1 000 EUR atteint.

## Ce qui a été appliqué

Une campagne après publication du gel `2fc700dfb385f92b001a63fcb642603be51f7bf8` : référence Jeu37 fixed100 contre deux variantes séparées, jamais combinées. Sur MNQ seulement, nouvelles entrées strictement avant 11 h New York ; ou veto directionnel issu de Kronos-mini téléchargé, comparant sa quatrième clôture prédite au prix d’entrée. Le filtre horaire ne ferme pas les positions existantes à 11 h. Risque, stops, sorties 2R et profils MES RSI/MGC avant11 inchangés ; MYM exclu.

Juin, juillet et août 2026 déjà vus, comptes funded50K neufs chaque mois. Coûts normaux et doublés : 18 relectures, six témoins entiers exacts. Les scénarios alternatifs ne sont pas des observations indépendantes. Les mois ne forment pas un compte continu.

## Écart documentaire conservé

**La conformité intégrale au texte du protocole Kronos n’est pas établie.** Une erreur du protocole gelé indique `top-p 0`, alors que la politique, le code et le pack hashé publiés avant prévisions fixent tous `topP: 0.9`. Les prévisions utilisent effectivement 0,9. Le code n’a pas changé après gel ; cet écart de spécification est déclaré, sans corriger le protocole historique et sans relancer une campagne. Les résultats sont conservés comme diagnostic de la règle codée, pas comme essai intégralement conforme au texte. Les autres contrôles techniques ne font pas disparaître cet écart.

## Tous les résultats mensuels

Montants USD nets de coûts simulés. Drawdown réalisé entre trades, pas toute la baisse latente intrabougie. Les frais doublés peuvent modifier les admissions et quantités.

| Mois | Variante | Coûts | Trades | Gains/pertes | Net | Moyenne/trade | Gain moyen | Perte moyenne | Drawdown |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| Juin | Référence 100 $ | normal | 16 | 11/5 | 1 048,75 | 65,55 | 133,64 | -84,25 | 172,50 |
| Juin | Référence 100 $ | stress | 13 | 9/4 | 785,50 | 60,42 | 122,72 | -79,75 | 145,00 |
| Juin | MNQ avant 11 h | normal | 12 | 8/4 | 758,75 | 63,23 | 136,25 | -82,81 | 172,50 |
| Juin | MNQ avant 11 h | stress | 9 | 6/3 | 516,50 | 57,39 | 123,08 | -74,00 | 222,00 |
| Juin | Veto Kronos | normal | 14 | 9/5 | 802,75 | 57,34 | 136,00 | -84,25 | 172,50 |
| Juin | Veto Kronos | stress | 12 | 8/4 | 659,50 | 54,96 | 122,31 | -79,75 | 145,00 |
| Juillet | Référence 100 $ | normal | 21 | 8/13 | 176,00 | 8,38 | 141,44 | -73,50 | 312,50 |
| Juillet | Référence 100 $ | stress | 21 | 9/12 | 164,00 | 7,81 | 126,50 | -81,21 | 330,50 |
| Juillet | MNQ avant 11 h | normal | 18 | 8/10 | 426,50 | 23,69 | 141,44 | -70,50 | 312,50 |
| Juillet | MNQ avant 11 h | stress | 18 | 9/9 | 428,50 | 23,81 | 126,50 | -78,89 | 330,50 |
| Juillet | Veto Kronos | normal | 18 | 7/11 | 186,00 | 10,33 | 138,71 | -71,36 | 312,50 |
| Juillet | Veto Kronos | stress | 18 | 8/10 | 188,00 | 10,44 | 122,69 | -79,35 | 330,50 |
| Août | Référence 100 $ | normal | 11 | 3/8 | -245,50 | -22,32 | 148,17 | -86,25 | 442,00 |
| Août | Référence 100 $ | stress | 8 | 2/6 | -228,50 | -28,56 | 132,50 | -82,25 | 359,50 |
| Août | MNQ avant 11 h | normal | 8 | 3/5 | -31,00 | -3,87 | 148,17 | -95,10 | 283,00 |
| Août | MNQ avant 11 h | stress | 5 | 2/3 | 0,00 | 0,00 | 132,50 | -88,33 | 190,00 |
| Août | Veto Kronos | normal | 8 | 2/6 | -259,50 | -32,44 | 143,25 | -91,00 | 451,00 |
| Août | Veto Kronos | stress | 5 | 1/4 | -183,00 | -36,60 | 157,00 | -85,00 | 340,00 |

Tous les comptes sont sans rupture mais objectif non atteint (`incomplete`). Tous les retraits USD et versements EUR sont nuls. Solde final =50 000USD+net ; aucune demande réelle.

## Gagnants supprimés, pertes évitées et nouvelles admissions

| Mois | Variante | Coûts | Signaux veto | Gagnants retirés | Perdants retirés | Net des trades retirés | Nouvelles admissions | Net ajouté | Variation nette |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| Juin | MNQ avant 11 h | normal | 8 | 3 | 1 | 290,00 | 0 | 0,00 | -290,00 |
| Juin | MNQ avant 11 h | stress | 8 | 3 | 1 | 269,00 | 0 | 0,00 | -269,00 |
| Juin | Veto Kronos | normal | 5 | 2 | 0 | 246,00 | 0 | 0,00 | -246,00 |
| Juin | Veto Kronos | stress | 5 | 1 | 0 | 126,00 | 0 | 0,00 | -126,00 |
| Juillet | MNQ avant 11 h | normal | 9 | 0 | 3 | -250,50 | 0 | 0,00 | 250,50 |
| Juillet | MNQ avant 11 h | stress | 9 | 0 | 3 | -264,50 | 0 | 0,00 | 264,50 |
| Juillet | Veto Kronos | normal | 10 | 1 | 2 | -10,00 | 0 | 0,00 | 10,00 |
| Juillet | Veto Kronos | stress | 10 | 1 | 2 | -24,00 | 0 | 0,00 | 24,00 |
| Août | MNQ avant 11 h | normal | 5 | 0 | 3 | -214,50 | 0 | 0,00 | 214,50 |
| Août | MNQ avant 11 h | stress | 5 | 0 | 3 | -228,50 | 0 | 0,00 | 228,50 |
| Août | Veto Kronos | normal | 9 | 1 | 3 | -67,50 | 1 | -81,50 | -14,00 |
| Août | Veto Kronos | stress | 9 | 1 | 3 | -131,50 | 1 | -86,00 | 45,50 |

Aux coûts normaux, le filtre horaire retire **3 gagnants et 7 perdants** ; Kronos retire **4 gagnants et 5 perdants**. Aux coûts doublés : horaire3/7 et Kronos3/5. Ne pas additionner les deux coûts comme des trades distincts observés.

Les 22 veto horaires et24vetoKronos portent sur49signaux distincts, avant dimensionnement. Tous ne concernaient pas des positions admises. L’horaire retire dix trades effectivement exécutés. Kronos en retire neuf aux coûts normaux, huit aux coûts doublés. Il libère en août une admission MGC perdante : −81,50USD normal et −86USD doublé, auparavant refusée par le plafond quotidien de deux entrées. Les trades communs ont des résultats identiques.

## Contributions par marché

| Mois | Variante | Coûts | Marché | Trades | Gains/pertes | Net | Moyenne/trade |
|---|---|---|---|---:|---:|---:|---:|
| Juin | Référence 100 $ | normal | MNQ | 7 | 6/1 | 700,00 | 100,00 |
| Juin | Référence 100 $ | normal | MES | 7 | 3/4 | 83,75 | 11,96 |
| Juin | Référence 100 $ | normal | MYM | 0 | 0/0 | 0,00 | — |
| Juin | Référence 100 $ | normal | MGC | 2 | 2/0 | 265,00 | 132,50 |
| Juin | Référence 100 $ | stress | MNQ | 6 | 5/1 | 559,00 | 93,17 |
| Juin | Référence 100 $ | stress | MES | 4 | 2/2 | 47,50 | 11,88 |
| Juin | Référence 100 $ | stress | MYM | 0 | 0/0 | 0,00 | — |
| Juin | Référence 100 $ | stress | MGC | 3 | 2/1 | 179,00 | 59,67 |
| Juin | MNQ avant 11 h | normal | MNQ | 3 | 3/0 | 410,00 | 136,67 |
| Juin | MNQ avant 11 h | normal | MES | 7 | 3/4 | 83,75 | 11,96 |
| Juin | MNQ avant 11 h | normal | MYM | 0 | 0/0 | 0,00 | — |
| Juin | MNQ avant 11 h | normal | MGC | 2 | 2/0 | 265,00 | 132,50 |
| Juin | MNQ avant 11 h | stress | MNQ | 2 | 2/0 | 290,00 | 145,00 |
| Juin | MNQ avant 11 h | stress | MES | 4 | 2/2 | 47,50 | 11,88 |
| Juin | MNQ avant 11 h | stress | MYM | 0 | 0/0 | 0,00 | — |
| Juin | MNQ avant 11 h | stress | MGC | 3 | 2/1 | 179,00 | 59,67 |
| Juin | Veto Kronos | normal | MNQ | 5 | 4/1 | 454,00 | 90,80 |
| Juin | Veto Kronos | normal | MES | 7 | 3/4 | 83,75 | 11,96 |
| Juin | Veto Kronos | normal | MYM | 0 | 0/0 | 0,00 | — |
| Juin | Veto Kronos | normal | MGC | 2 | 2/0 | 265,00 | 132,50 |
| Juin | Veto Kronos | stress | MNQ | 5 | 4/1 | 433,00 | 86,60 |
| Juin | Veto Kronos | stress | MES | 4 | 2/2 | 47,50 | 11,88 |
| Juin | Veto Kronos | stress | MYM | 0 | 0/0 | 0,00 | — |
| Juin | Veto Kronos | stress | MGC | 3 | 2/1 | 179,00 | 59,67 |
| Juillet | Référence 100 $ | normal | MNQ | 8 | 2/6 | -228,00 | -28,50 |
| Juillet | Référence 100 $ | normal | MES | 5 | 3/2 | 315,00 | 63,00 |
| Juillet | Référence 100 $ | normal | MYM | 0 | 0/0 | 0,00 | — |
| Juillet | Référence 100 $ | normal | MGC | 8 | 3/5 | 89,00 | 11,13 |
| Juillet | Référence 100 $ | stress | MNQ | 8 | 2/6 | -259,50 | -32,44 |
| Juillet | Référence 100 $ | stress | MES | 6 | 4/2 | 332,50 | 55,42 |
| Juillet | Référence 100 $ | stress | MYM | 0 | 0/0 | 0,00 | — |
| Juillet | Référence 100 $ | stress | MGC | 7 | 3/4 | 91,00 | 13,00 |
| Juillet | MNQ avant 11 h | normal | MNQ | 5 | 2/3 | 22,50 | 4,50 |
| Juillet | MNQ avant 11 h | normal | MES | 5 | 3/2 | 315,00 | 63,00 |
| Juillet | MNQ avant 11 h | normal | MYM | 0 | 0/0 | 0,00 | — |
| Juillet | MNQ avant 11 h | normal | MGC | 8 | 3/5 | 89,00 | 11,13 |
| Juillet | MNQ avant 11 h | stress | MNQ | 5 | 2/3 | 5,00 | 1,00 |
| Juillet | MNQ avant 11 h | stress | MES | 6 | 4/2 | 332,50 | 55,42 |
| Juillet | MNQ avant 11 h | stress | MYM | 0 | 0/0 | 0,00 | — |
| Juillet | MNQ avant 11 h | stress | MGC | 7 | 3/4 | 91,00 | 13,00 |
| Juillet | Veto Kronos | normal | MNQ | 5 | 1/4 | -218,00 | -43,60 |
| Juillet | Veto Kronos | normal | MES | 5 | 3/2 | 315,00 | 63,00 |
| Juillet | Veto Kronos | normal | MYM | 0 | 0/0 | 0,00 | — |
| Juillet | Veto Kronos | normal | MGC | 8 | 3/5 | 89,00 | 11,13 |
| Juillet | Veto Kronos | stress | MNQ | 5 | 1/4 | -235,50 | -47,10 |
| Juillet | Veto Kronos | stress | MES | 6 | 4/2 | 332,50 | 55,42 |
| Juillet | Veto Kronos | stress | MYM | 0 | 0/0 | 0,00 | — |
| Juillet | Veto Kronos | stress | MGC | 7 | 3/4 | 91,00 | 13,00 |
| Août | Référence 100 $ | normal | MNQ | 5 | 1/4 | -149,50 | -29,90 |
| Août | Référence 100 $ | normal | MES | 5 | 1/4 | -257,50 | -51,50 |
| Août | Référence 100 $ | normal | MYM | 0 | 0/0 | 0,00 | — |
| Août | Référence 100 $ | normal | MGC | 1 | 1/0 | 161,50 | 161,50 |
| Août | Référence 100 $ | stress | MNQ | 5 | 1/4 | -220,50 | -44,10 |
| Août | Référence 100 $ | stress | MES | 2 | 0/2 | -165,00 | -82,50 |
| Août | Référence 100 $ | stress | MYM | 0 | 0/0 | 0,00 | — |
| Août | Référence 100 $ | stress | MGC | 1 | 1/0 | 157,00 | 157,00 |
| Août | MNQ avant 11 h | normal | MNQ | 2 | 1/1 | 65,00 | 32,50 |
| Août | MNQ avant 11 h | normal | MES | 5 | 1/4 | -257,50 | -51,50 |
| Août | MNQ avant 11 h | normal | MYM | 0 | 0/0 | 0,00 | — |
| Août | MNQ avant 11 h | normal | MGC | 1 | 1/0 | 161,50 | 161,50 |
| Août | MNQ avant 11 h | stress | MNQ | 2 | 1/1 | 8,00 | 4,00 |
| Août | MNQ avant 11 h | stress | MES | 2 | 0/2 | -165,00 | -82,50 |
| Août | MNQ avant 11 h | stress | MYM | 0 | 0/0 | 0,00 | — |
| Août | MNQ avant 11 h | stress | MGC | 1 | 1/0 | 157,00 | 157,00 |
| Août | Veto Kronos | normal | MNQ | 1 | 0/1 | -82,00 | -82,00 |
| Août | Veto Kronos | normal | MES | 5 | 1/4 | -257,50 | -51,50 |
| Août | Veto Kronos | normal | MYM | 0 | 0/0 | 0,00 | — |
| Août | Veto Kronos | normal | MGC | 2 | 1/1 | 80,00 | 40,00 |
| Août | Veto Kronos | stress | MNQ | 1 | 0/1 | -89,00 | -89,00 |
| Août | Veto Kronos | stress | MES | 2 | 0/2 | -165,00 | -82,50 |
| Août | Veto Kronos | stress | MYM | 0 | 0/0 | 0,00 | — |
| Août | Veto Kronos | stress | MGC | 2 | 1/1 | 71,00 | 35,50 |

MES reste strictement identique dans les deux variantes. MGC reste identique avec le filtre horaire ; la nouvelle perte d’août sous Kronos explique pourquoi un gain d’admission propre au MNQ peut devenir une dégradation du portefeuille. MYM n’a aucune position. Aucun profil n’est choisi selon le mois qu’il vient de réussir.

## Apport par semaine

Chaque ligne appartient à un mois réinitialisé ; une semaine partielle ne couvre que ses dates dans ce mois. Versement personnel nul partout. Les journées et la ventilation des horaires par marché restent disponibles dans le [rapport agrégé](./jeu39-report.json) et le [calendrier par jeu/profil/coûts](./#historyCalendarGame).

| Mois | Variante | Coûts | Période | Partielle | Net | Cumul mensuel |
|---|---|---|---|---|---:|---:|
| Juin | Référence 100 $ | normal | 2026-06-01 → 2026-06-05 | Non | 347,00 | 347,00 |
| Juin | Référence 100 $ | normal | 2026-06-08 → 2026-06-12 | Non | -15,25 | 331,75 |
| Juin | Référence 100 $ | normal | 2026-06-15 → 2026-06-18 | Non | 13,50 | 345,25 |
| Juin | Référence 100 $ | normal | 2026-06-22 → 2026-06-26 | Non | 573,50 | 918,75 |
| Juin | Référence 100 $ | normal | 2026-06-29 → 2026-06-30 | Oui | 130,00 | 1 048,75 |
| Juin | Référence 100 $ | stress | 2026-06-01 → 2026-06-05 | Non | 189,00 | 189,00 |
| Juin | Référence 100 $ | stress | 2026-06-08 → 2026-06-12 | Non | -5,00 | 184,00 |
| Juin | Référence 100 $ | stress | 2026-06-15 → 2026-06-18 | Non | 3,00 | 187,00 |
| Juin | Référence 100 $ | stress | 2026-06-22 → 2026-06-26 | Non | 478,50 | 665,50 |
| Juin | Référence 100 $ | stress | 2026-06-29 → 2026-06-30 | Oui | 120,00 | 785,50 |
| Juin | MNQ avant 11 h | normal | 2026-06-01 → 2026-06-05 | Non | 70,50 | 70,50 |
| Juin | MNQ avant 11 h | normal | 2026-06-08 → 2026-06-12 | Non | -15,25 | 55,25 |
| Juin | MNQ avant 11 h | normal | 2026-06-15 → 2026-06-18 | Non | 0,00 | 55,25 |
| Juin | MNQ avant 11 h | normal | 2026-06-22 → 2026-06-26 | Non | 573,50 | 628,75 |
| Juin | MNQ avant 11 h | normal | 2026-06-29 → 2026-06-30 | Oui | 130,00 | 758,75 |
| Juin | MNQ avant 11 h | stress | 2026-06-01 → 2026-06-05 | Non | -77,00 | -77,00 |
| Juin | MNQ avant 11 h | stress | 2026-06-08 → 2026-06-12 | Non | -5,00 | -82,00 |
| Juin | MNQ avant 11 h | stress | 2026-06-15 → 2026-06-18 | Non | 0,00 | -82,00 |
| Juin | MNQ avant 11 h | stress | 2026-06-22 → 2026-06-26 | Non | 478,50 | 396,50 |
| Juin | MNQ avant 11 h | stress | 2026-06-29 → 2026-06-30 | Oui | 120,00 | 516,50 |
| Juin | Veto Kronos | normal | 2026-06-01 → 2026-06-05 | Non | 101,00 | 101,00 |
| Juin | Veto Kronos | normal | 2026-06-08 → 2026-06-12 | Non | -15,25 | 85,75 |
| Juin | Veto Kronos | normal | 2026-06-15 → 2026-06-18 | Non | 13,50 | 99,25 |
| Juin | Veto Kronos | normal | 2026-06-22 → 2026-06-26 | Non | 573,50 | 672,75 |
| Juin | Veto Kronos | normal | 2026-06-29 → 2026-06-30 | Oui | 130,00 | 802,75 |
| Juin | Veto Kronos | stress | 2026-06-01 → 2026-06-05 | Non | 63,00 | 63,00 |
| Juin | Veto Kronos | stress | 2026-06-08 → 2026-06-12 | Non | -5,00 | 58,00 |
| Juin | Veto Kronos | stress | 2026-06-15 → 2026-06-18 | Non | 3,00 | 61,00 |
| Juin | Veto Kronos | stress | 2026-06-22 → 2026-06-26 | Non | 478,50 | 539,50 |
| Juin | Veto Kronos | stress | 2026-06-29 → 2026-06-30 | Oui | 120,00 | 659,50 |
| Juillet | Référence 100 $ | normal | 2026-07-01 → 2026-07-02 | Oui | 150,00 | 150,00 |
| Juillet | Référence 100 $ | normal | 2026-07-06 → 2026-07-10 | Non | -241,00 | -91,00 |
| Juillet | Référence 100 $ | normal | 2026-07-13 → 2026-07-17 | Non | 141,00 | 50,00 |
| Juillet | Référence 100 $ | normal | 2026-07-20 → 2026-07-24 | Non | -27,00 | 23,00 |
| Juillet | Référence 100 $ | normal | 2026-07-27 → 2026-07-31 | Non | 153,00 | 176,00 |
| Juillet | Référence 100 $ | stress | 2026-07-01 → 2026-07-02 | Oui | 140,00 | 140,00 |
| Juillet | Référence 100 $ | stress | 2026-07-06 → 2026-07-10 | Non | -184,00 | -44,00 |
| Juillet | Référence 100 $ | stress | 2026-07-13 → 2026-07-17 | Non | 123,00 | 79,00 |
| Juillet | Référence 100 $ | stress | 2026-07-20 → 2026-07-24 | Non | -38,50 | 40,50 |
| Juillet | Référence 100 $ | stress | 2026-07-27 → 2026-07-31 | Non | 123,50 | 164,00 |
| Juillet | MNQ avant 11 h | normal | 2026-07-01 → 2026-07-02 | Oui | 150,00 | 150,00 |
| Juillet | MNQ avant 11 h | normal | 2026-07-06 → 2026-07-10 | Non | -79,00 | 71,00 |
| Juillet | MNQ avant 11 h | normal | 2026-07-13 → 2026-07-17 | Non | 141,00 | 212,00 |
| Juillet | MNQ avant 11 h | normal | 2026-07-20 → 2026-07-24 | Non | -27,00 | 185,00 |
| Juillet | MNQ avant 11 h | normal | 2026-07-27 → 2026-07-31 | Non | 241,50 | 426,50 |
| Juillet | MNQ avant 11 h | stress | 2026-07-01 → 2026-07-02 | Oui | 140,00 | 140,00 |
| Juillet | MNQ avant 11 h | stress | 2026-07-06 → 2026-07-10 | Non | -11,50 | 128,50 |
| Juillet | MNQ avant 11 h | stress | 2026-07-13 → 2026-07-17 | Non | 123,00 | 251,50 |
| Juillet | MNQ avant 11 h | stress | 2026-07-20 → 2026-07-24 | Non | -38,50 | 213,00 |
| Juillet | MNQ avant 11 h | stress | 2026-07-27 → 2026-07-31 | Non | 215,50 | 428,50 |
| Juillet | Veto Kronos | normal | 2026-07-01 → 2026-07-02 | Oui | 150,00 | 150,00 |
| Juillet | Veto Kronos | normal | 2026-07-06 → 2026-07-10 | Non | -160,00 | -10,00 |
| Juillet | Veto Kronos | normal | 2026-07-13 → 2026-07-17 | Non | 141,00 | 131,00 |
| Juillet | Veto Kronos | normal | 2026-07-20 → 2026-07-24 | Non | -187,50 | -56,50 |
| Juillet | Veto Kronos | normal | 2026-07-27 → 2026-07-31 | Non | 242,50 | 186,00 |
| Juillet | Veto Kronos | stress | 2026-07-01 → 2026-07-02 | Oui | 140,00 | 140,00 |
| Juillet | Veto Kronos | stress | 2026-07-06 → 2026-07-10 | Non | -96,00 | 44,00 |
| Juillet | Veto Kronos | stress | 2026-07-13 → 2026-07-17 | Non | 123,00 | 167,00 |
| Juillet | Veto Kronos | stress | 2026-07-20 → 2026-07-24 | Non | -195,50 | -28,50 |
| Juillet | Veto Kronos | stress | 2026-07-27 → 2026-07-31 | Non | 216,50 | 188,00 |
| Août | Référence 100 $ | normal | 2026-08-03 → 2026-08-07 | Non | -150,50 | -150,50 |
| Août | Référence 100 $ | normal | 2026-08-10 → 2026-08-14 | Non | 347,00 | 196,50 |
| Août | Référence 100 $ | normal | 2026-08-17 → 2026-08-21 | Non | -167,00 | 29,50 |
| Août | Référence 100 $ | normal | 2026-08-24 → 2026-08-28 | Non | -275,00 | -245,50 |
| Août | Référence 100 $ | normal | 2026-08-31 → 2026-08-31 | Oui | 0,00 | -245,50 |
| Août | Référence 100 $ | stress | 2026-08-03 → 2026-08-07 | Non | -59,00 | -59,00 |
| Août | Référence 100 $ | stress | 2026-08-10 → 2026-08-14 | Non | 190,00 | 131,00 |
| Août | Référence 100 $ | stress | 2026-08-17 → 2026-08-21 | Non | -80,50 | 50,50 |
| Août | Référence 100 $ | stress | 2026-08-24 → 2026-08-28 | Non | -279,00 | -228,50 |
| Août | Référence 100 $ | stress | 2026-08-31 → 2026-08-31 | Oui | 0,00 | -228,50 |
| Août | MNQ avant 11 h | normal | 2026-08-03 → 2026-08-07 | Non | -95,00 | -95,00 |
| Août | MNQ avant 11 h | normal | 2026-08-10 → 2026-08-14 | Non | 347,00 | 252,00 |
| Août | MNQ avant 11 h | normal | 2026-08-17 → 2026-08-21 | Non | -90,00 | 162,00 |
| Août | MNQ avant 11 h | normal | 2026-08-24 → 2026-08-28 | Non | -193,00 | -31,00 |
| Août | MNQ avant 11 h | normal | 2026-08-31 → 2026-08-31 | Oui | 0,00 | -31,00 |
| Août | MNQ avant 11 h | stress | 2026-08-03 → 2026-08-07 | Non | 0,00 | 0,00 |
| Août | MNQ avant 11 h | stress | 2026-08-10 → 2026-08-14 | Non | 190,00 | 190,00 |
| Août | MNQ avant 11 h | stress | 2026-08-17 → 2026-08-21 | Non | 0,00 | 190,00 |
| Août | MNQ avant 11 h | stress | 2026-08-24 → 2026-08-28 | Non | -190,00 | 0,00 |
| Août | MNQ avant 11 h | stress | 2026-08-31 → 2026-08-31 | Oui | 0,00 | 0,00 |
| Août | Veto Kronos | normal | 2026-08-03 → 2026-08-07 | Non | -95,00 | -95,00 |
| Août | Veto Kronos | normal | 2026-08-10 → 2026-08-14 | Non | 189,00 | 94,00 |
| Août | Veto Kronos | normal | 2026-08-17 → 2026-08-21 | Non | -90,00 | 4,00 |
| Août | Veto Kronos | normal | 2026-08-24 → 2026-08-28 | Non | -263,50 | -259,50 |
| Août | Veto Kronos | normal | 2026-08-31 → 2026-08-31 | Oui | 0,00 | -259,50 |
| Août | Veto Kronos | stress | 2026-08-03 → 2026-08-07 | Non | 0,00 | 0,00 |
| Août | Veto Kronos | stress | 2026-08-10 → 2026-08-14 | Non | 82,00 | 82,00 |
| Août | Veto Kronos | stress | 2026-08-17 → 2026-08-21 | Non | 0,00 | 82,00 |
| Août | Veto Kronos | stress | 2026-08-24 → 2026-08-28 | Non | -265,00 | -183,00 |
| Août | Veto Kronos | stress | 2026-08-31 → 2026-08-31 | Oui | 0,00 | -183,00 |

## Modèle et auto-évaluation

43requêtes uniques de64M15,49signaux liés. Trois signaux manquent de contexte après roll et le filtre s’abstient. Trois prévisions sont invalides (neuf lignes OHLC incohérentes), sans erreur d’inférence : elles sont conservées et déclenchent une abstention, jamais une correction inventée. Les43signaux au statutvalide ne signifient pas43prévisions uniques valides : certaines requêtes sont réutilisées. Les poids, seed et paramètres n’ont pas été entraînés ou cherchés sur ces résultats.

Le nouveau module d’auto-évaluation examine les six cellules mois/coûts de chaque variante : non-dégradation du net, non-dégradation du drawdown, aucune rupture, au moins une amélioration stricte ; Kronos exige aussi zéro sortie invalide/erreur. L’horaire échoue sur net et drawdown (juin stress145→222). Kronos échoue sur net, drawdown (août normal442→451) et qualité. Il n’y a ni sélection automatique ni réécriture autonome des règles.

L’entrée est simulée au même open que la référence, sans délai supplémentaire d’inférence. Cette hypothèse idéale ne prouve pas une exécution possible en production. Les prédictions ne sont pas des probabilités calibrées de réussite.

## Conservation et prochaine amélioration utile

62empreintes gelées vérifiées, six témoins exacts,384préfixes de compte,384préfixes de filtre et64reconstructions d’entrées modèle. Audit séparé :18cellules,384journées,90semaines,147décisions et2752bougies M15 contrôlées avec les sources, sans nouvelle inférence ni campagne. Les quatre fichiers privés (requêtes, prévisions, rapport, trades) sont archivés et reconstruits exactement depuis TRADING_DATASETS ; [manifeste](./jeu39-archive.json), SHA90e3290567fbc376daeca2300261a02dd7fd1c0b0c5295e59e3f5709469729de.

Deux configurations ajoutées après calcul : registre92, catalogue109, zéro confirmation indépendante. Toutes les anciennes entrées, freezes et résultats sont conservés. L’intégration Kronos/RSI/news, la collecteJeu08 et le rendez-vous du3décembre restent intacts. Aucun ordre, broker, Paper/Shadow, achat, abonnement ou merge main.

La prochaine priorité est la qualité de mesure : ajouter un contrôle de cohérence entre le texte, les paramètres et le pack avant un futur gel ; modéliser la latence avant de revendiquer une exécution ; réserver de nouvelles données à un protocole adapté. Ne pas changer11h en10h45 à partir de ce tableau, combiner les deux variantes après résultat, ou augmenter le risque. La collecte prospective existante garde son protocoleJeu08 et ne devient pas rétroactivement une validationJeu39.

[Recherches et limites des sources](./JEU39_RESEARCH.md) · [Protocole original](./JEU39_PROTOCOL.md) · [Audit de l’exécution](./jeu39-execution-audit.json) · [Leçons](./RESEARCH_LESSONS.md).


## Vérification logicielle

254 tests passent, dont les rapports39 et les62sélections/186vues du calendrier commun. Build, hygiène et25modules Functions validés. Les516anciens identifiants HTML sont préservés parmi518uniques. Les24lignes du nouveau panneau sont rapprochées du rapport ; tests d’interface sur DOM simulé et inspection des sources CSS, sans contrôle navigateur. Ces vérifications ne changent pas les conclusions de performance ni l’écart documentaire.
