/**
 * Lecture des variables d'environnement pour les proxys du serveur de dev.
 *
 * Les deux configurations (`proxy.conf.mjs` et `proxy.conf.prod.mjs`) ont
 * besoin des mêmes valeurs — le port du backend local, la clé du backlog — et
 * les cherchent au même endroit : l'environnement du processus d'abord, puis
 * le `.env` du front s'il existe, puis celui du backend, qui les contient déjà.
 *
 * Aucun de ces fichiers n'est versionné, et rien de ce qui est lu ici n'atteint
 * le navigateur : ce module s'exécute dans le processus Node du serveur de dev.
 */
import { readFileSync } from 'node:fs';

const ENV_FILES = ['.env', '../backend/.env'];

/**
 * Renvoie la première valeur non vide trouvée pour `name`, sinon `fallback`.
 * Les valeurs entourées de guillemets sont nettoyées, comme le ferait dotenv.
 */
export function readEnv(name, fallback = '') {
  if (process.env[name]) return process.env[name];

  const pattern = new RegExp(`^\\s*${name}\\s*=`);
  for (const file of ENV_FILES) {
    try {
      const line = readFileSync(new URL(file, import.meta.url), 'utf8')
        .split('\n')
        .find((l) => pattern.test(l));
      const value = line?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      if (value) return value;
    } catch {
      // Fichier absent : on essaie le suivant.
    }
  }
  return fallback;
}
