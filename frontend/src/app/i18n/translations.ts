import type { Lang } from './i18n.service';

/**
 * EN + DE translations, keyed by the exact French source string. FR needs no
 * entry (it is the key). Keep keys byte-identical to what `tr()` is called with
 * — including `<em>` markup and `&nbsp;` — or the lookup silently falls back to
 * French.
 *
 * ⚠️ Legal copy (mentions légales / politique de confidentialité) is translated
 * for convenience and MUST be reviewed by a professional before going live —
 * the [BRACKET] placeholders are not filled either.
 */
export const TRANSLATIONS: Record<Exclude<Lang, 'fr'>, Record<string, string>> = {
  en: {
    /* ---- nav ---- */
    'La méthode': 'How it works',
    Garanties: 'Guarantees',
    'Décrivez votre projet': 'Describe your project',
    'JUNO — accueil': 'JUNO — home',
    '← Retour au site': '← Back to the site',
    'Retour au site': 'Back to the site',

    /* ---- hero ---- */
    'Agence web · design + développement': 'Web studio · design + development',
    'Vous le décrivez. On vous le dessine. Vous validez — on développe et on met en ligne. Sans prise de tête.':
      'You describe it. We draw it for you. You approve — we build and ship it. No headaches.',
    'Comment ça marche': 'How it works',
    'Maquette en quelques minutes': 'A mockup in minutes',
    'Vous validez avant qu’on code': 'You approve before we code',

    /* ---- hero chat demo ---- */
    'Bonjour, je suis <b>JUNO</b> — votre studio web.':
      'Hi, I’m <b>JUNO</b> — your web studio.',
    'Dites-moi en une phrase ce que vous faites.':
      'Tell me in one sentence what you do.',
    'Je vous prépare une première maquette…':
      'Let me put together a first mockup…',
    'Voilà. On l’affine ensemble et on met en ligne ?':
      'There it is. Shall we refine it together and go live?',
    'Bonjour, je suis <b>JUNO</b>.': 'Hi, I’m <b>JUNO</b>.',
    'Dites-moi ce que vous faites.': 'Tell me what you do.',
    Fleuriste: 'Florist',
    Restaurant: 'Restaurant',
    Artisan: 'Craftsperson',
    'Fleuriste à Lyon — élégant, avec une boutique en ligne.':
      'A florist in Lyon — elegant, with an online shop.',
    'Élégant, chaleureux, une boutique. Je vous dessine ça.':
      'Elegant, warm, a shop. Let me draw that for you.',
    'Vos bouquets, livrés avec soin.': 'Your bouquets, delivered with care.',
    'Un restaurant — je veux la carte et les réservations.':
      'A restaurant — I want the menu and bookings.',
    'Convivial, la carte, les réservations en ligne. C’est parti.':
      'Welcoming, the menu, online bookings. Here we go.',
    'Une table qu’on réserve d’un clic.': 'A table booked in one click.',
    'Menuisier — montrer mes réalisations et un devis.':
      'A carpenter — showcase my work and offer quotes.',
    'Vos réalisations mises en valeur, un devis simple. Je m’en occupe.':
      'Your work showcased, a simple quote. I’m on it.',
    'Vos réalisations, mises en valeur.': 'Your work, beautifully showcased.',
    'Valider et lancer →': 'Approve and launch →',
    'Votre studio web · en ligne': 'Your web studio · online',
    '✓ prête': '✓ ready',
    'génération…': 'generating…',
    'Démonstration JUNO': 'JUNO demo',

    /* ---- marquee ---- */
    Restaurants: 'Restaurants',
    Artisans: 'Craftspeople',
    Boutiques: 'Shops',
    Cabinets: 'Practices',
    Indépendants: 'Freelancers',
    Commerces: 'Businesses',

    /* ---- méthode ---- */
    'Vous décrivez': 'You describe',
    'En quelques phrases, votre activité et ce que vous voulez. Pas de jargon.':
      'In a few sentences: your business and what you want. No jargon.',
    'Juno vous dessine': 'Juno draws it',
    'Un premier rendu sur-mesure, prêt à regarder.':
      'A first tailor-made design, ready to look at.',
    'En quelques minutes': 'In minutes',
    'Vous validez': 'You approve',
    'Vous ajustez, vous commentez. Rien n’est codé tant que ça ne vous plaît pas.':
      'You tweak, you comment. Nothing gets coded until you love it.',
    'On met en ligne': 'We go live',
    'On développe, on héberge, on déploie. Clé en main.':
      'We build, host and deploy. Turnkey.',
    'Quatre étapes. Vous gardez la main <em class="acc">à chaque fois</em>.':
      'Four steps. You stay in control <em class="acc">every step</em>.',

    /* ---- garanties ---- */
    'Vous validez d’abord': 'You approve first',
    'Rien n’est codé tant que la maquette ne vous plaît pas. Vous voyez exactement ce que vous aurez.':
      'Nothing is coded until you love the mockup. You see exactly what you’ll get.',
    'Un prix clair, dès le départ': 'A clear price, from the start',
    'Vous savez ce que vous payez et ce que vous recevez. Pas de coûts cachés en cours de route.':
      'You know what you pay and what you get. No hidden costs along the way.',
    'On s’occupe de tout': 'We handle everything',
    'Design, développement, hébergement, mise en ligne — clé en main.':
      'Design, development, hosting, launch — turnkey.',

    /* ---- cta final ---- */
    'Prêt à commencer ?': 'Ready to start?',
    'Prêt à voir votre site avant même de le commander ?':
      'Ready to see your site before you even order it?',
    '© 2026 JUNO — Agence web': '© 2026 JUNO — Web studio',
    'Mentions légales': 'Legal notice',
    Confidentialité: 'Privacy',

    /* ---- intake · shell / ui ---- */
    'On reprend là où vous en étiez ?': 'Pick up where you left off?',
    'Votre demande a été sauvegardée sur cet appareil.':
      'Your request was saved on this device.',
    Reprendre: 'Resume',
    'Recommencer à zéro': 'Start over',
    précédent: 'back',
    Aperçu: 'Preview',
    'Aperçu — mis à jour': 'Preview — updated',
    'Fermer l’aperçu': 'Close preview',
    '≈ 2 min': '≈ 2 min',
    'Sans engagement': 'No commitment',
    'Réponse sous 24 h': 'Reply within 24 h',
    Suivant: 'Next',
    'Vérifier mes réponses': 'Review my answers',
    OK: 'OK',
    passer: 'skip',
    'appuyez sur': 'press',
    ou: 'or',
    Merci: 'Thanks',
    'cliquez une réponse, ou tapez': 'click an answer, or type',
    Entrée: 'Enter',

    /* ---- intake · sections ---- */
    Vous: 'You',
    'Votre projet': 'Your project',
    'Détails & envoi': 'Details & send',
    'Qui vous êtes, comment vous joindre.': 'Who you are, how to reach you.',
    'Ce que vous voulez, on le dessine au fur et à mesure.':
      'What you want — we draw it as we go.',
    'Les derniers réglages, puis on s’en occupe.':
      'The last details, then we take it from here.',

    /* ---- intake · questions ---- */
    'Pour commencer, vous êtes&nbsp;?': 'To start, who are you?',
    'Votre prénom ou le nom de votre activité.':
      'Your first name or your business name.',
    'Où peut-on vous <em>recontacter</em>&nbsp;?':
      'Where can we <em>reach you</em>?',
    'On revient vers vous sous 24 h ouvrées.':
      'We’ll get back to you within 24 business hours.',
    'Vous travaillez dans quel domaine&nbsp;?': 'What field are you in?',
    'Vous avez déjà un site&nbsp;?': 'Do you already have a website?',
    'Quel type de site vous faut-il&nbsp;?': 'What kind of site do you need?',
    'Quelles pages voulez-vous&nbsp;?': 'Which pages do you want?',
    'Plusieurs choix possibles — au feeling.':
      'Pick as many as you like — go with your gut.',
    'L’ambiance que vous <em>imaginez</em>&nbsp;?':
      'The vibe you <em>have in mind</em>?',
    'Choisissez les mots qui vous parlent.':
      'Choose the words that speak to you.',
    'Quel <em>budget</em> imaginez-vous&nbsp;?':
      'What <em>budget</em> do you have in mind?',
    'Une fourchette suffit — on s’adapte. (optionnel)':
      'A rough range is enough — we adapt. (optional)',
    'Pour <em>quand</em>&nbsp;?': 'For <em>when</em>?',
    'Votre échéance idéale. (optionnel)': 'Your ideal timeline. (optional)',
    'Des références, des couleurs&nbsp;?': 'Any references or colours?',
    'Un site que vous aimez, vos couleurs si vous les avez. (optionnel)':
      'A site you like, your colours if you have them. (optional)',
    'Votre projet en <em>quelques mots</em>&nbsp;?':
      'Your project in <em>a few words</em>?',
    'Ce qui compte pour vous, vos objectifs. (optionnel)':
      'What matters to you, your goals. (optional)',

    /* ---- intake · options ---- */
    Restauration: 'Food & dining',
    'Commerce / boutique': 'Retail / shop',
    'Artisanat / BTP': 'Trades / construction',
    'Santé / bien-être': 'Health / wellness',
    'Services aux entreprises': 'Business services',
    'Beauté / coiffure': 'Beauty / hair',
    Immobilier: 'Real estate',
    Autre: 'Other',
    'Oui, mais il est à refaire': 'Yes, but it needs redoing',
    'Non, aucun pour l’instant': 'No, none yet',
    'Site vitrine': 'Showcase site',
    'Présenter votre activité': 'Present your business',
    'Boutique en ligne': 'Online shop',
    'Vendre vos produits': 'Sell your products',
    'Application web': 'Web app',
    'Un outil sur-mesure': 'A tailor-made tool',
    Accueil: 'Home',
    'À propos': 'About',
    Services: 'Services',
    Catalogue: 'Catalogue',
    Réalisations: 'Portfolio',
    Tarifs: 'Pricing',
    Contact: 'Contact',
    Blog: 'Blog',
    FAQ: 'FAQ',
    'Épuré': 'Clean',
    Chaleureux: 'Warm',
    'Élégant': 'Elegant',
    Audacieux: 'Bold',
    Moderne: 'Modern',
    Artisanal: 'Handcrafted',
    Premium: 'Premium',
    Minimaliste: 'Minimalist',
    'Coloré': 'Colourful',
    Naturel: 'Natural',
    'Moins de 1 000 €': 'Under €1,000',
    '1 000 – 3 000 €': '€1,000 – 3,000',
    '3 000 – 6 000 €': '€3,000 – 6,000',
    'Plus de 6 000 €': 'Over €6,000',
    'À définir ensemble': 'To define together',
    'Dès que possible': 'As soon as possible',
    'Sous 1 mois': 'Within 1 month',
    '1 à 3 mois': '1 to 3 months',
    'Pas de date précise': 'No set date',

    /* ---- intake · placeholders ---- */
    'Téléphone (optionnel)': 'Phone (optional)',
    'Vos informations servent uniquement à vous recontacter — jamais partagées.':
      'Your details are only used to get back to you — never shared.',
    'En savoir plus': 'Learn more',
    '« j’aime bien le site de…, une ambiance comme… »':
      '“I like the site of…, a vibe like…”',
    'Racontez-nous…': 'Tell us…',

    /* ---- intake · recap ---- */
    'Presque fini': 'Almost done',
    '/ récapitulatif': '/ summary',
    'On vérifie <em>ensemble</em>&nbsp;?': 'Let’s check <em>together</em>?',
    'Cliquez une ligne pour la modifier. Tout est encore ajustable.':
      'Click a row to edit it. Everything is still adjustable.',
    Modifier: 'Edit',
    'J’accepte que mes informations soient utilisées pour être recontacté au sujet de mon projet.':
      'I agree that my information may be used to be contacted about my project.',
    'Politique de confidentialité': 'Privacy policy',
    'Envoyer ma demande': 'Send my request',
    Secteur: 'Field',
    'Site actuel': 'Current site',
    'Type de site': 'Site type',
    Pages: 'Pages',
    Ambiance: 'Vibe',
    Budget: 'Budget',
    'Échéance': 'Timeline',
    Message: 'Message',
    Références: 'References',
    'Oui, à refaire': 'Yes, to redo',
    'Aucun pour l’instant': 'None yet',
    couleur: 'colour',
    couleurs: 'colours',

    /* ---- intake · validation errors ---- */
    'Dites-nous juste votre nom': 'Just tell us your name',
    'On a besoin d’un email pour vous répondre':
      'We need an email to reply to you',
    'Cet email a l’air incomplet': 'This email looks incomplete',
    'Choisissez une option': 'Choose an option',
    'Merci d’accepter l’utilisation de vos informations pour continuer.':
      'Please accept the use of your information to continue.',

    /* ---- intake · confirm ---- */
    'Demande envoyée': 'Request sent',
    'On étudie votre projet et on revient sous 24 h ouvrées — et bientôt, avec une première maquette rien que pour vous.':
      'We’re reviewing your project and will get back within 24 business hours — and soon, with a first mockup just for you.',
    'On lit votre brief en détail': 'We read your brief in detail',
    'On vous dessine une première maquette': 'We draw you a first mockup',
    'Vous validez — et on développe': 'You approve — and we build',

    /* ---- intake · live preview ---- */
    'Votre maquette se prépare…': 'Your mockup is on its way…',
    'Juno dessine en direct': 'Juno drawing live',
    Découvrir: 'Discover',
    'Vos couleurs': 'Your colours',
    'Un aperçu indicatif — la vraie maquette, on la dessine à la main après votre brief.':
      'An indicative preview — the real mockup is drawn by hand after your brief.',
    'Votre marque': 'Your brand',

    /* ---- intake · preview sector heroes ---- */
    'Votre boutique, ouverte jour et nuit.':
      'Your shop, open day and night.',
    'Prendre rendez-vous, en toute simplicité.':
      'Book an appointment, effortlessly.',
    'Votre expertise, clairement présentée.':
      'Your expertise, clearly presented.',
    'Réservez votre moment, en ligne.': 'Book your moment, online.',
    'Vos biens, sublimés en vitrine.': 'Your properties, beautifully showcased.',
    'Votre activité, en ligne et soignée.':
      'Your business, online and polished.',
    Présentation: 'Overview',
    Boutique: 'Shop',
    'Espace client': 'Client area',

    /* ---- legal · shared ---- */
    'Informations légales': 'Legal information',
    'Dernière mise à jour :': 'Last updated:',
    '21 août 2026': '21 August 2026',

    /* ---- legal · mentions ---- */
    'Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, voici les informations relatives à l’éditeur et à l’hébergement de ce site.':
      'In accordance with French Act No. 2004-575 of 21 June 2004 on confidence in the digital economy, here is the information about the publisher and hosting of this site.',
    'Éditeur du site': 'Site publisher',
    'Le site JUNO est édité par :': 'The JUNO site is published by:',
    '• Raison sociale : [RAISON SOCIALE]': '• Company name: [COMPANY NAME]',
    '• Forme juridique : [FORME JURIDIQUE] au capital de [CAPITAL] €':
      '• Legal form: [LEGAL FORM] with share capital of €[CAPITAL]',
    '• Siège social : [ADRESSE COMPLÈTE]':
      '• Registered office: [FULL ADDRESS]',
    '• SIREN / RCS : [SIREN] — RCS de [VILLE]':
      '• SIREN / trade register: [SIREN] — register of [CITY]',
    '• N° TVA intracommunautaire : [N° TVA]': '• EU VAT number: [VAT NO.]',
    '• Contact : hello@juno.studio — [TÉLÉPHONE]':
      '• Contact: hello@juno.studio — [PHONE]',
    '• Directeur de la publication : [NOM DU DIRECTEUR DE PUBLICATION]':
      '• Publication director: [PUBLICATION DIRECTOR NAME]',
    Hébergement: 'Hosting',
    'Le site est hébergé par :': 'The site is hosted by:',
    '• [NOM DE L’HÉBERGEUR]': '• [HOST NAME]',
    '• [ADRESSE DE L’HÉBERGEUR]': '• [HOST ADDRESS]',
    '• [SITE / TÉLÉPHONE DE L’HÉBERGEUR]': '• [HOST WEBSITE / PHONE]',
    'Propriété intellectuelle': 'Intellectual property',
    'L’ensemble des contenus de ce site (textes, visuels, logo, code, éléments graphiques) est la propriété exclusive de l’éditeur, sauf mention contraire. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable, est interdite et constitue une contrefaçon.':
      'All content on this site (text, visuals, logo, code, graphic elements) is the exclusive property of the publisher unless otherwise stated. Any reproduction, representation or distribution, in whole or in part, without prior written authorisation is prohibited and constitutes infringement.',
    'Données personnelles': 'Personal data',
    'Les informations transmises via le formulaire de contact sont traitées conformément à notre Politique de confidentialité, que nous vous invitons à consulter.':
      'Information submitted through the contact form is processed in accordance with our Privacy Policy, which we invite you to review.',
    Cookies: 'Cookies',
    'Ce site n’utilise pas de cookies publicitaires ni de traceurs tiers à des fins marketing. Seul un stockage local (localStorage) est utilisé pour vous permettre de reprendre un formulaire commencé ; il reste sur votre appareil et n’est jamais transmis à des tiers.':
      'This site uses no advertising cookies or third-party trackers for marketing. Only local storage (localStorage) is used to let you resume a form you started; it stays on your device and is never shared with third parties.',

    /* ---- legal · confidentialité ---- */
    'Nous accordons une grande importance à la protection de vos données personnelles. Cette politique explique quelles données nous collectons, pourquoi, et quels sont vos droits, conformément au Règlement général sur la protection des données (RGPD).':
      'We take the protection of your personal data seriously. This policy explains what data we collect, why, and what your rights are, in accordance with the General Data Protection Regulation (GDPR).',
    'Responsable du traitement': 'Data controller',
    'Le responsable du traitement des données est [RAISON SOCIALE], [ADRESSE].':
      'The data controller is [COMPANY NAME], [ADDRESS].',
    'Pour toute question relative à vos données : hello@juno.studio.':
      'For any question about your data: hello@juno.studio.',
    'Données collectées': 'Data collected',
    'Via notre formulaire « Décrivez votre projet », nous collectons uniquement les informations que vous nous transmettez :':
      'Through our “Describe your project” form, we collect only the information you provide:',
    '• Votre nom ou le nom de votre activité, votre e-mail, et éventuellement votre téléphone.':
      '• Your name or business name, your email, and optionally your phone number.',
    '• Les éléments décrivant votre projet : secteur, type de site, pages, ambiance, budget, échéance, références et couleurs, message libre.':
      '• The elements describing your project: field, site type, pages, vibe, budget, timeline, references and colours, free-text message.',
    'Aucune donnée sensible n’est demandée. Vous restez libre de ne renseigner que les champs obligatoires.':
      'No sensitive data is requested. You are free to fill in only the required fields.',
    'Finalités et base légale': 'Purposes and legal basis',
    'Vos données sont utilisées pour vous recontacter, étudier votre demande et vous proposer une maquette puis un devis.':
      'Your data is used to get back to you, review your request and offer you a mockup and then a quote.',
    'La base légale est votre consentement (recueilli lors de l’envoi du formulaire) et, le cas échéant, l’exécution de mesures précontractuelles prises à votre demande.':
      'The legal basis is your consent (collected when the form is submitted) and, where applicable, the performance of pre-contractual steps taken at your request.',
    Destinataires: 'Recipients',
    'Vos données sont destinées uniquement à l’équipe de JUNO. Elles ne sont ni vendues, ni louées, ni cédées à des tiers à des fins commerciales. Elles peuvent être traitées par nos prestataires techniques (hébergement) dans la seule mesure nécessaire au fonctionnement du service.':
      'Your data is intended solely for the JUNO team. It is neither sold, rented, nor transferred to third parties for commercial purposes. It may be processed by our technical providers (hosting) only insofar as necessary to run the service.',
    'Durée de conservation': 'Retention period',
    'Vos données sont conservées le temps nécessaire au traitement de votre demande, puis archivées ou supprimées au plus tard [DURÉE — ex. 3 ans] après notre dernier contact, sauf obligation légale contraire.':
      'Your data is kept for as long as needed to process your request, then archived or deleted no later than [PERIOD — e.g. 3 years] after our last contact, unless otherwise legally required.',
    'Vos droits': 'Your rights',
    'Conformément au RGPD, vous disposez des droits suivants sur vos données : accès, rectification, effacement, limitation, opposition et portabilité.':
      'Under the GDPR, you have the following rights over your data: access, rectification, erasure, restriction, objection and portability.',
    'Pour les exercer, écrivez-nous à hello@juno.studio. Nous répondrons dans un délai maximum d’un mois.':
      'To exercise them, write to us at hello@juno.studio. We will respond within one month at most.',
    'Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr) si vous estimez que vos droits ne sont pas respectés.':
      'You may also lodge a complaint with the French CNIL (www.cnil.fr) if you believe your rights are not respected.',
    Sécurité: 'Security',
    'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès, perte ou divulgation non autorisés (connexions chiffrées, accès restreint au back-office).':
      'We implement appropriate technical and organisational measures to protect your data against unauthorised access, loss or disclosure (encrypted connections, restricted back-office access).',
  },

  de: {
    /* ---- nav ---- */
    'La méthode': 'So funktioniert’s',
    Garanties: 'Garantien',
    'Décrivez votre projet': 'Projekt beschreiben',
    'JUNO — accueil': 'JUNO — Startseite',
    '← Retour au site': '← Zurück zur Website',
    'Retour au site': 'Zurück zur Website',

    /* ---- hero ---- */
    'Agence web · design + développement': 'Webstudio · Design + Entwicklung',
    'Vous le décrivez. On vous le dessine. Vous validez — on développe et on met en ligne. Sans prise de tête.':
      'Sie beschreiben es. Wir gestalten es. Sie geben frei — wir entwickeln und stellen online. Ganz ohne Stress.',
    'Comment ça marche': 'So funktioniert’s',
    'Maquette en quelques minutes': 'Entwurf in wenigen Minuten',
    'Vous validez avant qu’on code': 'Sie geben frei, bevor wir coden',

    /* ---- hero chat demo ---- */
    'Bonjour, je suis <b>JUNO</b> — votre studio web.':
      'Hallo, ich bin <b>JUNO</b> — Ihr Webstudio.',
    'Dites-moi en une phrase ce que vous faites.':
      'Sagen Sie mir in einem Satz, was Sie machen.',
    'Je vous prépare une première maquette…':
      'Ich erstelle einen ersten Entwurf…',
    'Voilà. On l’affine ensemble et on met en ligne ?':
      'Fertig. Verfeinern wir ihn gemeinsam und gehen online?',
    'Bonjour, je suis <b>JUNO</b>.': 'Hallo, ich bin <b>JUNO</b>.',
    'Dites-moi ce que vous faites.': 'Sagen Sie mir, was Sie machen.',
    Fleuriste: 'Florist',
    Restaurant: 'Restaurant',
    Artisan: 'Handwerker',
    'Fleuriste à Lyon — élégant, avec une boutique en ligne.':
      'Florist in Lyon — elegant, mit Onlineshop.',
    'Élégant, chaleureux, une boutique. Je vous dessine ça.':
      'Elegant, warm, ein Shop. Ich gestalte das für Sie.',
    'Vos bouquets, livrés avec soin.': 'Ihre Sträuße, sorgfältig geliefert.',
    'Un restaurant — je veux la carte et les réservations.':
      'Ein Restaurant — ich möchte die Karte und Reservierungen.',
    'Convivial, la carte, les réservations en ligne. C’est parti.':
      'Einladend, die Karte, Onlinereservierungen. Los geht’s.',
    'Une table qu’on réserve d’un clic.':
      'Ein Tisch, mit einem Klick reserviert.',
    'Menuisier — montrer mes réalisations et un devis.':
      'Tischler — meine Arbeiten zeigen und Angebote machen.',
    'Vos réalisations mises en valeur, un devis simple. Je m’en occupe.':
      'Ihre Arbeiten im besten Licht, ein einfaches Angebot. Ich kümmere mich.',
    'Vos réalisations, mises en valeur.': 'Ihre Arbeiten, gekonnt in Szene gesetzt.',
    'Valider et lancer →': 'Freigeben und starten →',
    'Votre studio web · en ligne': 'Ihr Webstudio · online',
    '✓ prête': '✓ fertig',
    'génération…': 'wird erstellt…',
    'Démonstration JUNO': 'JUNO-Demo',

    /* ---- marquee ---- */
    Restaurants: 'Restaurants',
    Artisans: 'Handwerker',
    Boutiques: 'Läden',
    Cabinets: 'Kanzleien',
    Indépendants: 'Selbstständige',
    Commerces: 'Geschäfte',

    /* ---- méthode ---- */
    'Vous décrivez': 'Sie beschreiben',
    'En quelques phrases, votre activité et ce que vous voulez. Pas de jargon.':
      'In wenigen Sätzen: Ihr Geschäft und was Sie möchten. Kein Fachjargon.',
    'Juno vous dessine': 'Juno gestaltet',
    'Un premier rendu sur-mesure, prêt à regarder.':
      'Ein erster, maßgeschneiderter Entwurf, bereit zum Ansehen.',
    'En quelques minutes': 'In wenigen Minuten',
    'Vous validez': 'Sie geben frei',
    'Vous ajustez, vous commentez. Rien n’est codé tant que ça ne vous plaît pas.':
      'Sie passen an, Sie kommentieren. Nichts wird gecodet, bis es Ihnen gefällt.',
    'On met en ligne': 'Wir gehen online',
    'On développe, on héberge, on déploie. Clé en main.':
      'Wir entwickeln, hosten und veröffentlichen. Schlüsselfertig.',
    'Quatre étapes. Vous gardez la main <em class="acc">à chaque fois</em>.':
      'Vier Schritte. Sie behalten <em class="acc">jederzeit</em> die Kontrolle.',

    /* ---- garanties ---- */
    'Vous validez d’abord': 'Sie geben zuerst frei',
    'Rien n’est codé tant que la maquette ne vous plaît pas. Vous voyez exactement ce que vous aurez.':
      'Nichts wird gecodet, bis Ihnen der Entwurf gefällt. Sie sehen genau, was Sie bekommen.',
    'Un prix clair, dès le départ': 'Ein klarer Preis, von Anfang an',
    'Vous savez ce que vous payez et ce que vous recevez. Pas de coûts cachés en cours de route.':
      'Sie wissen, was Sie zahlen und was Sie erhalten. Keine versteckten Kosten unterwegs.',
    'On s’occupe de tout': 'Wir kümmern uns um alles',
    'Design, développement, hébergement, mise en ligne — clé en main.':
      'Design, Entwicklung, Hosting, Veröffentlichung — schlüsselfertig.',

    /* ---- cta final ---- */
    'Prêt à commencer ?': 'Bereit loszulegen?',
    'Prêt à voir votre site avant même de le commander ?':
      'Bereit, Ihre Website zu sehen, bevor Sie sie überhaupt bestellen?',
    '© 2026 JUNO — Agence web': '© 2026 JUNO — Webstudio',
    'Mentions légales': 'Impressum',
    Confidentialité: 'Datenschutz',

    /* ---- intake · shell / ui ---- */
    'On reprend là où vous en étiez ?': 'Dort weitermachen, wo Sie aufgehört haben?',
    'Votre demande a été sauvegardée sur cet appareil.':
      'Ihre Anfrage wurde auf diesem Gerät gespeichert.',
    Reprendre: 'Fortsetzen',
    'Recommencer à zéro': 'Neu beginnen',
    précédent: 'zurück',
    Aperçu: 'Vorschau',
    'Aperçu — mis à jour': 'Vorschau — aktualisiert',
    'Fermer l’aperçu': 'Vorschau schließen',
    '≈ 2 min': '≈ 2 Min.',
    'Sans engagement': 'Unverbindlich',
    'Réponse sous 24 h': 'Antwort binnen 24 Std.',
    Suivant: 'Weiter',
    'Vérifier mes réponses': 'Antworten prüfen',
    OK: 'OK',
    passer: 'überspringen',
    'appuyez sur': 'drücken Sie',
    ou: 'oder',
    Merci: 'Danke',
    'cliquez une réponse, ou tapez': 'Antwort anklicken oder tippen',
    Entrée: 'Enter',

    /* ---- intake · sections ---- */
    Vous: 'Sie',
    'Votre projet': 'Ihr Projekt',
    'Détails & envoi': 'Details & Senden',
    'Qui vous êtes, comment vous joindre.': 'Wer Sie sind, wie man Sie erreicht.',
    'Ce que vous voulez, on le dessine au fur et à mesure.':
      'Was Sie möchten — wir gestalten es Schritt für Schritt.',
    'Les derniers réglages, puis on s’en occupe.':
      'Die letzten Details, dann übernehmen wir.',

    /* ---- intake · questions ---- */
    'Pour commencer, vous êtes&nbsp;?': 'Zum Anfang: Wer sind Sie?',
    'Votre prénom ou le nom de votre activité.':
      'Ihr Vorname oder der Name Ihres Unternehmens.',
    'Où peut-on vous <em>recontacter</em>&nbsp;?':
      'Wo können wir Sie <em>erreichen</em>?',
    'On revient vers vous sous 24 h ouvrées.':
      'Wir melden uns innerhalb von 24 Werkstunden.',
    'Vous travaillez dans quel domaine&nbsp;?': 'In welcher Branche sind Sie tätig?',
    'Vous avez déjà un site&nbsp;?': 'Haben Sie bereits eine Website?',
    'Quel type de site vous faut-il&nbsp;?': 'Welche Art Website brauchen Sie?',
    'Quelles pages voulez-vous&nbsp;?': 'Welche Seiten möchten Sie?',
    'Plusieurs choix possibles — au feeling.':
      'Mehrfachauswahl möglich — nach Gefühl.',
    'L’ambiance que vous <em>imaginez</em>&nbsp;?':
      'Die Stimmung, die Ihnen <em>vorschwebt</em>?',
    'Choisissez les mots qui vous parlent.':
      'Wählen Sie die Wörter, die Sie ansprechen.',
    'Quel <em>budget</em> imaginez-vous&nbsp;?':
      'Welches <em>Budget</em> schwebt Ihnen vor?',
    'Une fourchette suffit — on s’adapte. (optionnel)':
      'Eine Spanne genügt — wir passen uns an. (optional)',
    'Pour <em>quand</em>&nbsp;?': 'Bis <em>wann</em>?',
    'Votre échéance idéale. (optionnel)': 'Ihr idealer Zeitrahmen. (optional)',
    'Des références, des couleurs&nbsp;?': 'Referenzen oder Farben?',
    'Un site que vous aimez, vos couleurs si vous les avez. (optionnel)':
      'Eine Website, die Ihnen gefällt, Ihre Farben falls vorhanden. (optional)',
    'Votre projet en <em>quelques mots</em>&nbsp;?':
      'Ihr Projekt in <em>wenigen Worten</em>?',
    'Ce qui compte pour vous, vos objectifs. (optionnel)':
      'Was Ihnen wichtig ist, Ihre Ziele. (optional)',

    /* ---- intake · options ---- */
    Restauration: 'Gastronomie',
    'Commerce / boutique': 'Handel / Laden',
    'Artisanat / BTP': 'Handwerk / Bau',
    'Santé / bien-être': 'Gesundheit / Wellness',
    'Services aux entreprises': 'Unternehmensdienste',
    'Beauté / coiffure': 'Beauty / Friseur',
    Immobilier: 'Immobilien',
    Autre: 'Sonstiges',
    'Oui, mais il est à refaire': 'Ja, aber sie muss erneuert werden',
    'Non, aucun pour l’instant': 'Nein, noch keine',
    'Site vitrine': 'Präsenz-Website',
    'Présenter votre activité': 'Ihr Geschäft präsentieren',
    'Boutique en ligne': 'Onlineshop',
    'Vendre vos produits': 'Ihre Produkte verkaufen',
    'Application web': 'Web-App',
    'Un outil sur-mesure': 'Ein maßgeschneidertes Tool',
    Accueil: 'Start',
    'À propos': 'Über uns',
    Services: 'Leistungen',
    Catalogue: 'Katalog',
    Réalisations: 'Portfolio',
    Tarifs: 'Preise',
    Contact: 'Kontakt',
    Blog: 'Blog',
    FAQ: 'FAQ',
    'Épuré': 'Klar',
    Chaleureux: 'Warm',
    'Élégant': 'Elegant',
    Audacieux: 'Mutig',
    Moderne: 'Modern',
    Artisanal: 'Handgemacht',
    Premium: 'Premium',
    Minimaliste: 'Minimalistisch',
    'Coloré': 'Bunt',
    Naturel: 'Natürlich',
    'Moins de 1 000 €': 'Unter 1.000 €',
    '1 000 – 3 000 €': '1.000 – 3.000 €',
    '3 000 – 6 000 €': '3.000 – 6.000 €',
    'Plus de 6 000 €': 'Über 6.000 €',
    'À définir ensemble': 'Gemeinsam festzulegen',
    'Dès que possible': 'So bald wie möglich',
    'Sous 1 mois': 'Innerhalb 1 Monat',
    '1 à 3 mois': '1 bis 3 Monate',
    'Pas de date précise': 'Kein festes Datum',

    /* ---- intake · placeholders ---- */
    'Téléphone (optionnel)': 'Telefon (optional)',
    'Vos informations servent uniquement à vous recontacter — jamais partagées.':
      'Ihre Angaben dienen nur der Kontaktaufnahme — niemals weitergegeben.',
    'En savoir plus': 'Mehr erfahren',
    '« j’aime bien le site de…, une ambiance comme… »':
      '„Ich mag die Website von…, eine Stimmung wie…“',
    'Racontez-nous…': 'Erzählen Sie uns…',

    /* ---- intake · recap ---- */
    'Presque fini': 'Fast fertig',
    '/ récapitulatif': '/ Zusammenfassung',
    'On vérifie <em>ensemble</em>&nbsp;?': 'Prüfen wir <em>gemeinsam</em>?',
    'Cliquez une ligne pour la modifier. Tout est encore ajustable.':
      'Klicken Sie eine Zeile an, um sie zu ändern. Alles ist noch anpassbar.',
    Modifier: 'Ändern',
    'J’accepte que mes informations soient utilisées pour être recontacté au sujet de mon projet.':
      'Ich bin einverstanden, dass meine Angaben verwendet werden, um mich zu meinem Projekt zu kontaktieren.',
    'Politique de confidentialité': 'Datenschutzerklärung',
    'Envoyer ma demande': 'Anfrage senden',
    Secteur: 'Branche',
    'Site actuel': 'Aktuelle Website',
    'Type de site': 'Website-Typ',
    Pages: 'Seiten',
    Ambiance: 'Stimmung',
    Budget: 'Budget',
    'Échéance': 'Zeitrahmen',
    Message: 'Nachricht',
    Références: 'Referenzen',
    'Oui, à refaire': 'Ja, zu erneuern',
    'Aucun pour l’instant': 'Noch keine',
    couleur: 'Farbe',
    couleurs: 'Farben',

    /* ---- intake · validation errors ---- */
    'Dites-nous juste votre nom': 'Sagen Sie uns einfach Ihren Namen',
    'On a besoin d’un email pour vous répondre':
      'Wir brauchen eine E-Mail, um zu antworten',
    'Cet email a l’air incomplet': 'Diese E-Mail sieht unvollständig aus',
    'Choisissez une option': 'Wählen Sie eine Option',
    'Merci d’accepter l’utilisation de vos informations pour continuer.':
      'Bitte stimmen Sie der Nutzung Ihrer Angaben zu, um fortzufahren.',

    /* ---- intake · confirm ---- */
    'Demande envoyée': 'Anfrage gesendet',
    'On étudie votre projet et on revient sous 24 h ouvrées — et bientôt, avec une première maquette rien que pour vous.':
      'Wir prüfen Ihr Projekt und melden uns binnen 24 Werkstunden — und bald mit einem ersten Entwurf nur für Sie.',
    'On lit votre brief en détail': 'Wir lesen Ihr Briefing genau',
    'On vous dessine une première maquette': 'Wir gestalten einen ersten Entwurf',
    'Vous validez — et on développe': 'Sie geben frei — und wir entwickeln',

    /* ---- intake · live preview ---- */
    'Votre maquette se prépare…': 'Ihr Entwurf entsteht…',
    'Juno dessine en direct': 'Juno gestaltet live',
    Découvrir: 'Entdecken',
    'Vos couleurs': 'Ihre Farben',
    'Un aperçu indicatif — la vraie maquette, on la dessine à la main après votre brief.':
      'Eine ungefähre Vorschau — den echten Entwurf gestalten wir nach Ihrem Briefing von Hand.',
    'Votre marque': 'Ihre Marke',

    /* ---- intake · preview sector heroes ---- */
    'Votre boutique, ouverte jour et nuit.':
      'Ihr Shop, Tag und Nacht geöffnet.',
    'Prendre rendez-vous, en toute simplicité.':
      'Termine buchen, ganz einfach.',
    'Votre expertise, clairement présentée.':
      'Ihre Expertise, klar präsentiert.',
    'Réservez votre moment, en ligne.': 'Buchen Sie Ihren Moment, online.',
    'Vos biens, sublimés en vitrine.': 'Ihre Objekte, ins beste Licht gerückt.',
    'Votre activité, en ligne et soignée.':
      'Ihr Geschäft, online und gepflegt.',
    Présentation: 'Übersicht',
    Boutique: 'Shop',
    'Espace client': 'Kundenbereich',

    /* ---- legal · shared ---- */
    'Informations légales': 'Rechtliche Informationen',
    'Dernière mise à jour :': 'Zuletzt aktualisiert:',
    '21 août 2026': '21. August 2026',

    /* ---- legal · mentions ---- */
    'Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, voici les informations relatives à l’éditeur et à l’hébergement de ce site.':
      'Gemäß dem französischen Gesetz Nr. 2004-575 vom 21. Juni 2004 über das Vertrauen in die digitale Wirtschaft finden Sie hier die Angaben zum Herausgeber und zum Hosting dieser Website.',
    'Éditeur du site': 'Herausgeber der Website',
    'Le site JUNO est édité par :': 'Die Website JUNO wird herausgegeben von:',
    '• Raison sociale : [RAISON SOCIALE]': '• Firmenname: [FIRMENNAME]',
    '• Forme juridique : [FORME JURIDIQUE] au capital de [CAPITAL] €':
      '• Rechtsform: [RECHTSFORM] mit einem Kapital von [KAPITAL] €',
    '• Siège social : [ADRESSE COMPLÈTE]': '• Sitz: [VOLLSTÄNDIGE ANSCHRIFT]',
    '• SIREN / RCS : [SIREN] — RCS de [VILLE]':
      '• Handelsregister: [SIREN] — Register [STADT]',
    '• N° TVA intracommunautaire : [N° TVA]': '• USt-IdNr.: [UST-IDNR.]',
    '• Contact : hello@juno.studio — [TÉLÉPHONE]':
      '• Kontakt: hello@juno.studio — [TELEFON]',
    '• Directeur de la publication : [NOM DU DIRECTEUR DE PUBLICATION]':
      '• Verantwortlich für den Inhalt: [NAME]',
    Hébergement: 'Hosting',
    'Le site est hébergé par :': 'Die Website wird gehostet von:',
    '• [NOM DE L’HÉBERGEUR]': '• [NAME DES HOSTERS]',
    '• [ADRESSE DE L’HÉBERGEUR]': '• [ANSCHRIFT DES HOSTERS]',
    '• [SITE / TÉLÉPHONE DE L’HÉBERGEUR]': '• [WEBSITE / TELEFON DES HOSTERS]',
    'Propriété intellectuelle': 'Geistiges Eigentum',
    'L’ensemble des contenus de ce site (textes, visuels, logo, code, éléments graphiques) est la propriété exclusive de l’éditeur, sauf mention contraire. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable, est interdite et constitue une contrefaçon.':
      'Sämtliche Inhalte dieser Website (Texte, Grafiken, Logo, Code, gestalterische Elemente) sind, sofern nicht anders angegeben, ausschließliches Eigentum des Herausgebers. Jede vollständige oder teilweise Vervielfältigung, Wiedergabe oder Verbreitung ohne vorherige schriftliche Genehmigung ist untersagt und stellt eine Rechtsverletzung dar.',
    'Données personnelles': 'Personenbezogene Daten',
    'Les informations transmises via le formulaire de contact sont traitées conformément à notre Politique de confidentialité, que nous vous invitons à consulter.':
      'Die über das Kontaktformular übermittelten Informationen werden gemäß unserer Datenschutzerklärung verarbeitet, die wir Sie einzusehen bitten.',
    Cookies: 'Cookies',
    'Ce site n’utilise pas de cookies publicitaires ni de traceurs tiers à des fins marketing. Seul un stockage local (localStorage) est utilisé pour vous permettre de reprendre un formulaire commencé ; il reste sur votre appareil et n’est jamais transmis à des tiers.':
      'Diese Website verwendet keine Werbe-Cookies oder Tracker Dritter zu Marketingzwecken. Es wird lediglich ein lokaler Speicher (localStorage) genutzt, damit Sie ein begonnenes Formular fortsetzen können; er verbleibt auf Ihrem Gerät und wird niemals an Dritte übermittelt.',

    /* ---- legal · confidentialité ---- */
    'Nous accordons une grande importance à la protection de vos données personnelles. Cette politique explique quelles données nous collectons, pourquoi, et quels sont vos droits, conformément au Règlement général sur la protection des données (RGPD).':
      'Der Schutz Ihrer personenbezogenen Daten ist uns sehr wichtig. Diese Erklärung legt dar, welche Daten wir erheben, warum, und welche Rechte Sie haben, gemäß der Datenschutz-Grundverordnung (DSGVO).',
    'Responsable du traitement': 'Verantwortlicher',
    'Le responsable du traitement des données est [RAISON SOCIALE], [ADRESSE].':
      'Verantwortlicher für die Datenverarbeitung ist [FIRMENNAME], [ANSCHRIFT].',
    'Pour toute question relative à vos données : hello@juno.studio.':
      'Bei Fragen zu Ihren Daten: hello@juno.studio.',
    'Données collectées': 'Erhobene Daten',
    'Via notre formulaire « Décrivez votre projet », nous collectons uniquement les informations que vous nous transmettez :':
      'Über unser Formular „Projekt beschreiben“ erheben wir ausschließlich die von Ihnen übermittelten Informationen:',
    '• Votre nom ou le nom de votre activité, votre e-mail, et éventuellement votre téléphone.':
      '• Ihren Namen oder Firmennamen, Ihre E-Mail und ggf. Ihre Telefonnummer.',
    '• Les éléments décrivant votre projet : secteur, type de site, pages, ambiance, budget, échéance, références et couleurs, message libre.':
      '• Die Angaben zu Ihrem Projekt: Branche, Website-Typ, Seiten, Stimmung, Budget, Zeitrahmen, Referenzen und Farben, Freitextnachricht.',
    'Aucune donnée sensible n’est demandée. Vous restez libre de ne renseigner que les champs obligatoires.':
      'Es werden keine sensiblen Daten abgefragt. Sie können auch nur die Pflichtfelder ausfüllen.',
    'Finalités et base légale': 'Zwecke und Rechtsgrundlage',
    'Vos données sont utilisées pour vous recontacter, étudier votre demande et vous proposer une maquette puis un devis.':
      'Ihre Daten werden verwendet, um Sie zu kontaktieren, Ihre Anfrage zu prüfen und Ihnen einen Entwurf sowie ein Angebot zu unterbreiten.',
    'La base légale est votre consentement (recueilli lors de l’envoi du formulaire) et, le cas échéant, l’exécution de mesures précontractuelles prises à votre demande.':
      'Rechtsgrundlage ist Ihre Einwilligung (erteilt beim Absenden des Formulars) sowie ggf. die Durchführung vorvertraglicher Maßnahmen auf Ihre Anfrage hin.',
    Destinataires: 'Empfänger',
    'Vos données sont destinées uniquement à l’équipe de JUNO. Elles ne sont ni vendues, ni louées, ni cédées à des tiers à des fins commerciales. Elles peuvent être traitées par nos prestataires techniques (hébergement) dans la seule mesure nécessaire au fonctionnement du service.':
      'Ihre Daten sind ausschließlich für das JUNO-Team bestimmt. Sie werden weder verkauft, vermietet noch zu kommerziellen Zwecken an Dritte weitergegeben. Sie können von unseren technischen Dienstleistern (Hosting) nur soweit verarbeitet werden, wie es für den Betrieb des Dienstes erforderlich ist.',
    'Durée de conservation': 'Speicherdauer',
    'Vos données sont conservées le temps nécessaire au traitement de votre demande, puis archivées ou supprimées au plus tard [DURÉE — ex. 3 ans] après notre dernier contact, sauf obligation légale contraire.':
      'Ihre Daten werden so lange gespeichert, wie es für die Bearbeitung Ihrer Anfrage erforderlich ist, und spätestens [DAUER — z. B. 3 Jahre] nach unserem letzten Kontakt archiviert oder gelöscht, sofern keine gesetzliche Pflicht entgegensteht.',
    'Vos droits': 'Ihre Rechte',
    'Conformément au RGPD, vous disposez des droits suivants sur vos données : accès, rectification, effacement, limitation, opposition et portabilité.':
      'Gemäß der DSGVO haben Sie folgende Rechte an Ihren Daten: Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Übertragbarkeit.',
    'Pour les exercer, écrivez-nous à hello@juno.studio. Nous répondrons dans un délai maximum d’un mois.':
      'Zur Ausübung schreiben Sie uns an hello@juno.studio. Wir antworten innerhalb von höchstens einem Monat.',
    'Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr) si vous estimez que vos droits ne sont pas respectés.':
      'Sie können sich außerdem bei der zuständigen Datenschutzbehörde beschweren (in Frankreich die CNIL, www.cnil.fr), wenn Sie der Ansicht sind, dass Ihre Rechte nicht gewahrt werden.',
    Sécurité: 'Sicherheit',
    'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès, perte ou divulgation non autorisés (connexions chiffrées, accès restreint au back-office).':
      'Wir treffen geeignete technische und organisatorische Maßnahmen, um Ihre Daten vor unbefugtem Zugriff, Verlust oder Offenlegung zu schützen (verschlüsselte Verbindungen, eingeschränkter Zugang zum Backoffice).',
  },
};
