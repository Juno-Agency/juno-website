import { SITE_DOMAIN } from '../models/legal.data';

export const SITE_ORIGIN = `https://${SITE_DOMAIN}`;

/**
 * URL canonique d'une page : l'origine du site + le chemin, sans query string
 * ni fragment. Le sitemap liste `/projet` sans slash final, on s'aligne dessus.
 */
export function canonicalUrl(url: string): string {
  const path = url.split(/[?#]/)[0] || '/';
  return `${SITE_ORIGIN}${path}`;
}
