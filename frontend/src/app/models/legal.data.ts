/**
 * Static legal content (mentions légales + politique de confidentialité).
 * Placeholders in [BRACKETS] must be filled with the real company details
 * before going live — never ship fabricated legal facts.
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

const CONTACT_EMAIL = 'hello@juno.studio';

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  mentions: {
    key: 'mentions',
    title: 'Mentions légales',
    updated: '21 août 2026',
    intro:
      'Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, voici les informations relatives à l’éditeur et à l’hébergement de ce site.',
    sections: [
      {
        h: 'Éditeur du site',
        p: [
          'Le site JUNO est édité par :',
          '• Raison sociale : [RAISON SOCIALE]',
          '• Forme juridique : [FORME JURIDIQUE] au capital de [CAPITAL] €',
          '• Siège social : [ADRESSE COMPLÈTE]',
          '• SIREN / RCS : [SIREN] — RCS de [VILLE]',
          '• N° TVA intracommunautaire : [N° TVA]',
          `• Contact : ${CONTACT_EMAIL} — [TÉLÉPHONE]`,
          '• Directeur de la publication : [NOM DU DIRECTEUR DE PUBLICATION]',
        ],
      },
      {
        h: 'Hébergement',
        p: [
          'Le site est hébergé par :',
          '• [NOM DE L’HÉBERGEUR]',
          '• [ADRESSE DE L’HÉBERGEUR]',
          '• [SITE / TÉLÉPHONE DE L’HÉBERGEUR]',
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
          'Ce site n’utilise pas de cookies publicitaires ni de traceurs tiers à des fins marketing. Seul un stockage local (localStorage) est utilisé pour vous permettre de reprendre un formulaire commencé ; il reste sur votre appareil et n’est jamais transmis à des tiers.',
        ],
      },
    ],
  },

  confidentialite: {
    key: 'confidentialite',
    title: 'Politique de confidentialité',
    updated: '21 août 2026',
    intro:
      'Nous accordons une grande importance à la protection de vos données personnelles. Cette politique explique quelles données nous collectons, pourquoi, et quels sont vos droits, conformément au Règlement général sur la protection des données (RGPD).',
    sections: [
      {
        h: 'Responsable du traitement',
        p: [
          'Le responsable du traitement des données est [RAISON SOCIALE], [ADRESSE].',
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
        ],
      },
      {
        h: 'Finalités et base légale',
        p: [
          'Vos données sont utilisées pour vous recontacter, étudier votre demande et vous proposer une maquette puis un devis.',
          'La base légale est votre consentement (recueilli lors de l’envoi du formulaire) et, le cas échéant, l’exécution de mesures précontractuelles prises à votre demande.',
        ],
      },
      {
        h: 'Destinataires',
        p: [
          'Vos données sont destinées uniquement à l’équipe de JUNO. Elles ne sont ni vendues, ni louées, ni cédées à des tiers à des fins commerciales. Elles peuvent être traitées par nos prestataires techniques (hébergement) dans la seule mesure nécessaire au fonctionnement du service.',
        ],
      },
      {
        h: 'Durée de conservation',
        p: [
          'Vos données sont conservées le temps nécessaire au traitement de votre demande, puis archivées ou supprimées au plus tard [DURÉE — ex. 3 ans] après notre dernier contact, sauf obligation légale contraire.',
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
