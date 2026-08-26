import {
  animate,
  group,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { JunoLeadService, LeadPayload } from '../../services/juno-lead.service';
import { prefersReducedMotion } from '../../utils/reduced-motion';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { GrainVignetteComponent } from '../grain-vignette/grain-vignette';
import {
  DEFAULT_SWATCHES,
  LETTERS,
  QUESTIONS,
  SECTIONS,
  STYLE_PALETTES,
  TYPE_MODULE,
  emptyLead,
  sectorHero,
} from '../../models/intake.data';
import { DataKey } from '../../models/intake.model';
import { JunoMascot } from '../../shared/juno-mascot/juno-mascot';
import { I18nService } from '../../i18n/i18n.service';
import { LangSwitcherComponent } from '../lang-switcher/lang-switcher';

interface Confetti {
  id: number;
  left: string;
  background: string;
  duration: string;
  delay: string;
  rotate: string;
}

interface RecapRow {
  step: number;
  label: string;
  value: string;
}
interface RecapGroup {
  id: number;
  label: string;
  rows: RecapRow[];
}

/** Live "Juno dessine" preview model, derived from the answers so far. */
interface Preview {
  brand: string;
  url: string;
  hasBrand: boolean;
  hero: string;
  hasHero: boolean;
  typeLabel: string;
  hasType: boolean;
  nav: string[];
  styles: string[];
  isShop: boolean;
  isApp: boolean;
  colors: string[];
  primary: string;
  onPrimary: string;
  primarySoft: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Parse a #rrggbb hex into [r, g, b]. */
function hexRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  const n = c.length === 3 ? c.split('').map((x) => x + x).join('') : c;
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}
/** Readable text colour (ink or cream) for a given background. */
function readable(hex: string): string {
  const [r, g, b] = hexRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#141414' : '#fcfcfb';
}
/** A translucent tint of the colour, for soft surfaces in the preview. */
function softRgba(hex: string, a: number): string {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
const STORE_KEY = 'juno_intake_v1';
const LS: Storage | null =
  typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;

/** The Juno mascot mark, inlined so the fly-to-preview "rocket" can render it. */
const JUNO_SVG =
  '<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">' +
  '<ellipse cx="32" cy="58" rx="15" ry="3" fill="rgba(0,0,0,0.30)"/>' +
  '<path d="M32 4C46 3 59 12 60 27C61 39 57 49 46 56C37 61 26 61 17 55C7 48 3 37 5 26C7 13 19 5 32 4Z" fill="#fcfcfb"/>' +
  '<circle cx="24.5" cy="30" r="3.1" fill="#141414"/>' +
  '<circle cx="39.5" cy="30" r="3.1" fill="#141414"/>' +
  '<circle cx="25.4" cy="30.6" r="1.15" fill="#fcfcfb"/>' +
  '<circle cx="40.4" cy="30.6" r="1.15" fill="#fcfcfb"/>' +
  '<path d="M24 41 Q32 48 40 41" stroke="#141414" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
  '</svg>';

@Component({
  selector: 'app-intake',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    GrainVignetteComponent,
    AutofocusDirective,
    JunoMascot,
    LangSwitcherComponent,
  ],
  templateUrl: './intake.html',
  styleUrl: './intake.scss',
  animations: [
    trigger('panel', [
      transition(':enter', [
        style({ opacity: 0, transform: '{{ enterFrom }} scale(.985)', filter: 'blur(7px)' }),
        group([
          animate(
            '540ms cubic-bezier(.16,1,.3,1)',
            style({ opacity: 1, transform: 'none', filter: 'blur(0)' }),
          ),
          query(
            '.stagger',
            [
              style({ opacity: 0, transform: 'translateY(18px)' }),
              stagger(58, [
                animate(
                  '560ms 40ms cubic-bezier(.16,1,.3,1)',
                  style({ opacity: 1, transform: 'none' }),
                ),
              ]),
            ],
            { optional: true },
          ),
        ]),
      ], { params: { enterFrom: 'translateY(28px)', leaveTo: 'translateY(-22px)' } }),
      transition(':leave', [
        animate('300ms ease', style({ opacity: 0, transform: '{{ leaveTo }} scale(.992)', filter: 'blur(6px)' })),
      ], { params: { enterFrom: 'translateY(28px)', leaveTo: 'translateY(-22px)' } }),
    ]),
    // A ripple that radiates out of the "Aperçu" button when the flying token
    // lands in it — the visible "your answer just reached the preview".
    trigger('peekPing', [
      transition(':increment', [
        style({ opacity: 0.55, transform: 'scale(0.4)' }),
        animate('720ms cubic-bezier(.16,1,.3,1)', style({ opacity: 0, transform: 'scale(2.7)' })),
      ]),
    ]),
  ],
})
export class IntakeComponent {
  private readonly lead = inject(JunoLeadService);
  private readonly i18n = inject(I18nService);
  protected readonly tr = this.i18n.tr;
  /** Recap heading carries an <em>, so it renders via [innerHTML]. */
  protected readonly recapQ = 'On vérifie <em>ensemble</em>&nbsp;?';

  protected readonly rm = prefersReducedMotion();
  protected readonly letters = LETTERS;
  protected readonly questions = QUESTIONS;
  protected readonly sections = SECTIONS;
  protected readonly total = QUESTIONS.length;

  /** 0..total-1 = questions, total = recap. `done` shows the confirmation. */
  protected readonly step = signal(0);
  protected readonly dir = signal(1);
  protected readonly data = signal<LeadPayload>(emptyLead());
  protected readonly err = signal('');
  protected readonly done = signal(false);
  protected readonly confetti = signal<Confetti[]>([]);
  protected readonly resumeAvailable = signal(false);
  protected readonly previewOpen = signal(false);
  protected readonly consent = signal(false);
  /** Honeypot value — stays empty for real users; filled = bot (dropped server-side). */
  protected readonly honeypot = signal('');
  /** When the form was opened, sent so the server can reject bot-speed submissions. */
  private readonly startedAt = Date.now();
  /** Duplicate pre-check: true while checking, and whether to show the choice modal. */
  protected readonly checkingDup = signal(false);
  protected readonly dupOpen = signal(false);
  /**
   * Envoi en cours / envoi échoué. Tant que l'API n'a pas confirmé, le
   * brouillon reste et la confirmation n'apparaît pas : un lead qui n'est pas
   * parti ne doit jamais ressembler à un lead reçu.
   */
  protected readonly sending = signal(false);
  protected readonly sendFailed = signal(false);
  /** Choix du modal de doublon, rejoué tel quel par « Réessayer ». */
  private combineWithExisting = false;

  /** Drives the "Aperçu" attention cue: the mockup changed but the drawer
      (mobile) hasn't been opened to see it yet. */
  protected readonly previewUnseen = signal(false);
  /** Bumped on every mockup-affecting change to replay the button's ping/rise. */
  protected readonly pulseTick = signal(0);
  private lastPreviewKey = '';

  private readonly animating = signal(false);
  private persistOn = false;
  private pending: { data: LeadPayload; step: number } | null = null;
  private uid = 0;

  constructor() {
    // Restore an in-progress submission (autosave). Offer it, don't force it.
    const saved = this.readSaved();
    if (saved && this.hasContent(saved.data)) {
      this.pending = saved;
      this.resumeAvailable.set(true);
    } else {
      this.persistOn = true;
    }
    // Autosave whenever data/step change (once persistence is armed).
    effect(() => {
      const snapshot = { data: this.data(), step: this.step() };
      if (!this.persistOn || this.done()) return;
      try {
        LS?.setItem(STORE_KEY, JSON.stringify(snapshot));
      } catch {
        /* storage unavailable — degrade silently */
      }
    });

    // Whenever an answer changes the live mockup, flag the "Aperçu" button so
    // the user (on mobile, where the preview is tucked in a drawer) sees there's
    // something new — a calm static badge, no motion. First run records the
    // baseline. The button's ripple only fires when a token actually lands.
    effect(() => {
      const key = this.previewKey();
      if (this.lastPreviewKey === '') {
        this.lastPreviewKey = key;
        return;
      }
      if (key === this.lastPreviewKey) return;
      this.lastPreviewKey = key;
      if (!untracked(() => this.previewOpen())) this.previewUnseen.set(true);
    });
  }

  /* ---------- derived state ---------- */
  protected readonly isRecap = computed(() => this.step() >= this.total);
  protected readonly current = computed(() => this.questions[Math.min(this.step(), this.total - 1)]);
  protected readonly section = computed(() => {
    const id = this.isRecap() ? 3 : this.current().section;
    return this.sections[id - 1];
  });
  protected readonly progress = computed(() => {
    if (this.done() || this.isRecap()) return 100;
    return Math.round((this.step() / this.total) * 100);
  });
  protected readonly stepLabel = computed(() => String(this.step() + 1).padStart(2, '0'));
  protected readonly totalLabel = String(this.total).padStart(2, '0');
  protected readonly isLast = computed(() => this.step() === this.total - 1);
  protected readonly canSkip = computed(() => !this.isRecap() && !this.current().required);

  protected readonly panelParams = computed(() =>
    this.dir() >= 0
      ? { enterFrom: 'translateY(26px)', leaveTo: 'translateY(-22px)' }
      : { enterFrom: 'translateY(-26px)', leaveTo: 'translateY(22px)' },
  );

  protected readonly firstName = computed(
    () => this.data().nom.trim().split(' ')[0] || 'à vous',
  );

  /** Chapter status for the left-rail stepper. */
  protected sectionState(id: number): 'done' | 'active' | 'todo' {
    const cur = this.section().id;
    if (this.done() || this.isRecap()) return id <= cur ? 'done' : 'todo';
    if (id < cur) return 'done';
    if (id === cur) return 'active';
    return 'todo';
  }

  /* ---------- adaptive colour palette (driven by the chosen ambiance) ---------- */
  protected readonly swatches = computed<string[]>(() => {
    const d = this.data();
    const out: string[] = [];
    const seen = new Set<string>();
    const add = (c: string) => {
      const k = c.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        out.push(c);
      }
    };
    for (const s of d.styles) (STYLE_PALETTES[s] ?? []).forEach(add);
    if (!out.length) DEFAULT_SWATCHES.forEach(add);
    // Keep already-picked colours visible even if the ambiance changed.
    for (const c of d.colors) add(c);
    return out.slice(0, 10);
  });

  /* ---------- live preview ("Juno dessine") ---------- */
  protected readonly preview = computed<Preview>(() => {
    const d = this.data();
    const nom = d.nom.trim();
    const slug = nom
      ? nom
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      : '';
    const primary = d.colors[0] ?? '';
    return {
      brand: nom || 'Votre marque',
      url: `${slug || 'votre-site'}.fr`,
      hasBrand: !!nom,
      hero: d.secteur ? sectorHero(d.secteur) : '',
      hasHero: !!d.secteur,
      typeLabel: d.type ? TYPE_MODULE[d.type] ?? '' : '',
      hasType: !!d.type,
      nav: (d.pages.length ? d.pages : ['Accueil', 'Services', 'Contact']).slice(0, 5),
      styles: d.styles.slice(0, 3),
      isShop: d.type === 'Boutique en ligne',
      isApp: d.type === 'Application web',
      colors: d.colors,
      primary,
      onPrimary: primary ? readable(primary) : '#fcfcfb',
      primarySoft: primary ? softRgba(primary, 0.16) : '',
    };
  });

  /** Signature of everything the live mockup renders — changes here mean the
      preview visibly updated, which is what drives the "Aperçu" pulse. */
  protected readonly previewKey = computed(() => {
    const p = this.preview();
    return JSON.stringify([
      p.brand,
      p.hero,
      p.typeLabel,
      p.nav,
      p.styles,
      p.isShop,
      p.isApp,
      p.colors,
      p.primary,
    ]);
  });

  /* ---------- recap ---------- */
  protected readonly recap = computed<RecapGroup[]>(() => {
    const d = this.data();
    const rows = this.questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.key || q.kind === 'refs')
      .map(({ i }) => ({ step: i, label: this.recapLabel(i), value: this.recapValue(i, d) }));
    return this.sections.map((s) => ({
      id: s.id,
      label: s.label,
      rows: rows.filter((r) => this.questions[r.step].section === s.id),
    }));
  });

  private recapLabel(i: number): string {
    const q = this.questions[i];
    const map: Record<string, string> = {
      nom: 'Vous',
      email: 'Contact',
      secteur: 'Secteur',
      existant: 'Site actuel',
      type: 'Type de site',
      pages: 'Pages',
      styles: 'Ambiance',
      budget: 'Budget',
      echeance: 'Échéance',
      message: 'Message',
    };
    if (q.key && map[q.key]) return this.tr(map[q.key]);
    if (q.kind === 'refs') return this.tr('Références');
    return q.key ?? '—';
  }

  private recapValue(i: number, d: LeadPayload): string {
    const q = this.questions[i];
    const dash = '—';
    if (q.kind === 'refs') {
      const parts: string[] = [];
      if (d.refs.trim()) parts.push(d.refs.trim());
      if (d.colors.length)
        parts.push(
          `${d.colors.length} ${this.tr(d.colors.length > 1 ? 'couleurs' : 'couleur')}`,
        );
      return parts.length ? parts.join(' · ') : dash;
    }
    if (q.key === 'email') {
      const e = d.email.trim();
      return e ? (d.tel?.trim() ? `${e} · ${d.tel.trim()}` : e) : dash;
    }
    if (q.key === 'existant') {
      return d.existant === 'refaire'
        ? this.tr('Oui, à refaire')
        : d.existant === 'aucun'
          ? this.tr('Aucun pour l’instant')
          : dash;
    }
    if (!q.key) return dash;
    const v = d[q.key];
    // Option values are stored in French and translated only for display.
    if (Array.isArray(v)) return v.length ? v.map((x) => this.tr(x)).join(', ') : dash;
    return typeof v === 'string' && v.trim() ? this.tr(v) : dash;
  }

  /* ---------- resume ---------- */
  protected resume(): void {
    if (this.pending) {
      this.data.set({ ...emptyLead(), ...this.pending.data });
      this.step.set(Math.min(this.pending.step, this.total));
    }
    this.pending = null;
    this.persistOn = true;
    this.resumeAvailable.set(false);
  }
  protected startFresh(): void {
    this.pending = null;
    this.clearSaved();
    this.persistOn = true;
    this.resumeAvailable.set(false);
  }

  private readSaved(): { data: LeadPayload; step: number } | null {
    try {
      const raw = LS?.getItem(STORE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data && typeof parsed.step === 'number') return parsed;
    } catch {
      /* ignore */
    }
    return null;
  }
  private clearSaved(): void {
    try {
      LS?.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
  }
  private hasContent(d: LeadPayload): boolean {
    return !!(
      d.nom?.trim() ||
      d.email?.trim() ||
      d.secteur ||
      d.type ||
      d.pages?.length ||
      d.styles?.length
    );
  }

  /** "A/B/C" hint for the current choice screen. */
  protected hintLetters(): string {
    const opts = this.current().opts ?? [];
    return opts.slice(0, 3).map((_, n) => this.letters[n]).join('/');
  }

  /* ---------- value helpers (template-friendly) ---------- */
  protected stringVal(key: DataKey): string {
    const v = this.data()[key];
    return typeof v === 'string' ? v : '';
  }
  protected isPicked(key: DataKey, value: string): boolean {
    const v = this.data()[key];
    return Array.isArray(v) ? v.includes(value) : v === value;
  }
  protected isColorOn(c: string): boolean {
    return this.data().colors.includes(c);
  }

  /* ---------- input updates ---------- */
  protected setText(key: DataKey, ev: Event): void {
    const value = (ev.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.data.update((d) => ({ ...d, [key]: value }));
  }

  protected selectSingle(value: string, immediate = false): void {
    const key = this.current().key;
    if (!key) return;
    this.data.update((d) => ({ ...d, [key]: value }));
    if (immediate) {
      this.go(1);
    } else {
      setTimeout(() => this.go(1), 240);
    }
  }

  protected toggleMulti(value: string): void {
    const key = this.current().key;
    if (!key) return;
    this.data.update((d) => {
      const arr = (d[key] as string[]).slice();
      const idx = arr.indexOf(value);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(value);
      return { ...d, [key]: arr };
    });
  }

  protected toggleColor(c: string): void {
    this.data.update((d) => {
      const arr = d.colors.slice();
      const idx = arr.indexOf(c);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(c);
      return { ...d, colors: arr };
    });
  }

  /* ---------- navigation ---------- */
  protected go(dir: number): boolean {
    if (this.animating() || this.done()) return false;
    if (dir > 0 && !this.isRecap() && !this.validate()) return false;
    const next = Math.max(0, Math.min(this.total, this.step() + dir));
    if (next === this.step()) return false;
    this.dir.set(dir >= 0 ? 1 : -1);
    this.animating.set(true);
    this.err.set('');
    this.step.set(next);
    setTimeout(() => this.animating.set(false), this.rm ? 0 : 300);
    return true;
  }

  /**
   * Advance to the next question and, if it actually advanced, fly a small
   * token from the pressed button up into the live preview — the visible
   * "your answer just went into the mockup". `origin` is the button clicked.
   */
  protected flyThenGo(origin: HTMLElement | null): boolean {
    const from = origin?.getBoundingClientRect() ?? null;
    const advanced = this.go(1);
    if (advanced && from && !this.rm) this.launchFly(from);
    return advanced;
  }

  private goButtonEl(): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    return document.querySelector('.stage .foot .go');
  }

  /**
   * Glide the Juno mascot along a smooth arc from `from` up into the live
   * preview, drawing one sleek tapered light-streak behind it (no particles).
   */
  private launchFly(from: DOMRect): void {
    if (typeof document === 'undefined' || !document.body) return;

    // Target: the "Aperçu" pill when it's on screen (mobile), otherwise the
    // live mockup card itself (desktop), falling back to the preview pane.
    const peek = document.querySelector('.peek') as HTMLElement | null;
    const site = document.querySelector('.preview .site') as HTMLElement | null;
    const pane = document.querySelector('.preview') as HTMLElement | null;
    let to: DOMRect | null = null;
    if (peek) {
      const r = peek.getBoundingClientRect();
      if (r.width > 0) to = r;
    }
    if (!to && site) to = site.getBoundingClientRect();
    if (!to && pane) to = pane.getBoundingClientRect();
    if (!to) return;

    const sx = from.left + from.width / 2;
    const sy = from.top + from.height / 2;
    const tx = to.left + to.width / 2;
    const ty = to.top + to.height / 2;
    const dx = tx - sx;
    const dy = ty - sy;

    const DUR = 1150;
    const EASE = 'cubic-bezier(.45,0,.15,1)';

    const spawned: HTMLElement[] = [];
    let landed = false;
    const done = () => {
      if (landed) return;
      landed = true;
      spawned.forEach((e) => e.remove());
      // The mascot "lands" — replay the preview's receive pulse.
      this.pulseTick.update((n) => n + 1);
      if (!untracked(() => this.previewOpen())) this.previewUnseen.set(true);
    };

    const supportsPath =
      typeof CSS !== 'undefined' &&
      CSS.supports &&
      CSS.supports('offset-path', "path('M0 0 L1 1')");

    if (supportsPath) {
      // A quadratic Bézier lifted above the straight line → a graceful curve
      // that both the streak and the mascot ride, locked together.
      const lift = Math.min(180, Math.max(90, Math.abs(dx) * 0.34 + 80));
      const cx = (sx + tx) / 2;
      const cy = (sy + ty) / 2 - 2 * lift;
      const d = `path("M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}")`;

      const make = (css: string, html: string): HTMLElement => {
        const el = document.createElement('div');
        el.className = 'fly-token';
        el.setAttribute('aria-hidden', 'true');
        el.style.cssText =
          `position:fixed;left:0;top:0;margin:0;pointer-events:none;offset-path:${d};offset-distance:0%;${css}`;
        if (html) el.innerHTML = html;
        document.body.appendChild(el);
        spawned.push(el);
        return el;
      };

      // The streak: a soft, tapered light ribbon whose bright head meets the
      // mascot and fades to nothing behind it. offset-rotate:auto keeps it
      // tangent to the curve; offset-anchor pins its head onto the path point.
      const streak = make(
        'z-index:70;width:104px;height:13px;border-radius:999px;' +
          'background:linear-gradient(90deg,rgba(252,252,251,0) 0%,rgba(252,252,251,.16) 55%,rgba(252,252,251,.62) 100%);' +
          'filter:blur(3px);offset-rotate:auto;offset-anchor:100% 50%;' +
          'will-change:offset-distance,opacity,width;',
        '',
      );
      streak.animate(
        [
          { offset: 0, offsetDistance: '0%', width: '40px', opacity: 0 },
          { offset: 0.16, offsetDistance: '5%', width: '104px', opacity: 0.5 },
          { offset: 0.82, offsetDistance: '86%', width: '104px', opacity: 0.5 },
          { offset: 1, offsetDistance: '100%', width: '30px', opacity: 0 },
        ],
        { duration: DUR, easing: EASE, fill: 'forwards' },
      );

      // The mascot rides the same curve but stays upright (offset-rotate:0).
      const juno = make(
        'z-index:71;width:40px;height:40px;offset-rotate:0deg;' +
          'filter:drop-shadow(0 0 9px rgba(252,252,251,.5));' +
          'will-change:offset-distance,transform,opacity;',
        JUNO_SVG,
      );
      const anim = juno.animate(
        [
          { offset: 0, offsetDistance: '0%', transform: 'scale(.5)', opacity: 0 },
          { offset: 0.16, offsetDistance: '5%', transform: 'scale(1)', opacity: 1 },
          { offset: 0.82, offsetDistance: '86%', transform: 'scale(.92)', opacity: 1 },
          { offset: 1, offsetDistance: '100%', transform: 'scale(.34)', opacity: 0 },
        ],
        { duration: DUR, easing: EASE, fill: 'forwards' },
      );
      anim.onfinish = done;
    } else {
      // Fallback: a plain smooth glide of the mascot, no streak.
      const mx = dx * 0.5;
      const my = dy * 0.5 - Math.min(180, Math.max(90, Math.abs(dx) * 0.34 + 80));
      const T = (m: string, s: string) => `translate(-50%,-50%) ${m} ${s}`;
      const juno = document.createElement('div');
      juno.className = 'fly-token';
      juno.setAttribute('aria-hidden', 'true');
      juno.style.cssText =
        `position:fixed;left:${sx}px;top:${sy}px;margin:0;z-index:71;width:40px;height:40px;` +
        'pointer-events:none;filter:drop-shadow(0 0 9px rgba(252,252,251,.5));' +
        'will-change:transform,opacity;';
      juno.innerHTML = JUNO_SVG;
      document.body.appendChild(juno);
      spawned.push(juno);
      const anim = juno.animate(
        [
          { offset: 0, transform: T('translate(0,0)', 'scale(.5)'), opacity: 0 },
          { offset: 0.16, transform: T('translate(0,0)', 'scale(1)'), opacity: 1 },
          { offset: 0.5, transform: T(`translate(${mx}px,${my}px)`, 'scale(1)'), opacity: 1 },
          { offset: 1, transform: T(`translate(${dx}px,${dy}px)`, 'scale(.34)'), opacity: 0 },
        ],
        { duration: DUR, easing: EASE, fill: 'forwards' },
      );
      anim.onfinish = done;
    }

    // Safety net: if animations are paused (e.g. the tab is backgrounded) and
    // never fire onfinish, guarantee cleanup + pulse still happen.
    setTimeout(done, DUR + 350);
  }

  protected skip(): void {
    if (!this.canSkip()) return;
    this.go(1);
  }

  /** Jump back to a specific question from the recap. */
  protected editFrom(step: number): void {
    if (this.animating()) return;
    this.dir.set(-1);
    this.animating.set(true);
    this.err.set('');
    this.step.set(step);
    setTimeout(() => this.animating.set(false), this.rm ? 0 : 300);
  }

  protected togglePreview(): void {
    this.previewOpen.update((v) => !v);
    // Opening the drawer means the update has been seen — clear the cue.
    if (this.previewOpen()) this.previewUnseen.set(false);
  }

  protected toggleConsent(): void {
    this.consent.update((v) => !v);
    if (this.consent()) this.err.set('');
  }

  private validate(): boolean {
    const s = this.current();
    if (!s.required) return true;
    const d = this.data();
    if (s.kind === 'text' && !d.nom.trim()) {
      this.err.set(this.tr('Dites-nous juste votre nom'));
      return false;
    }
    if (s.kind === 'email') {
      const email = d.email.trim();
      if (!email) {
        this.err.set(this.tr('On a besoin d’un email pour vous répondre'));
        return false;
      }
      if (!EMAIL_RE.test(email)) {
        this.err.set(this.tr('Cet email a l’air incomplet'));
        return false;
      }
    }
    if ((s.kind === 'single' || s.kind === 'cards') && s.key && !this.stringVal(s.key)) {
      this.err.set(this.tr('Choisissez une option'));
      return false;
    }
    return true;
  }

  /* ---------- keyboard ---------- */
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (this.done() || this.resumeAvailable()) return;
    const active = document.activeElement as HTMLElement | null;
    const inArea = !!active && active.classList.contains('bigarea');
    const inField = !!active && /INPUT|TEXTAREA/.test(active.tagName);

    if (e.key === 'Enter') {
      if (inArea && !e.metaKey && !e.ctrlKey) return; // newline in textareas
      e.preventDefault();
      if (this.isRecap()) this.submit();
      else this.flyThenGo(this.goButtonEl());
      return;
    }
    if ((e.key === 'Backspace' || e.key === 'ArrowUp') && !inField) {
      e.preventDefault();
      this.go(-1);
      return;
    }
    if (this.isRecap()) return;
    const s = this.current();
    if (s.kind === 'single' || s.kind === 'cards') {
      const idx = this.letters.indexOf(e.key.toUpperCase());
      if (idx >= 0 && s.opts && s.opts[idx]) {
        this.selectSingle(s.opts[idx].value, true);
      }
    }
  }

  /* ---------- submit + confirmation ---------- */
  protected submit(): void {
    if (this.animating() || this.done() || this.checkingDup() || this.sending()) return;
    if (!this.requireConsent()) return;
    // Duplicate pre-check: if a request already exists for this email, let the
    // visitor decide (new project vs. link to the existing one) before sending.
    const email = this.data().email.trim();
    if (!email) {
      this.finalize(false);
      return;
    }
    this.checkingDup.set(true);
    this.lead.exists(email).subscribe((exists) => {
      this.checkingDup.set(false);
      if (exists) this.dupOpen.set(true);
      else this.finalize(false);
    });
  }

  /** Duplicate modal choices. */
  protected dupNew(): void {
    this.dupOpen.set(false);
    this.finalize(false);
  }
  protected dupCombine(): void {
    this.dupOpen.set(false);
    this.finalize(true);
  }
  protected dupCancel(): void {
    this.dupOpen.set(false);
  }

  /** Actually send the lead (after the duplicate check is resolved). */
  private finalize(combine: boolean): void {
    if (this.animating() || this.done() || this.sending()) return;
    this.combineWithExisting = combine;
    this.send();
  }

  /** Nouvelle tentative après un échec réseau : mêmes réponses, état le plus à jour. */
  protected retry(): void {
    if (this.sending() || this.done() || !this.requireConsent()) return;
    this.send();
  }

  private requireConsent(): boolean {
    if (this.consent()) return true;
    this.err.set(this.tr('Merci d’accepter l’utilisation de vos informations pour continuer.'));
    return false;
  }

  /**
   * Envoie la demande et n'affiche la confirmation qu'après un accusé de
   * réception de l'API. En cas d'échec — API Render au réveil, réseau coupé,
   * 500 — le brouillon est conservé et l'écran propose de réessayer, plutôt
   * que de remercier un prospect dont la demande n'est jamais arrivée.
   */
  private send(): void {
    this.sending.set(true);
    this.sendFailed.set(false);
    this.err.set('');
    this.lead.submit(this.buildPayload(this.combineWithExisting)).subscribe((res) => {
      this.sending.set(false);
      if (!res.ok) {
        this.sendFailed.set(true);
        this.err.set(
          this.tr(
            'L’envoi a échoué. Vos réponses sont conservées sur cet appareil — réessayez dans un instant.',
          ),
        );
        return;
      }
      this.animating.set(true);
      this.clearSaved();
      this.persistOn = false;
      this.done.set(true);
      setTimeout(() => this.burst(), this.rm ? 0 : 60);
      setTimeout(() => this.animating.set(false), this.rm ? 0 : 300);
    });
  }

  private buildPayload(combine = false): LeadPayload {
    const d = this.data();
    return {
      ...d,
      nom: d.nom.trim(),
      email: d.email.trim(),
      tel: d.tel?.trim() || undefined,
      refs: d.refs.trim(),
      message: d.message?.trim() || undefined,
      budget: d.budget || undefined,
      echeance: d.echeance || undefined,
      website: this.honeypot(),
      startedAt: this.startedAt,
      combineWithExisting: combine || undefined,
    };
  }

  private burst(): void {
    if (this.rm) return;
    const cols = ['#fcfcfb', '#e8e6e1', '#b9b5ad', '#4a4a47'];
    const pieces: Confetti[] = Array.from({ length: 70 }, (_, n) => ({
      id: ++this.uid,
      left: `${Math.random() * 100}%`,
      background: cols[n % cols.length],
      duration: `${1.6 + Math.random() * 1.8}s`,
      delay: `${Math.random() * 0.5}s`,
      rotate: `rotate(${Math.random() * 360}deg)`,
    }));
    this.confetti.set(pieces);
    setTimeout(() => this.confetti.set([]), 4200);
  }
}
