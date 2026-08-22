import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminLead, EditableLead, LeadStats, LeadStatus } from '../models/admin.model';

/** Reads, updates and deletes leads for the back office. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  getLeads(status?: LeadStatus): Observable<AdminLead[]> {
    let params = new HttpParams().set('take', '200');
    if (status) params = params.set('status', status);
    return this.http.get<AdminLead[]>('/api/leads', { params });
  }

  getLead(id: string): Observable<AdminLead> {
    return this.http.get<AdminLead>(`/api/leads/${id}`);
  }

  getStats(): Observable<LeadStats> {
    return this.http.get<LeadStats>('/api/leads/stats');
  }

  /** Update any subset of fields (status included). */
  update(id: string, patch: Partial<EditableLead>): Observable<AdminLead> {
    return this.http.patch<AdminLead>(`/api/leads/${id}`, patch);
  }

  updateStatus(id: string, status: LeadStatus): Observable<AdminLead> {
    return this.update(id, { status });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/leads/${id}`);
  }

  /** Re-send the lead emails (client recap by default). Returns the refreshed lead. */
  resendEmails(
    id: string,
    kind: 'internal' | 'client' | 'both' = 'client',
  ): Observable<{ result: { internal: boolean; client: boolean }; lead: AdminLead }> {
    const params = new HttpParams().set('kind', kind);
    return this.http.post<{ result: { internal: boolean; client: boolean }; lead: AdminLead }>(
      `/api/leads/${id}/resend`,
      {},
      { params },
    );
  }
}
