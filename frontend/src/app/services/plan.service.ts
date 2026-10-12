import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ComparisonRow, Plan, PlanDraft } from '../models/plan.model';

/** Public read + back-office CRUD for subscription plans. */
@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly http = inject(HttpClient);

  /** Public: published plans, in display order. */
  list(): Observable<Plan[]> {
    return this.http.get<Plan[]>('/api/plans');
  }

  /** Back-office: every plan, including unpublished ones. */
  listAll(): Observable<Plan[]> {
    return this.http.get<Plan[]>('/api/plans/admin');
  }

  create(draft: PlanDraft): Observable<Plan> {
    return this.http.post<Plan>('/api/plans', draft);
  }

  update(id: string, patch: Partial<PlanDraft>): Observable<Plan> {
    return this.http.patch<Plan>(`/api/plans/${id}`, patch);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/plans/${id}`);
  }

  /** Public: rows of the comparison table, in display order. */
  comparison(): Observable<ComparisonRow[]> {
    return this.http.get<ComparisonRow[]>('/api/plans/comparison');
  }

  /** Back-office: replace the whole comparison table. */
  saveComparison(rows: ComparisonRow[]): Observable<ComparisonRow[]> {
    return this.http.put<ComparisonRow[]>('/api/plans/comparison', rows);
  }
}
