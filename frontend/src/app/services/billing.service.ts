import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminSubscription, BillingStatus } from '../models/billing.model';
import { BillingPeriod } from '../models/plan.model';

/** Stripe subscriptions: public checkout + back-office read. */
@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);

  /** Public: URL of the Stripe payment page for a plan and billing period. */
  checkout(slug: string, periode: BillingPeriod, lang: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>('/api/billing/checkout', { slug, periode, lang });
  }

  /** Back-office: subscriptions mirrored from Stripe, newest first. */
  subscriptions(): Observable<AdminSubscription[]> {
    return this.http.get<AdminSubscription[]>('/api/billing/subscriptions');
  }

  /** Back-office: is Stripe configured on the API? */
  status(): Observable<BillingStatus> {
    return this.http.get<BillingStatus>('/api/billing/status');
  }
}
