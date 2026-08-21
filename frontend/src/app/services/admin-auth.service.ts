import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const TOKEN_KEY = 'juno_admin_token';

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Back-office authentication: holds the JWT and exposes auth state. */
@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(readToken());
  readonly isAuthenticated = computed(() => !!this.token());

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<{ token: string }>('/api/auth/login', { email, password })
      .pipe(
        map((res) => {
          this.setToken(res.token);
          return true;
        }),
      );
  }

  logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    this.token.set(null);
  }

  private setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
    this.token.set(token);
  }
}
