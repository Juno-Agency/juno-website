import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { prefersReducedMotion } from '../../utils/reduced-motion';

interface Sector {
  label: string;
  reply: string;
  echo: string;
  hero: string;
  url: string;
}

/** Omit that distributes over a union, preserving each variant's own keys. */
type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

type ChatItem =
  | { id: number; kind: 'typing' }
  | { id: number; kind: 'juno'; html: string }
  | { id: number; kind: 'user'; text: string }
  | { id: number; kind: 'replies'; nudge: boolean }
  | { id: number; kind: 'gen'; url: string; hero: string; ready: boolean }
  | { id: number; kind: 'cta' };

const SECTORS: Record<string, Sector> = {
  fleur: {
    label: 'Fleuriste',
    reply: 'Fleuriste à Lyon — élégant, avec une boutique en ligne.',
    echo: 'Élégant, chaleureux, une boutique. Je vous dessine ça.',
    hero: 'Vos bouquets, livrés avec soin.',
    url: 'atelier-floral.fr',
  },
  resto: {
    label: 'Restaurant',
    reply: 'Un restaurant — je veux la carte et les réservations.',
    echo: 'Convivial, la carte, les réservations en ligne. C’est parti.',
    hero: 'Une table qu’on réserve d’un clic.',
    url: 'chez-marius.fr',
  },
  artisan: {
    label: 'Artisan',
    reply: 'Menuisier — montrer mes réalisations et un devis.',
    echo: 'Vos réalisations mises en valeur, un devis simple. Je m’en occupe.',
    hero: 'Vos réalisations, mises en valeur.',
    url: 'bois-et-cie.fr',
  },
};

@Component({
  selector: 'app-hero-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './hero-chat.html',
  styleUrl: './hero-chat.scss',
})
export class HeroChatComponent implements AfterViewInit, OnDestroy {
  protected readonly heroIn = signal(false);
  protected readonly items = signal<ChatItem[]>([]);
  protected readonly parallax = signal('');
  protected readonly magnet = signal('');

  protected readonly sectorKeys = Object.keys(SECTORS);
  protected sectorLabel(key: string): string {
    return SECTORS[key].label;
  }

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly rm = prefersReducedMotion();
  private alive = true;
  private uid = 0;
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private resolveChoice: ((key: string) => void) | null = null;
  private nudgeTimer: ReturnType<typeof setTimeout> | null = null;

  ngAfterViewInit(): void {
    // Headline + left column reveal immediately (not on scroll).
    // On the server (prerender), reveal statically and skip the browser-only
    // chat engine (timers, requestAnimationFrame).
    if (!this.isBrowser) {
      this.heroIn.set(true);
      return;
    }
    requestAnimationFrame(() => this.heroIn.set(true));
    void this.run();
  }

  ngOnDestroy(): void {
    this.alive = false;
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    if (this.nudgeTimer) clearTimeout(this.nudgeTimer);
  }

  /* ---------- parallax + magnetic (pointer-driven) ---------- */
  onParallax(e: PointerEvent, stage: HTMLElement): void {
    if (this.rm) return;
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    this.parallax.set(`translate(${x * 16}px, ${y * 16}px)`);
  }
  resetParallax(): void {
    this.parallax.set('');
  }
  onMagnet(e: PointerEvent, btn: HTMLElement): void {
    if (this.rm) return;
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    this.magnet.set(`translate(${x * 0.18}px, ${y * 0.28}px)`);
  }
  resetMagnet(): void {
    this.magnet.set('');
  }

  /* ---------- chat engine ---------- */
  protected onReply(key: string): void {
    if (this.resolveChoice) {
      const r = this.resolveChoice;
      this.resolveChoice = null;
      if (this.nudgeTimer) clearTimeout(this.nudgeTimer);
      this.setNudge(false);
      this.removeKind('replies');
      r(key);
    }
  }

  private wait(ms: number): Promise<void> {
    const d = this.rm ? Math.min(ms, 200) : ms;
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        this.timers.delete(t);
        resolve();
      }, d);
      this.timers.add(t);
    });
  }

  private push(item: DistributiveOmit<ChatItem, 'id'>): ChatItem {
    const full = { ...item, id: ++this.uid } as ChatItem;
    this.items.update((list) => {
      const next = [...list, full];
      // Mirror the mockup: keep the thread to its 9 most recent items.
      while (next.length > 9) next.shift();
      return next;
    });
    return full;
  }

  private removeId(id: number): void {
    this.items.update((list) => list.filter((it) => it.id !== id));
  }
  private removeKind(kind: ChatItem['kind']): void {
    this.items.update((list) => list.filter((it) => it.kind !== kind));
  }

  private async typing(ms: number): Promise<void> {
    const t = this.push({ kind: 'typing' });
    await this.wait(ms);
    this.removeId(t.id);
  }

  private async juno(html: string, delay = 850): Promise<void> {
    await this.typing(delay);
    if (!this.alive) return;
    this.push({ kind: 'juno', html });
  }

  private choose(): Promise<string> {
    return new Promise((resolve) => {
      this.push({ kind: 'replies', nudge: false });
      this.resolveChoice = resolve;
      // Re-animate the buttons periodically to invite a click.
      const arm = (delay: number) => {
        this.nudgeTimer = setTimeout(() => {
          if (!this.resolveChoice) return;
          this.setNudge(true);
          this.nudgeTimer = setTimeout(() => {
            this.setNudge(false);
            arm(16000);
          }, 1100);
        }, delay);
      };
      arm(17000);
    });
  }

  private setNudge(on: boolean): void {
    this.items.update((list) =>
      list.map((it) => (it.kind === 'replies' ? { ...it, nudge: on } : it)),
    );
  }

  private async gen(s: Sector): Promise<void> {
    const card = this.push({
      kind: 'gen',
      url: s.url,
      hero: s.hero,
      ready: false,
    });
    await this.wait(1600);
    if (!this.alive) return;
    this.items.update((list) =>
      list.map((it) =>
        it.id === card.id && it.kind === 'gen' ? { ...it, ready: true } : it,
      ),
    );
  }

  private async run(): Promise<void> {
    if (this.rm) {
      this.push({ kind: 'juno', html: 'Bonjour, je suis <b>JUNO</b>.' });
      this.push({ kind: 'juno', html: 'Dites-moi ce que vous faites.' });
      const s = SECTORS['fleur'];
      this.push({ kind: 'user', text: s.reply });
      await this.gen(s);
      return;
    }

    while (this.alive) {
      this.items.set([]);
      await this.juno('Bonjour, je suis <b>JUNO</b> — votre studio web.', 650);
      if (!this.alive) return;
      await this.juno('Dites-moi en une phrase ce que vous faites.', 950);
      if (!this.alive) return;

      const key = await this.choose();
      if (!this.alive) return;
      const s = SECTORS[key];

      await this.wait(300);
      this.push({ kind: 'user', text: s.reply });
      await this.wait(650);
      await this.juno(s.echo, 1000);
      if (!this.alive) return;
      await this.juno('Je vous prépare une première maquette…', 900);
      if (!this.alive) return;
      await this.gen(s);
      if (!this.alive) return;
      await this.wait(450);
      await this.juno('Voilà. On l’affine ensemble et on met en ligne ?', 1050);
      if (!this.alive) return;
      this.push({ kind: 'cta' });
      await this.wait(5400);
    }
  }
}
