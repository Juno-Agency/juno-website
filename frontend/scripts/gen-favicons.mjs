/**
 * Génère les déclinaisons bitmap du favicon à partir de public/favicon.svg :
 *   - favicon.ico          (16, 32, 48 — PNG encapsulés dans le conteneur ICO)
 *   - apple-touch-icon.png (180, écran d'accueil iOS)
 *   - icon-192.png / icon-512.png (manifest / Android)
 *
 * Le rendu passe par Chromium (Playwright) plutôt que par un rasteriseur
 * dédié : c'est le moteur qui affichera réellement l'icône, et ça évite une
 * dépendance système de plus (le script mail de Julien, lui, réclame
 * rsvg-convert).
 *
 * Depuis frontend/ :  node scripts/gen-favicons.mjs
 * Playwright n'est pas une dépendance du projet ; le script le résout depuis
 * l'installation globale si besoin (npm i -g playwright).
 */
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const SVG = join(PUBLIC_DIR, 'favicon.svg');

/** Tailles empaquetées dans le .ico. 48 sert aux raccourcis bureau Windows. */
const ICO_SIZES = [16, 32, 48];
/** Fichiers PNG autonomes : [taille, nom]. */
const PNG_FILES = [
  [180, 'apple-touch-icon.png'],
  [192, 'icon-192.png'],
  [512, 'icon-512.png'],
];

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    return createRequire(join(globalRoot, 'noop.js'))('playwright');
  }
}

/**
 * Rend le SVG dans un viewport exactement carré et renvoie le PNG.
 *
 * `square` produit un carré plein, sans coins arrondis ni transparence : c'est
 * ce qu'attendent iOS et Android, qui masquent l'icône eux-mêmes (un coin
 * transparent y ressort en liseré). Le .ico, lui, garde ses coins arrondis —
 * il s'affiche tel quel dans l'onglet, sur un fond dont on ne sait rien.
 */
async function render(page, svgMarkup, size, { square = false } = {}) {
  const markup = square ? svgMarkup.replace(/rx="14"/, 'rx="0"') : svgMarkup;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;padding:0}svg{display:block;width:${size}px;height:${size}px}</style>${markup}`,
  );
  return page.screenshot({ omitBackground: !square });
}

/**
 * Assemble un .ico à partir de PNG déjà encodés. Le format accepte des PNG
 * bruts depuis Vista ; tous les navigateurs encore en service les lisent.
 */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type 1 = icône
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    // 0 encode 256 ; nos tailles restent en dessous, mais la règle vaut d'être respectée.
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // largeur
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // hauteur
    entry.writeUInt8(0, 2); // palette : sans objet en couleurs vraies
    entry.writeUInt8(0, 3); // réservé
    entry.writeUInt16LE(1, 4); // plans
    entry.writeUInt16LE(32, 6); // bits par pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const { chromium } = loadPlaywright();
const svgMarkup = readFileSync(SVG, 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();

const icoImages = [];
for (const size of ICO_SIZES) {
  icoImages.push({ size, data: await render(page, svgMarkup, size) });
}
writeFileSync(join(PUBLIC_DIR, 'favicon.ico'), buildIco(icoImages));
console.log(`favicon.ico  ${ICO_SIZES.join(', ')}`);

for (const [size, name] of PNG_FILES) {
  writeFileSync(join(PUBLIC_DIR, name), await render(page, svgMarkup, size, { square: true }));
  console.log(`${name}  ${size}×${size}`);
}

await browser.close();
