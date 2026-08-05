(() => {
  const LANGUAGE_STORAGE_KEY = 'nykuto-language';
  const SUPPORTED_LANGUAGES = ['fr', 'en', 'pt', 'es'];
  const LANGUAGE_LABELS = {
    fr: { code: 'FR', name: 'Français' },
    en: { code: 'EN', name: 'English' },
    pt: { code: 'PT', name: 'Português' },
    es: { code: 'ES', name: 'Español' }
  };

  const UI_COPY = {
    fr: {
      trigger: 'Changer de langue',
      panel: 'Choisir la langue',
      current: 'Langue actuelle',
      legalNotice: 'Version juridique officielle',
      legalMessage: 'Le document juridique ci-dessous est publié en français. Le texte français constitue la version de référence.',
      startingAt: (amount) => `à partir de ${amount.toLocaleString('fr-FR')} €`
    },
    en: {
      trigger: 'Change language',
      panel: 'Choose language',
      current: 'Current language',
      legalNotice: 'Official legal version',
      legalMessage: 'The legal document below is published in French. The French text is the authoritative version.',
      startingAt: (amount) => `from €${amount.toLocaleString('en-GB')}`
    },
    pt: {
      trigger: 'Mudar idioma',
      panel: 'Escolher idioma',
      current: 'Idioma atual',
      legalNotice: 'Versão jurídica oficial',
      legalMessage: 'O documento jurídico abaixo é publicado em francês. O texto em francês constitui a versão de referência.',
      startingAt: (amount) => `a partir de ${amount.toLocaleString('pt-BR')} €`
    },
    es: {
      trigger: 'Cambiar idioma',
      panel: 'Elegir idioma',
      current: 'Idioma actual',
      legalNotice: 'Versión jurídica oficial',
      legalMessage: 'El documento jurídico que figura a continuación se publica en francés. El texto francés constituye la versión de referencia.',
      startingAt: (amount) => `desde ${amount.toLocaleString('es-ES')} €`
    }
  };

  // Each row is [French source, English, Portuguese, Spanish].
  // French remains the source of truth in the production HTML files.
  const COPY = [
    ['Aller au contenu', 'Skip to content', 'Ir para o conteúdo', 'Ir al contenido'],
    ['Menu', 'Menu', 'Menu', 'Menú'],
    ['Scénarios', 'Scenarios', 'Cenários', 'Escenarios'],
    ['Méthode', 'Method', 'Método', 'Método'],
    ['À propos', 'About', 'Sobre', 'Acerca de'],
    ['Parler du projet', 'Discuss your project', 'Falar sobre o projeto', 'Hablar del proyecto'],
    ['Contact', 'Contact', 'Contato', 'Contacto'],
    ['Mentions légales', 'Legal notice', 'Aviso legal', 'Aviso legal'],
    ['Confidentialité', 'Privacy', 'Privacidade', 'Privacidad'],
    ['CGV', 'Terms', 'Termos', 'Condiciones'],
    ['Expertises', 'Expertise', 'Especialidades', 'Especialidades'],
    ['Notre méthode', 'Our method', 'Nosso método', 'Nuestro método'],
    ['Informations', 'Information', 'Informações', 'Información'],
    ['Navigation', 'Navigation', 'Navegação', 'Navegación'],
    ['Légal', 'Legal', 'Jurídico', 'Legal'],
    ['Création digitale, organisation administrative et coordination de projets internationaux.', 'Digital creation, administrative organisation and international project coordination.', 'Criação digital, organização administrativa e coordenação de projetos internacionais.', 'Creación digital, organización administrativa y coordinación de proyectos internacionales.'],
    ['Nykuto — Diego Oliveira Santos, entrepreneur individuel.', 'Nykuto — Diego Oliveira Santos, sole proprietor.', 'Nykuto — Diego Oliveira Santos, empresário individual.', 'Nykuto — Diego Oliveira Santos, empresario individual.'],
    ['Nykuto, accueil', 'Nykuto, home', 'Nykuto, início', 'Nykuto, inicio'],
    ['Navigation principale', 'Main navigation', 'Navegação principal', 'Navegación principal'],
    ['Navigation de bas de page', 'Footer navigation', 'Navegação do rodapé', 'Navegación del pie de página'],
    ['Nom :', 'Name:', 'Nome:', 'Nombre:'],
    ['Entreprise :', 'Company:', 'Empresa:', 'Empresa:'],
    ['Email :', 'Email:', 'E-mail:', 'Correo electrónico:'],
    ['Téléphone / WhatsApp :', 'Phone / WhatsApp:', 'Telefone / WhatsApp:', 'Teléfono / WhatsApp:'],
    ['Pays :', 'Country:', 'País:', 'País:'],
    ['Besoin :', 'Requirement:', 'Necessidade:', 'Necesidad:'],
    ['Budget indicatif :', 'Indicative budget:', 'Orçamento estimado:', 'Presupuesto estimado:'],
    ['Échéance :', 'Deadline:', 'Prazo:', 'Plazo:'],
    ['Message :', 'Message:', 'Mensagem:', 'Mensaje:'],
    ['Non précisée', 'Not specified', 'Não informado', 'No indicado'],
    ['Non précisé', 'Not specified', 'Não informado', 'No indicado'],
    ['Projet Nykuto', 'Nykuto project', 'Projeto Nykuto', 'Proyecto Nykuto'],
    ['Votre messagerie va s’ouvrir avec le récapitulatif. Vérifiez-le avant l’envoi.', 'Your email application will open with the summary. Review it before sending.', 'Seu aplicativo de e-mail será aberto com o resumo. Revise-o antes de enviar.', 'Su aplicación de correo se abrirá con el resumen. Revíselo antes de enviarlo.'],

    // Homepage
    ['Nykuto — Digital & Business International', 'Nykuto — Digital & Business International', 'Nykuto — Digital & Business International', 'Nykuto — Digital & Business International'],
    ['Missions France · Europe · Amérique latine', 'Assignments in France · Europe · Latin America', 'Missões na França · Europa · América Latina', 'Misiones en Francia · Europa · América Latina'],
    ['Digital · Organisation · International', 'Digital · Organisation · International', 'Digital · Organização · Internacional', 'Digital · Organización · Internacional'],
    ['Le digital et l’international,', 'Digital and international expertise,', 'Digital e internacional,', 'Digital e internacional,'],
    ['réunis.', 'united.', 'reunidos.', 'unidos.'],
    ['Un interlocuteur unique pour rendre votre activité plus crédible, structurer l’administratif et coordonner vos projets entre plusieurs marchés.', 'One dedicated point of contact to strengthen your credibility, organise administration and coordinate projects across several markets.', 'Um único ponto de contato para reforçar a credibilidade da sua atividade, organizar o administrativo e coordenar projetos entre vários mercados.', 'Un único interlocutor para reforzar la credibilidad de su actividad, organizar la gestión administrativa y coordinar proyectos entre varios mercados.'],
    ['Présenter mon projet', 'Present my project', 'Apresentar meu projeto', 'Presentar mi proyecto'],
    ['Découvrir Nykuto', 'Discover Nykuto', 'Conhecer a Nykuto', 'Conocer Nykuto'],
    ['Digital · Coordination · Français, portugais et espagnol', 'Digital · Coordination · French, Portuguese and Spanish', 'Digital · Coordenação · Francês, português e espanhol', 'Digital · Coordinación · Francés, portugués y español'],
    ['Sécurisé', 'Secure', 'Seguro', 'Seguro'],
    ['Bordeaux · Europe', 'Bordeaux · Europe', 'Bordeaux · Europa', 'Burdeos · Europa'],
    ['Amérique latine', 'Latin America', 'América Latina', 'América Latina'],
    ['Organisation', 'Organisation', 'Organização', 'Organización'],
    ['Aperçu des expertises Nykuto', 'Overview of Nykuto expertise', 'Visão geral das especialidades da Nykuto', 'Resumen de las especialidades de Nykuto'],
    ['Réseau stylisé entre l’Europe et l’Amérique latine', 'Stylised network between Europe and Latin America', 'Rede estilizada entre a Europa e a América Latina', 'Red estilizada entre Europa y América Latina'],
    ['Accéder aux pages principales', 'Open the main pages', 'Acessar as páginas principais', 'Acceder a las páginas principales']
  ];

  COPY.push(
    // Shared brand and footer copy
    [`Digital`, `Digital`, `Digital`, `Digital`],
    [`International`, `International`, `Internacional`, `Internacional`],
    [`Digital & International`, `Digital & International`, `Digital & International`, `Digital & International`],
    [`Digital & Business International`, `Digital & Business International`, `Digital & Business International`, `Digital & Business International`],
    [`Nykuto Digital`, `Nykuto Digital`, `Nykuto Digital`, `Nykuto Digital`],
    [`Business International`, `Business International`, `Business International`, `Business International`],
    [`FAQ`, `FAQ`, `FAQ`, `Preguntas frecuentes`],
    [`Nykuto — Diego Oliveira Santos, EI.`, `Nykuto — Diego Oliveira Santos, sole proprietor.`, `Nykuto — Diego Oliveira Santos, empresário individual.`, `Nykuto — Diego Oliveira Santos, empresario individual.`],
    [`Nykuto — Diego Oliveira Santos, entrepreneur individuel.`, `Nykuto — Diego Oliveira Santos, sole proprietor.`, `Nykuto — Diego Oliveira Santos, empresário individual.`, `Nykuto — Diego Oliveira Santos, empresario individual.`],
    [`SIREN 900 602 566 · Bordeaux, France`, `SIREN 900 602 566 · Bordeaux, France`, `SIREN 900 602 566 · Bordeaux, França`, `SIREN 900 602 566 · Burdeos, Francia`],
    [`Nykuto / Project cockpit`, `Nykuto / Project cockpit`, `Nykuto / Painel de projetos`, `Nykuto / Panel de proyectos`],

    // Digital offer page
    [`Nykuto Digital — Sites vitrines clairs et professionnels`, `Nykuto Digital — Clear, professional business websites`, `Nykuto Digital — Sites institucionais claros e profissionais`, `Nykuto Digital — Sitios web corporativos claros y profesionales`],
    [`Votre activité mérite mieux qu’une page improvisée.`, `Your business deserves more than an improvised web page.`, `Sua atividade merece mais do que uma página improvisada.`, `Su actividad merece algo mejor que una página improvisada.`],
    [`Nous transformons votre offre en un site vitrine rapide, lisible et professionnel, avec un parcours de contact pensé pour vos futurs clients.`, `We turn your offer into a fast, clear and professional business website, with a contact journey designed for prospective clients.`, `Transformamos sua oferta em um site institucional rápido, claro e profissional, com uma jornada de contato pensada para seus futuros clientes.`, `Convertimos su oferta en un sitio web corporativo rápido, claro y profesional, con un recorrido de contacto pensado para sus futuros clientes.`],
    [`Demander un devis`, `Request a quote`, `Solicitar orçamento`, `Solicitar presupuesto`],
    [`Voir les packs`, `View packages`, `Ver pacotes`, `Ver paquetes`],
    [`Responsive`, `Responsive`, `Responsivo`, `Responsive`],
    [`SEO technique de base`, `Core technical SEO`, `SEO técnico básico`, `SEO técnico básico`],
    [`Propriété des contenus`, `Content ownership`, `Propriedade dos conteúdos`, `Propiedad de los contenidos`],
    [`Packs cadrés`, `Clearly scoped packages`, `Pacotes com escopo definido`, `Paquetes con alcance definido`],
    [`Un point de départ clair, sans surprise.`, `A clear starting point, with no surprises.`, `Um ponto de partida claro, sem surpresas.`, `Un punto de partida claro, sin sorpresas.`],
    [`Les prix indiqués correspondent à un périmètre standard. Chaque devis confirme les contenus, délais, corrections et options avant démarrage.`, `The prices shown cover a standard scope. Each quote confirms content, timing, revisions and options before work begins.`, `Os preços indicados correspondem a um escopo padrão. Cada orçamento confirma conteúdos, prazos, revisões e opções antes do início.`, `Los precios indicados corresponden a un alcance estándar. Cada presupuesto confirma contenidos, plazos, revisiones y opciones antes de empezar.`],
    [`Essentiel`, `Essential`, `Essencial`, `Esencial`],
    [`Landing page`, `Landing page`, `Landing page`, `Landing page`],
    [`à partir de`, `from`, `a partir de`, `desde`],
    [`Pour présenter une activité simple et faciliter une prise de contact.`, `For presenting a straightforward business and making contact easy.`, `Para apresentar uma atividade simples e facilitar o contato.`, `Para presentar una actividad sencilla y facilitar el contacto.`],
    [`Une page, jusqu’à 5 sections`, `One page, up to 5 sections`, `Uma página, até 5 seções`, `Una página, hasta 5 secciones`],
    [`Design responsive`, `Responsive design`, `Design responsivo`, `Diseño responsive`],
    [`Services, preuves et contact`, `Services, proof and contact`, `Serviços, provas e contato`, `Servicios, pruebas y contacto`],
    [`Bouton email ou lien externe`, `Email button or external link`, `Botão de e-mail ou link externo`, `Botón de correo o enlace externo`],
    [`Une série de corrections`, `One revision round`, `Uma rodada de revisões`, `Una ronda de revisiones`],
    [`Choisir Essentiel`, `Choose Essential`, `Escolher Essencial`, `Elegir Esencial`],
    [`Le plus choisi`, `Most popular`, `Mais escolhido`, `Más elegido`],
    [`Vitrine Impact`, `Impact Website`, `Site Impacto`, `Web Impacto`],
    [`Pour structurer une image plus complète sur plusieurs pages.`, `For building a fuller brand presence across several pages.`, `Para estruturar uma presença mais completa em várias páginas.`, `Para estructurar una presencia más completa en varias páginas.`],
    [`3 à 5 pages simples`, `3 to 5 streamlined pages`, `3 a 5 páginas simples`, `De 3 a 5 páginas sencillas`],
    [`Direction visuelle cohérente`, `Consistent visual direction`, `Direção visual coerente`, `Dirección visual coherente`],
    [`Pages services, à propos et contact`, `Services, about and contact pages`, `Páginas de serviços, sobre e contato`, `Páginas de servicios, nosotros y contacto`],
    [`Formulaire ou lien de contact`, `Contact form or link`, `Formulário ou link de contato`, `Formulario o enlace de contacto`],
    [`Deux séries de corrections`, `Two revision rounds`, `Duas rodadas de revisões`, `Dos rondas de revisiones`],
    [`Choisir Impact`, `Choose Impact`, `Escolher Impacto`, `Elegir Impacto`],
    [`Sur mesure`, `Bespoke`, `Sob medida`, `A medida`],
    [`Digital Signature`, `Digital Signature`, `Digital Signature`, `Digital Signature`],
    [`Devis`, `Quote`, `Orçamento`, `Presupuesto`],
    [`Pour une vitrine plus ambitieuse ou un besoin de contenu approfondi.`, `For a more ambitious website or in-depth content requirements.`, `Para um site mais ambicioso ou uma necessidade de conteúdo aprofundado.`, `Para un sitio más ambicioso o necesidades de contenido en profundidad.`],
    [`Architecture personnalisée`, `Custom architecture`, `Arquitetura personalizada`, `Arquitectura personalizada`],
    [`Accompagnement éditorial`, `Editorial guidance`, `Acompanhamento editorial`, `Acompañamiento editorial`],
    [`Pages et modules spécifiques`, `Custom pages and modules`, `Páginas e módulos específicos`, `Páginas y módulos específicos`],
    [`Intégrations externes simples`, `Simple third-party integrations`, `Integrações externas simples`, `Integraciones externas sencillas`],
    [`Plan de maintenance possible`, `Optional maintenance plan`, `Plano de manutenção opcional`, `Plan de mantenimiento opcional`],
    [`Décrire le projet`, `Describe the project`, `Descrever o projeto`, `Describir el proyecto`],
    [`Estimation rapide`, `Quick estimate`, `Estimativa rápida`, `Estimación rápida`],
    [`Composez un périmètre indicatif.`, `Build an indicative scope.`, `Monte um escopo indicativo.`, `Configure un alcance indicativo.`],
    [`Cette estimation aide à préparer l’échange. Seul le devis signé engage le prix et les livrables.`, `This estimate helps prepare the discussion. Only a signed quote confirms the price and deliverables.`, `Esta estimativa ajuda a preparar a conversa. Somente o orçamento assinado confirma o preço e os entregáveis.`, `Esta estimación ayuda a preparar la conversación. Solo el presupuesto firmado confirma el precio y los entregables.`],
    [`Passer à une vitrine multi-pages`, `Upgrade to a multi-page website`, `Passar para um site com várias páginas`, `Pasar a un sitio de varias páginas`],
    [`Galerie ou portfolio simple`, `Simple gallery or portfolio`, `Galeria ou portfólio simples`, `Galería o portafolio sencillo`],
    [`Aide à la structuration des textes`, `Help structuring your copy`, `Ajuda na estruturação dos textos`, `Ayuda para estructurar los textos`],
    [`Intégration Calendly, Tally ou équivalent`, `Calendly, Tally or equivalent integration`, `Integração com Calendly, Tally ou equivalente`, `Integración con Calendly, Tally o equivalente`],
    [`Formulaire détaillé`, `Detailed form`, `Formulário detalhado`, `Formulario detallado`],
    [`Estimation :`, `Estimate:`, `Estimativa:`, `Estimación:`],
    [`à partir de 390 €`, `from €390`, `a partir de 390 €`, `desde 390 €`],
    [`Ce que nous construisons`, `What we build`, `O que construímos`, `Lo que construimos`],
    [`Une vitrine utile avant d’être décorative.`, `A business website designed to be useful before decorative.`, `Um site institucional útil antes de ser decorativo.`, `Un sitio corporativo útil antes que decorativo.`],
    [`Chaque bloc doit répondre à une question de votre visiteur et l’aider à décider de vous contacter.`, `Every section should answer a visitor’s question and help them decide to contact you.`, `Cada seção deve responder a uma pergunta do visitante e ajudá-lo a decidir entrar em contato.`, `Cada bloque debe responder a una pregunta del visitante y ayudarle a decidir si contactarle.`],
    [`Positionnement`, `Positioning`, `Posicionamento`, `Posicionamiento`],
    [`Une promesse compréhensible, un public identifié et une hiérarchie de messages.`, `A clear promise, a defined audience and a hierarchy of messages.`, `Uma promessa clara, um público definido e uma hierarquia de mensagens.`, `Una promesa clara, un público definido y una jerarquía de mensajes.`],
    [`Expérience mobile`, `Mobile experience`, `Experiência mobile`, `Experiencia móvil`],
    [`Une lecture fluide, des boutons accessibles et un contact simple sur petit écran.`, `Easy reading, accessible buttons and simple contact on smaller screens.`, `Leitura fluida, botões acessíveis e contato simples em telas pequenas.`, `Lectura fluida, botones accesibles y contacto sencillo en pantallas pequeñas.`],
    [`Fondations techniques`, `Technical foundations`, `Bases técnicas`, `Fundamentos técnicos`],
    [`Pages légères, métadonnées, structure sémantique et indexation de base.`, `Lightweight pages, metadata, semantic structure and baseline indexing.`, `Páginas leves, metadados, estrutura semântica e indexação básica.`, `Páginas ligeras, metadatos, estructura semántica e indexación básica.`],
    [`Transmission`, `Handover`, `Transferência`, `Entrega y traspaso`],
    [`Livraison, explication des outils et cadre clair pour les futures modifications.`, `Delivery, tool walkthrough and a clear framework for future updates.`, `Entrega, explicação das ferramentas e um quadro claro para futuras alterações.`, `Entrega, explicación de las herramientas y un marco claro para futuras modificaciones.`],
    [`Limites explicites`, `Clear boundaries`, `Limites claros`, `Límites claros`],
    [`Une vitrine n’est pas une plateforme métier.`, `A business website is not an operational platform.`, `Um site institucional não é uma plataforma operacional.`, `Un sitio corporativo no es una plataforma operativa.`],
    [`Inclus selon devis :`, `Included as quoted:`, `Incluído conforme orçamento:`, `Incluido según presupuesto:`],
    [`présentation, contenus, responsive, contact, SEO technique de base et intégrations externes simples.`, `presentation, content, responsive design, contact journey, core technical SEO and simple third-party integrations.`, `apresentação, conteúdos, design responsivo, contato, SEO técnico básico e integrações externas simples.`, `presentación, contenidos, diseño responsive, contacto, SEO técnico básico e integraciones externas sencillas.`],
    [`À étudier séparément :`, `Assessed separately:`, `A avaliar separadamente:`, `A estudiar por separado:`],
    [`e-commerce avancé, espace client, réservation sur mesure, back-end complexe, automatisations ou garantie de classement Google.`, `advanced e-commerce, client portals, custom booking, complex back ends, automations or guaranteed Google rankings.`, `e-commerce avançado, área do cliente, reservas sob medida, back-end complexo, automações ou garantia de posicionamento no Google.`, `comercio electrónico avanzado, área de cliente, reservas a medida, back-end complejo, automatizaciones o garantía de posición en Google.`],
    [`Prêt à clarifier votre présence en ligne ?`, `Ready to clarify your online presence?`, `Pronto para tornar sua presença online mais clara?`, `¿Listo para clarificar su presencia en línea?`],
    [`Partez d’un objectif, pas d’un modèle générique.`, `Start with an objective, not a generic template.`, `Comece por um objetivo, não por um modelo genérico.`, `Parta de un objetivo, no de una plantilla genérica.`],
    [`Présentez votre activité, vos priorités et votre échéance. Nous proposerons un périmètre adapté.`, `Tell us about your business, priorities and deadline. We will propose an appropriate scope.`, `Apresente sua atividade, prioridades e prazo. Proporemos um escopo adequado.`, `Presente su actividad, prioridades y plazo. Propondremos un alcance adecuado.`],
    [`Recevoir une orientation`, `Get initial guidance`, `Receber uma orientação`, `Recibir orientación`]
  );

  COPY.push(
    // Digital Signature detail page
    [`Création de site internet sur mesure — Nykuto Digital`, `Bespoke website creation — Nykuto Digital`, `Criação de site sob medida — Nykuto Digital`, `Creación de sitio web a medida — Nykuto Digital`],
    [`Découvrir l’accompagnement →`, `Explore the service →`, `Conhecer o acompanhamento →`, `Descubrir el acompañamiento →`],
    [`Création de sites internet`, `Website creation`, `Criação de sites`, `Creación de sitios web`],
    [`Nykuto Digital · Digital Signature`, `Nykuto Digital · Digital Signature`, `Nykuto Digital · Digital Signature`, `Nykuto Digital · Digital Signature`],
    [`Un site structuré pour être compris, crédible et choisi.`, `A website structured to be understood, trusted and chosen.`, `Um site estruturado para ser compreendido, transmitir credibilidade e ser escolhido.`, `Un sitio estructurado para ser comprendido, transmitir credibilidad y ser elegido.`],
    [`Avant de dessiner des pages, nous clarifions ce que votre marché doit comprendre. Le positionnement, les messages et le parcours deviennent ensuite un site vitrine cohérent, rapide et adapté à votre activité.`, `Before designing pages, we clarify what your market needs to understand. Positioning, messages and the journey then become a coherent, fast business website tailored to your activity.`, `Antes de criar as páginas, esclarecemos o que seu mercado precisa entender. O posicionamento, as mensagens e a jornada se transformam em um site institucional coerente, rápido e adaptado à sua atividade.`, `Antes de diseñar las páginas, aclaramos lo que su mercado debe comprender. El posicionamiento, los mensajes y el recorrido se convierten después en un sitio corporativo coherente, rápido y adaptado a su actividad.`],
    [`Découvrir l’approche`, `Explore the approach`, `Conhecer a abordagem`, `Descubrir el enfoque`],
    [`Cadrage stratégique`, `Strategic scoping`, `Enquadramento estratégico`, `Definición estratégica`],
    [`Design sur mesure`, `Bespoke design`, `Design sob medida`, `Diseño a medida`],
    [`Architecture multilingue`, `Multilingual architecture`, `Arquitetura multilíngue`, `Arquitectura multilingüe`],
    [`Stratégie & positionnement`, `Strategy & positioning`, `Estratégia e posicionamento`, `Estrategia y posicionamiento`],
    [`Avant le design, une position claire.`, `Before design, a clear position.`, `Antes do design, um posicionamento claro.`, `Antes del diseño, un posicionamiento claro.`],
    [`Le site traduit une décision commerciale : à qui vous vous adressez, quelle valeur vous apportez et pourquoi votre proposition mérite l’attention.`, `The website expresses a commercial decision: who you address, what value you provide and why your offer deserves attention.`, `O site traduz uma decisão comercial: com quem você fala, qual valor oferece e por que sua proposta merece atenção.`, `El sitio traduce una decisión comercial: a quién se dirige, qué valor aporta y por qué su propuesta merece atención.`],
    [`Public prioritaire`, `Priority audience`, `Público prioritário`, `Público prioritario`],
    [`Identifier les interlocuteurs que le site doit convaincre en premier.`, `Identify the people the website must convince first.`, `Identificar os interlocutores que o site deve convencer primeiro.`, `Identificar a los interlocutores que el sitio debe convencer primero.`],
    [`Proposition de valeur`, `Value proposition`, `Proposta de valor`, `Propuesta de valor`],
    [`Formuler une promesse compréhensible, précise et cohérente avec vos capacités réelles.`, `Formulate a clear, precise promise that matches your actual capabilities.`, `Formular uma promessa clara, precisa e coerente com suas capacidades reais.`, `Formular una promesa comprensible, precisa y coherente con sus capacidades reales.`],
    [`Architecture de l’offre`, `Offer architecture`, `Arquitetura da oferta`, `Arquitectura de la oferta`],
    [`Organiser les services, niveaux d’accompagnement et informations nécessaires à la décision.`, `Organise the services, engagement levels and information required for a decision.`, `Organizar os serviços, níveis de acompanhamento e informações necessárias à decisão.`, `Organizar los servicios, niveles de acompañamiento e información necesarios para la decisión.`],
    [`Parcours de conversion`, `Conversion journey`, `Jornada de conversão`, `Recorrido de conversión`],
    [`Relier chaque page à une prochaine étape simple : comprendre, comparer puis prendre contact.`, `Connect every page to a simple next step: understand, compare and then make contact.`, `Conectar cada página a uma próxima etapa simples: entender, comparar e depois entrar em contato.`, `Conectar cada página con un siguiente paso sencillo: comprender, comparar y después contactar.`],
    [`Livrable de cadrage`, `Scoping deliverable`, `Entregável de enquadramento`, `Entregable de definición`],
    [`Une base commune avant la création.`, `A shared foundation before creation.`, `Uma base comum antes da criação.`, `Una base común antes de la creación.`],
    [`Selon le périmètre retenu, le cadrage rassemble les décisions utiles dans un document synthétique, validé avant la conception visuelle.`, `Depending on the agreed scope, the scoping phase brings key decisions together in a concise document approved before visual design.`, `Conforme o escopo escolhido, o enquadramento reúne as decisões úteis em um documento sintético, validado antes da criação visual.`, `Según el alcance acordado, la definición reúne las decisiones útiles en un documento conciso, validado antes del diseño visual.`],
    [`Ce document peut réunir`, `This document may include`, `Este documento pode reunir`, `Este documento puede incluir`],
    [`Objectifs commerciaux et publics prioritaires`, `Commercial objectives and priority audiences`, `Objetivos comerciais e públicos prioritários`, `Objetivos comerciales y públicos prioritarios`],
    [`Proposition de valeur et messages essentiels`, `Value proposition and essential messages`, `Proposta de valor e mensagens essenciais`, `Propuesta de valor y mensajes esenciales`],
    [`Hiérarchie des offres et appels à l’action`, `Offer hierarchy and calls to action`, `Hierarquia das ofertas e chamadas para ação`, `Jerarquía de ofertas y llamadas a la acción`],
    [`Arborescence et rôle de chaque page`, `Sitemap and role of each page`, `Mapa do site e função de cada página`, `Mapa del sitio y función de cada página`],
    [`Contenus disponibles, manquants ou à valider`, `Available, missing or pending content`, `Conteúdos disponíveis, ausentes ou a validar`, `Contenidos disponibles, pendientes o por validar`],
    [`Contraintes techniques, langues et calendrier`, `Technical constraints, languages and schedule`, `Restrições técnicas, idiomas e cronograma`, `Restricciones técnicas, idiomas y calendario`],
    [`Conception`, `Design`, `Concepção`, `Diseño`],
    [`La stratégie devient une expérience digitale cohérente.`, `Strategy becomes a coherent digital experience.`, `A estratégia se transforma em uma experiência digital coerente.`, `La estrategia se convierte en una experiencia digital coherente.`],
    [`Chaque choix visuel ou technique sert la compréhension, la crédibilité et la prise de contact.`, `Every visual and technical choice supports understanding, credibility and contact.`, `Cada escolha visual ou técnica favorece a compreensão, a credibilidade e o contato.`, `Cada elección visual o técnica favorece la comprensión, la credibilidad y el contacto.`],
    [`Direction visuelle`, `Visual direction`, `Direção visual`, `Dirección visual`],
    [`Une identité numérique cohérente avec votre activité, votre niveau de gamme et vos publics.`, `A digital identity aligned with your activity, market level and audiences.`, `Uma identidade digital coerente com sua atividade, seu nível de posicionamento e seus públicos.`, `Una identidad digital coherente con su actividad, su nivel de posicionamiento y sus públicos.`],
    [`Architecture des pages`, `Page architecture`, `Arquitetura das páginas`, `Arquitectura de las páginas`],
    [`Une navigation multipage claire, sans transformer l’accueil en un long catalogue.`, `Clear multi-page navigation without turning the homepage into a long catalogue.`, `Uma navegação multipágina clara, sem transformar a página inicial em um catálogo extenso.`, `Una navegación multipágina clara, sin convertir el inicio en un catálogo interminable.`],
    [`Expérience responsive`, `Responsive experience`, `Experiência responsiva`, `Experiencia responsive`],
    [`Des contenus, boutons et parcours contrôlés sur téléphone, tablette et ordinateur.`, `Content, buttons and journeys checked across phones, tablets and computers.`, `Conteúdos, botões e jornadas verificados em celulares, tablets e computadores.`, `Contenidos, botones y recorridos comprobados en teléfonos, tabletas y ordenadores.`],
    [`Fondations de publication`, `Publishing foundations`, `Bases de publicação`, `Fundamentos de publicación`],
    [`Performance, structure sémantique, métadonnées, sécurité de base et mise en ligne.`, `Performance, semantic structure, metadata, baseline security and launch.`, `Desempenho, estrutura semântica, metadados, segurança básica e publicação.`, `Rendimiento, estructura semántica, metadatos, seguridad básica y publicación.`],
    [`Déroulement`, `Process`, `Desenvolvimento`, `Proceso`],
    [`Du cadrage à la transmission.`, `From scoping to handover.`, `Do enquadramento à entrega.`, `De la definición a la entrega.`],
    [`Les étapes et validations sont inscrites dans la proposition afin de maîtriser le périmètre, les responsabilités et les corrections.`, `Stages and approvals are stated in the proposal to control scope, responsibilities and revisions.`, `As etapas e validações são definidas na proposta para controlar o escopo, as responsabilidades e as revisões.`, `Las etapas y validaciones figuran en la propuesta para controlar el alcance, las responsabilidades y las revisiones.`],
    [`Activité, objectifs, publics, contenus, langues, échéance et contraintes.`, `Activity, objectives, audiences, content, languages, deadline and constraints.`, `Atividade, objetivos, públicos, conteúdos, idiomas, prazo e restrições.`, `Actividad, objetivos, públicos, contenidos, idiomas, plazo y restricciones.`],
    [`Proposition de valeur, messages prioritaires et structure des offres.`, `Value proposition, priority messages and offer structure.`, `Proposta de valor, mensagens prioritárias e estrutura das ofertas.`, `Propuesta de valor, mensajes prioritarios y estructura de las ofertas.`],
    [`Architecture`, `Architecture`, `Arquitetura`, `Arquitectura`],
    [`Arborescence, parcours de navigation, rôle des pages et appels à l’action.`, `Sitemap, navigation journey, page roles and calls to action.`, `Mapa do site, jornada de navegação, função das páginas e chamadas para ação.`, `Mapa del sitio, recorrido de navegación, función de las páginas y llamadas a la acción.`],
    [`Design & intégration`, `Design & build`, `Design e integração`, `Diseño e integración`],
    [`Direction visuelle, construction responsive et intégrations externes convenues.`, `Visual direction, responsive build and agreed third-party integrations.`, `Direção visual, construção responsiva e integrações externas acordadas.`, `Dirección visual, construcción responsive e integraciones externas acordadas.`],
    [`Tests & transmission`, `Testing & handover`, `Testes e entrega`, `Pruebas y entrega`],
    [`Contrôles, corrections prévues, mise en ligne et explication des éléments livrés.`, `Checks, agreed revisions, launch and explanation of delivered assets.`, `Verificações, revisões previstas, publicação e explicação dos elementos entregues.`, `Comprobaciones, revisiones previstas, publicación y explicación de los elementos entregados.`],
    [`Un accompagnement sur devis.`, `A quotation-based service.`, `Um acompanhamento sob orçamento.`, `Un acompañamiento con presupuesto.`],
    [`Le prix dépend du nombre de pages, de l’état des contenus, des langues, des intégrations, du calendrier et du niveau d’accompagnement stratégique.`, `Price depends on the number of pages, content readiness, languages, integrations, schedule and level of strategic guidance.`, `O preço depende do número de páginas, do estado dos conteúdos, dos idiomas, das integrações, do cronograma e do nível de acompanhamento estratégico.`, `El precio depende del número de páginas, el estado de los contenidos, los idiomas, las integraciones, el calendario y el nivel de acompañamiento estratégico.`],
    [`Comparer avec les autres packs →`, `Compare with other packages →`, `Comparar com os outros pacotes →`, `Comparar con los demás paquetes →`],
    [`Périmètre possible`, `Potential scope`, `Escopo possível`, `Alcance posible`],
    [`Cadrage stratégique et positionnement digital`, `Strategic scoping and digital positioning`, `Enquadramento estratégico e posicionamento digital`, `Definición estratégica y posicionamiento digital`],
    [`Architecture multipage personnalisée`, `Custom multi-page architecture`, `Arquitetura multipágina personalizada`, `Arquitectura multipágina personalizada`],
    [`Direction visuelle et accompagnement éditorial`, `Visual direction and editorial guidance`, `Direção visual e acompanhamento editorial`, `Dirección visual y acompañamiento editorial`],
    [`Version responsive et parcours de contact`, `Responsive build and contact journey`, `Versão responsiva e jornada de contato`, `Versión responsive y recorrido de contacto`],
    [`Architecture multilingue selon les contenus validés`, `Multilingual architecture based on approved content`, `Arquitetura multilíngue conforme os conteúdos validados`, `Arquitectura multilingüe según los contenidos validados`],
    [`SEO technique de base et intégrations externes simples`, `Core technical SEO and simple third-party integrations`, `SEO técnico básico e integrações externas simples`, `SEO técnico básico e integraciones externas sencillas`],
    [`Transmission et plan de maintenance possible`, `Handover and optional maintenance plan`, `Entrega e plano de manutenção opcional`, `Entrega y plan de mantenimiento opcional`],
    [`Périmètre maîtrisé`, `Controlled scope`, `Escopo controlado`, `Alcance controlado`],
    [`La proposition décrit précisément ce qui sera livré.`, `The proposal states exactly what will be delivered.`, `A proposta descreve exatamente o que será entregue.`, `La propuesta describe exactamente lo que se entregará.`],
    [`Le nombre de pages, les contenus, langues, intégrations, séries de corrections, responsabilités, licences et modalités de maintenance sont confirmés avant le démarrage.`, `The number of pages, content, languages, integrations, revision rounds, responsibilities, licences and maintenance terms are confirmed before work begins.`, `O número de páginas, os conteúdos, idiomas, integrações, rodadas de revisão, responsabilidades, licenças e condições de manutenção são confirmados antes do início.`, `El número de páginas, los contenidos, idiomas, integraciones, rondas de revisión, responsabilidades, licencias y condiciones de mantenimiento se confirman antes de empezar.`],
    [`Les besoins qui dépassent un site vitrine — boutique complexe, espace client, back-end métier ou automatisation avancée — font l’objet d’une étude distincte avant tout engagement.`, `Requirements beyond a business website — complex stores, client portals, operational back ends or advanced automation — require a separate assessment before any commitment.`, `Necessidades que ultrapassam um site institucional — loja complexa, área do cliente, back-end operacional ou automação avançada — exigem uma análise separada antes de qualquer compromisso.`, `Las necesidades que superan un sitio corporativo — tienda compleja, área de cliente, back-end operativo o automatización avanzada — requieren un estudio separado antes de cualquier compromiso.`],
    [`Votre projet mérite un cadre précis`, `Your project deserves a precise framework`, `Seu projeto merece um escopo preciso`, `Su proyecto merece un marco preciso`],
    [`Commençons par ce que votre site doit faire comprendre.`, `Let’s start with what your website must communicate.`, `Vamos começar pelo que seu site precisa comunicar.`, `Empecemos por lo que su sitio debe comunicar.`],
    [`Présentez votre activité, vos publics, les langues souhaitées et l’objectif commercial. Vous recevrez une première orientation sur le périmètre possible.`, `Tell us about your activity, audiences, required languages and commercial objective. You will receive initial guidance on the potential scope.`, `Apresente sua atividade, seus públicos, os idiomas desejados e o objetivo comercial. Você receberá uma primeira orientação sobre o escopo possível.`, `Presente su actividad, sus públicos, los idiomas deseados y el objetivo comercial. Recibirá una primera orientación sobre el alcance posible.`]
  );

  COPY.push(
    // International coordination page
    [`Nykuto Business International — Coordination France & Amérique latine`, `Nykuto Business International — France & Latin America coordination`, `Nykuto Business International — Coordenação entre França e América Latina`, `Nykuto Business International — Coordinación entre Francia y América Latina`],
    [`Un relais pour structurer vos projets au-delà des frontières.`, `A trusted partner to structure projects across borders.`, `Um parceiro para estruturar seus projetos além das fronteiras.`, `Un socio para estructurar sus proyectos más allá de las fronteras.`],
    [`Nykuto aide les entreprises à clarifier leur besoin, organiser les informations et coordonner les bons interlocuteurs entre la France, l’Europe et l’Amérique latine.`, `Nykuto helps businesses clarify their needs, organise information and coordinate the right stakeholders across France, Europe and Latin America.`, `A Nykuto ajuda empresas a esclarecer suas necessidades, organizar informações e coordenar os interlocutores certos entre França, Europa e América Latina.`, `Nykuto ayuda a las empresas a aclarar sus necesidades, organizar la información y coordinar a los interlocutores adecuados entre Francia, Europa y América Latina.`],
    [`Demander un diagnostic`, `Request an assessment`, `Solicitar um diagnóstico`, `Solicitar un diagnóstico`],
    [`Voir les missions`, `View assignments`, `Ver missões`, `Ver misiones`],
    [`France ↔ Brésil`, `France ↔ Brazil`, `França ↔ Brasil`, `Francia ↔ Brasil`],
    [`FR · PT · ES`, `FR · PT · ES`, `FR · PT · ES`, `FR · PT · ES`],
    [`Mission sur devis`, `Assignment by quotation`, `Missão sob orçamento`, `Misión con presupuesto`],
    [`Champs d’intervention`, `Areas of support`, `Áreas de atuação`, `Áreas de intervención`],
    [`De la question opérationnelle au plan coordonné.`, `From an operational question to a coordinated plan.`, `Da questão operacional ao plano coordenado.`, `De la cuestión operativa al plan coordinado.`],
    [`Nous intervenons comme conseil et coordinateur. Le périmètre dépend du pays, du secteur, des montants et des professionnels réglementés à mobiliser.`, `We act as adviser and coordinator. The scope depends on the country, sector, transaction values and regulated professionals involved.`, `Atuamos como consultoria e coordenação. O escopo depende do país, do setor, dos valores e dos profissionais regulamentados a mobilizar.`, `Actuamos como asesores y coordinadores. El alcance depende del país, el sector, los importes y los profesionales regulados que deban intervenir.`],
    [`Diagnostic international`, `International assessment`, `Diagnóstico internacional`, `Diagnóstico internacional`],
    [`Analyse du besoin, cartographie des contraintes, risques, acteurs et prochaines décisions.`, `Needs analysis and mapping of constraints, risks, stakeholders and upcoming decisions.`, `Análise da necessidade e mapeamento de restrições, riscos, atores e próximas decisões.`, `Análisis de necesidades y mapeo de restricciones, riesgos, actores y próximas decisiones.`],
    [`Organisation administrative`, `Administrative organisation`, `Organização administrativa`, `Organización administrativa`],
    [`Collecte structurée des informations, préparation de dossiers et suivi des étapes convenues.`, `Structured information gathering, document preparation and follow-up on agreed steps.`, `Coleta estruturada de informações, preparação de dossiês e acompanhamento das etapas acordadas.`, `Recopilación estructurada de información, preparación de expedientes y seguimiento de las etapas acordadas.`],
    [`Coordination de prestataires`, `Provider coordination`, `Coordenação de prestadores`, `Coordinación de proveedores`],
    [`Interface avec banques, prestataires de paiement, experts-comptables, juristes ou partenaires choisis par le client.`, `Coordination with banks, payment providers, accountants, legal professionals or partners selected by the client.`, `Interface com bancos, prestadores de pagamento, contadores, profissionais jurídicos ou parceiros escolhidos pelo cliente.`, `Coordinación con bancos, proveedores de pago, contables, profesionales jurídicos o socios elegidos por el cliente.`],
    [`Recherche de solutions`, `Solution research`, `Pesquisa de soluções`, `Búsqueda de soluciones`],
    [`Comparaison de solutions disponibles et préparation des questions à adresser aux fournisseurs.`, `Comparison of available solutions and preparation of questions for providers.`, `Comparação das soluções disponíveis e preparação das perguntas a enviar aos fornecedores.`, `Comparación de soluciones disponibles y preparación de preguntas para los proveedores.`],
    [`Formation & transmission`, `Training & handover`, `Formação e transferência`, `Formación y transferencia`],
    [`Sessions à distance ou sur site, documentation et prise en main des processus retenus.`, `Remote or on-site sessions, documentation and onboarding to the selected processes.`, `Sessões remotas ou presenciais, documentação e domínio dos processos escolhidos.`, `Sesiones remotas o presenciales, documentación y puesta en marcha de los procesos seleccionados.`],
    [`Suivi de mission`, `Assignment follow-up`, `Acompanhamento da missão`, `Seguimiento de la misión`],
    [`Tableau d’avancement, comptes rendus et relances selon les responsabilités définies.`, `Progress dashboard, reports and follow-ups based on defined responsibilities.`, `Painel de progresso, relatórios e acompanhamentos conforme as responsabilidades definidas.`, `Panel de progreso, informes y seguimientos según las responsabilidades definidas.`],
    [`Paiements à distance`, `Remote payments`, `Pagamentos à distância`, `Pagos a distancia`],
    [`Une approche conforme, pas une “machine magique”.`, `A compliant approach, not a “magic machine”.`, `Uma abordagem em conformidade, não uma “máquina mágica”.`, `Un enfoque conforme, no una “máquina mágica”.`],
    [`Nykuto peut analyser le besoin d’encaissement, préparer le dossier marchand et coordonner l’échange avec un prestataire de paiement réglementé.`, `Nykuto can assess payment acceptance needs, prepare the merchant application and coordinate discussions with a regulated payment provider.`, `A Nykuto pode analisar a necessidade de recebimento, preparar o dossiê comercial e coordenar a comunicação com um prestador de pagamento regulamentado.`, `Nykuto puede analizar las necesidades de cobro, preparar el expediente comercial y coordinar el intercambio con un proveedor de pago regulado.`],
    [`Ce que la mission peut couvrir`, `What the assignment may cover`, `O que a missão pode abranger`, `Qué puede incluir la misión`],
    [`Cartographier pays, devises, montants et type de clientèle`, `Map countries, currencies, amounts and customer types`, `Mapear países, moedas, valores e tipos de clientes`, `Mapear países, divisas, importes y tipos de clientes`],
    [`Comparer terminal virtuel, lien de paiement, facture ou virement`, `Compare virtual terminals, payment links, invoices and bank transfers`, `Comparar terminal virtual, link de pagamento, fatura ou transferência`, `Comparar terminal virtual, enlace de pago, factura o transferencia`],
    [`Préparer les justificatifs KYC/KYB et le descriptif d’activité`, `Prepare KYC/KYB evidence and the business activity description`, `Preparar os documentos KYC/KYB e a descrição da atividade`, `Preparar la documentación KYC/KYB y la descripción de la actividad`],
    [`Poser les questions sur MOTO, 3-D Secure, réserves et rétrofacturations`, `Address questions about MOTO, 3-D Secure, reserves and chargebacks`, `Tratar questões sobre MOTO, 3-D Secure, reservas e chargebacks`, `Plantear las preguntas sobre MOTO, 3-D Secure, reservas y contracargos`],
    [`Coordonner l’onboarding avec le prestataire retenu`, `Coordinate onboarding with the selected provider`, `Coordenar o onboarding com o prestador escolhido`, `Coordinar el onboarding con el proveedor seleccionado`],
    [`La saisie ou le stockage de données de carte n’est jamais réalisé par Nykuto. L’acceptation et les limites relèvent exclusivement du prestataire de paiement.`, `Nykuto never enters or stores card data. Approval and operating limits are exclusively determined by the payment provider.`, `A Nykuto nunca insere nem armazena dados de cartão. A aprovação e os limites são definidos exclusivamente pelo prestador de pagamento.`, `Nykuto nunca introduce ni almacena datos de tarjeta. La aprobación y los límites dependen exclusivamente del proveedor de pago.`],
    [`Formats d’accompagnement`, `Engagement formats`, `Formatos de acompanhamento`, `Formatos de acompañamiento`],
    [`Une mission calibrée sur le niveau d’incertitude.`, `An assignment calibrated to the level of uncertainty.`, `Uma missão dimensionada conforme o nível de incerteza.`, `Una misión adaptada al nivel de incertidumbre.`],
    [`Les projets internationaux sont chiffrés après un entretien de qualification et, si nécessaire, une phase de diagnostic.`, `International projects are priced after a qualification call and, where necessary, an assessment phase.`, `Projetos internacionais são orçados após uma reunião de qualificação e, quando necessário, uma fase de diagnóstico.`, `Los proyectos internacionales se presupuestan tras una reunión de calificación y, cuando es necesario, una fase de diagnóstico.`],
    [`Étape 1`, `Step 1`, `Etapa 1`, `Etapa 1`],
    [`Diagnostic`, `Assessment`, `Diagnóstico`, `Diagnóstico`],
    [`Sur devis`, `By quotation`, `Sob orçamento`, `Con presupuesto`],
    [`Comprendre le contexte et produire une feuille de route exploitable.`, `Understand the context and produce an actionable roadmap.`, `Compreender o contexto e produzir um roteiro acionável.`, `Comprender el contexto y producir una hoja de ruta accionable.`],
    [`Entretien de cadrage`, `Scoping interview`, `Reunião de enquadramento`, `Reunión de definición`],
    [`Analyse documentaire ciblée`, `Targeted document review`, `Análise documental direcionada`, `Análisis documental específico`],
    [`Risques et dépendances`, `Risks and dependencies`, `Riscos e dependências`, `Riesgos y dependencias`],
    [`Plan d’action priorisé`, `Prioritised action plan`, `Plano de ação priorizado`, `Plan de acción priorizado`],
    [`Mission`, `Assignment`, `Missão`, `Misión`],
    [`Coordination`, `Coordination`, `Coordenação`, `Coordinación`],
    [`Piloter les étapes, les informations et les prestataires retenus.`, `Manage the steps, information and selected providers.`, `Conduzir as etapas, as informações e os prestadores escolhidos.`, `Gestionar las etapas, la información y los proveedores seleccionados.`],
    [`Périmètre et calendrier`, `Scope and schedule`, `Escopo e cronograma`, `Alcance y calendario`],
    [`Interlocuteurs identifiés`, `Named stakeholders`, `Interlocutores identificados`, `Interlocutores identificados`],
    [`Suivi et comptes rendus`, `Follow-up and reporting`, `Acompanhamento e relatórios`, `Seguimiento e informes`],
    [`Transmission finale`, `Final handover`, `Transferência final`, `Entrega final`],
    [`Qualifier la mission`, `Qualify the assignment`, `Qualificar a missão`, `Calificar la misión`],
    [`Terrain`, `On site`, `Presencial`, `Sobre el terreno`],
    [`Déplacement`, `Travel assignment`, `Deslocamento`, `Desplazamiento`],
    [`Intervention sur site lorsqu’elle apporte une valeur réelle au projet.`, `On-site support when it brings genuine value to the project.`, `Atuação presencial quando agrega valor real ao projeto.`, `Intervención presencial cuando aporta un valor real al proyecto.`],
    [`Objectifs écrits`, `Written objectives`, `Objetivos por escrito`, `Objetivos por escrito`],
    [`Temps de préparation`, `Preparation time`, `Tempo de preparação`, `Tiempo de preparación`],
    [`Formation ou coordination`, `Training or coordination`, `Formação ou coordenação`, `Formación o coordinación`],
    [`Frais détaillés au devis`, `Expenses itemised in the quote`, `Despesas detalhadas no orçamento`, `Gastos detallados en el presupuesto`],
    [`Étudier un déplacement`, `Assess an on-site assignment`, `Avaliar um deslocamento`, `Evaluar un desplazamiento`],
    [`Cadre de responsabilité`, `Responsibility framework`, `Quadro de responsabilidades`, `Marco de responsabilidad`],
    [`Nykuto conseille et coordonne. Nykuto n’est pas un établissement financier.`, `Nykuto advises and coordinates. Nykuto is not a financial institution.`, `A Nykuto presta consultoria e coordena. A Nykuto não é uma instituição financeira.`, `Nykuto asesora y coordina. Nykuto no es una entidad financiera.`],
    [`Nykuto ne fournit pas de compte bancaire, n’encaisse pas pour le compte de tiers, ne conserve pas de données de carte et ne garantit pas l’ouverture d’un compte marchand.`, `Nykuto does not provide bank accounts, collect funds on behalf of third parties, retain card data or guarantee approval of a merchant account.`, `A Nykuto não fornece conta bancária, não recebe em nome de terceiros, não armazena dados de cartão e não garante a abertura de uma conta comercial.`, `Nykuto no proporciona cuentas bancarias, no cobra por cuenta de terceros, no conserva datos de tarjeta ni garantiza la apertura de una cuenta comercial.`],
    [`Les décisions d’acceptation, plafonds, réserves, contrôles et conditions contractuelles appartiennent aux prestataires réglementés. Les sujets juridiques, fiscaux et comptables sont transmis aux professionnels compétents.`, `Approval, limits, reserves, checks and contractual terms are determined by regulated providers. Legal, tax and accounting matters are referred to qualified professionals.`, `Decisões de aprovação, limites, reservas, controles e condições contratuais pertencem aos prestadores regulamentados. Questões jurídicas, fiscais e contábeis são encaminhadas aos profissionais competentes.`, `Las decisiones de aprobación, límites, reservas, controles y condiciones contractuales corresponden a los proveedores regulados. Las cuestiones jurídicas, fiscales y contables se remiten a profesionales competentes.`],
    [`Un projet entre plusieurs pays ?`, `A project spanning several countries?`, `Um projeto entre vários países?`, `¿Un proyecto entre varios países?`],
    [`Commençons par qualifier les faits.`, `Let’s start by establishing the facts.`, `Vamos começar qualificando os fatos.`, `Empecemos por precisar los hechos.`],
    [`Pays, activité, volumes, objectif, calendrier et parties prenantes : ces éléments permettent de proposer une voie réaliste.`, `Countries, activity, volumes, objective, timeline and stakeholders: these facts enable us to propose a realistic path.`, `Países, atividade, volumes, objetivo, cronograma e partes envolvidas: esses elementos permitem propor um caminho realista.`, `Países, actividad, volúmenes, objetivo, calendario y partes interesadas: estos elementos permiten proponer una vía realista.`],
    [`Présenter le contexte`, `Present the context`, `Apresentar o contexto`, `Presentar el contexto`]
  );

  COPY.push(
    // Illustrative scenarios
    [`Scénarios de mission — Nykuto`, `Assignment scenarios — Nykuto`, `Cenários de missão — Nykuto`, `Escenarios de misión — Nykuto`],
    [`Scénarios illustratifs`, `Illustrative scenarios`, `Cenários ilustrativos`, `Escenarios ilustrativos`],
    [`Voir le type de résultat avant de parler de promesse.`, `See the type of outcome before discussing promises.`, `Veja o tipo de resultado antes de falar em promessas.`, `Vea el tipo de resultado antes de hablar de promesas.`],
    [`Les exemples ci-dessous sont des scénarios, pas des clients ni des résultats commerciaux revendiqués. Ils montrent comment Nykuto peut structurer différents besoins.`, `The examples below are scenarios, not clients or claimed commercial results. They show how Nykuto can structure different needs.`, `Os exemplos abaixo são cenários, não clientes nem resultados comerciais reivindicados. Eles mostram como a Nykuto pode estruturar diferentes necessidades.`, `Los ejemplos siguientes son escenarios, no clientes ni resultados comerciales atribuidos. Muestran cómo Nykuto puede estructurar distintas necesidades.`],
    [`Livrables`, `Deliverables`, `Entregáveis`, `Entregables`],
    [`Des directions adaptées au métier.`, `Approaches tailored to each business.`, `Direções adaptadas a cada atividade.`, `Enfoques adaptados a cada actividad.`],
    [`La structure change selon la décision attendue du visiteur : appeler, demander un devis, réserver via un outil externe ou comprendre une offre.`, `The structure changes according to the action expected from the visitor: call, request a quote, book through an external tool or understand an offer.`, `A estrutura muda conforme a ação esperada do visitante: ligar, solicitar orçamento, reservar por uma ferramenta externa ou entender uma oferta.`, `La estructura cambia según la acción esperada del visitante: llamar, solicitar presupuesto, reservar mediante una herramienta externa o comprender una oferta.`],
    [`Concept · service local`, `Concept · local service`, `Conceito · serviço local`, `Concepto · servicio local`],
    [`Artisan & dépannage`, `Trades & repairs`, `Serviços técnicos e reparos`, `Oficios y reparaciones`],
    [`Zone d’intervention, services prioritaires, preuves, photos et demande de devis rapide sur mobile.`, `Service area, priority services, proof, photos and a fast mobile quote request.`, `Área de atuação, serviços prioritários, provas, fotos e pedido rápido de orçamento pelo celular.`, `Zona de servicio, servicios prioritarios, pruebas, fotos y solicitud rápida de presupuesto desde el móvil.`],
    [`Local`, `Local`, `Local`, `Local`],
    [`Mobile`, `Mobile`, `Mobile`, `Móvil`],
    [`Concept · conseil`, `Concept · consulting`, `Conceito · consultoria`, `Concepto · consultoría`],
    [`Cabinet indépendant`, `Independent consultancy`, `Consultoria independente`, `Consultoría independiente`],
    [`Expertise, méthode, offres, réponses aux objections et prise de rendez-vous via un outil externe.`, `Expertise, method, offers, objection handling and appointment booking through an external tool.`, `Especialidade, método, ofertas, respostas a objeções e agendamento por ferramenta externa.`, `Experiencia, método, ofertas, respuestas a objeciones y reserva de citas mediante una herramienta externa.`],
    [`Crédibilité`, `Credibility`, `Credibilidade`, `Credibilidad`],
    [`Contenu`, `Content`, `Conteúdo`, `Contenido`],
    [`RDV`, `Booking`, `Agendamento`, `Cita`],
    [`Concept · hospitalité`, `Concept · hospitality`, `Conceito · hospitalidade`, `Concepto · hospitalidad`],
    [`Maison d’hôtes`, `Guest house`, `Pousada`, `Casa de huéspedes`],
    [`Univers visuel, hébergements, informations pratiques, galerie et redirection vers la réservation.`, `Visual identity, accommodation, practical information, gallery and booking redirection.`, `Universo visual, acomodações, informações práticas, galeria e redirecionamento para reservas.`, `Universo visual, alojamientos, información práctica, galería y redirección a reservas.`],
    [`Images`, `Images`, `Imagens`, `Imágenes`],
    [`Confiance`, `Trust`, `Confiança`, `Confianza`],
    [`Réservation`, `Booking`, `Reserva`, `Reserva`],
    [`Concept · marque personnelle`, `Concept · personal brand`, `Conceito · marca pessoal`, `Concepto · marca personal`],
    [`Expert international`, `International expert`, `Especialista internacional`, `Experto internacional`],
    [`Positionnement multilingue, domaines d’intervention, parcours, publications et contact qualifié.`, `Multilingual positioning, areas of expertise, background, publications and qualified contact.`, `Posicionamento multilíngue, áreas de atuação, trajetória, publicações e contato qualificado.`, `Posicionamiento multilingüe, áreas de intervención, trayectoria, publicaciones y contacto cualificado.`],
    [`Autorité`, `Authority`, `Autoridade`, `Autoridad`],
    [`Leads`, `Leads`, `Leads`, `Leads`],
    [`Des scénarios où la coordination fait la différence.`, `Scenarios where coordination makes the difference.`, `Cenários em que a coordenação faz a diferença.`, `Escenarios en los que la coordinación marca la diferencia.`],
    [`Les livrables exacts dépendent toujours de la réglementation, des prestataires impliqués et de la documentation disponible.`, `Exact deliverables always depend on regulations, the providers involved and available documentation.`, `Os entregáveis exatos sempre dependem da regulamentação, dos prestadores envolvidos e da documentação disponível.`, `Los entregables exactos siempre dependen de la normativa, los proveedores implicados y la documentación disponible.`],
    [`Scénario · paiement transfrontalier`, `Scenario · cross-border payments`, `Cenário · pagamentos internacionais`, `Escenario · pagos transfronterizos`],
    [`Préparer un onboarding marchand`, `Prepare merchant onboarding`, `Preparar o onboarding comercial`, `Preparar el onboarding comercial`],
    [`Contexte :`, `Context:`, `Contexto:`, `Contexto:`],
    [`une société veut recevoir des paiements de clients étrangers.`, `a company wants to receive payments from international customers.`, `uma empresa quer receber pagamentos de clientes estrangeiros.`, `una empresa quiere recibir pagos de clientes extranjeros.`],
    [`Intervention possible :`, `Potential support:`, `Intervenção possível:`, `Intervención posible:`],
    [`qualifier flux et devises, comparer les parcours, préparer le dossier KYB et coordonner les échanges avec les PSP sélectionnés.`, `qualify flows and currencies, compare payment journeys, prepare the KYB application and coordinate discussions with selected PSPs.`, `qualificar fluxos e moedas, comparar jornadas, preparar o dossiê KYB e coordenar as trocas com os PSPs selecionados.`, `calificar flujos y divisas, comparar recorridos, preparar el expediente KYB y coordinar los intercambios con los PSP seleccionados.`],
    [`Limite :`, `Boundary:`, `Limite:`, `Límite:`],
    [`le PSP reste seul décisionnaire et Nykuto ne manipule aucune donnée de carte.`, `the PSP remains the sole decision-maker and Nykuto handles no card data.`, `o PSP continua sendo o único decisor e a Nykuto não manipula nenhum dado de cartão.`, `el PSP sigue siendo el único responsable de la decisión y Nykuto no maneja ningún dato de tarjeta.`],
    [`Scénario · France ↔ Brésil`, `Scenario · France ↔ Brazil`, `Cenário · França ↔ Brasil`, `Escenario · Francia ↔ Brasil`],
    [`Organiser une mission sur site`, `Organise an on-site assignment`, `Organizar uma missão presencial`, `Organizar una misión presencial`],
    [`plusieurs interlocuteurs doivent valider un nouveau processus.`, `several stakeholders need to approve a new process.`, `vários interlocutores precisam validar um novo processo.`, `varios interlocutores deben validar un nuevo proceso.`],
    [`agenda, objectifs, documentation bilingue, réunions, compte rendu et plan d’action.`, `agenda, objectives, bilingual documentation, meetings, report and action plan.`, `agenda, objetivos, documentação bilíngue, reuniões, relatório e plano de ação.`, `agenda, objetivos, documentación bilingüe, reuniones, informe y plan de acción.`],
    [`les actes réglementés sont confiés aux professionnels habilités.`, `regulated activities are entrusted to authorised professionals.`, `as atividades regulamentadas são confiadas a profissionais habilitados.`, `las actividades reguladas se confían a profesionales habilitados.`],
    [`Livrables possibles`, `Potential deliverables`, `Entregáveis possíveis`, `Entregables posibles`],
    [`Des éléments que l’entreprise peut réellement utiliser.`, `Practical assets the company can genuinely use.`, `Elementos práticos que a empresa pode realmente utilizar.`, `Elementos prácticos que la empresa puede utilizar realmente.`],
    [`Brief et périmètre de mission`, `Brief and assignment scope`, `Briefing e escopo da missão`, `Brief y alcance de la misión`],
    [`Architecture de site et textes structurés`, `Website architecture and structured copy`, `Arquitetura do site e textos estruturados`, `Arquitectura web y textos estructurados`],
    [`Tableau comparatif de solutions`, `Solution comparison table`, `Tabela comparativa de soluções`, `Tabla comparativa de soluciones`],
    [`Checklist documentaire et plan d’action`, `Document checklist and action plan`, `Checklist documental e plano de ação`, `Lista documental y plan de acción`],
    [`Comptes rendus et matrice de responsabilités`, `Reports and responsibility matrix`, `Relatórios e matriz de responsabilidades`, `Informes y matriz de responsabilidades`],
    [`Guide de prise en main ou de transmission`, `Onboarding or handover guide`, `Guia de uso ou transferência`, `Guía de puesta en marcha o traspaso`],
    [`Votre cas sera différent`, `Your situation will be different`, `Seu caso será diferente`, `Su caso será diferente`],
    [`Décrivons-le sans le faire entrer de force dans une case.`, `Let’s describe it without forcing it into a predefined box.`, `Vamos descrevê-lo sem forçá-lo a caber em uma categoria.`, `Describámoslo sin forzarlo a encajar en una categoría.`],
    [`Un bon périmètre part de vos faits, pas d’un scénario préfabriqué.`, `A sound scope starts with your facts, not a pre-built scenario.`, `Um bom escopo parte dos seus fatos, não de um cenário pronto.`, `Un buen alcance parte de sus hechos, no de un escenario prefabricado.`],
    [`Présenter mon cas`, `Present my situation`, `Apresentar meu caso`, `Presentar mi caso`],

    // Method page
    [`Méthode Nykuto — Cadrer, coordonner, livrer`, `The Nykuto method — Scope, coordinate, deliver`, `Método Nykuto — Definir, coordenar, entregar`, `Método Nykuto — Definir, coordinar, entregar`],
    [`Méthode Nykuto`, `The Nykuto method`, `Método Nykuto`, `Método Nykuto`],
    [`Un projet sérieux commence par un cadre compréhensible.`, `A serious project starts with a clear framework.`, `Um projeto sério começa com um quadro claro.`, `Un proyecto serio comienza con un marco claro.`],
    [`La méthode reste la même, qu’il s’agisse d’un site ou d’une mission internationale : clarifier les faits, répartir les responsabilités et produire des livrables vérifiables.`, `The method remains the same for a website or an international assignment: clarify the facts, allocate responsibilities and produce verifiable deliverables.`, `O método é o mesmo para um site ou uma missão internacional: esclarecer os fatos, distribuir responsabilidades e produzir entregáveis verificáveis.`, `El método es el mismo para un sitio web o una misión internacional: aclarar los hechos, distribuir responsabilidades y producir entregables verificables.`],
    [`Démarrer le cadrage`, `Start scoping`, `Iniciar o enquadramento`, `Iniciar la definición`],
    [`Voir les étapes`, `View the steps`, `Ver as etapas`, `Ver las etapas`],
    [`Du besoin au résultat`, `From need to outcome`, `Da necessidade ao resultado`, `De la necesidad al resultado`],
    [`Cinq étapes, aucune zone grise volontaire.`, `Five steps, with no deliberate grey areas.`, `Cinco etapas, sem zonas cinzentas intencionais.`, `Cinco etapas, sin zonas grises intencionadas.`],
    [`Le format et la durée s’adaptent à la mission. Chaque passage d’étape est confirmé par des informations ou un livrable.`, `The format and timing adapt to the assignment. Each stage transition is supported by information or a deliverable.`, `O formato e a duração se adaptam à missão. Cada mudança de etapa é confirmada por informações ou um entregável.`, `El formato y la duración se adaptan a la misión. Cada cambio de etapa se confirma con información o un entregable.`],
    [`Qualification`, `Qualification`, `Qualificação`, `Calificación`],
    [`Objectif, contexte, budget indicatif, échéance et interlocuteurs. Nous vérifions d’abord si Nykuto est le bon partenaire.`, `Objective, context, indicative budget, deadline and stakeholders. We first check whether Nykuto is the right partner.`, `Objetivo, contexto, orçamento indicativo, prazo e interlocutores. Primeiro verificamos se a Nykuto é o parceiro certo.`, `Objetivo, contexto, presupuesto orientativo, plazo e interlocutores. Primero comprobamos si Nykuto es el socio adecuado.`],
    [`Analyse des éléments utiles, identification des risques, dépendances et questions encore ouvertes.`, `Review of relevant information and identification of risks, dependencies and outstanding questions.`, `Análise dos elementos relevantes e identificação de riscos, dependências e questões em aberto.`, `Análisis de la información pertinente e identificación de riesgos, dependencias y cuestiones pendientes.`],
    [`Proposition`, `Proposal`, `Proposta`, `Propuesta`],
    [`Périmètre, livrables, exclusions, calendrier, prix, modalités de paiement et responsabilités.`, `Scope, deliverables, exclusions, schedule, price, payment terms and responsibilities.`, `Escopo, entregáveis, exclusões, cronograma, preço, condições de pagamento e responsabilidades.`, `Alcance, entregables, exclusiones, calendario, precio, condiciones de pago y responsabilidades.`],
    [`Exécution`, `Delivery`, `Execução`, `Ejecución`],
    [`Production ou coordination avec des points d’avancement et une traçabilité adaptée au projet.`, `Production or coordination with progress checkpoints and project-appropriate traceability.`, `Produção ou coordenação com pontos de acompanhamento e rastreabilidade adequada ao projeto.`, `Producción o coordinación con puntos de seguimiento y trazabilidad adaptada al proyecto.`],
    [`Livraison, explication, documents de sortie et prochaines actions recommandées.`, `Delivery, walkthrough, closing documentation and recommended next actions.`, `Entrega, explicação, documentos finais e próximas ações recomendadas.`, `Entrega, explicación, documentación final y próximas acciones recomendadas.`],
    [`Avant le démarrage`, `Before starting`, `Antes de começar`, `Antes de empezar`],
    [`Les éléments qui accélèrent une mission.`, `The elements that accelerate an assignment.`, `Os elementos que agilizam uma missão.`, `Los elementos que agilizan una misión.`],
    [`Il n’est pas nécessaire d’avoir toutes les réponses. En revanche, les incertitudes doivent être signalées honnêtement.`, `You do not need to have every answer. Uncertainties must, however, be disclosed honestly.`, `Não é necessário ter todas as respostas. No entanto, as incertezas devem ser informadas com honestidade.`, `No es necesario tener todas las respuestas. Sin embargo, las incertidumbres deben comunicarse con honestidad.`],
    [`Un objectif concret`, `A concrete objective`, `Um objetivo concreto`, `Un objetivo concreto`],
    [`Ce qui doit changer à la fin de la mission et pour qui.`, `What must change by the end of the assignment, and for whom.`, `O que deve mudar ao final da missão e para quem.`, `Qué debe cambiar al final de la misión y para quién.`],
    [`Un décideur identifié`, `A named decision-maker`, `Um decisor identificado`, `Un responsable de decisión identificado`],
    [`La personne capable de valider les contenus, budgets et choix.`, `The person authorised to approve content, budgets and choices.`, `A pessoa autorizada a validar conteúdos, orçamentos e escolhas.`, `La persona autorizada para validar contenidos, presupuestos y decisiones.`],
    [`Des documents légitimes`, `Legitimate documentation`, `Documentos legítimos`, `Documentos legítimos`],
    [`Informations d’entreprise et pièces strictement nécessaires, transmises par un canal adapté.`, `Business information and strictly necessary documents, shared through an appropriate channel.`, `Informações da empresa e documentos estritamente necessários, enviados por um canal adequado.`, `Información empresarial y documentos estrictamente necesarios, enviados por un canal adecuado.`],
    [`Des contraintes déclarées`, `Declared constraints`, `Restrições declaradas`, `Restricciones declaradas`],
    [`Pays, réglementation, délais, outils existants et dépendances externes.`, `Countries, regulations, deadlines, existing tools and external dependencies.`, `Países, regulamentação, prazos, ferramentas existentes e dependências externas.`, `Países, normativa, plazos, herramientas existentes y dependencias externas.`],
    [`Gouvernance`, `Governance`, `Governança`, `Gobernanza`],
    [`Qui fait quoi ?`, `Who does what?`, `Quem faz o quê?`, `¿Quién hace qué?`],
    [`Nykuto prend en charge les tâches listées au devis. Le client reste responsable de l’exactitude de ses informations, de ses validations et de la légitimité de son activité.`, `Nykuto handles the tasks listed in the quote. The client remains responsible for the accuracy of their information and approvals, and for the legitimacy of their activity.`, `A Nykuto executa as tarefas listadas no orçamento. O cliente permanece responsável pela exatidão das informações, pelas validações e pela legitimidade de sua atividade.`, `Nykuto asume las tareas indicadas en el presupuesto. El cliente sigue siendo responsable de la exactitud de su información y sus validaciones, así como de la legitimidad de su actividad.`],
    [`Intervenants spécialisés`, `Specialist professionals`, `Profissionais especializados`, `Profesionales especializados`],
    [`Le prestataire de paiement décide de l’ouverture et des règles d’encaissement.`, `The payment provider decides on approval and payment acceptance rules.`, `O prestador de pagamento decide sobre a aprovação e as regras de recebimento.`, `El proveedor de pago decide la aprobación y las normas de cobro.`],
    [`L’avocat sécurise une interprétation ou un contrat juridique.`, `A lawyer safeguards legal interpretation or contracts.`, `O advogado assegura a interpretação ou o contrato jurídico.`, `El abogado asegura la interpretación o el contrato jurídico.`],
    [`L’expert-comptable traite la fiscalité et les écritures.`, `The chartered accountant handles tax and accounting entries.`, `O contador trata da fiscalidade e dos registros contábeis.`, `El asesor contable gestiona la fiscalidad y los asientos contables.`],
    [`Le client choisit et signe directement avec ces professionnels.`, `The client selects and contracts directly with these professionals.`, `O cliente escolhe e contrata diretamente esses profissionais.`, `El cliente elige y contrata directamente a estos profesionales.`],
    [`Première étape`, `First step`, `Primeira etapa`, `Primera etapa`],
    [`Un échange court peut éviter une mauvaise solution.`, `A short conversation can prevent the wrong solution.`, `Uma conversa breve pode evitar uma solução inadequada.`, `Una breve conversación puede evitar una solución inadecuada.`],
    [`Présentez le besoin et les contraintes connues. Vous recevrez une orientation claire sur la suite possible.`, `Share the need and known constraints. You will receive clear guidance on the possible next step.`, `Apresente a necessidade e as restrições conhecidas. Você receberá uma orientação clara sobre a próxima etapa possível.`, `Explique la necesidad y las restricciones conocidas. Recibirá una orientación clara sobre el posible siguiente paso.`],
    [`Préparer l’échange`, `Prepare the discussion`, `Preparar a conversa`, `Preparar la conversación`]
  );

  COPY.push(
    // About page
    [`À propos — Nykuto, Digital & Business International`, `About — Nykuto, Digital & Business International`, `Sobre — Nykuto, Digital & Business International`, `Acerca de — Nykuto, Digital & Business International`],
    [`À propos de Nykuto`, `About Nykuto`, `Sobre a Nykuto`, `Acerca de Nykuto`],
    [`Une entreprise à taille humaine pour des projets qui traversent les silos.`, `A hands-on business for projects that cross traditional boundaries.`, `Uma empresa próxima para projetos que atravessam fronteiras entre áreas.`, `Una empresa cercana para proyectos que atraviesan fronteras entre áreas.`],
    [`Nykuto réunit sens du commerce, organisation administrative, culture digitale et compréhension des échanges entre la France et l’Amérique latine.`, `Nykuto combines commercial insight, administrative organisation, digital expertise and an understanding of business between France and Latin America.`, `A Nykuto reúne visão comercial, organização administrativa, cultura digital e compreensão das relações entre França e América Latina.`, `Nykuto combina visión comercial, organización administrativa, cultura digital y comprensión de los intercambios entre Francia y América Latina.`],
    [`Le fondateur`, `The founder`, `O fundador`, `El fundador`],
    [`Entrepreneur individuel basé à Bordeaux, Diego a une formation en commerce international et développe Nykuto comme un point de coordination entre besoins opérationnels, outils digitaux et contextes interculturels.`, `A sole proprietor based in Bordeaux, Diego is trained in international business and is developing Nykuto as a coordination point between operational needs, digital tools and cross-cultural contexts.`, `Empresário individual baseado em Bordeaux, Diego tem formação em comércio internacional e desenvolve a Nykuto como ponto de coordenação entre necessidades operacionais, ferramentas digitais e contextos interculturais.`, `Empresario individual con sede en Burdeos, Diego tiene formación en comercio internacional y desarrolla Nykuto como punto de coordinación entre necesidades operativas, herramientas digitales y contextos interculturales.`],
    [`Commerce international`, `International business`, `Comércio internacional`, `Comercio internacional`],
    [`France–Amérique latine`, `France–Latin America`, `França–América Latina`, `Francia–América Latina`],
    [`Une posture de coordination`, `A coordination-led approach`, `Uma abordagem de coordenação`, `Un enfoque basado en la coordinación`],
    [`Nykuto ne prétend pas remplacer chaque spécialiste. L’entreprise analyse, structure et coordonne, puis fait intervenir ou recommande les bons professionnels lorsque la mission touche au droit, à la fiscalité, à la banque ou à une autre activité réglementée.`, `Nykuto does not claim to replace every specialist. The business analyses, structures and coordinates, then brings in or recommends the right professionals when an assignment involves law, tax, banking or another regulated activity.`, `A Nykuto não pretende substituir cada especialista. A empresa analisa, estrutura e coordena, e depois envolve ou recomenda os profissionais adequados quando a missão abrange direito, fiscalidade, bancos ou outra atividade regulamentada.`, `Nykuto no pretende sustituir a todos los especialistas. La empresa analiza, estructura y coordina, y después incorpora o recomienda a los profesionales adecuados cuando una misión afecta al derecho, la fiscalidad, la banca u otra actividad regulada.`],
    [`Un interlocuteur directement impliqué`, `A directly involved point of contact`, `Um interlocutor diretamente envolvido`, `Un interlocutor directamente implicado`],
    [`Des décisions expliquées en langage clair`, `Decisions explained in clear language`, `Decisões explicadas em linguagem clara`, `Decisiones explicadas con claridad`],
    [`Une documentation proportionnée au projet`, `Documentation proportionate to the project`, `Documentação proporcional ao projeto`, `Documentación proporcionada al proyecto`],
    [`Des limites annoncées avant la signature`, `Boundaries stated before signing`, `Limites informados antes da assinatura`, `Límites comunicados antes de la firma`],
    [`Principes de travail`, `Working principles`, `Princípios de trabalho`, `Principios de trabajo`],
    [`Le sérieux n’a pas besoin de surpromesse.`, `Professionalism does not require overpromising.`, `Profissionalismo não precisa de promessas exageradas.`, `El profesionalismo no necesita promesas exageradas.`],
    [`La confiance vient de la clarté des rôles, de la qualité d’exécution et de la capacité à dire ce qui reste incertain.`, `Trust comes from clear roles, quality execution and the ability to state what remains uncertain.`, `A confiança vem da clareza dos papéis, da qualidade da execução e da capacidade de dizer o que ainda é incerto.`, `La confianza nace de la claridad de los roles, la calidad de la ejecución y la capacidad de señalar lo que sigue siendo incierto.`],
    [`Clarté`, `Clarity`, `Clareza`, `Claridad`],
    [`Rendre les offres, décisions et responsabilités compréhensibles.`, `Make offers, decisions and responsibilities easy to understand.`, `Tornar ofertas, decisões e responsabilidades fáceis de entender.`, `Hacer comprensibles las ofertas, decisiones y responsabilidades.`],
    [`Discrétion`, `Discretion`, `Discrição`, `Discreción`],
    [`Limiter les informations demandées et respecter leur confidentialité.`, `Request only necessary information and respect its confidentiality.`, `Limitar as informações solicitadas e respeitar sua confidencialidade.`, `Limitar la información solicitada y respetar su confidencialidad.`],
    [`Adaptation`, `Adaptability`, `Adaptação`, `Adaptación`],
    [`Tenir compte du pays, de la langue, du secteur et de la maturité de l’entreprise.`, `Account for the country, language, sector and maturity of the business.`, `Considerar o país, o idioma, o setor e a maturidade da empresa.`, `Tener en cuenta el país, el idioma, el sector y la madurez de la empresa.`],
    [`Traçabilité`, `Traceability`, `Rastreabilidade`, `Trazabilidad`],
    [`Conserver des validations et des livrables utiles sans alourdir inutilement la mission.`, `Keep useful approvals and deliverables without adding unnecessary weight to the assignment.`, `Conservar validações e entregáveis úteis sem tornar a missão desnecessariamente pesada.`, `Conservar validaciones y entregables útiles sin sobrecargar innecesariamente la misión.`],
    [`Identité professionnelle`, `Professional identity`, `Identidade profissional`, `Identidad profesional`],
    [`Une entreprise française identifiable.`, `An identifiable French business.`, `Uma empresa francesa identificável.`, `Una empresa francesa identificable.`],
    [`Nykuto est l’enseigne commerciale de Diego Oliveira Santos, entrepreneur individuel, immatriculé sous le SIREN 900 602 566 et établi à Bordeaux.`, `Nykuto is the trading name of Diego Oliveira Santos, a sole proprietor registered under SIREN 900 602 566 and based in Bordeaux.`, `Nykuto é o nome comercial de Diego Oliveira Santos, empresário individual registrado sob o SIREN 900 602 566 e estabelecido em Bordeaux.`, `Nykuto es el nombre comercial de Diego Oliveira Santos, empresario individual registrado con el SIREN 900 602 566 y establecido en Burdeos.`],
    [`Les informations détaillées d’édition, d’hébergement et de traitement des données sont disponibles dans les`, `Detailed information on publication, hosting and data processing is available in the`, `Informações detalhadas sobre publicação, hospedagem e tratamento de dados estão disponíveis no`, `La información detallada sobre publicación, alojamiento y tratamiento de datos está disponible en el`],
    [`mentions légales`, `legal notice`, `aviso legal`, `aviso legal`],
    [`et la`, `and the`, `e na`, `y la`],
    [`politique de confidentialité`, `privacy policy`, `política de privacidade`, `política de privacidad`],
    [`Travaillons sur du concret`, `Let’s focus on the concrete`, `Vamos trabalhar com fatos concretos`, `Trabajemos sobre hechos concretos`],
    [`Un premier échange pour vérifier l’alignement.`, `An initial discussion to check alignment.`, `Uma primeira conversa para verificar o alinhamento.`, `Una primera conversación para comprobar el encaje.`],
    [`Vous saurez rapidement si votre besoin entre dans le champ de Nykuto et quelle serait la prochaine étape.`, `You will quickly know whether your need falls within Nykuto’s scope and what the next step would be.`, `Você saberá rapidamente se sua necessidade está no escopo da Nykuto e qual seria a próxima etapa.`, `Sabrá rápidamente si su necesidad entra en el ámbito de Nykuto y cuál sería el siguiente paso.`],
    [`Prendre contact`, `Get in touch`, `Entrar em contato`, `Contactar`],

    // Contact page and form
    [`Contact & diagnostic — Nykuto`, `Contact & assessment — Nykuto`, `Contato e diagnóstico — Nykuto`, `Contacto y diagnóstico — Nykuto`],
    [`Contact & qualification`, `Contact & qualification`, `Contato e qualificação`, `Contacto y calificación`],
    [`Décrivez le besoin. Nous clarifions la prochaine étape.`, `Describe the need. We will clarify the next step.`, `Descreva a necessidade. Nós esclarecemos a próxima etapa.`, `Describa la necesidad. Aclararemos el siguiente paso.`],
    [`Ce formulaire prépare un email dans votre propre messagerie. Aucun message ni document n’est stocké sur le site.`, `This form prepares an email in your own email application. No message or document is stored on the website.`, `Este formulário prepara um e-mail no seu próprio aplicativo. Nenhuma mensagem ou documento é armazenado no site.`, `Este formulario prepara un correo en su propia aplicación. Ningún mensaje ni documento se almacena en el sitio.`],
    [`Contact direct`, `Direct contact`, `Contato direto`, `Contacto directo`],
    [`Parlons du contexte réel.`, `Let’s discuss the real context.`, `Vamos falar do contexto real.`, `Hablemos del contexto real.`],
    [`Indiquez l’activité, le pays, l’objectif, l’échéance et ce qui bloque aujourd’hui. Une réponse initiale ne vaut ni acceptation de mission ni conseil juridique ou financier.`, `State the activity, country, objective, deadline and current obstacle. An initial response is neither acceptance of an assignment nor legal or financial advice.`, `Informe a atividade, o país, o objetivo, o prazo e o bloqueio atual. Uma resposta inicial não constitui aceitação da missão nem aconselhamento jurídico ou financeiro.`, `Indique la actividad, el país, el objetivo, el plazo y el obstáculo actual. Una respuesta inicial no constituye aceptación de una misión ni asesoramiento jurídico o financiero.`],
    [`Email`, `Email`, `E-mail`, `Correo electrónico`],
    [`Téléphone`, `Phone`, `Telefone`, `Teléfono`],
    [`Langues`, `Languages`, `Idiomas`, `Idiomas`],
    [`Français · Portugais · Espagnol`, `French · Portuguese · Spanish`, `Francês · Português · Espanhol`, `Francés · Portugués · Español`],
    [`Zone`, `Region`, `Região`, `Zona`],
    [`France · Europe · Amérique latine`, `France · Europe · Latin America`, `França · Europa · América Latina`, `Francia · Europa · América Latina`],
    [`Sécurité`, `Security`, `Segurança`, `Seguridad`],
    [`N’envoyez jamais de numéro de carte, code bancaire, mot de passe, pièce d’identité ou document confidentiel dans ce formulaire.`, `Never enter a card number, banking code, password, identity document or confidential file in this form.`, `Nunca envie número de cartão, código bancário, senha, documento de identidade ou arquivo confidencial neste formulário.`, `Nunca envíe un número de tarjeta, código bancario, contraseña, documento de identidad o archivo confidencial mediante este formulario.`],
    [`Nom et prénom`, `Full name`, `Nome completo`, `Nombre completo`],
    [`Entreprise`, `Company`, `Empresa`, `Empresa`],
    [`Email professionnel`, `Business email`, `E-mail profissional`, `Correo profesional`],
    [`Téléphone / WhatsApp`, `Phone / WhatsApp`, `Telefone / WhatsApp`, `Teléfono / WhatsApp`],
    [`(facultatif)`, `(optional)`, `(opcional)`, `(opcional)`],
    [`Pays concerné`, `Country concerned`, `País envolvido`, `País afectado`],
    [`Type de besoin`, `Type of requirement`, `Tipo de necessidade`, `Tipo de necesidad`],
    [`Sélectionner`, `Select`, `Selecionar`, `Seleccionar`],
    [`Site vitrine`, `Business website`, `Site institucional`, `Sitio web corporativo`],
    [`Projet international`, `International project`, `Projeto internacional`, `Proyecto internacional`],
    [`Solution de paiement / onboarding PSP`, `Payment solution / PSP onboarding`, `Solução de pagamento / onboarding PSP`, `Solución de pago / onboarding PSP`],
    [`Formation ou déplacement`, `Training or on-site assignment`, `Formação ou deslocamento`, `Formación o desplazamiento`],
    [`Autre`, `Other`, `Outro`, `Otro`],
    [`Budget indicatif`, `Indicative budget`, `Orçamento estimado`, `Presupuesto estimado`],
    [`Non défini`, `Not defined`, `Não definido`, `No definido`],
    [`Moins de 1 000 €`, `Under €1,000`, `Menos de 1.000 €`, `Menos de 1.000 €`],
    [`1 000 à 3 000 €`, `€1,000 to €3,000`, `1.000 a 3.000 €`, `De 1.000 a 3.000 €`],
    [`3 000 à 7 500 €`, `€3,000 to €7,500`, `3.000 a 7.500 €`, `De 3.000 a 7.500 €`],
    [`7 500 à 15 000 €`, `€7,500 to €15,000`, `7.500 a 15.000 €`, `De 7.500 a 15.000 €`],
    [`Plus de 15 000 €`, `Over €15,000`, `Mais de 15.000 €`, `Más de 15.000 €`],
    [`Échéance`, `Deadline`, `Prazo`, `Plazo`],
    [`Contexte et résultat attendu`, `Context and expected outcome`, `Contexto e resultado esperado`, `Contexto y resultado esperado`],
    [`En continuant, vous choisissez d’ouvrir votre messagerie avec ces informations. Vous pourrez vérifier et modifier l’email avant de l’envoyer à Nykuto. Consultez notre`, `By continuing, you choose to open your email application with this information. You can review and edit the email before sending it to Nykuto. See our`, `Ao continuar, você opta por abrir seu aplicativo de e-mail com essas informações. Você poderá revisar e editar a mensagem antes de enviá-la à Nykuto. Consulte nossa`, `Al continuar, elige abrir su aplicación de correo con esta información. Podrá revisar y modificar el mensaje antes de enviarlo a Nykuto. Consulte nuestra`],
    [`Préparer mon email`, `Prepare my email`, `Preparar meu e-mail`, `Preparar mi correo`],
    [`Pour une réponse utile`, `For a useful response`, `Para uma resposta útil`, `Para una respuesta útil`],
    [`Trois informations font gagner du temps.`, `Three pieces of information save time.`, `Três informações economizam tempo.`, `Tres datos ahorran tiempo.`],
    [`Il n’est pas nécessaire de transmettre des pièces sensibles au premier échange.`, `There is no need to share sensitive documents in the initial discussion.`, `Não é necessário enviar documentos sensíveis no primeiro contato.`, `No es necesario enviar documentos sensibles en el primer contacto.`],
    [`Le résultat attendu`, `The expected outcome`, `O resultado esperado`, `El resultado esperado`],
    [`Ce que votre entreprise doit pouvoir faire après la mission.`, `What your business should be able to do after the assignment.`, `O que sua empresa deve ser capaz de fazer após a missão.`, `Lo que su empresa debe poder hacer después de la misión.`],
    [`Les pays et acteurs`, `Countries and stakeholders`, `Países e atores`, `Países y actores`],
    [`Où se trouvent l’entreprise, ses clients et ses partenaires.`, `Where the business, its clients and partners are located.`, `Onde estão localizados a empresa, seus clientes e parceiros.`, `Dónde se encuentran la empresa, sus clientes y sus socios.`],
    [`Les contraintes`, `Constraints`, `Restrições`, `Restricciones`],
    [`Budget, délai, outils existants, volumes et validations nécessaires.`, `Budget, timing, existing tools, volumes and required approvals.`, `Orçamento, prazo, ferramentas existentes, volumes e validações necessárias.`, `Presupuesto, plazo, herramientas existentes, volúmenes y validaciones necesarias.`],
    [`L’urgence réelle`, `The real urgency`, `A urgência real`, `La urgencia real`],
    [`Une date, un rendez-vous ou une décision qui conditionne le projet.`, `A date, meeting or decision on which the project depends.`, `Uma data, reunião ou decisão da qual o projeto depende.`, `Una fecha, reunión o decisión de la que depende el proyecto.`],
    [`Votre nom`, `Your name`, `Seu nome`, `Su nombre`],
    [`Nom de l’entreprise`, `Company name`, `Nome da empresa`, `Nombre de la empresa`],
    [`vous@entreprise.com`, `you@company.com`, `voce@empresa.com`, `usted@empresa.com`],
    [`Avec indicatif pays`, `Include country code`, `Com código do país`, `Con prefijo internacional`],
    [`France, Brésil…`, `France, Brazil…`, `França, Brasil…`, `Francia, Brasil…`],
    [`Date ou niveau d’urgence`, `Date or urgency level`, `Data ou nível de urgência`, `Fecha o nivel de urgencia`],
    [`Décrivez l’activité, le besoin, les pays concernés et ce qui doit être obtenu.`, `Describe the activity, requirement, countries involved and desired outcome.`, `Descreva a atividade, a necessidade, os países envolvidos e o resultado desejado.`, `Describa la actividad, la necesidad, los países implicados y el resultado deseado.`]
  );

  COPY.push(
    // Frequently asked questions
    [`Questions fréquentes — Nykuto`, `Frequently asked questions — Nykuto`, `Perguntas frequentes — Nykuto`, `Preguntas frecuentes — Nykuto`],
    [`Questions fréquentes`, `Frequently asked questions`, `Perguntas frequentes`, `Preguntas frecuentes`],
    [`Des réponses directes avant de commencer.`, `Clear answers before you begin.`, `Respostas diretas antes de começar.`, `Respuestas directas antes de empezar.`],
    [`Si votre situation ne correspond pas à une réponse standard, un échange de qualification permettra de préciser le cadre.`, `If your situation does not fit a standard answer, a qualification discussion will help define the framework.`, `Se sua situação não corresponder a uma resposta padrão, uma conversa de qualificação ajudará a definir o quadro.`, `Si su situación no encaja en una respuesta estándar, una conversación de calificación permitirá definir el marco.`],
    [`Collaboration`, `Working together`, `Colaboração`, `Colaboración`],
    [`Sites vitrines`, `Business websites`, `Sites institucionais`, `Sitios web corporativos`],
    [`À qui s’adressent les offres digitales ?`, `Who are the digital offers for?`, `Para quem são as ofertas digitais?`, `¿A quién se dirigen las ofertas digitales?`],
    [`Aux indépendants, TPE, services locaux et petites entreprises qui veulent présenter clairement leur activité et simplifier la prise de contact. Un besoin de plateforme complexe fait l’objet d’une étude séparée ou d’une orientation vers un autre prestataire.`, `They are for independent professionals, small businesses and local services that want to present their activity clearly and make contact easier. Complex platform requirements are assessed separately or referred to another provider.`, `Destinam-se a profissionais independentes, pequenas empresas e serviços locais que desejam apresentar claramente sua atividade e facilitar o contato. Necessidades de plataforma complexa são avaliadas separadamente ou encaminhadas a outro prestador.`, `Se dirigen a profesionales independientes, pequeñas empresas y servicios locales que desean presentar claramente su actividad y facilitar el contacto. Las necesidades de plataforma compleja se estudian por separado o se remiten a otro proveedor.`],
    [`Les prix de 390 € et 690 € sont-ils définitifs ?`, `Are the €390 and €690 prices final?`, `Os preços de 390 € e 690 € são definitivos?`, `¿Son definitivos los precios de 390 € y 690 €?`],
    [`Ce sont des prix de départ pour des périmètres standards. Le devis final dépend du nombre de pages, de l’état des contenus, des intégrations, des délais et des corrections prévues.`, `These are starting prices for standard scopes. The final quote depends on the number of pages, content readiness, integrations, deadlines and planned revisions.`, `São preços iniciais para escopos padrão. O orçamento final depende do número de páginas, do estado dos conteúdos, das integrações, dos prazos e das revisões previstas.`, `Son precios de partida para alcances estándar. El presupuesto final depende del número de páginas, el estado de los contenidos, las integraciones, los plazos y las revisiones previstas.`],
    [`Pouvez-vous garantir une première place sur Google ?`, `Can you guarantee first place on Google?`, `Vocês podem garantir o primeiro lugar no Google?`, `¿Pueden garantizar el primer puesto en Google?`],
    [`Non. Nykuto met en place une structure technique et éditoriale de base, mais aucun prestataire sérieux ne peut garantir un classement précis. Une stratégie SEO continue peut être chiffrée séparément avec les compétences adaptées.`, `No. Nykuto implements core technical and editorial foundations, but no serious provider can guarantee a specific ranking. An ongoing SEO strategy can be quoted separately with the appropriate expertise.`, `Não. A Nykuto implementa bases técnicas e editoriais, mas nenhum prestador sério pode garantir uma posição específica. Uma estratégia contínua de SEO pode ser orçada separadamente com as competências adequadas.`, `No. Nykuto implementa unas bases técnicas y editoriales, pero ningún proveedor serio puede garantizar una posición concreta. Una estrategia SEO continua puede presupuestarse por separado con las competencias adecuadas.`],
    [`Qui possède le site et les contenus ?`, `Who owns the website and content?`, `Quem é o proprietário do site e dos conteúdos?`, `¿Quién es propietario del sitio y los contenidos?`],
    [`Les droits et conditions de cession sont précisés au devis et dans les CGV. Après paiement complet, les éléments créés spécifiquement pour le client sont transmis selon le périmètre convenu, hors outils, licences et composants tiers.`, `Rights and transfer terms are specified in the quote and terms and conditions. After full payment, items created specifically for the client are transferred within the agreed scope, excluding third-party tools, licences and components.`, `Os direitos e as condições de cessão são definidos no orçamento e nos termos. Após o pagamento integral, os elementos criados especificamente para o cliente são transferidos conforme o escopo acordado, exceto ferramentas, licenças e componentes de terceiros.`, `Los derechos y condiciones de cesión se especifican en el presupuesto y las condiciones. Tras el pago completo, los elementos creados específicamente para el cliente se transfieren según el alcance acordado, salvo herramientas, licencias y componentes de terceros.`],
    [`Coordination & paiements`, `Coordination & payments`, `Coordenação e pagamentos`, `Coordinación y pagos`],
    [`Nykuto est-il une banque ou un intermédiaire de paiement ?`, `Is Nykuto a bank or payment intermediary?`, `A Nykuto é um banco ou intermediário de pagamento?`, `¿Es Nykuto un banco o intermediario de pago?`],
    [`Non. Nykuto est une entreprise de conseil, d’organisation administrative et de coordination. L’entreprise ne détient pas de fonds pour des tiers, ne fournit pas de compte marchand et ne manipule pas les données de carte des clients.`, `No. Nykuto provides consulting, administrative organisation and coordination services. The business does not hold funds for third parties, provide merchant accounts or handle customers’ card data.`, `Não. A Nykuto presta serviços de consultoria, organização administrativa e coordenação. A empresa não mantém fundos de terceiros, não fornece conta comercial e não manipula dados de cartão dos clientes.`, `No. Nykuto presta servicios de consultoría, organización administrativa y coordinación. La empresa no mantiene fondos de terceros, no proporciona cuentas comerciales ni maneja datos de tarjeta de los clientes.`],
    [`Pouvez-vous obtenir un terminal virtuel ou MOTO pour mon entreprise ?`, `Can you obtain a virtual terminal or MOTO facility for my business?`, `Vocês podem obter um terminal virtual ou MOTO para minha empresa?`, `¿Pueden obtener un terminal virtual o MOTO para mi empresa?`],
    [`Nykuto peut qualifier le besoin, comparer des parcours, préparer le dossier et coordonner l’échange avec des acquéreurs ou PSP réglementés. Seul le prestataire choisi décide de l’acceptation, des fonctionnalités, des plafonds et des conditions de risque.`, `Nykuto can qualify the need, compare payment journeys, prepare the application and coordinate discussions with regulated acquirers or PSPs. Only the selected provider decides approval, features, limits and risk terms.`, `A Nykuto pode qualificar a necessidade, comparar jornadas, preparar o dossiê e coordenar a comunicação com adquirentes ou PSPs regulamentados. Somente o prestador escolhido decide a aprovação, as funcionalidades, os limites e as condições de risco.`, `Nykuto puede calificar la necesidad, comparar recorridos, preparar el expediente y coordinar los intercambios con adquirentes o PSP regulados. Solo el proveedor elegido decide la aprobación, las funcionalidades, los límites y las condiciones de riesgo.`],
    [`Pourquoi le paiement MOTO est-il plus difficile à obtenir ?`, `Why is MOTO payment acceptance harder to obtain?`, `Por que é mais difícil obter pagamentos MOTO?`, `¿Por qué es más difícil obtener pagos MOTO?`],
    [`Le MOTO correspond à des paiements où la carte n’est pas physiquement présentée et où l’authentification forte peut ne pas s’appliquer comme dans un paiement en ligne classique. Le risque de fraude et de contestation est donc plus élevé, ce qui entraîne une étude renforcée de l’activité et des volumes.`, `MOTO covers payments where the card is not physically presented and strong authentication may not apply as it does in a standard online payment. Fraud and dispute risk is therefore higher, leading to enhanced review of the business and volumes.`, `MOTO abrange pagamentos em que o cartão não é apresentado fisicamente e a autenticação forte pode não se aplicar como em um pagamento online padrão. O risco de fraude e contestação é, portanto, maior, exigindo uma análise reforçada da atividade e dos volumes.`, `MOTO abarca pagos en los que la tarjeta no se presenta físicamente y la autenticación reforzada puede no aplicarse como en un pago online estándar. Por tanto, el riesgo de fraude y disputa es mayor, lo que exige un análisis reforzado de la actividad y los volúmenes.`],
    [`Travaillez-vous entre la France et le Brésil ?`, `Do you work between France and Brazil?`, `Vocês trabalham entre França e Brasil?`, `¿Trabajan entre Francia y Brasil?`],
    [`Oui, lorsque la mission entre dans le champ du conseil et de la coordination. Le périmètre précise les pays, langues, déplacements, prestataires locaux et obligations qui restent à la charge de professionnels habilités.`, `Yes, when the assignment falls within consulting and coordination. The scope specifies countries, languages, travel, local providers and obligations that remain with authorised professionals.`, `Sim, quando a missão está no campo da consultoria e coordenação. O escopo define países, idiomas, deslocamentos, prestadores locais e obrigações que permanecem sob responsabilidade de profissionais habilitados.`, `Sí, cuando la misión entra en el ámbito de la consultoría y coordinación. El alcance especifica países, idiomas, desplazamientos, proveedores locales y obligaciones que siguen a cargo de profesionales habilitados.`],
    [`Pouvez-vous vous déplacer ?`, `Can you travel on site?`, `Vocês podem se deslocar?`, `¿Pueden desplazarse?`],
    [`Oui, si le déplacement est utile et validé au devis. Temps de préparation, transport, hébergement, indemnités et objectifs sur site sont détaillés séparément ou intégrés au prix forfaitaire.`, `Yes, when on-site work is useful and approved in the quote. Preparation time, travel, accommodation, allowances and on-site objectives are itemised separately or included in the fixed fee.`, `Sim, quando o deslocamento é útil e aprovado no orçamento. Tempo de preparação, transporte, hospedagem, despesas e objetivos presenciais são detalhados separadamente ou incluídos no valor fixo.`, `Sí, cuando el desplazamiento es útil y está aprobado en el presupuesto. El tiempo de preparación, transporte, alojamiento, gastos y objetivos presenciales se detallan por separado o se incluyen en el precio fijo.`],
    [`Devis, confidentialité et délais`, `Quotes, confidentiality and timing`, `Orçamentos, confidencialidade e prazos`, `Presupuestos, confidencialidad y plazos`],
    [`Comment est fixé le prix d’une mission internationale ?`, `How is an international assignment priced?`, `Como é definido o preço de uma missão internacional?`, `¿Cómo se fija el precio de una misión internacional?`],
    [`Selon la complexité, le nombre de pays et d’interlocuteurs, le niveau d’analyse, les livrables, le calendrier, les risques et les déplacements. Un diagnostic peut être proposé avant une mission longue.`, `It depends on complexity, the number of countries and stakeholders, depth of analysis, deliverables, schedule, risks and travel. An assessment may be proposed before a longer assignment.`, `Depende da complexidade, do número de países e interlocutores, do nível de análise, dos entregáveis, do cronograma, dos riscos e dos deslocamentos. Um diagnóstico pode ser proposto antes de uma missão mais longa.`, `Depende de la complejidad, el número de países e interlocutores, la profundidad del análisis, los entregables, el calendario, los riesgos y los desplazamientos. Puede proponerse un diagnóstico antes de una misión más larga.`],
    [`Pouvez-vous signer un accord de confidentialité ?`, `Can you sign a confidentiality agreement?`, `Vocês podem assinar um acordo de confidencialidade?`, `¿Pueden firmar un acuerdo de confidencialidad?`],
    [`Oui. Un accord de confidentialité peut être examiné ou proposé lorsque le projet le justifie. Il ne dispense pas chaque partie de respecter la loi ni de vérifier la légitimité des opérations.`, `Yes. A confidentiality agreement can be reviewed or proposed when justified by the project. It does not remove either party’s duty to comply with the law or verify the legitimacy of operations.`, `Sim. Um acordo de confidencialidade pode ser analisado ou proposto quando o projeto justificar. Ele não dispensa nenhuma das partes de cumprir a lei ou verificar a legitimidade das operações.`, `Sí. Puede revisarse o proponerse un acuerdo de confidencialidad cuando el proyecto lo justifique. No exime a ninguna parte de cumplir la ley ni de verificar la legitimidad de las operaciones.`],
    [`Quels documents faut-il envoyer au premier contact ?`, `What documents should be sent at first contact?`, `Quais documentos devem ser enviados no primeiro contato?`, `¿Qué documentos deben enviarse en el primer contacto?`],
    [`Un résumé du besoin suffit. N’envoyez pas de numéro de carte, pièce d’identité, identifiants bancaires ou document confidentiel via le formulaire. Un canal adapté sera défini si des justificatifs deviennent nécessaires.`, `A summary of the need is enough. Do not send card numbers, identity documents, banking credentials or confidential documents through the form. An appropriate channel will be defined if evidence becomes necessary.`, `Um resumo da necessidade é suficiente. Não envie números de cartão, documentos de identidade, credenciais bancárias ou documentos confidenciais pelo formulário. Um canal adequado será definido se forem necessários comprovantes.`, `Basta con un resumen de la necesidad. No envíe números de tarjeta, documentos de identidad, credenciales bancarias ni documentos confidenciales mediante el formulario. Se definirá un canal adecuado si fueran necesarios justificantes.`],
    [`Combien de temps prend une mission ?`, `How long does an assignment take?`, `Quanto tempo leva uma missão?`, `¿Cuánto dura una misión?`],
    [`Un petit site peut prendre quelques semaines selon la disponibilité des contenus. Une mission internationale dépend surtout des contrôles et délais des prestataires externes. Le calendrier indicatif est inscrit dans la proposition.`, `A small website may take a few weeks depending on content availability. An international assignment mainly depends on external provider checks and timelines. The indicative schedule is stated in the proposal.`, `Um site pequeno pode levar algumas semanas, dependendo da disponibilidade dos conteúdos. Uma missão internacional depende principalmente das verificações e prazos dos prestadores externos. O cronograma indicativo é informado na proposta.`, `Un sitio pequeño puede tardar algunas semanas según la disponibilidad de los contenidos. Una misión internacional depende sobre todo de los controles y plazos de proveedores externos. El calendario orientativo figura en la propuesta.`],
    [`Une autre question ?`, `Another question?`, `Outra pergunta?`, `¿Otra pregunta?`],
    [`Expliquez le contexte en quelques lignes.`, `Explain the context in a few lines.`, `Explique o contexto em poucas linhas.`, `Explique el contexto en pocas líneas.`],
    [`Vous recevrez une réponse sur la faisabilité et la prochaine étape utile.`, `You will receive a response on feasibility and the next useful step.`, `Você receberá uma resposta sobre a viabilidade e a próxima etapa útil.`, `Recibirá una respuesta sobre la viabilidad y el siguiente paso útil.`],
    [`Nous contacter`, `Contact us`, `Fale conosco`, `Contactarnos`]
  );

  COPY.push(
    // Legal page introductions. The full legal documents remain in French.
    [`Demander le diagnostic`, `Request the assessment`, `Solicitar o diagnóstico`, `Solicitar el diagnóstico`],
    [`Mentions légales — Nykuto`, `Legal notice — Nykuto`, `Aviso legal — Nykuto`, `Aviso legal — Nykuto`],
    [`Informations légales`, `Legal information`, `Informações legais`, `Información legal`],
    [`Informations relatives à l’édition et à l’exploitation du site nykuto.com.`, `Information about the publication and operation of nykuto.com.`, `Informações sobre a publicação e operação do site nykuto.com.`, `Información sobre la publicación y explotación del sitio nykuto.com.`],
    [`Politique de confidentialité — Nykuto`, `Privacy policy — Nykuto`, `Política de privacidade — Nykuto`, `Política de privacidad — Nykuto`],
    [`Données personnelles`, `Personal data`, `Dados pessoais`, `Datos personales`],
    [`Politique de confidentialité`, `Privacy policy`, `Política de privacidade`, `Política de privacidad`],
    [`Cette page explique quelles données Nykuto peut traiter, pourquoi, pendant combien de temps et comment exercer vos droits.`, `This page explains what data Nykuto may process, why, for how long and how to exercise your rights.`, `Esta página explica quais dados a Nykuto pode tratar, por quê, por quanto tempo e como exercer seus direitos.`, `Esta página explica qué datos puede tratar Nykuto, por qué, durante cuánto tiempo y cómo ejercer sus derechos.`],
    [`Conditions générales de vente B2B — Nykuto`, `B2B terms and conditions — Nykuto`, `Termos e condições B2B — Nykuto`, `Condiciones generales B2B — Nykuto`],
    [`Cadre contractuel`, `Contractual framework`, `Quadro contratual`, `Marco contractual`],
    [`Conditions générales de vente B2B`, `B2B terms and conditions`, `Termos e condições B2B`, `Condiciones generales B2B`],
    [`Ces conditions encadrent les prestations fournies par Nykuto à des clients agissant à des fins professionnelles.`, `These terms govern services supplied by Nykuto to clients acting for business purposes.`, `Estes termos regem os serviços prestados pela Nykuto a clientes que atuam para fins profissionais.`, `Estas condiciones regulan los servicios prestados por Nykuto a clientes que actúan con fines profesionales.`]
  );

  const LEGAL_PAGES = new Set(['mentions-legales.html', 'confidentialite.html', 'cgv.html']);
  const originalTextNodes = new WeakMap();
  const originalAttributes = new WeakMap();
  let currentLanguage = 'fr';

  function normalize(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function createDictionary(language) {
    const languageIndex = SUPPORTED_LANGUAGES.indexOf(language);
    return new Map(COPY.map((row) => [normalize(row[0]), row[languageIndex]]));
  }

  function getCurrentPage() {
    const page = window.location.pathname.split('/').pop();
    return page || 'index.html';
  }

  function translateTextNodes(language) {
    const dictionary = createDictionary(language);
    const legalContent = document.querySelector('.legal-content');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('.language-switcher, script, style, noscript')) return NodeFilter.FILTER_REJECT;
        if (legalContent && legalContent.contains(parent)) return NodeFilter.FILTER_REJECT;
        return normalize(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    let node = walker.nextNode();
    while (node) {
      if (!originalTextNodes.has(node)) {
        const raw = node.nodeValue;
        originalTextNodes.set(node, {
          source: normalize(raw),
          leading: (raw.match(/^\s*/) || [''])[0],
          trailing: (raw.match(/\s*$/) || [''])[0]
        });
      }

      const original = originalTextNodes.get(node);
      const translated = language === 'fr' ? original.source : dictionary.get(original.source);
      node.nodeValue = `${original.leading}${translated || original.source}${original.trailing}`;
      node = walker.nextNode();
    }
  }

  function translateAttributes(language) {
    const dictionary = createDictionary(language);
    const selector = '[aria-label], [alt], [placeholder], [title]';
    document.querySelectorAll(selector).forEach((element) => {
      if (element.closest('.language-switcher')) return;
      if (!originalAttributes.has(element)) originalAttributes.set(element, {});
      const originals = originalAttributes.get(element);

      ['aria-label', 'alt', 'placeholder', 'title'].forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        if (!(attribute in originals)) originals[attribute] = element.getAttribute(attribute);
        const source = originals[attribute];
        element.setAttribute(attribute, language === 'fr' ? source : (dictionary.get(normalize(source)) || source));
      });
    });
  }

  function translateDocumentTitle(language) {
    if (!document.documentElement.dataset.originalTitle) {
      document.documentElement.dataset.originalTitle = document.title;
    }
    const source = document.documentElement.dataset.originalTitle;
    const dictionary = createDictionary(language);
    document.title = language === 'fr' ? source : (dictionary.get(normalize(source)) || source);
  }

  function updateInternalLinks(language) {
    document.querySelectorAll('a[href]').forEach((link) => {
      const initialHref = link.dataset.i18nHref || link.getAttribute('href');
      if (!link.dataset.i18nHref) link.dataset.i18nHref = initialHref;
      if (!initialHref || /^(#|mailto:|tel:|https?:\/\/)/i.test(initialHref)) return;

      const url = new URL(initialHref, window.location.href);
      if (language === 'fr') url.searchParams.delete('lang');
      else url.searchParams.set('lang', language);
      link.setAttribute('href', `${url.pathname.split('/').pop() || 'index.html'}${url.search}${url.hash}`);
    });
  }

  function updateLegalNotice(language) {
    const legalContent = document.querySelector('.legal-content');
    if (!legalContent) return;

    let notice = document.querySelector('.legal-language-notice');
    if (language === 'fr') {
      if (notice) notice.remove();
      return;
    }

    if (!notice) {
      notice = document.createElement('aside');
      notice.className = 'legal-language-notice narrow-shell';
      notice.setAttribute('role', 'note');
      legalContent.before(notice);
    }

    notice.innerHTML = `<strong>${UI_COPY[language].legalNotice}</strong><p>${UI_COPY[language].legalMessage}</p>`;
  }

  function closeLanguageMenu({ restoreFocus = false } = {}) {
    const switcher = document.querySelector('.language-switcher');
    if (!switcher) return;
    const trigger = switcher.querySelector('.language-trigger');
    const panel = switcher.querySelector('.language-menu');
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    switcher.classList.remove('open');
    if (restoreFocus) trigger.focus();
  }

  function updateSwitcher(language) {
    const switcher = document.querySelector('.language-switcher');
    if (!switcher) return;
    const trigger = switcher.querySelector('.language-trigger');
    const code = trigger.querySelector('[data-language-code]');
    code.textContent = LANGUAGE_LABELS[language].code;
    trigger.setAttribute('aria-label', `${UI_COPY[language].trigger}. ${UI_COPY[language].current}: ${LANGUAGE_LABELS[language].name}`);
    switcher.querySelector('.language-menu').setAttribute('aria-label', UI_COPY[language].panel);
    switcher.querySelectorAll('[data-language]').forEach((button) => {
      const isCurrent = button.dataset.language === language;
      button.setAttribute('aria-selected', String(isCurrent));
      button.classList.toggle('active', isCurrent);
    });
  }

  function persistLanguage(language, updateUrl) {
    try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch (_) { /* Storage can be unavailable. */ }
    if (!updateUrl) return;
    const url = new URL(window.location.href);
    if (language === 'fr') url.searchParams.delete('lang');
    else url.searchParams.set('lang', language);
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function applyLanguage(language, { updateUrl = false, announce = true } = {}) {
    const nextLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : 'fr';
    currentLanguage = nextLanguage;
    document.documentElement.lang = nextLanguage;
    document.body.dataset.language = nextLanguage;
    translateTextNodes(nextLanguage);
    translateAttributes(nextLanguage);
    translateDocumentTitle(nextLanguage);
    updateInternalLinks(nextLanguage);
    updateLegalNotice(nextLanguage);
    updateSwitcher(nextLanguage);
    persistLanguage(nextLanguage, updateUrl);
    closeLanguageMenu();
    if (announce) window.dispatchEvent(new CustomEvent('nykuto:languagechange', { detail: { language: nextLanguage } }));
  }

  function injectLanguageSwitcher() {
    const header = document.querySelector('.site-header');
    if (!header || header.querySelector('.language-switcher')) return;

    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.innerHTML = `
      <button class="language-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
        <span class="language-globe" aria-hidden="true">◎</span>
        <span data-language-code>FR</span>
        <span class="language-chevron" aria-hidden="true">⌄</span>
      </button>
      <div class="language-menu" role="listbox" hidden>
        ${SUPPORTED_LANGUAGES.map((language) => `
          <button type="button" role="option" data-language="${language}" aria-selected="false">
            <span class="language-option-code">${LANGUAGE_LABELS[language].code}</span>
            <span>${LANGUAGE_LABELS[language].name}</span>
            <span class="language-check" aria-hidden="true">✓</span>
          </button>
        `).join('')}
      </div>
    `;
    header.prepend(switcher);

    const trigger = switcher.querySelector('.language-trigger');
    const panel = switcher.querySelector('.language-menu');
    trigger.addEventListener('click', () => {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      trigger.setAttribute('aria-expanded', String(willOpen));
      switcher.classList.toggle('open', willOpen);
      if (willOpen) panel.querySelector('[aria-selected="true"]')?.focus();
    });

    switcher.querySelectorAll('[data-language]').forEach((button) => {
      button.addEventListener('click', () => applyLanguage(button.dataset.language, { updateUrl: true }));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const options = [...switcher.querySelectorAll('[data-language]')];
        const currentIndex = options.indexOf(button);
        const nextIndex = event.key === 'Home' ? 0
          : event.key === 'End' ? options.length - 1
            : event.key === 'ArrowDown' ? (currentIndex + 1) % options.length
              : (currentIndex - 1 + options.length) % options.length;
        options[nextIndex].focus();
      });
    });

    document.addEventListener('click', (event) => {
      if (!switcher.contains(event.target)) closeLanguageMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) closeLanguageMenu({ restoreFocus: true });
    });
  }

  function resolveInitialLanguage() {
    const queryLanguage = new URLSearchParams(window.location.search).get('lang');
    if (SUPPORTED_LANGUAGES.includes(queryLanguage)) return queryLanguage;
    try {
      const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (SUPPORTED_LANGUAGES.includes(savedLanguage)) return savedLanguage;
    } catch (_) { /* Storage can be unavailable. */ }
    return 'fr';
  }

  injectLanguageSwitcher();
  applyLanguage(resolveInitialLanguage(), { announce: false });

  window.NykutoI18n = {
    applyLanguage,
    getLanguage: () => currentLanguage,
    t(source, language = currentLanguage) {
      if (language === 'fr') return source;
      return createDictionary(language).get(normalize(source)) || source;
    },
    formatStartingAt(amount, language = currentLanguage) {
      return UI_COPY[language].startingAt(amount);
    }
  };

  if (LEGAL_PAGES.has(getCurrentPage())) updateLegalNotice(currentLanguage);
})();
