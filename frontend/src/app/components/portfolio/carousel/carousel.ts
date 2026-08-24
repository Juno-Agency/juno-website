import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { prefersReducedMotion } from '../../../utils/reduced-motion';
import { PortfolioItem } from '../../../models/portfolio.model';
import { I18nService } from '../../../i18n/i18n.service';
import { PortfolioDetailComponent } from '../detail/detail';

interface Slot {
  item: PortfolioItem;
  key: string;
}

interface Tween {
  from: number;
  delta: number;
  t0: number;
  dur: number;
  done?: () => void;
}

/** A press becomes a drag only past this distance — a click never nudges the ring. */
const DEAD_ZONE = 6;
/** A release counts as a click within this distance… */
const CLICK_DIST = 10;
/** …or within this one for a quick tap. */
const TAP_DIST = 24;
const TAP_MS = 250;
/** px → degrees while dragging (gentle, matches the wide arc). */
const DRAG_GAIN = 0.16;
/** Idle drift, degrees per frame. */
const AUTO_VEL = -0.045;
/** How long the lifted card takes to glide to / from the foreground (matches the SCSS). */
const LIFT_MS = 620;
/** Horizontal drag on the open project past this distance moves to the neighbour. */
const SWIPE_DIST = 60;
/** How much of the drag the lifted card follows (resistance). */
const SWIPE_FOLLOW = 0.45;
/** Ring slots: the projects repeat to fill this many cells for a gentle curve. */
const RING_SLOTS = 18;

/**
 * A curved panoramic carousel: projects sit on a large-radius cylinder that
 * bows *towards* the viewer, so the edge cards come slightly closer and the
 * whole row reads as a gentle arc. It drifts on its own and can be dragged
 * (with release inertia); the projects repeat around the ring so it always
 * fills the width and loops seamlessly.
 *
 * Clicking a card opens the project without leaving the page: the ring spins
 * so the card sits dead centre, a fixed clone of it is placed exactly on top,
 * the real cell is hidden (its seat in the ring stays empty) and the clone
 * glides to the foreground next to the copy. Closing plays it backwards.
 *
 * Everything is written straight to the DOM from a rAF loop rather than
 * through bindings — sixty change-detection passes a second would be wasteful.
 */
