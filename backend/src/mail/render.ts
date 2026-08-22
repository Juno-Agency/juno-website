import mjml2html from 'mjml';
import { leadInternalMjml } from './templates/lead-internal.mjml';
import { leadClientMjml } from './templates/lead-client.mjml';
import {
  BLOB_MASCOT_BASE64,
  BLOB_MASCOT_CID,
  BLOB_MASCOT_FILENAME,
} from './assets/blob-mascot';

/**
 * The email is a light page (white) with a dark card. Declaring it "light" stops
 * mobile clients from re-tinting the page (the beige-on-mobile dark-mode issue);
 * the dark card keeps its explicit background.
 */
const COLOR_SCHEME_META =
  '<meta name="color-scheme" content="light">' +
  '<meta name="supported-color-schemes" content="light">';

/** Inline blob-mascot attachment (shared by both emails), referenced via cid:. */
export const blobAttachment = {
  filename: BLOB_MASCOT_FILENAME,
  content: BLOB_MASCOT_BASE64,
  contentId: BLOB_MASCOT_CID,
};

/**
 * MJML is compiled once, lazily, into HTML that still contains the {{placeholder}}
 * tokens (MJML leaves unknown text untouched). Interpolation then happens per
 * send — cheap string replacement instead of re-running the compiler each time.
 */
type Vars = Record<string, string>;

let compiled: { internal: string; client: string } | null = null;

async function compileOne(name: string, source: string): Promise<string> {
  // mjml v5 is async and returns { html, errors }.
  const { html, errors } = await mjml2html(source, { validationLevel: 'soft' });
  if (errors?.length) {
    console.warn(`[JUNO] MJML warnings in ${name}:`, errors.map((e) => e.formattedMessage));
  }
  // Inject color-scheme hints just after <head> (MJML doesn't emit them).
  return html.replace(/<head[^>]*>/i, (m) => m + COLOR_SCHEME_META);
}

/** Compile both templates once and cache the result. Safe to call repeatedly. */
export async function warmTemplates(): Promise<void> {
  if (compiled) return;
  const [internal, client] = await Promise.all([
    compileOne('lead-internal', leadInternalMjml),
    compileOne('lead-client', leadClientMjml),
  ]);
  compiled = { internal, client };
}

/** Escape a raw user-supplied string for safe insertion into HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Inline styles (Gmail-safe) for the black card: cream chips with a hairline.
const CHIP =
  "display:inline-block;padding:6px 13px;margin:0 7px 8px 0;border:1px solid rgba(252,252,251,0.18);" +
  "border-radius:100px;color:#fcfcfb;font-size:13px;line-height:1;" +
  "font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;";
const DASH = '<span style="color:#6f6a63;">—</span>';

/** Render a list of tags as escaped cream "chip" pills; falls back to a dash. */
export function chips(items: string[]): string {
  if (!items?.length) return DASH;
  return items.map((i) => `<span style="${CHIP}">${escapeHtml(i)}</span>`).join('');
}

/** Render colours as a swatch + hex label; only valid-looking values get a swatch. */
export function colorSwatches(items: string[]): string {
  if (!items?.length) return DASH;
  return items
    .map((raw) => {
      const safe = escapeHtml(raw);
      const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw);
      const swatch = isHex
        ? `<span style="display:inline-block;width:12px;height:12px;border-radius:4px;margin-right:8px;` +
          `vertical-align:middle;border:1px solid rgba(252,252,251,0.25);background:${safe};"></span>`
        : '';
      return `<span style="${CHIP}">${swatch}${safe}</span>`;
    })
    .join('');
}

/** Replace every {{key}} token. Values are inserted verbatim (pre-escaped by caller). */
function interpolate(html: string, vars: Vars): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_m, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : '',
  );
}

export async function renderLeadInternal(vars: Vars): Promise<string> {
  await warmTemplates();
  return interpolate(compiled!.internal, vars);
}

export async function renderLeadClient(vars: Vars): Promise<string> {
  await warmTemplates();
  return interpolate(compiled!.client, vars);
}
