# Nykuto — sources fiables, actualités et calendrier des marchés

**Recherche du 9 septembre 2026 — priorité MNQ, MES, MYM et MGC.**

Ce dossier propose un système de veille pour le bot, pas une liste de signaux d’achat ou de vente. Il réunit 77 fiches de ressources : publications, calendriers, fournisseurs, communautés et documentation. Plusieurs fiches appartiennent au même organisme. Les sources ont été examinées à partir de pages publiques et de documentation indexée; les flux commerciaux n’ont pas été testés sous abonnement et aucun salon privé Discord n’a été audité.

**Conclusion : le bot a surtout besoin de savoir quelle information croire, quand elle est devenue disponible et à quel marché elle est pertinente. Multiplier les sites ne suffit pas.** Aucune connexion n’a été installée sur Nykuto par ce dossier.

## 1. Trois fonctions à séparer

**Comprendre.** Une base documentaire explique CPI, PCE, emploi, taux réels, résultats d’entreprise, échéances et microstructure. Le modèle peut rechercher dans cette base et produire une explication sourcée, sous réserve des droits des textes utilisés.

**Être informé.** Des adaptateurs autorisés reçoivent les nouvelles et les mises à jour de calendrier. Leurs horodatages et leur état de fonctionnement sont surveillés. Les capacités de transport varient : par exemple, [Trading Economics documente un WebSocket de calendrier](https://docs.tradingeconomics.com/economic_calendar/streaming/) et la [Fed publie un répertoire RSS](https://www.federalreserve.gov/feeds/feeds.htm).

**Décider des autorisations de trading.** Un moteur déterministe, séparé du lecteur IA, applique la politique de risque validée. Une nouvelle ambiguë, une donnée manquante ou un article hostile ne doit pas pouvoir directement modifier les ordres.

Je recommande donc une base de connaissances actualisable et une recherche documentaire au moment de la question, plutôt qu’un réentraînement permanent du modèle sur tout ce qu’il trouve. Cette recommandation ne dispense pas de vérifier les licences.

## 2. Hiérarchie de confiance proposée

| Classe | Rôle | Limite |
|---|---|---|
| Producteur officiel | Vérifier une publication, une décision, un horaire ou une règle dans son domaine | Une page peut être ancienne; une déclaration n’est pas une vérité économique universelle |
| Rédaction ou fil professionnel | Découvrir, contextualiser et corroborer rapidement | Vérifier correction, source amont et licence |
| Recherche et formation | Comprendre les mécanismes et générer des hypothèses | Une analyse convaincante n’est pas un résultat de backtest |
| Communauté | Repérer un outil, une rumeur ou un problème à vérifier | Popularité, captures d’écran et témoignages ne sont pas des preuves |

Il s’agit de catégories de travail, pas de scores de fiabilité calculés. Les [principes de Reuters](https://www.thomsonreuters.com/en/about-us/trust-principles) et les [règles éditoriales d’AP](https://www.ap.org/about/news-values-and-principles/) constituent des éléments utiles pour évaluer une rédaction; ils ne prouvent pas son infaillibilité.

Pour chaque information, conserver séparément : authenticité de l’origine, fraîcheur, indépendance des confirmations, pertinence pour le contrat, précision des chiffres et droits d’usage.

## 3. Le noyau macroéconomique

| Besoin | Sources prioritaires | Ce que le bot doit apprendre à distinguer |
|---|---|---|
| Politique monétaire américaine | [Calendrier FOMC](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm), [événements Fed](https://www.federalreserve.gov/newsevents/calendar.htm) | Décision, projections, discours, conférence et compte rendu |
| Inflation et emploi | [BLS](https://www.bls.gov/schedule/) | CPI/PPI, chiffres mensuels ou annuels, chômage, salaires, révisions |
| PCE et croissance | [BEA](https://www.bea.gov/news/schedule) | PCE global ou sous-jacent, PIB et versions successives |
| Consommation, logement, commandes | [Census](https://www.census.gov/economic-indicators/calendar-listview.html) | Indicateurs différents, dates et périodes de référence |
| Chômage hebdomadaire | [Department of Labor](https://oui.doleta.gov/unemploy/claims_arch.asp) | Demandes initiales/continues, semaines et corrections |
| Enquêtes d’activité | [ISM](https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/), [S&P PMI](https://www.pmi.spglobal.com/Public/Release/ReleaseDates?language=en) | Deux producteurs distincts; global, prix, emploi, commandes; flash/final |
| Dette américaine | [Treasury, adjudications](https://fiscaldata.treasury.gov/datasets/treasury-securities-auctions-data/) | Annonce, adjudication, résultat et règlement |
| Contexte historique | [FRED](https://fred.stlouisfed.org/docs/api/fred/), [ALFRED](https://alfred.stlouisfed.org/) | Version actuelle contre version disponible dans le passé |

Les calendriers officiels servent de référence. Un agrégateur normalisé simplifie leur usage, mais ne doit pas effacer le nom du producteur initial. Le consensus provient d’une enquête ou d’un fournisseur identifié, pas nécessairement de l’agence qui publie le réalisé. [Trading Economics distingue notamment le consensus des économistes de sa propre prévision](https://tradingeconomics.com/api/calendar.aspx).

**API ne veut pas dire instantané.** Les [dates de publication FRED](https://fred.stlouisfed.org/docs/api/fred/releases_dates.html) ne garantissent pas la disponibilité simultanée dans FRED/ALFRED. La [documentation historique du BLS](https://www.bls.gov/bls/api_features.htm) signale également un décalage de disponibilité. Il faut tester chaque accès avant de lui confier une fonction sensible à la seconde.

## 4. Couverture internationale, commerce et entreprises

Pour les annonces hors États-Unis, suivre d’abord les calendriers de la [BCE](https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html), de la [Bank of England](https://www.bankofengland.co.uk/monetary-policy/upcoming-mpc-dates) et de la [Bank of Japan](https://www.boj.or.jp/en/mopo/mpmsche_minu/index.htm). Leur inclusion est une proposition de couverture des risques internationaux, pas une affirmation que chaque réunion mérite un trade.

Pour le commerce, utiliser [USTR](https://ustr.gov/about-us/policy-offices/press-office/press-releases), les [publications de la Maison-Blanche](https://www.whitehouse.gov/fact-sheets/), le [Bureau of Industry and Security](https://www.bis.gov/news-updates) pour les exportations sensibles et le [Federal Register](https://www.federalregister.gov/developers/documentation/api/v1). Le bot doit différencier une menace de tarif, une décision signée, une date d’application, une suspension et une annulation.

Pour les entreprises, partir des dépôts [SEC/EDGAR](https://www.sec.gov/search-filings/edgar-application-programming-interfaces) et des espaces relations investisseurs. Les sites de [NVIDIA](https://investor.nvidia.com/home/default.aspx) et [Microsoft](https://www.microsoft.com/en-us/investor/default) illustrent l’accès aux résultats et aux événements. [Quartr](https://quartr.com/) est une piste commerciale pour structurer les conférences et documents d’émetteurs.

La liste des entreprises surveillées doit être construite à partir des constituants et pondérations datés des indices, non d’une liste permanente de quelques grandes marques. Le [Dow est pondéré par les prix](https://www.spglobal.com/spdji/en/indices/equity/dow-jones-industrial-average/); il ne doit pas recevoir le même calcul de pondération que le [S&P 500](https://www.spglobal.com/spdji/en/methodology/article/sp-us-indices-methodology/).

Je propose de classer les annonces d’entreprise en résultats, prévisions, dépenses d’investissement, nouveau produit, partenariat, acquisition, restructuration, contentieux et restriction réglementaire. Un nouveau produit n’est matériel pour l’indice que si son importance économique est étayée. Un communiqué de l’entreprise demeure une déclaration de cette entreprise, même s’il est distribué par un service de presse.

## 5. Fournisseurs et sites de consultation

| Source | Usage proposé | Vérification avant achat/intégration |
|---|---|---|
| [Trading Economics](https://tradingeconomics.com/api/calendar.aspx) ou [FXStreet](https://docs.fxstreet.com/) | Calendrier structuré et valeurs | Couverture, consensus historique, droits, mises à jour et latence |
| [Newsquawk Enterprise](https://www.newsquawk.com/enterprise) | News macro et fil contextualisé | Accès JSON/RSS prévu au contrat; usages algorithmiques autorisés |
| [LSEG Machine Readable News](https://www.lseg.com/en/data-analytics/financial-news-service/machine-readable-news) | News professionnelles structurées | Éditeurs inclus, archives, droit IA et usage non-display |
| [Bloomberg Event-Driven Feeds](https://professional.bloomberg.com/products/data/enterprise-catalog/event-driven-feeds/) | Flux d’événements professionnels | Produit exact, contrat et budget |
| [Dow Jones](https://www.dowjones.com/business-intelligence/newswires/products/content-feeds-and-apis/) | Newswires et APIs | Ne pas présumer que toutes les variantes sont temps réel et utilisables pour le même automatisme |
| [Benzinga API](https://docs.benzinga.com/introduction/welcome) | Actualités d’émetteurs et calendriers | Différence entre abonnement utilisateur et licence API |
| [FinancialJuice](https://www.financialjuice.com/home) | Veille humaine, titres et squawk | Audio public annoncé différé; API officielle réutilisable non confirmée ici |
| [Forex Factory](https://www.forexfactory.com/calendar) et [Investing.com](https://www.investing.com/economic-calendar) | Contrôle visuel du calendrier | Ne pas assimiler page publique et autorisation de collecte massive |
| [EODHD](https://eodhd.com/financial-apis/stock-market-financial-news-api), [Newscatcher](https://www.newscatcherapi.com/docs/news-api/get-started/introduction) | Couverture complémentaire | Tester pertinence et fraîcheur plutôt que compter les articles |

**Un piège commercial concret :** le [plan Developer de NewsAPI](https://newsapi.org/pricing) mentionne un retard de 24 heures sur les articles et exclut la production, même interne. Il ne constitue donc pas une solution gratuite de news live pour le bot.

Je déconseille de souscrire tous ces services. Comparer d’abord un calendrier structuré et un seul fil de nouvelles sur les mêmes annonces, puis sélectionner le minimum qui répond aux besoins mesurés. Les tarifs de lecture ne suffisent pas à chiffrer l’usage serveur, le stockage, l’IA et l’affichage sur un site.

## 6. Ce que montrent YouTube, Reddit et Discord

Les discussions publiques de [FuturesTrading sur les sources](https://www.reddit.com/r/FuturesTrading/comments/1rnrzkv/what_are_your_goto_news_and_analysis_sources/) citent notamment FinancialJuice, les calendriers et les services de squawk. Ce sont des pistes de découverte. Aucun taux de réussite ou classement de latence n’en a été déduit.

Pour la vidéo, privilégier [CME Group](https://www.youtube.com/user/cmegroup), les [diffusions officielles de la Fed](https://www.federalreserve.gov/live-broadcast.htm), [Bloomberg Television](https://www.youtube.com/@markets) et [Reuters](https://www.youtube.com/@Reuters). Les pages de chaînes et publications ont été repérées; aucune prétention d’avoir visionné et validé tout leur contenu. Je recommande d’extraire la pédagogie et les documents originaux, pas des instructions de trading tirées d’un montage.

[Bookmap](https://bookmap.com/learning-center) présente des communautés et des diffusions éducatives, dont un accès [en portugais](https://bookmap.com/pt/discord-brasil). Cela peut être utile à l’apprentissage des outils, mais ce n’est pas une rédaction macroéconomique indépendante. [Benzinga propose aussi une distribution de news vers Discord](https://www.benzinga.com/apis/cloud-product/stock-news-for-discord/): le canal de diffusion n’est pas l’origine de l’information.

Les [conditions Reddit](https://redditinc.com/policies/data-api-terms) restreignent notamment les usages commerciaux et l’entraînement sur les contenus. La [politique Discord](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy) interdit le scraping et conditionne l’entraînement sur les messages API à son autorisation expresse. La [méthode YouTube de téléchargement des sous-titres](https://developers.google.com/youtube/v3/docs/captions/download) demande des permissions d’édition : ce n’est pas un accès universel aux transcriptions de toutes les vidéos publiques.

## 7. Horaires : une donnée opérationnelle, pas une décoration

La séance principale [NYSE](https://www.nyse.com/trade/hours-calendars) est normalement 09:30–16:00 à New York, avec des exceptions publiées. Les sessions futures doivent venir du [calendrier CME par produit](https://www.cmegroup.com/trading-hours.html), complété par les avis applicables. Les [horaires MGC](https://www.cmegroup.com/markets/metals/precious/e-micro-gold.html) incluent une pause quotidienne; ne pas appliquer aveuglément un horaire d’actions à l’or.

**Anomalie trouvée pendant la recherche :** la [FAQ Micro E-mini](https://www.cmegroup.com/articles/faqs/micro-e-mini-equity-index-futures-frequently-asked-questions.html) reprend une ancienne pause 16:15–16:30 ET. L’[avis réglementaire CME 21-244R](https://www.cmegroup.com/market-regulation/rule-filings/2021/6/21-244R_1.pdf), dont le texte et les pages pertinentes ont été inspectés, indique sa suppression pour les contrats concernés à partir du 28 juin 2021 et liste notamment MNQ, MES et MYM. Le bot ne doit pas conserver l’ancienne règle simplement parce qu’elle reste visible sur une page officielle.

Stocker en UTC et afficher avec `America/New_York`, `America/Chicago` et `America/Asuncion`. La [base IANA documente le passage du Paraguay à UTC−3 permanent](https://data.iana.org/time-zones/tzdb-2025b/NEWS). Utiliser une base récente pour les conversions, jamais une différence horaire fixée pour toute l’année.

Je recommande de gérer séparément séance de la bourse, date de trading, fermeture anticipée, échéance, changement de contrat, premier jour de notification/livraison lorsque pertinent et restrictions propres au courtier ou à la prop firm. Aucun horaire spécifique de Lucid n’a été audité ici.

## 8. Priorités différentes selon le marché

Ces priorités sont des hypothèses de conception à tester.

**MNQ :** macro américaine, attentes de taux, résultats des constituants pertinents, investissements technologiques et restrictions d’exportation. Ne pas faire dépendre le filtrage d’une liste fixe d’entreprises.

**MES :** activité, inflation, emploi, politique monétaire et résultats répartis entre les secteurs de l’indice.

**MYM :** mêmes risques macro, avec une pondération des annonces cohérente avec la méthode du Dow plutôt qu’avec la capitalisation seule.

**MGC :** politique monétaire, taux réels, dollar, événements géopolitiques et contexte aurifère. La [recherche de la Chicago Fed](https://www.chicagofed.org/publications/chicago-fed-letter/2021/464) donne un cadre conditionnel pour les taux réels et l’or. Les [données Goldhub](https://www.gold.org/goldhub/data) et le [COT](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm) servent davantage au contexte qu’à la course à la première seconde. Le COT hebdomadaire publié le vendredi décrit habituellement les positions du mardi, sous réserve du calendrier.

## 9. Comment transformer une nouvelle en donnée exploitable

Le schéma joint prévoit origine, URL canonique, première publication, réception, heure prévue, correction, période mesurée, statut et droits. Pour les chiffres : réalisé initial, réalisé révisé, consensus horodaté, prévision propre du fournisseur, précédent connu et précédent révisé restent séparés.

**Exemple entièrement fictif :** une inflation mensuelle ressort à 0,4 % contre un consensus de 0,3 %. La surprise est +0,1 point de pourcentage. Cela ne suffit pas à donner un ordre de vente : il manque notamment les autres composantes, les attentes déjà intégrées, les éventuelles révisions et une mesure correcte de la réaction du marché. Le bot doit formuler les hypothèses concurrentes, pas inventer une probabilité de hausse ou de baisse.

Une même dépêche redistribuée par plusieurs sites doit rester un seul groupe d’origine. Les corrections ne doivent pas effacer le contenu initial connu à l’instant du backtest, lorsque sa conservation est autorisée.

## 10. Mise en place et validation proposées

Architecture cible : **sources autorisées → normalisation → provenance/déduplication → calendrier et contexte par marché → lecteur IA → moteur de risque déterministe → journal d’audit**. Les prix exécutables et l’état de la bourse restent des flux séparés; une news live ne corrige pas un graphique différé.

Commencer par un calendrier officiel et une base documentaire. Ajouter un calendrier API seulement après choix et validation du contrat. Ajouter ensuite un fil professionnel unique. Réserver Reddit, Discord et YouTube à la découverte/formation, selon droits. Le coût utile est celui de l’information pertinente disponible à temps, pas celui du plus grand nombre de sites.

La politique jointe reste en **shadow-only** et n’autorise aucune exécution. Les fenêtres de prudence sont volontairement non chiffrées : il faut les calibrer par contrat et événement, puis les évaluer hors échantillon. Une conférence FOMC ne doit pas être déclarée terminée par une simple minuterie après le communiqué.

Le premier objectif proposé est d’évaluer si les news améliorent la sélection des moments où ne pas ouvrir une position. Sur panne d’un flux critique, bloquer les nouvelles entrées dépendantes de ce flux tout en préservant les protections existantes. Un arrêt de bourse peut empêcher l’exécution immédiate d’une sortie; aucune règle informatique ne doit promettre l’inverse.

Enfin, comparer à stratégie identique : sans news, calendrier seul, puis calendrier et filtre news. Mesurer résultats nets, drawdown, slippage, erreurs, couverture, faux blocages et occasions manquées. Les tests doivent utiliser l’information réellement disponible à chaque instant, pas les révisions futures. Une meilleure lecture des textes ne prouve pas, à elle seule, une meilleure rentabilité.

## Annexes du dossier

L’annuaire complet est dans `registre_sources.md` et sa version machine dans `sources.json`. Les autres fichiers contiennent le schéma d’événement, une politique de risque proposée, les consignes du lecteur IA et un protocole d’acceptation. Ils constituent une base d’intégration à tester, non une modification déjà appliquée au site.
