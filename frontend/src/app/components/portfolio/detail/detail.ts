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
  output,
  viewChild,
} from '@angular/core';
import { I18nService } from '../../../i18n/i18n.service';
import { PortfolioItem } from '../../../models/portfolio.model';

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The foreground view of one project: a blurred backdrop, a slot on the left
 * (on top, on phones) that the carousel glides the lifted card into, and the
 * project's copy beside it.
 *
 * The slot holds a *seat* — an in-flow copy of the card's image. While the
 * card flies in and out the carousel animates its own fixed clone; once it
 * has landed the seat takes over, so the image scrolls with the copy on
 * phones and swipes have an element to drag.
 *
 * Visibility is driven directly on the DOM by the carousel (`show` / `setOpen`
 * / `hide` / `showSeat`) so it can measure the slot the very frame it appears —
 * the copy itself goes through normal bindings, its fade hides the one-tick delay.
 */
@Component({
  selector: 'app-portfolio-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class PortfolioDetailComponent {
  readonly item = input<PortfolioItem | null>(null);
  readonly index = input(0);
  readonly total = input(0);

  readonly closed = output<void>();
  readonly prev = output<void>();
  readonly next = output<void>();

  protected readonly tr = inject(I18nService).tr;

  protected readonly count = computed(() => `${pad(this.index() + 1)} / ${pad(this.total())}`);

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly slot = viewChild.required<ElementRef<HTMLElement>>('slot');
  private readonly seat = viewChild<ElementRef<HTMLElement>>('seat');
  private readonly close = viewChild.required<ElementRef<HTMLButtonElement>>('close');

  constructor() {
    // The page sections sit in their own stacking contexts (z-index 2, above
    // the grain), which would trap this overlay below the fixed nav. Moving
    // the root node to <body> keeps bindings, listeners and scoped styles
    // intact while putting z-index 60 back in the root context.
    const doc = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const root = this.root().nativeElement;
      doc.body.appendChild(root);
      destroyRef.onDestroy(() => root.remove());
    });
  }

  /** Render the overlay (still transparent) so the slot can be measured. */
  show(): void {
    this.root().nativeElement.hidden = false;
  }

  /** Fade the backdrop and copy in (`true`) or out (`false`). */
  setOpen(open: boolean): void {
    this.root().nativeElement.classList.toggle('open', open);
  }

  hide(): void {
    const root = this.root().nativeElement;
    root.hidden = true;
    root.scrollTop = 0;
  }

  focusClose(): void {
    this.close().nativeElement.focus();
  }

  /** Viewport box of the slot the lifted card glides into. */
  slotRect(): DOMRect {
    return this.slot().nativeElement.getBoundingClientRect();
  }

  /** The seat element (present once an item is set), for swipes. */
  seatEl(): HTMLElement | null {
    return this.seat()?.nativeElement ?? null;
  }

  /** Viewport box of the seat — where the card sits right now. */
  seatRect(): DOMRect {
    return (this.seat()?.nativeElement ?? this.slot().nativeElement).getBoundingClientRect();
  }

  /** Place the seat inside the slot (box relative to the slot). */
  fitSeat(box: Box): void {
    const el = this.seat()?.nativeElement;
    if (!el) return;
    el.style.left = `${box.left}px`;
    el.style.top = `${box.top}px`;
    el.style.width = `${box.width}px`;
    el.style.height = `${box.height}px`;
  }

  /** Reveal the seat once the flying card has landed on it (and hide it again before take-off). */
  showSeat(on: boolean): void {
    this.seat()?.nativeElement.classList.toggle('on', on);
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
