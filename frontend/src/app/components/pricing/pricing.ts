import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GrainVignetteComponent } from '../grain-vignette/grain-vignette';
import { NavComponent } from '../nav/nav';
import { CtaFinalComponent } from '../cta-final/cta-final';
import { JunoMascot } from '../../shared/juno-mascot/juno-mascot';
import { PeriodSwitchComponent } from '../../shared/period-switch/period-switch';
import { I18nService } from '../../i18n/i18n.service';
import { PlanService } from '../../services/plan.service';
import { BillingPeriod, Plan, SUBSCRIPTION_DISCUSS } from '../../models/plan.model';
import { PlanPrice, annualSaving, formatEuros, planPrice } from '../../utils/pricing';

interface PlanCard {
  plan: Plan;
  price: PlanPrice;
  /** "2 mois offerts" on the annual view, when the yearly price earns it. */
  saving: string;
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Public pricing page — the subscription plans managed in the back-office,
 * with an annual / monthly switch (annual by default).
 */
@Component({
  selector: 'app-pricing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    GrainVignetteComponent,
    NavComponent,
    CtaFinalComponent,
    JunoMascot,
    PeriodSwitchComponent,
  ],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class PricingComponent implements OnInit {
  protected readonly tr = inject(I18nService).tr;
  private readonly api = inject(PlanService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly discuss = SUBSCRIPTION_DISCUSS;
  protected readonly eur = formatEuros;

  protected readonly period = signal<BillingPeriod>('annuel');
  protected readonly plans = signal<Plan[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  protected readonly cards = computed<PlanCard[]>(() =>
    this.plans().map((plan) => ({
      plan,
      price: planPrice(plan, this.period()),
      saving: this.period() === 'annuel' ? this.savingLabel(plan) : '',
    })),
  );

  /** Best annual saving across plans, shown on the switch ("jusqu'à −17 %"). */
  protected readonly bestSaving = computed(() =>
    Math.max(0, ...this.plans().map((p) => annualSaving(p))),
  );

  ngOnInit(): void {
    // Prices change from the back-office without a rebuild, so they are only
    // fetched in the browser; the prerendered page ships the loading state.
    if (!this.isBrowser) return;
    this.api.list().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      },
    });
  }

  protected setPeriod(p: BillingPeriod): void {
    this.period.set(p);
  }

  /** "Les 2 premiers mois" / "Jusqu'au 31 mars 2027" under a promo price. */
  protected promoNote(card: PlanCard): string {
    const promo = card.price.promo;
    if (!promo) return '';
    const parts: string[] = [];
    if (promo.months) {
      parts.push(
        promo.months === 1
          ? this.tr('le premier mois')
          : `${this.tr('les')} ${promo.months} ${this.tr('premiers mois')}`,
      );
      parts.push(`${this.tr('puis')} ${formatEuros(card.price.base)}${this.tr('/mois')}`);
    }
    if (promo.endsAt) {
      parts.push(`${this.tr('offre valable jusqu’au')} ${dateFmt.format(new Date(promo.endsAt))}`);
    }
    return parts.join(', ');
  }

  private savingLabel(plan: Plan): string {
    const free = plan.monthlyPrice > 0 ? (plan.monthlyPrice * 12 - plan.annualPrice) / plan.monthlyPrice : 0;
    if (free >= 1 && Math.abs(free - Math.round(free)) < 0.05) {
      const n = Math.round(free);
      return `${n} ${this.tr(n > 1 ? 'mois offerts' : 'mois offert')}`;
    }
    const pct = annualSaving(plan);
    return pct > 0 ? `−${pct} %` : '';
  }
}
