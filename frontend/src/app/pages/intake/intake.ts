import {
  animate,
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
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { JunoLeadService, LeadPayload } from '../../core/juno-lead.service';
import { prefersReducedMotion } from '../../core/reduced-motion';
import { AutofocusDirective } from '../../shared/autofocus.directive';
import { GrainVignetteComponent } from '../../shared/fx/grain-vignette';
import { LETTERS, QUESTIONS, SWATCHES, emptyLead } from './intake.data';
import { DataKey } from './intake.model';

interface Confetti {
  id: number;
  left: string;
  background: string;
  duration: string;
  delay: string;
  rotate: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

@Component({
  selector: 'app-intake',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GrainVignetteComponent, AutofocusDirective],
  templateUrl: './intake.html',
  styleUrl: './intake.scss',
  animations: [
    trigger('panelAnim', [
      transition(':enter', [
        query(
          '.qnum, .qtitle, .qsub, .qbody, .errwrap, .foot, .confirm',
          [
            style({ opacity: 0, transform: 'translateY(16px)' }),
            stagger(80, [
              animate(
                '600ms cubic-bezier(.16,1,.3,1)',
                style({ opacity: 1, transform: 'translateY(0)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
      transition(':leave', [
        animate(
          '280ms ease',
          style({ opacity: 0, transform: 'translateY(-18px)' }),
        ),
      ]),
    ]),
  ],
})
export class IntakeComponent {
  private readonly lead = inject(JunoLeadService);

  protected readonly rm = prefersReducedMotion();
  protected readonly letters = LETTERS;
  protected readonly swatches = SWATCHES;
  protected readonly questions = QUESTIONS;
  protected readonly total = QUESTIONS.length;

  protected readonly step = signal(0);
  protected readonly data = signal<LeadPayload>(emptyLead());
  protected readonly err = signal('');
  protected readonly done = signal(false);
  protected readonly confetti = signal<Confetti[]>([]);

  private readonly animating = signal(false);
  private uid = 0;

  protected readonly current = computed(() => this.questions[this.step()]);
  protected readonly progress = computed(() =>
    this.done() ? 100 : Math.round((this.step() / this.total) * 100),
  );
  protected readonly stepLabel = computed(() =>
    String(this.step() + 1).padStart(2, '0'),
  );
  protected readonly totalLabel = String(this.total).padStart(2, '0');
  protected readonly isLast = computed(() => this.step() === this.total - 1);

  protected readonly glowTransform = computed(() => {
    if (this.rm) return 'translate(-50%, -50%)';
    const shift = this.done() ? 0 : this.step() % 2 ? 60 : -60;
    return `translate(-50%, -50%) translateX(${shift}px)`;
  });

  protected readonly firstName = computed(
    () => this.data().nom.trim().split(' ')[0] || 'à vous',
  );

  /** "A/B/C" hint for the current choice screen. */
  protected hintLetters(): string {
    const opts = this.current().opts ?? [];
    return opts
      .slice(0, 3)
      .map((_, n) => this.letters[n])
      .join('/');
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
      setTimeout(() => this.go(1), 260);
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
    if (dir > 0 && !this.validate()) return;
    if (dir > 0 && this.isLast()) {
      this.finish();
      return;
    }
    const next = Math.max(0, Math.min(this.total - 1, this.step() + dir));
    if (next === this.step()) return;
    this.animating.set(true);
    this.err.set('');
    this.step.set(next);
    setTimeout(() => this.animating.set(false), this.rm ? 0 : 300);
  }

  private validate(): boolean {
    const s = this.current();
    if (!s.required) return true;
    const d = this.data();
    if (s.kind === 'text' && !d.nom.trim()) {
      this.err.set('Dites-nous juste votre nom 🙂');
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
    if (this.done()) return;
    const active = document.activeElement as HTMLElement | null;
    const inArea = !!active && active.classList.contains('bigarea');
    const inField = !!active && /INPUT|TEXTAREA/.test(active.tagName);

    if (e.key === 'Enter') {
      if (inArea && !e.metaKey && !e.ctrlKey) return; // newline in textareas
      e.preventDefault();
      this.go(1);
      return;
    }
    if ((e.key === 'Backspace' || e.key === 'ArrowUp') && !inField) {
      e.preventDefault();
      this.go(-1);
      return;
    }
    const s = this.current();
    if (s.kind === 'single' || s.kind === 'cards') {
      const idx = this.letters.indexOf(e.key.toUpperCase());
      if (idx >= 0 && s.opts && s.opts[idx]) {
        this.selectSingle(s.opts[idx].value, true);
      }
    }
  }

  /* ---------- submit + confirmation ---------- */
  private finish(): void {
    this.animating.set(true);
    const payload: LeadPayload = this.buildPayload();
    this.lead.submit(payload).subscribe();
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
