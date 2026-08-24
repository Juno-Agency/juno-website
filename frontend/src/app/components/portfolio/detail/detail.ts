import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { I18nService } from '../../../i18n/i18n.service';
import { PortfolioItem } from '../../../models/portfolio.model';

/**
 * The foreground view of one project: a blurred backdrop, an empty seat on
 * the left that the carousel glides the lifted card into, and the project's
 * copy on the right.
 *
 * Visibility is driven directly on the DOM by the carousel (`show` / `setOpen`
 * / `hide`) so it can measure the seat the very frame it appears — the copy
 * itself goes through normal bindings, its fade hides the one-tick delay.
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
  private readonly close = viewChild.required<ElementRef<HTMLButtonElement>>('close');

  /** Render the overlay (still transparent) so the seat can be measured. */
  show(): void {
    this.root().nativeElement.hidden = false;
  }

  /** Fade the backdrop and copy in (`true`) or out (`false`). */
  setOpen(open: boolean): void {
    this.root().nativeElement.classList.toggle('open', open);
  }

  hide(): void {
    this.root().nativeElement.hidden = true;
  }

  focusClose(): void {
    this.close().nativeElement.focus();
  }

  /** Viewport box of the seat the lifted card glides into. */
  slotRect(): DOMRect {
    return this.slot().nativeElement.getBoundingClientRect();
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
