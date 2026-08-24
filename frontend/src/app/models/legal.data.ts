/**
 * Static legal content (mentions légales + politique de confidentialité).
 *
 * The publisher is Julien Dietschy's micro-entreprise (DIETSCHYDIGIT) until the
 * JUNO company exists — when it does, only the "Éditeur" and "Responsable du
 * traitement" blocks change. Every string here is also the i18n key for the
 * EN/DE copy in `i18n/translations.ts`: edit both, or EN/DE silently fall
 * back to French.
 */

export interface LegalSection {
  h: string;
  /** Paragraphs; a line may contain a leading "• " to render as a bullet. */
  p: string[];
}

export interface LegalDoc {
  key: 'mentions' | 'confidentialite';
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}

export const CONTACT_EMAIL = 'agencyjuno@gmail.com';
export const SITE_DOMAIN = 'agency-juno.com';

const UPDATED = '24 août 2026';

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  mentions: {
    key: 'mentions',
    title: 'Mentions légales',
    updated: UPDATED,
    intro:
      'Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, voici les informations relatives à l’éditeur et à l’hébergement de ce site.',
    sections: [
      {
        h: 'Éditeur du site',
        p: [
          'Le site JUNO (agency-juno.com) est édité par :',
          '• Julien Dietschy — entrepreneur individuel (micro-entreprise), exerçant sous le nom commercial DIETSCHYDIGIT',
          '• Adresse : 26 quai Armand Lalande, 33000 Bordeaux, France',
          '• SIREN : 991 553 630',
          '• TVA non applicable, article 293 B du CGI',
          `• Contact : ${CONTACT_EMAIL}`,
          '• Directeur de la publication : Julien Dietschy',
          'JUNO est le nom commercial sous lequel DIETSCHYDIGIT propose ses services de création de sites web.',
        ],
      },
      {
        h: 'Hébergement',
        p: [
          'Le site et son interface de traitement des demandes sont hébergés par :',
          '• Render Services, Inc.',
          '• 525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis',
          '• render.com',
          'La base de données est hébergée par MongoDB, Inc. (service MongoDB Atlas), les images du portfolio par Cloudflare, Inc. et les e-mails sont envoyés via Resend, Inc.',
        ],
      },
      {
        h: 'Propriété intellectuelle',
        p: [
          'L’ensemble des contenus de ce site (textes, visuels, logo, code, éléments graphiques) est la propriété exclusive de l’éditeur, sauf mention contraire. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable, est interdite et constitue une contrefaçon.',
        ],
      },
      {
        h: 'Données personnelles',
        p: [
          'Les informations transmises via le formulaire de contact sont traitées conformément à notre Politique de confidentialité, que nous vous invitons à consulter.',
        ],
      },
      {
        h: 'Cookies',
        p: [
          'Ce site n’utilise pas de cookies publicitaires ni de traceurs tiers à des fins marketing, et aucun outil de mesure d’audience n’est installé. Seul un stockage local (localStorage) est utilisé pour mémoriser votre choix de langue et vous permettre de reprendre un formulaire commencé ; il reste sur votre appareil et n’est jamais transmis à des tiers.',
        ],
      },
    ],
  },

  confidentialite: {
    key: 'confidentialite',
    title: 'Politique de confidentialité',
    updated: UPDATED,
    intro:
      'Nous accordons une grande importance à la protection de vos données personnelles. Cette politique explique quelles données nous collectons, pourquoi, et quels sont vos droits, conformément au Règlement général sur la protection des données (RGPD).',
    sections: [
      {
        h: 'Responsable du traitement',
        p: [
          'Le responsable du traitement des données est Julien Dietschy (DIETSCHYDIGIT, micro-entreprise), 26 quai Armand Lalande, 33000 Bordeaux, France.',
          `Pour toute question relative à vos données : ${CONTACT_EMAIL}.`,
        ],
      },
      {
        h: 'Données collectées',
        p: [
          'Via notre formulaire « Décrivez votre projet », nous collectons uniquement les informations que vous nous transmettez :',
          '• Votre nom ou le nom de votre activité, votre e-mail, et éventuellement votre téléphone.',
          '• Les éléments décrivant votre projet : secteur, type de site, pages, ambiance, budget, échéance, références et couleurs, message libre.',
          'Aucune donnée sensible n’est demandée. Vous restez libre de ne renseigner que les champs obligatoires.',
          'Par ailleurs, comme tout site web, nos serveurs enregistrent automatiquement des données techniques (adresse IP, type de navigateur, pages consultées, date et heure) dans des journaux utilisés uniquement pour la sécurité et le bon fonctionnement du service, notamment la protection du formulaire contre les abus. Ces journaux sont conservés au maximum un mois.',
        ],
      },
      {
        h: 'Finalités et base légale',
        p: [
          'Vos données sont utilisées pour vous recontacter, étudier votre demande et vous proposer une maquette puis un devis.',
          'La base légale est votre consentement (recueilli lors de l’envoi du formulaire) et, le cas échéant, l’exécution de mesures précontractuelles prises à votre demande.',
          'Les données techniques sont traitées sur la base de notre intérêt légitime à assurer la sécurité et la disponibilité du site.',
        ],
      },
      {
        h: 'Destinataires et sous-traitants',
        p: [
          'Vos données sont destinées uniquement à l’équipe de JUNO. Elles ne sont ni vendues, ni louées, ni cédées à des tiers à des fins commerciales.',
          'Pour faire fonctionner le service, nous faisons appel aux prestataires suivants, qui n’accèdent aux données que dans la mesure strictement nécessaire :',
          '• Render Services, Inc. (États-Unis) — hébergement du site et de l’interface de traitement des demandes.',
          '• MongoDB, Inc. (États-Unis) — hébergement de la base de données (MongoDB Atlas).',
          '• Resend, Inc. (États-Unis) — envoi des e-mails de confirmation et de notification.',
          '• Cloudflare, Inc. (États-Unis) — diffusion du site et hébergement des images du portfolio.',
          '• Google LLC (États-Unis) — chargement des polices de caractères (Google Fonts), ce qui transmet votre adresse IP à Google lors de la visite.',
        ],
      },
      {
        h: 'Transferts hors Union européenne',
        p: [
          'Ces prestataires sont établis aux États-Unis. Les transferts de données sont encadrés par les clauses contractuelles types adoptées par la Commission européenne et, pour les prestataires certifiés, par le cadre de protection des données UE–États-Unis (Data Privacy Framework).',
        ],
      },
      {
        h: 'Durée de conservation',
        p: [
          'Vos données sont conservées le temps nécessaire au traitement de votre demande, puis supprimées au plus tard 3 ans après notre dernier contact, sauf obligation légale contraire (par exemple la conservation des documents contractuels et comptables si un projet est réalisé).',
        ],
      },
      {
        h: 'Vos droits',
        p: [
          'Conformément au RGPD, vous disposez des droits suivants sur vos données : accès, rectification, effacement, limitation, opposition et portabilité.',
          `Pour les exercer, écrivez-nous à ${CONTACT_EMAIL}. Nous répondrons dans un délai maximum d’un mois.`,
          'Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr) si vous estimez que vos droits ne sont pas respectés.',
        ],
      },
      {
        h: 'Sécurité',
        p: [
          'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès, perte ou divulgation non autorisés (connexions chiffrées, accès restreint au back-office).',
        ],
      },
    ],
  },
};
