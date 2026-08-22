import {
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TRANSLATIONS } from './translations';

export type Lang = 'fr' | 'en' | 'de';

/** Ordered list shown by the language switcher. */
export const LANGS: { code: Lang; label: string; full: string; flag: string }[] = [
  { code: 'fr', label: 'FR', full: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'EN', full: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'DE', full: 'Deutsch', flag: '🇩🇪' },
];

const STORE_KEY = 'juno_lang';
const isLang = (v: unknown): v is Lang => v === 'fr' || v === 'en' || v === 'de';

/**
 * Runtime i18n. French is the source language and doubles as the lookup key —
 * `tr('La méthode')` returns the French text as-is in FR, or the EN/DE mapping
 * otherwise. Internal data values (saved leads, palette keys, `type === …`
 * checks) stay in French and are never translated, so switching language can
 * never corrupt state.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Current language. Reactive — templates using `tr()` re-render on change. */
  readonly lang = signal<Lang>('fr');

  constructor() {
    if (this.isBrowser) {
      // Resolve the target synchronously (reads storage/navigator, no writes),
      // then apply it after hydration so the first client paint matches the
      // server (FR) and no hydration mismatch occurs.
      const target = this.detect();
      if (target !== 'fr') afterNextRender(() => this.apply(target, false));
      else this.reflect('fr');
    }
  }

  setLang(l: Lang): void {
    this.apply(l, true);
  }

  /** Translate a French source string (reactive: reads the lang signal). */
  readonly tr = (fr: string): string => {
    const l = this.lang();
    if (l === 'fr') return fr;
    return TRANSLATIONS[l]?.[fr] ?? fr;
  };

  private detect(): Lang {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (isLang(saved)) return saved;
    } catch {
      /* storage unavailable */
    }
    const nav = (this.doc.defaultView?.navigator?.language ?? 'fr')
      .slice(0, 2)
      .toLowerCase();
    return isLang(nav) ? nav : 'fr';
  }

  private apply(l: Lang, persist: boolean): void {
    this.lang.set(l);
    this.reflect(l);
    if (persist) {
      try {
        localStorage.setItem(STORE_KEY, l);
      } catch {
        /* storage unavailable */
      }
    }
  }

  private reflect(l: Lang): void {
    this.doc.documentElement.setAttribute('lang', l);
  }
}
