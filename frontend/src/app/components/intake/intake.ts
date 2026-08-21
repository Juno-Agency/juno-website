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

@Component({
  selector: 'app-intake',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GrainVignetteComponent, AutofocusDirective],
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
  ],
})
export class IntakeComponent {
  private readonly lead = inject(JunoLeadService);

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
    if (q.key && map[q.key]) return map[q.key];
    if (q.kind === 'refs') return 'Références';
    return q.key ?? '—';
  }

  private recapValue(i: number, d: LeadPayload): string {
    const q = this.questions[i];
    const dash = '—';
    if (q.kind === 'refs') {
      const parts: string[] = [];
      if (d.refs.trim()) parts.push(d.refs.trim());
      if (d.colors.length) parts.push(`${d.colors.length} couleur${d.colors.length > 1 ? 's' : ''}`);
      return parts.length ? parts.join(' · ') : dash;
    }
    if (q.key === 'email') {
      const e = d.email.trim();
      return e ? (d.tel?.trim() ? `${e} · ${d.tel.trim()}` : e) : dash;
    }
    if (q.key === 'existant') {
      return d.existant === 'refaire'
        ? 'Oui, à refaire'
        : d.existant === 'aucun'
          ? 'Aucun pour l’instant'
          : dash;
    }
    if (!q.key) return dash;
    const v = d[q.key];
    if (Array.isArray(v)) return v.length ? v.join(', ') : dash;
    return typeof v === 'string' && v.trim() ? v : dash;
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
  protected go(dir: number): void {
    if (this.animating() || this.done()) return;
    if (dir > 0 && !this.isRecap() && !this.validate()) return;
    const next = Math.max(0, Math.min(this.total, this.step() + dir));
    if (next === this.step()) return;
    this.dir.set(dir >= 0 ? 1 : -1);
    this.animating.set(true);
    this.err.set('');
    this.step.set(next);
    setTimeout(() => this.animating.set(false), this.rm ? 0 : 300);
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
      this.err.set('Dites-nous juste votre nom');
      return false;
    }
    if (s.kind === 'email') {
      const email = d.email.trim();
      if (!email) {
        this.err.set('On a besoin d’un email pour vous répondre');
        return false;
      }
      if (!EMAIL_RE.test(email)) {
        this.err.set('Cet email a l’air incomplet');
        return false;
      }
    }
    if ((s.kind === 'single' || s.kind === 'cards') && s.key && !this.stringVal(s.key)) {
      this.err.set('Choisissez une option');
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
      else this.go(1);
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
    if (this.animating() || this.done()) return;
    if (!this.consent()) {
      this.err.set('Merci d’accepter l’utilisation de vos informations pour continuer.');
      return;
    }
    this.animating.set(true);
    const payload: LeadPayload = this.buildPayload();
    this.lead.submit(payload).subscribe();
    this.clearSaved();
    this.persistOn = false;
    this.done.set(true);
    setTimeout(() => this.burst(), this.rm ? 0 : 60);
    setTimeout(() => this.animating.set(false), this.rm ? 0 : 300);
  }

  private buildPayload(): LeadPayload {
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
