# Registre des sources Nykuto

Recherche du 2026-09-09 — 77 fiches de ressources, pas autant de sites indépendants.

Les liens ci-dessous sont des pages de référence, pas nécessairement des endpoints API. Aucun connecteur n’est activé. Les droits et les latences doivent être validés avant ingestion.

## Macro officiel

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [Federal Reserve — calendrier FOMC](https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm) (`fed_fomc`) | Décisions, comptes rendus, projections et dates FOMC. | Pages officielles. | Une réunion, sa décision, ses projections et sa conférence sont des événements distincts. |
| [Federal Reserve — événements et discours](https://www.federalreserve.gov/newsevents/calendar.htm) (`fed_events`) | Discours, auditions et horaires des conférences. | Calendrier public. | Conserver le fuseau et les modifications; une heure prévue ne prouve pas la réception effective. |
| [Federal Reserve — répertoire RSS](https://www.federalreserve.gov/feeds/feeds.htm) (`fed_rss`) | Découverte des nouveaux communiqués officiels. | RSS documenté; sélectionner le flux pertinent. | Le polling et la publication RSS ne constituent pas une garantie de faible latence. |
| [BLS — calendrier statistique](https://www.bls.gov/schedule/) (`bls_calendar`) | Inflation CPI/PPI, emploi, salaires, JOLTS et calendrier. | Calendrier et publications officiels. | Recharger les dates; les publications peuvent être reprogrammées. |
| [BEA — calendrier](https://www.bea.gov/news/schedule) (`bea_calendar`) | PIB, revenus et dépenses des ménages, PCE. | Calendrier et communiqués officiels. | Distinguer première estimation et révisions; ne pas inventer un consensus. |
| [Census — calendrier des indicateurs](https://www.census.gov/economic-indicators/calendar-listview.html) (`census_calendar`) | Ventes au détail, logement, commandes et commerce extérieur. | Calendrier public. | Chaque indicateur possède son propre horaire et ses révisions. |
| [Department of Labor — demandes d’allocations](https://oui.doleta.gov/unemploy/claims_arch.asp) (`dol_claims`) | Inscriptions hebdomadaires au chômage et archives. | Publications officielles. | Distinguer demandes initiales, demandes continues et semaines de référence. |
| [ISM — PMI Reports](https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/) (`ism_pmi`) | Enquêtes manufacturières et services, composantes prix et emploi. | Publications du producteur. | ISM n’est pas une agence publique; droits d’exploitation et de redistribution à valider. |
| [ISM — calendrier de publication](https://www.ismworld.org/supply-management-news-and-reports/reports/rob-report-calendar/) (`ism_calendar`) | Dates et heures de diffusion des enquêtes. | Calendrier officiel. | Ne pas substituer une simple règle de jour ouvré au calendrier publié. |
| [S&P Global — calendrier PMI](https://www.pmi.spglobal.com/Public/Release/ReleaseDates?language=en) (`sp_pmi`) | PMI mondiaux; enquêtes flash et finales. | Calendrier public du producteur. | PMI S&P et PMI ISM ne sont pas le même indicateur; droits commerciaux à vérifier. |
| [Treasury — résultats des adjudications](https://fiscaldata.treasury.gov/datasets/treasury-securities-auctions-data/) (`treasury_auctions`) | Caractéristiques et résultats des adjudications du Trésor. | Jeu de données FiscalData; API documentée. | Ne pas supposer une latence de diffusion comparable à un fil professionnel. |
| [Treasury — prochaines adjudications](https://fiscaldata.treasury.gov/datasets/upcoming-auctions/) (`treasury_upcoming`) | Planification des émissions et adjudications. | Jeu de données officiel. | Conserver dates d’annonce, d’adjudication et de règlement séparément. |
| [CFTC — calendrier COT](https://www.cftc.gov/MarketReports/CommitmentsofTraders/ReleaseSchedule/index.htm) (`cftc_calendar`) | Dates effectives de publication des COT. | Calendrier officiel. | Habituellement vendredi pour positions du mardi; vérifier les exceptions. |
| [BCE — réunions des conseils](https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html) (`ecb_calendar`) | Décisions monétaires européennes. | Calendrier institutionnel. | Fuseaux européens et dates de transition saisonnière à gérer. |
| [Bank of England — dates MPC](https://www.bankofengland.co.uk/monetary-policy/upcoming-mpc-dates) (`boe_calendar`) | Réunions monétaires britanniques. | Calendrier officiel. | Vérifier le caractère provisoire des dates futures. |
| [Bank of Japan — réunions de politique monétaire](https://www.boj.or.jp/en/mopo/mpmsche_minu/index.htm) (`boj_calendar`) | Politique monétaire japonaise et publications associées. | Calendrier officiel. | Ne pas imposer une heure de décision inconnue; gérer Asia/Tokyo. |

## Documentation

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [BLS — limites et fonctionnalités API](https://www.bls.gov/bls/api_features.htm) (`bls_api`) | Documenter les séries historiques et limites d’accès. | API de données documentée. | L’ancienne documentation signale un décalage de disponibilité; ne pas supposer un flux instantané à la publication. |
| [BEA — développeurs](https://www.bea.gov/resources/for-developers) (`bea_api`) | Séries macroéconomiques structurées. | API documentée; conditions et clé à vérifier. | Un accès API historique n’est pas une preuve de disponibilité temps réel. |
| [Census — API indicateurs économiques](https://www.census.gov/data/developers/data-sets/economic-indicators.html) (`census_api`) | Données économiques structurées du Census. | API documentée. | Vérifier les jeux de données et leur date de disponibilité. |
| [FRED — dates de publication](https://fred.stlouisfed.org/docs/api/fred/releases_dates.html) (`fred_release_warning`) | Comprendre la différence entre publication source et disponibilité FRED. | Documentation API. | La documentation précise que ces dates ne garantissent pas la disponibilité sur FRED/ALFRED. |
| [Reuters — principes éditoriaux](https://www.thomsonreuters.com/en/about-us/trust-principles) (`reuters_standards`) | Cadre d’indépendance et d’intégrité éditoriale. | Politique du groupe. | Politique éditoriale n’équivaut ni à infaillibilité ni à licence de réutilisation. |
| [Trading Economics — streaming calendrier](https://docs.tradingeconomics.com/economic_calendar/streaming/) (`te_streaming`) | Mises à jour d’événements via WebSocket. | WebSocket avec authentification documenté. | Mesurer réception et perte d’événements; ne pas attribuer de SLA non mesuré. |
| [NewsAPI — conditions des plans](https://newsapi.org/pricing) (`newsapi`) | Évaluer les limites d’un agrégateur généraliste. | API; plan Developer limité au développement. | Articles du plan gratuit retardés de 24 h; pas de staging/production même interne selon la page consultée. |
| [Benzinga — Stock News for Discord](https://www.benzinga.com/apis/cloud-product/stock-news-for-discord/) (`benzinga_discord`) | Distribution de nouvelles à un canal Discord par webhook. | Produit officiel documenté. | Confirmer le contrat; recevoir un flux dans Discord n’autorise pas son extraction ou son entraînement illimité. |
| [IANA — historique de version des fuseaux](https://data.iana.org/time-zones/tzdb-2025b/NEWS) (`iana_tz`) | Traçabilité des modifications de fuseaux, dont Paraguay UTC−3 permanent. | Base officielle de fuseaux. | Utiliser la base à jour en production, pas cette seule ancienne version comme calendrier perpétuel. |

## Historique contexte

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [FRED — API](https://fred.stlouisfed.org/docs/api/fred/) (`fred_api`) | Séries macroéconomiques et documentation. | API documentée. | Licences variables selon le producteur amont; FRED n’est pas un fil de trading instantané. |
| [ALFRED — versions historiques](https://alfred.stlouisfed.org/) (`alfred`) | Versions connues à une date passée pour limiter la fuite temporelle. | Archives et API associée. | Une vintage datée à la journée ne remplace pas l’horodatage exact de réception intrajournalière. |
| [Federal Reserve Bank of New York — API marchés](https://markets.newyorkfed.org/static/docs/markets-api.html) (`nyfed_markets`) | Opérations monétaires et taux de référence. | API officielle documentée. | Un taux de référence publié ne doit pas être confondu avec une cotation négociable en continu. |
| [CFTC — Commitments of Traders](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm) (`cftc_cot`) | Positionnement agrégé des participants. | Rapports et archives officiels. | Contexte retardé, pas signal intraday; ne pas dater l’information au jour des positions. |
| [EIA — Open Data](https://www.eia.gov/opendata/) (`eia_api`) | Énergie, pétrole, gaz et contexte inflationniste. | API officielle documentée. | Pertinence indirecte pour les quatre microcontrats; ne pas activer tous les indicateurs. |
| [World Gold Council — Goldhub Data](https://www.gold.org/goldhub/data) (`wgc_data`) | Demande d’or, ETF, réserves et séries sectorielles. | Données et études sectorielles. | Organisme du secteur aurifère; certains jeux sont retardés et sous conditions de licence. |
| [World Gold Council — Gold Demand Trends](https://www.gold.org/goldhub/research/gold-demand-trends) (`wgc_demand`) | Contexte de demande et d’offre pour MGC. | Rapports sectoriels. | Contexte de moyen terme, pas déclencheur de scalping. |

## Politique commerciale

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [USTR — communiqués commerciaux](https://ustr.gov/about-us/policy-offices/press-office/press-releases) (`ustr`) | Tarifs douaniers, négociations et accords commerciaux. | Communiqués officiels. | Source primaire de la position gouvernementale, pas preuve de son effet économique. |
| [White House — fiches officielles](https://www.whitehouse.gov/fact-sheets/) (`whitehouse`) | Annonces politiques et économiques de l’exécutif. | Publications institutionnelles. | Distinguer déclaration, signature, texte applicable et prise d’effet. |
| [Bureau of Industry and Security — actualités](https://www.bis.gov/news-updates) (`bis_exports`) | Restrictions d’exportation et technologies sensibles. | Publications officielles. | bis.gov est le Bureau of Industry and Security, distinct de la Banque des règlements internationaux. |
| [Federal Register — API](https://www.federalregister.gov/developers/documentation/api/v1) (`federal_register`) | Avis et textes réglementaires, dates d’application. | API publique documentée. | Vérifier l’état juridique et la version officielle lorsque la précision réglementaire est déterminante. |

## Entreprises

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [SEC — EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces) (`sec_edgar`) | Dépôts réglementaires et données financières des émetteurs. | API officielle et règles d’accès. | Un dépôt est une déclaration de l’émetteur, pas une validation de toutes ses affirmations par la SEC. |
| [NVIDIA — relations investisseurs](https://investor.nvidia.com/home/default.aspx) (`nvidia_ir`) | Résultats, événements et présentations de l’émetteur. | Pages IR, alertes et répertoire RSS visibles. | Exemple d’émetteur; pertinence à recalculer selon la composition des indices à la date de l’événement. |
| [Microsoft — relations investisseurs](https://www.microsoft.com/en-us/investor/default) (`microsoft_ir`) | Résultats, prévisions, conférences et annonces financières. | Pages IR et alertes. | Distinguer chiffres réalisés, objectifs et communication promotionnelle. |
| [Quartr — données de relations investisseurs](https://quartr.com/) (`quartr`) | Conférences, transcriptions et documents d’émetteurs. | Offre API annoncée par l’éditeur; périmètre contractuel à vérifier. | Latence, couverture et droits IA non testés dans cette recherche. |

## Marche operations

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [CME Group — horaires et jours fériés](https://www.cmegroup.com/trading-hours.html) (`cme_hours`) | Sessions, pauses et exceptions de négociation. | Calendrier officiel. | Source par produit et date; ne pas prendre les heures d’un autre groupe de contrats. |
| [CME — FAQ Micro E-mini](https://www.cmegroup.com/articles/faqs/micro-e-mini-equity-index-futures-frequently-asked-questions.html) (`cme_faq`) | Codes et fonctionnement des Micro E-mini. | FAQ publique. | Conflit détecté: ancienne pause 16:15–16:30 ET encore mentionnée; ne pas l’utiliser comme moteur de sessions. |
| [CME — avis 21-244R, suppression ancienne pause](https://www.cmegroup.com/market-regulation/rule-filings/2021/6/21-244R_1.pdf) (`cme_halt_change`) | Avis daté de suppression de la pause de 15 minutes, applicable le 28 juin 2021. | PDF officiel; texte et pages 2, 4, 5 inspectés. | Inclut MES, MNQ et MYM. Vérifier tout amendement ultérieur avant production. |
| [CME — Micro Nasdaq-100](https://www.cmegroup.com/markets/equities/nasdaq/micro-e-mini-nasdaq-100.contractSpecs.html) (`cme_mnq`) | Identification du contrat MNQ et liens de spécifications. | Page produit officielle; tableaux dynamiques partiellement rendus. | Les cours affichés sur le site peuvent être différés; ce n’est pas un flux de prix connecté. |
| [CME — Micro Gold](https://www.cmegroup.com/markets/metals/precious/e-micro-gold.html) (`cme_mgc`) | Identification MGC, horaires et ressources contractuelles. | Page produit officielle. | Distinguer futures, options et échéance exacte; vérifier les limites du courtier. |
| [CME — limites de prix](https://www.cmegroup.com/trading/price-limits.html) (`cme_limits`) | Limites de variation et contexte de suspension. | Informations officielles. | Limites et arrêt de marché ne sont pas la même chose qu’un stop personnel. |
| [CME — calendrier du Gold](https://www.cmegroup.com/markets/metals/precious/gold.calendar.html) (`cme_gold_calendar`) | Échéances et calendrier du contrat Gold de référence. | Calendrier produit. | Ne pas substituer automatiquement une date GC à une date MGC: vérifier le contrat exact. |
| [NYSE — horaires et jours fériés](https://www.nyse.com/trade/hours-calendars) (`nyse_hours`) | Séance principale des actions et clôtures anticipées. | Calendrier officiel. | La séance cash 09:30–16:00 ET n’est pas la totalité de la session des futures. |

## Indices

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [S&P Dow Jones Indices — S&P 500](https://www.spglobal.com/spdji/en/indices/equity/sp-500/) (`sp500`) | Indice sous-jacent et ressources méthodologiques MES. | Page officielle du fournisseur d’indice. | Constituants et pondérations doivent être datés et licenciés si nécessaire. |
| [S&P Dow Jones Indices — Dow Jones Industrial Average](https://www.spglobal.com/spdji/en/indices/equity/dow-jones-industrial-average/) (`dow_index`) | Indice sous-jacent MYM, pondéré par les prix. | Page officielle du fournisseur d’indice. | Ne pas le pondérer comme le S&P 500; composition et poids évoluent. |
| [S&P Dow Jones Indices — annonces](https://www.spglobal.com/spdji/en/) (`sp_index_news`) | Changements d’indices, méthodes et annonces de reconstitution. | Annonces officielles. | Distinguer annonce du changement et date d’entrée en vigueur. |

## Formation

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [Chicago Fed — recherche sur le prix de l’or](https://www.chicagofed.org/publications/chicago-fed-letter/2021/464) (`chicagofed_gold`) | Mécanismes conditionnels entre or, taux réels et anticipations. | Recherche institutionnelle publiée. | Relation conditionnelle et historique; pas une règle de direction garantie. |
| [YouTube — CME Group](https://www.youtube.com/user/cmegroup) (`youtube_cme`) | Éducation sur futures et recherche de marché. | Chaîne publique identifiée; vidéos non auditées individuellement. | Pédagogie et opinions ne sont pas des signaux de rentabilité validés. |
| [Federal Reserve — diffusion vidéo officielle](https://www.federalreserve.gov/live-broadcast.htm) (`fed_video`) | Conférences monétaires à la source. | Diffusion vidéo publique. | Utiliser le communiqué écrit pour les chiffres; latence vidéo non garantie. |
| [YouTube — Bloomberg Television](https://www.youtube.com/@markets) (`youtube_bloomberg`) | Interviews et couverture financière audiovisuelle. | Page de chaîne publique identifiée. | Distinguer propos d’un invité, commentaire éditorial et fait confirmé. |
| [YouTube — Reuters](https://www.youtube.com/@Reuters) (`youtube_reuters`) | Couverture vidéo et contexte international. | Page de chaîne publique identifiée. | Une vidéo rediffusée n’est pas une nouvelle annonce; vérifier la date d’enregistrement. |

## News professionnelles

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [LSEG — Reuters News](https://www.lseg.com/en/reuters-news) (`lseg_reuters_news`) | Information Reuters pour les usages professionnels. | Offres et droits commerciaux à négocier. | Un abonnement de lecture ne vaut pas automatiquement droit d’ingestion dans un bot. |
| [LSEG — Machine Readable News](https://www.lseg.com/en/data-analytics/financial-news-service/machine-readable-news) (`lseg_mrn`) | Flux de nouvelles structurées pour applications. | Offre de flux documentée. | Vérifier éditeurs inclus, retards contractuels, archives et droits non-display/IA. |
| [Bloomberg — Event-Driven Feeds](https://professional.bloomberg.com/products/data/enterprise-catalog/event-driven-feeds/) (`bloomberg_feeds`) | Nouvelles et événements structurés pour usages professionnels. | Offre entreprise. | Ne pas confondre flux de news, Bloomberg TV et flux de cotations; droits à négocier. |
| [Dow Jones — Content Feeds and APIs](https://www.dowjones.com/business-intelligence/newswires/products/content-feeds-and-apis/) (`dowjones_feeds`) | Flux et APIs de nouvelles Dow Jones. | Offre officielle de flux/API. | Périmètre temps réel, usages automatisés et variantes IA à valider; documentation détaillée partiellement inaccessible. |
| [Associated Press — valeurs et principes](https://www.ap.org/about/news-values-and-principles/) (`ap_standards`) | Référence éditoriale pour corroboration d’événements généraux. | Lecture des politiques et information éditoriale. | Une dépêche géopolitique confirmée ne fixe pas le sens de réaction d’un marché. |
| [Newsquawk — Enterprise](https://www.newsquawk.com/enterprise) (`newsquawk`) | Veille macro, titres et intégration professionnelle. | Offre entreprise JSON, RSS et widgets documentée. | Confirmer droit d’utilisation algorithmique; abonnement d’écoute et licence API sont distincts. |
| [FinancialJuice — plateforme publique](https://www.financialjuice.com/home) (`financialjuice`) | Veille macro et squawk humain. | Plateforme web; liens RSS et Discord visibles. | Audio public indiqué différé; API officielle réutilisable par Nykuto non confirmée. |
| [Benzinga — documentation API](https://docs.benzinga.com/introduction/welcome) (`benzinga_api`) | Actualités d’entreprises et calendriers. | API et transports documentés selon produit. | Couverture macro et droit d’usage du bot à vérifier; le produit Pro n’implique pas tous les droits API. |
| [EODHD — Financial News API](https://eodhd.com/financial-apis/stock-market-financial-news-api) (`eodhd_news`) | Actualités par instrument ou thème. | API documentée. | Couverture et fraîcheur à tester sur les événements réellement utiles au bot. |
| [Newscatcher — introduction API](https://www.newscatcherapi.com/docs/news-api/get-started/introduction) (`newscatcher`) | Agrégation généraliste et recherche thématique. | API documentée. | Source complémentaire; pas une preuve de faible latence financière ou de droits sur chaque texte intégral. |

## Calendriers aggreges

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [Trading Economics — calendrier API](https://tradingeconomics.com/api/calendar.aspx) (`te_calendar`) | Calendrier normalisé, réalisé, consensus et révisions. | API commerciale documentée. | Consensus d’économistes et prévision propre TE sont deux champs différents. |
| [FXStreet — API documentation](https://docs.fxstreet.com/) (`fxstreet_api`) | Calendrier économique et occurrences d’événements. | API B2B documentée. | Licence, couverture et horodatages de consensus à confirmer. |
| [Forex Factory — calendrier](https://www.forexfactory.com/calendar) (`forexfactory`) | Consultation humaine et contrôle croisé d’un calendrier. | Page publique. | Aucune licence de collecte massive ou API commerciale n’est présumée. |
| [Investing.com — calendrier économique](https://www.investing.com/economic-calendar) (`investing_calendar`) | Consultation humaine des événements et filtres. | Page publique. | Horaires dépendants des réglages; accès web ne vaut pas autorisation de scraping. |

## Communaute

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [Reddit — FuturesTrading](https://www.reddit.com/r/FuturesTrading/) (`reddit_futures`) | Repérer des outils et problèmes d’usage. | Pages et discussions publiques. | Messages et votes ne prouvent ni précision, ni indépendance, ni performances. |
| [Reddit — discussion sur les sources de news](https://www.reddit.com/r/FuturesTrading/comments/1rnrzkv/what_are_your_goto_news_and_analysis_sources/) (`reddit_sources_discussion`) | Retours d’utilisateurs sur FinancialJuice, calendriers et services de news. | Discussion publique consultée. | Témoignages non contrôlés; vérifier toute caractéristique chez l’éditeur. |
| [Bookmap — communauté et formation](https://bookmap.com/learning-center) (`bookmap_community`) | Formation order flow et orientation vers Discord officiel. | Liens publics YouTube et Discord. | Le serveur privé n’a pas été audité; communauté d’un vendeur de plateforme. |
| [Bookmap Brasil — Discord officiel](https://bookmap.com/pt/discord-brasil) (`bookmap_pt`) | Entraide et support en portugais. | Page officielle d’accès à la communauté. | Ne remplace pas les sources macro officielles; collecte/training non autorisés par défaut. |

## Droits securite

| Ressource | Usage | Accès documenté | Limite importante |
|---|---|---|---|
| [Reddit — Data API Terms](https://redditinc.com/policies/data-api-terms) (`reddit_terms`) | Restrictions de l’API, usage commercial et droits sur contenus utilisateurs. | Conditions officielles. | Usages commerciaux et entraînement IA soumis aux accords/autorisations applicables. |
| [Discord — Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy) (`discord_policy`) | Collecte de messages et conditions d’usage par un bot. | Politique officielle. | Scraping interdit; entraînement ML/IA sur contenu API soumis à autorisation expresse de Discord. |
| [YouTube — captions.download](https://developers.google.com/youtube/v3/docs/captions/download) (`youtube_captions`) | Conditions d’accès API aux sous-titres. | Documentation officielle. | Téléchargement API requiert des permissions d’édition; ce n’est pas une API universelle de transcriptions publiques. |