@Component({
  selector: 'app-portfolio-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PortfolioDetailComponent],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class PortfolioCarouselComponent {
  readonly items = input.required<PortfolioItem[]>();

  protected readonly tr = inject(I18nService).tr;
  private readonly doc = inject(DOCUMENT);

  /** Projects repeated enough times to fill the ring. */
  protected readonly slots = computed<Slot[]>(() => {
    const list = this.items();
    if (list.length === 0) return [];
    const repeat = Math.max(1, Math.round(RING_SLOTS / list.length));
    const out: Slot[] = [];
    for (let r = 0; r < repeat; r++) {
      for (const item of list) out.push({ item, key: `${item.id}-${r}` });
    }
    return out;
  });

  /** Project shown in the foreground, `null` while the ring is free. */
  protected readonly detailItem = signal<PortfolioItem | null>(null);
  protected readonly detailIndex = computed(() => {
    const item = this.detailItem();
    return item ? this.items().indexOf(item) : 0;
  });

  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly ring = viewChild.required<ElementRef<HTMLElement>>('ring');
  private readonly detail = viewChild.required(PortfolioDetailComponent);

  // ---- ring motion ----
  private rotation = 0;
  private vel = 0;
  private step = 20; // degrees between cards
  private radius = 700;
  private cells: HTMLElement[] = [];
  private tween: Tween | null = null;
  private reduced = false;

  // ---- pointer ----
  private dragging = false;
  private moved = false;
  private lastX = 0;
  private downX = 0;
  private maxDist = 0;
  private downT = 0;
  private pointerId = -1;
  private downCell: HTMLElement | null = null;

  // ---- detail ----
  private paused = false;
  private busy = false;
  private lifted: HTMLElement | null = null;
  private ghost: HTMLElement | null = null;
  /** Horizontal distance of the current / last swipe on the open project. */
  private swipeDx = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const stage = this.stage().nativeElement;
      const ring = this.ring().nativeElement;
      this.cells = Array.from(ring.children) as HTMLElement[];
      const n = this.cells.length;
      if (n === 0) return;

      this.step = 360 / n;
      this.reduced = prefersReducedMotion();
      this.layout();

      let raf = 0;
      const frame = () => {
        this.tick();
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      const onDown = (e: PointerEvent) => {
        if (this.paused || this.tween || e.button !== 0) return;
        this.downCell = (e.target as Element).closest<HTMLElement>('.cell');
        this.downT = performance.now();
        this.maxDist = 0;
        this.pointerId = e.pointerId;
        this.dragging = true;
        this.moved = false;
        this.lastX = this.downX = e.clientX;
        this.vel = 0;
        // No pointer capture yet: a plain click must stay a plain click for the browser.
      };
      const onMove = (e: PointerEvent) => {
        if (!this.dragging) return;
        const dist = Math.abs(e.clientX - this.downX);
        this.maxDist = Math.max(this.maxDist, dist);
        if (!this.moved) {
          if (dist < DEAD_ZONE) return; // still a click — the ring does not budge
          this.moved = true;
          this.lastX = e.clientX; // the drag starts here, no jump
          stage.classList.add('grabbing');
          try {
            stage.setPointerCapture(this.pointerId); // only now do we own the pointer
          } catch {
            /* pointer already gone */
          }
        }
        const dx = e.clientX - this.lastX;
        this.lastX = e.clientX;
        const d = -dx * DRAG_GAIN; // the arc bows towards the viewer, so screen-x runs against the angle
        this.rotation += d;
        this.vel = d;
      };
      const onUp = (e: PointerEvent) => {
        if (!this.dragging) return;
        this.dragging = false;
        if (this.moved) {
          try {
            stage.releasePointerCapture(this.pointerId);
          } catch {
            /* already released */
          }
        }
        stage.classList.remove('grabbing');
        const cell = this.downCell;
        this.downCell = null;
        const quick = performance.now() - this.downT < TAP_MS;
        const isClick = this.maxDist < CLICK_DIST || (quick && this.maxDist < TAP_DIST);
        // Fallback opener: if the browser swallows the click, this still opens.
        if (e.type === 'pointerup' && isClick) this.tryOpen(cell);
      };
      // Primary opener: the browser's own click (down + up on the same cell, no drag).
      const onClick = (e: MouseEvent) => {
        const cell = (e.target as Element).closest<HTMLElement>('.cell');
        if (cell && !this.moved) this.tryOpen(cell);
      };
      const onKey = (e: KeyboardEvent) => {
        const cell = (e.target as Element).closest<HTMLElement>('.cell');
        if (cell && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          this.tryOpen(cell);
        }
      };
      const onDragStart = (e: Event) => e.preventDefault(); // never let a native drag steal the pointer
      const onDocKey = (e: KeyboardEvent) => {
        if (!this.lifted) return;
        if (e.key === 'Escape') this.closeDetail();
        else if (e.key === 'ArrowLeft') this.swap(-1);
        else if (e.key === 'ArrowRight') this.swap(1);
      };
      const onResize = () => {
        this.layout();
        if (this.ghost && this.lifted && !this.busy) {
          this.place(this.ghost, this.slotRect(this.cardOf(this.lifted).getBoundingClientRect()));
        }
      };

      // Swiping the open project: drag left / right on the lifted card or the
      // backdrop (not the copy, not the close button) to slide to the neighbour.
      // The card follows the pointer with some resistance and springs back
      // when the drag is too short.
      let swiping = false;
      let swipeX0 = 0;
      const onSwipeDown = (e: PointerEvent) => {
        if (!this.lifted || !this.ghost || this.busy || e.button !== 0) return;
        const t = e.target as Element;
        if (t.closest('.d-body, .d-close')) return;
        if (!t.closest('.detail, .ghost')) return;
        swiping = true;
        swipeX0 = e.clientX;
        this.swipeDx = 0;
        this.ghost.style.transition = 'none';
      };
      const onSwipeMove = (e: PointerEvent) => {
        if (!swiping || !this.ghost) return;
        this.swipeDx = e.clientX - swipeX0;
        const dx = this.swipeDx * SWIPE_FOLLOW;
        this.ghost.style.transform = `translateX(${dx}px) rotate(${dx * 0.02}deg)`;
      };
      const onSwipeUp = () => {
        if (!swiping) return;
        swiping = false;
        const ghost = this.ghost;
        if (!ghost) return;
        ghost.style.transition = '';
        ghost.style.transform = '';
        if (Math.abs(this.swipeDx) > SWIPE_DIST) this.swap(this.swipeDx < 0 ? 1 : -1);
      };

      stage.addEventListener('pointerdown', onDown);
      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerup', onUp);
      stage.addEventListener('pointercancel', onUp);
      stage.addEventListener('click', onClick);
      stage.addEventListener('keydown', onKey);
      stage.addEventListener('dragstart', onDragStart);
      this.doc.addEventListener('keydown', onDocKey);
      this.doc.addEventListener('pointerdown', onSwipeDown);
      this.doc.addEventListener('pointermove', onSwipeMove);
      this.doc.addEventListener('pointerup', onSwipeUp);
      this.doc.addEventListener('pointercancel', onSwipeUp);
      addEventListener('resize', onResize);

      this.render();

      destroyRef.onDestroy(() => {
        cancelAnimationFrame(raf);
        stage.removeEventListener('pointerdown', onDown);
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerup', onUp);
        stage.removeEventListener('pointercancel', onUp);
        stage.removeEventListener('click', onClick);
        stage.removeEventListener('keydown', onKey);
        stage.removeEventListener('dragstart', onDragStart);
        this.doc.removeEventListener('keydown', onDocKey);
        this.doc.removeEventListener('pointerdown', onSwipeDown);
        this.doc.removeEventListener('pointermove', onSwipeMove);
        this.doc.removeEventListener('pointerup', onSwipeUp);
        this.doc.removeEventListener('pointercancel', onSwipeUp);
        removeEventListener('resize', onResize);
        this.ghost?.remove();
        this.lockScroll(false);
      });
    });
  }

  /** Freeze the page behind an open project. `html` already carries an
   *  `overflow-x` in the global styles, so it — not `body` — owns the
   *  viewport scroll and must be locked too. */
  private lockScroll(on: boolean): void {
    const v = on ? 'hidden' : '';
    this.doc.documentElement.style.overflow = v;
    this.doc.body.style.overflow = v;
  }

  // ------------------------------------------------------------------ ring

  /** Size the portrait cards (~5 across) and derive the cylinder radius so
   *  neighbours sit edge to edge along a gentle arc. */
  private layout(): void {
    const stage = this.stage().nativeElement;
    const cellW = Math.min(300, Math.max(150, stage.clientWidth / 5.2));
    const cellH = Math.min(stage.clientHeight * 0.92, cellW * 1.34);
    stage.style.setProperty('--cell-w', `${cellW}px`);
    stage.style.setProperty('--cell-h', `${cellH}px`);
    const gap = 16;
    this.radius = (cellW + gap) / (2 * Math.tan((this.step * Math.PI) / 360));
    // Cells face inward from a cylinder whose axis sits *in front* of the
    // ring, so the edges bow towards the viewer.
    this.cells.forEach((cell, i) => {
      cell.style.transform = `rotateY(${i * this.step}deg) translateZ(${-this.radius}px)`;
    });
  }

  /** Apply the ring rotation and a light depth dimming each frame. */
  private render(): void {
    const ring = this.ring().nativeElement;
    ring.style.transform = `translateZ(${this.radius}px) rotateY(${this.rotation}deg)`;
    const rad = Math.PI / 180;
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      if (cell === this.lifted) continue; // hidden while it is in the foreground
      const c = Math.cos((this.rotation + i * this.step) * rad);
      const front = (c + 1) / 2; // 0..1
      cell.style.visibility = c < 0.05 ? 'hidden' : 'visible';
      cell.style.opacity = (0.5 + 0.5 * front).toFixed(3);
      cell.style.filter = `brightness(${(0.8 + 0.2 * front).toFixed(3)})`;
    }
  }

  private tick(): void {
    const tw = this.tween;
    if (tw) {
      const t = Math.min(1, (performance.now() - tw.t0) / tw.dur);
      const k = 1 - Math.pow(1 - t, 3);
      this.rotation = tw.from + tw.delta * k;
      if (t >= 1) {
        this.tween = null;
        this.render();
        tw.done?.();
      }
    } else if (!this.paused && !this.dragging) {
      if (Math.abs(this.vel) > Math.abs(AUTO_VEL) + 0.001) {
        this.rotation += this.vel;
        this.vel *= 0.95;
      } else if (!this.reduced) {
        this.vel += (AUTO_VEL - this.vel) * 0.02;
        this.rotation += this.vel;
      }
    }
    this.render();
  }

  /** Spin the ring to `target` degrees the short way round. */
  private spinTo(target: number, done?: () => void): void {
    const delta = ((((target - this.rotation) % 360) + 540) % 360) - 180;
    if (this.reduced) {
      this.rotation += delta;
      this.render();
      done?.();
      return;
    }
    this.tween = {
      from: this.rotation,
      delta,
      t0: performance.now(),
      dur: 200 + Math.min(500, Math.abs(delta) * 5),
      done,
    };
  }

  // ---------------------------------------------------------------- detail

  private tryOpen(cell: HTMLElement | null): void {
    if (!cell || this.paused || this.tween || this.lifted || this.busy) return;
    this.vel = 0;
    this.openDetail(cell);
  }

  private cardOf(cell: HTMLElement): HTMLElement {
    return cell.querySelector<HTMLElement>('.card')!;
  }

  private place(
    el: HTMLElement,
    r: { left: number; top: number; width: number; height: number },
  ): void {
    el.style.left = `${r.left}px`;
    el.style.top = `${r.top}px`;
    el.style.width = `${r.width}px`;
    el.style.height = `${r.height}px`;
  }

  /** Where the ghost ends up: fitted inside the detail's seat, keeping the card's aspect. */
  private slotRect(card: DOMRect): { left: number; top: number; width: number; height: number } {
    const s = this.detail().slotRect();
    const k = Math.min(s.width / card.width, s.height / card.height);
    const w = card.width * k;
    const h = card.height * k;
    return {
      left: s.left + (s.width - w) / 2,
      top: s.top + (s.height - h) / 2,
      width: w,
      height: h,
    };
  }

  private openDetail(cell: HTMLElement): void {
    this.busy = true;
    this.paused = true;
    this.dragging = false;
    const stage = this.stage().nativeElement;
    stage.classList.add('frozen');
    const i = this.cells.indexOf(cell);
    this.detailItem.set(this.slots()[i].item);

    this.spinTo(-i * this.step, () => {
      const card = this.cardOf(cell);
      const from = card.getBoundingClientRect();
      const ghost = card.cloneNode(true) as HTMLElement;
      ghost.classList.add('ghost');
      this.place(ghost, from);
      this.doc.body.appendChild(ghost);
      this.ghost = ghost;
      this.lifted = cell;
      cell.style.visibility = 'hidden';

      const detail = this.detail();
      detail.show();
      this.lockScroll(true);
      ghost.getBoundingClientRect(); // commit the start position before transitioning
      requestAnimationFrame(() => {
        detail.setOpen(true);
        ghost.classList.add('fore');
        this.place(ghost, this.slotRect(from));
        const settle = () => {
          this.busy = false;
          detail.focusClose();
        };
        this.reduced ? settle() : setTimeout(settle, LIFT_MS);
      });
    });
  }

  private closeDetail(then?: () => void): void {
    if (this.busy || !this.lifted || !this.ghost) return;
    this.busy = true;
    const cell = this.lifted;
    const ghost = this.ghost;
    const detail = this.detail();
    detail.setOpen(false);
    ghost.classList.remove('fore');
    this.place(ghost, this.cardOf(cell).getBoundingClientRect()); // the ring has not moved

    const done = () => {
      ghost.remove();
      this.ghost = null;
      this.lifted = null;
      cell.style.visibility = '';
      this.render();
      detail.hide();
      this.lockScroll(false);
      this.stage().nativeElement.classList.remove('frozen');
      this.busy = false;
      if (then) {
        then();
      } else {
        this.paused = false;
        this.detailItem.set(null);
        cell.focus({ preventScroll: true });
      }
    };
    this.reduced ? done() : setTimeout(done, LIFT_MS);
  }

  /** Prev / next = the card sitting to the left / right of this one in the
   *  ring: send this card home, spin one notch, lift the neighbour. Screen-x
   *  shrinks as the cell index grows (the arc bows towards the viewer). */
  private swap(dir: -1 | 1): void {
    if (this.busy || !this.lifted) return;
    const n = this.cells.length;
    const i = this.cells.indexOf(this.lifted);
    const j = (i - dir + n) % n;
    this.closeDetail(() => this.openDetail(this.cells[j]));
  }

  /** Backdrop / close button. A swipe that ended on the backdrop is not a click. */
  protected onClose(): void {
    if (Math.abs(this.swipeDx) > DEAD_ZONE) {
      this.swipeDx = 0;
      return;
    }
    this.closeDetail();
  }
  protected onPrev(): void {
    this.swap(-1);
  }
  protected onNext(): void {
    this.swap(1);
  }
}
