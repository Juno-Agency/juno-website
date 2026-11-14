import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { BillingService } from '../../services/billing.service';
import {
  AdminSubscription,
  BillingStatus,
  SUBSCRIPTION_SOURCE_LABEL,
  SUBSCRIPTION_STATUS_META,
  isBilling,
  monthlyValue,
} from '../../models/billing.model';
import { formatEuros } from '../../utils/pricing';

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Back-office list of the Stripe subscriptions. Read-only: refunds,
 * cancellations and invoices are handled in the Stripe dashboard, which each
 * row links to.
 */
@Component({
  selector: 'app-admin-subscriptions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-subscriptions.html',
  styleUrl: './admin-subscriptions.scss',
})
export class AdminSubscriptionsComponent implements OnInit {
  private readonly api = inject(BillingService);

  protected readonly eur = formatEuros;
  protected readonly sourceLabel = SUBSCRIPTION_SOURCE_LABEL;

  protected readonly subscriptions = signal<AdminSubscription[]>([]);
  protected readonly status = signal<BillingStatus | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly billing = computed(() => this.subscriptions().filter(isBilling));

  /** Monthly recurring revenue of the live subscriptions, annual ones ÷ 12. */
  protected readonly mrr = computed(() =>
    this.billing()
      .filter((s) => s.livemode)
      .reduce((sum, s) => sum + monthlyValue(s), 0),
  );

  /** What is missing on the API for payments to work, in plain words. */
  protected readonly setupWarning = computed(() => {
    const s = this.status();
    if (!s) return '';
    if (!s.checkout) {
      return 'Stripe n’est pas configuré sur l’API (STRIPE_SECRET_KEY) : le bouton « S’abonner » de /tarifs renvoie vers le formulaire.';
    }
    if (!s.webhook) {
      return 'Le webhook Stripe n’est pas configuré (STRIPE_WEBHOOK_SECRET) : les paiements passent, mais les abonnements n’apparaissent pas ici.';
    }
    return s.livemode ? '' : 'Stripe est en mode test : aucun paiement réel n’est encaissé.';
  });

  ngOnInit(): void {
    forkJoin({ subscriptions: this.api.subscriptions(), status: this.api.status() }).subscribe({
      next: ({ subscriptions, status }) => {
        this.subscriptions.set(subscriptions);
        this.status.set(status);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les abonnements.');
        this.loading.set(false);
      },
    });
  }

  protected meta(s: AdminSubscription): { label: string; color: string } {
    return SUBSCRIPTION_STATUS_META[s.status] ?? { label: s.status, color: '#b9b5ad' };
  }

  protected date(iso: string | null): string {
    return iso ? dateFmt.format(new Date(iso)) : '—';
  }

  /** "Renouvellement le 14 déc. 2026" / "Se termine le …" / "Résilié le …". */
  protected nextStep(s: AdminSubscription): string {
    if (s.status === 'canceled') return `Résilié le ${this.date(s.canceledAt)}`;
    if (!s.currentPeriodEnd) return '';
    return `${s.cancelAtPeriodEnd ? 'Se termine le' : 'Renouvellement le'} ${this.date(s.currentPeriodEnd)}`;
  }

  protected stripeUrl(s: AdminSubscription): string {
    return `https://dashboard.stripe.com/${s.livemode ? '' : 'test/'}subscriptions/${s.stripeSubscriptionId}`;
  }

  protected siteHref(site: string): string {
    return /^https?:\/\//i.test(site) ? site : `https://${site}`;
  }
}
