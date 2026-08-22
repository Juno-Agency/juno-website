import mjml2html from 'mjml';
import { leadInternalMjml } from './templates/lead-internal.mjml';
import { leadClientMjml } from './templates/lead-client.mjml';

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
  return html;
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

/** Render a list of tags as escaped "chip" pills; falls back to a dash. */
export function chips(items: string[]): string {
  if (!items?.length) return '<span style="color:#94a3b8;">—</span>';
  return items.map((i) => `<span class="chip">${escapeHtml(i)}</span>`).join('');
}

/** Render colours as a swatch + hex label; only valid-looking values get a swatch. */
export function colorSwatches(items: string[]): string {
  if (!items?.length) return '<span style="color:#94a3b8;">—</span>';
  return items
    .map((raw) => {
      const safe = escapeHtml(raw);
      const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw);
      const swatch = isHex ? `<span class="swatch" style="background:${safe};"></span>` : '';
      return `<span class="chip">${swatch}${safe}</span>`;
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
