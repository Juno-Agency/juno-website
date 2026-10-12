import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { BillingPeriod } from '../../models/plan.model';

/**
 * Annual / monthly pill switch, shared by the pricing page and the intake
 * form's subscription step.
 */
@Component({
  selector: 'app-period-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="switch" role="radiogroup" [attr.aria-label]="tr('Facturation')">
      <button
        type="button"
        role="radio"
        class="sw-opt"
        [class.on]="value() === 'annuel'"
        [attr.aria-checked]="value() === 'annuel'"
        (click)="changed.emit('annuel')"
      >
        {{ tr('Annuel') }}
        @if (saving() > 0) {
          <span class="sw-save">{{ tr('jusqu’à') }} −{{ saving() }} %</span>
        }
      </button>
      <button
        type="button"
        role="radio"
        class="sw-opt"
        [class.on]="value() === 'mensuel'"
        [attr.aria-checked]="value() === 'mensuel'"
        (click)="changed.emit('mensuel')"
      >
        {{ tr('Mensuel') }}
      </button>
    </div>
  `,
  styleUrl: './period-switch.scss',
})
export class PeriodSwitchComponent {
  protected readonly tr = inject(I18nService).tr;

  readonly value = input.required<BillingPeriod>();
  /** Best annual saving in %, shown on the "Annuel" option when > 0. */
  readonly saving = input(0);
  readonly changed = output<BillingPeriod>();
}
