# Jeu 19 — huit comparaisons de microcontrats

Gel local avant résultats : `9f3b33c`. Aucune configuration sélectionnable,
car les deux fenêtres de développement ne sont intégralement couvertes pour
aucun marché. La réserve mai–août 2026 n'a pas été ouverte pour mesurer la performance.

| Marché / méthode | Trades normaux | Net normal | Trades stress | Net stress |
| --- | ---: | ---: | ---: | ---: |
| MNQ Pullback | 5 | +171,50 $ | 5 | +154 $ |
| MNQ croisement | 0 | 0 $ | 0 | 0 $ |
| MES Pullback | 51 | −408,75 $ | 7 | −50 $ |
| MES croisement | 11 | −10 $ | 1 | +7,50 $ |
| MYM Pullback | 69 | +251 $ | 38 | +145,50 $ |
| MYM croisement | 14 | +49,50 $ | 7 | +169 $ |
| MGC Pullback | 0 | 0 $ | 0 | 0 $ |
| MGC croisement | 0 | 0 $ | 0 | 0 $ |

Les nombres définitifs sont ceux du rapport vérifié. Ce sont des résultats sur
les séances exploitables de janvier–avril 2026, pas des comptes continus ni des
revenus attendus. Les coûts doublés modifient les admissions aux limites de
risque et de marge nette : les trades peuvent changer, et le résultat n'est donc
pas nécessairement inférieur au scénario normal. Les coûts restent hypothétiques.

La piste MYM Pullback satisfait les six critères de performance, avec un PF en
R de 1,216648 et un drawdown de 5,192616 R, mais échoue sur la couverture et la
validation des comptes complets. Janvier–février couvre 39/39 séances ; mars–avril
34/43. Les neuf séances non évaluées résultent de la préparation au changement
d'échéance, pas de prix absents sur ces neuf journées. Le résultat sur 73 journées
se décompose en 19 positives, 19 négatives et 35 sans trade ; pire journée −82 $.
Ces chiffres ne justifient pas une activation.

La comparaison a ajouté des calculs de tick, multiplicateur, coûts et seuils
de compte propres à MES, MYM et MGC. Les huit replays MNQ de référence restent
identiques au moteur figé du Jeu 17. Audit : 808 préfixes de signaux, 468 préfixes
de comptes et 530 trades audités, incluant des observations réutilisées.

L'or reste sans trade admissible sous ces règles, avec de nombreuses séances
de préparation indisponibles et un budget de risque par trade de 50 $. L'absence
de trade n'est jamais un succès. Aucun paramètre n'a été ajusté après résultat.

Suite distincte : vérifier les bougies natives 30 min pour préparer les deux
horizons séparément sur MYM, sans inventer de bougie 5 min. Toute modification
sera gelée dans un nouveau Jeu 20 avant ses résultats. La sélection du Jeu 19
reste nulle dans `jeu19-selection.json` et les anciens résultats sont conservés.
Les prix et trades individuels restent privés. Aucun ordre, bot, compte membre
ni ancienne tâche de collecte n'est activé ou modifié.

Archivage privé vérifié : voir [les manifestes et empreintes](JEU19_20_ARCHIVE.md).
