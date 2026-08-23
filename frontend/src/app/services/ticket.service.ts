import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Ticket, TicketDraft, TicketStatus } from '../models/ticket.model';

/** Backlog interne du back-office. Toutes les routes exigent le JWT admin. */
@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly http = inject(HttpClient);

  list(status?: TicketStatus): Observable<Ticket[]> {
    let params = new HttpParams().set('take', '200');
    if (status) params = params.set('status', status);
    return this.http.get<Ticket[]>('/api/tickets', { params });
  }

  create(draft: TicketDraft): Observable<Ticket> {
    return this.http.post<Ticket>('/api/tickets', draft);
  }

  update(id: string, patch: Partial<TicketDraft>): Observable<Ticket> {
    return this.http.patch<Ticket>(`/api/tickets/${id}`, patch);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/tickets/${id}`);
  }
}
