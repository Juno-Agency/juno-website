import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { I18nService, LANGS, Lang } from '../../i18n/i18n.service';

/**
 * Language dropdown with flags — same UI on desktop and mobile. The button
 * shows the current flag + code; clicking opens a menu of FR / EN / DE. The
 * menu is position:fixed and anchored via measured coordinates, so it is never
 * clipped by the rail's horizontal-scroll overflow or the nav.
 */
@Component({
  selector: 'app-lang-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      #ddbtn
      type="button"
      class="langdd-btn"
      [class.open]="open()"
      [attr.aria-expanded]="open()"
      aria-haspopup="menu"
      [attr.aria-label]="current().full"
      (click)="toggle(ddbtn)"
    >
      <span class="fl">{{ current().flag }}</span>
      <span class="cd">{{ current().label }}</span>
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    @if (open()) {
      <button class="langdd-backdrop" type="button" (click)="close()" aria-hidden="true" tabindex="-1"></button>
      <div class="langdd-menu" role="menu" [style]="menuStyle()">
        @for (l of langs; track l.code) {
          <button
            type="button"
            class="langdd-item"
            role="menuitemradio"
            [class.on]="i18n.lang() === l.code"
            [attr.aria-checked]="i18n.lang() === l.code"
            (click)="pick(l.code)"
          >
            <span class="fl">{{ l.flag }}</span>
            <span class="nm">{{ l.full }}</span>
            @if (i18n.lang() === l.code) {
              <svg class="chk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
                <path d="M5 12l4 4L19 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            }
          </button>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .fl {
        font-size: 13px;
        line-height: 1;
        font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
      }

      .langdd-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        appearance: none;
        border: 1px solid var(--line);
        background: rgba(252, 252, 251, 0.03);
        color: var(--cream);
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.06em;
        line-height: 1;
        padding: 8px 11px;
        border-radius: 100px;
        transition: border-color 0.2s, background 0.2s;
      }
      .langdd-btn .chev {
        width: 13px;
        height: 13px;
        color: var(--muted);
        transition: transform 0.2s;
      }
      .langdd-btn.open .chev {
        transform: rotate(180deg);
      }
      .langdd-btn.open,
      .langdd-btn:hover {
        border-color: var(--muted);
        background: rgba(252, 252, 251, 0.06);
      }

      .langdd-backdrop {
        position: fixed;
        inset: 0;
        z-index: 79;
        border: none;
        background: transparent;
        padding: 0;
      }
      .langdd-menu {
        z-index: 80;
        min-width: 150px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 6px;
        background: var(--bg2);
        border: 1px solid var(--line);
        border-radius: 12px;
        box-shadow: 0 24px 50px -22px rgba(0, 0, 0, 0.9);
        animation: langdd-in 0.16s cubic-bezier(0.2, 0.8, 0.3, 1) both;
      }
      @keyframes langdd-in {
        from {
          opacity: 0;
          transform: translateY(-6px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
      .langdd-item {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        text-align: left;
        appearance: none;
        border: none;
        background: transparent;
        color: var(--muted);
        font-family: var(--sans);
        font-size: 14px;
        font-weight: 500;
        padding: 9px 11px;
        border-radius: 8px;
        transition: background 0.15s, color 0.15s;
      }
      .langdd-item .nm {
        flex: 1;
      }
      .langdd-item .chk {
        width: 15px;
        height: 15px;
        color: var(--cream);
      }
      .langdd-item:hover {
        background: rgba(252, 252, 251, 0.06);
        color: var(--cream);
      }
      .langdd-item.on {
        color: var(--cream);
      }

      @media (prefers-reduced-motion: reduce) {
        .langdd-menu {
          animation: none;
        }
      }
    `,
  ],
})
export class LangSwitcherComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly langs = LANGS;
  protected readonly open = signal(false);
  protected readonly menuStyle = signal<Record<string, string>>({});
  protected readonly current = computed(
    () => LANGS.find((l) => l.code === this.i18n.lang()) ?? LANGS[0],
  );

  protected toggle(btn: HTMLElement): void {
    if (this.open()) {
      this.open.set(false);
      return;
    }
    // Anchor the fixed menu under the button's right edge.
    const r = btn.getBoundingClientRect();
    this.menuStyle.set({
      position: 'fixed',
      top: `${Math.round(r.bottom + 8)}px`,
      right: `${Math.round(window.innerWidth - r.right)}px`,
    });
    this.open.set(true);
  }

  protected pick(code: Lang): void {
    this.i18n.setLang(code);
    this.open.set(false);
  }

  protected close(): void {
    this.open.set(false);
  }
}
