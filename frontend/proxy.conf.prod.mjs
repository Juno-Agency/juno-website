/**
 * Proxy du serveur de dev vers l'API de PRODUCTION (Render).
 *
 * Sert à gérer le backlog de tickets — partagé avec Julien — depuis
 * localhost:4200, sans avoir à lancer le backend ni Mongo en local.
 *
 * À savoir avant de l'utiliser :
 *   - les écritures touchent la vraie base : supprimer un ticket, un lead ou un
 *     projet du portfolio ici, c'est le supprimer pour de bon ;
 *   - la connexion se fait avec les identifiants admin de PROD (dashboard
 *     Render), pas avec le `change-me` du .env local ;
 *   - l'API dort après 15 minutes sans trafic (plan gratuit) : le premier appel
 *     peut prendre une minute avant de répondre.
 *
 * Usage :  npm run start:prod-api
 */

const API = 'https://juno-api-hhb0.onrender.com';

// Repère au démarrage : sans lui, rien à l'écran ne distingue cette session
// d'une session locale, et c'est comme ça qu'on supprime en prod par erreur.
console.log('\n\x1b[43m\x1b[30m  API DE PRODUCTION  \x1b[0m');
console.log(`\x1b[33m  /api → ${API}\x1b[0m`);
console.log('\x1b[33m  Les écritures sont définitives. Identifiants admin de prod.\x1b[0m\n');

export default {
  '/api': {
    target: API,
    changeOrigin: true,
    secure: true,
    logLevel: 'info',
  },
};
