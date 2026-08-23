import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PortfolioDraft, PortfolioItem } from '../models/portfolio.model';

/** Public read + back-office CRUD for portfolio projects. */
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly http = inject(HttpClient);

  /** Public: published projects, ordered for the grid. */
  list(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>('/api/portfolio');
  }

  /** Back-office: every project, including drafts. */
  listAll(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>('/api/portfolio/admin');
  }

  create(draft: PortfolioDraft): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>('/api/portfolio', draft);
  }

  update(id: string, patch: Partial<PortfolioDraft>): Observable<PortfolioItem> {
    return this.http.patch<PortfolioItem>(`/api/portfolio/${id}`, patch);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/portfolio/${id}`);
  }

  /** Upload an image file to R2, returns its public URL + storage key. */
  uploadImage(file: File): Observable<{ url: string; key: string }> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<{ url: string; key: string }>('/api/portfolio/upload', form);
  }
}
