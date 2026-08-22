import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/** Existing-site answer. */
export type ExistingSite = 'refaire' | 'aucun';

/** Kind of site requested. */
export type SiteType = 'Site vitrine' | 'Boutique en ligne' | 'Application web';

/**
 * The full intake payload sent to the JUNO API.
 * Mirrors the backend Zod schema (`backend/src/leads/lead.schema.ts`).
 */
export interface LeadPayload {
  nom: string;
  email: string;
  tel?: string;
  secteur: string;
  existant: ExistingSite | '';
  type: SiteType | '';
  pages: string[];
  styles: string[];
  refs: string;
  colors: string[];
  budget?: string;
  echeance?: string;
  message?: string;
  /** Honeypot — always empty for real users; a filled value flags a bot. */
  website?: string;
  /** ms timestamp of when the form was opened (bot-speed detection). */
  startedAt?: number;
}

export interface LeadResult {
  ok: boolean;
  id?: string;
}

/** Base path for the API. In Docker/prod, nginx proxies /api → backend. */
const API_BASE = '/api';

/**
 * Sends intake submissions to the backend. Designed as the single extension
 * point: swap the transport here without touching the form component.
 */
@Injectable({ providedIn: 'root' })
export class JunoLeadService {
  private readonly http = inject(HttpClient);

  submit(payload: LeadPayload): Observable<LeadResult> {
    // Always keep a console trace — useful in dev and if the API is offline.
    console.log('[JUNO] lead submitted', payload);

    return this.http.post<{ id: string }>(`${API_BASE}/leads`, payload).pipe(
      map((res) => ({ ok: true, id: res.id })),
      catchError((err) => {
        console.error('[JUNO] lead submit failed', err);
        // The mockup always shows the confirmation screen; we degrade
        // gracefully so a backend hiccup never blocks the user.
        return of({ ok: false });
      }),
    );
  }
}
