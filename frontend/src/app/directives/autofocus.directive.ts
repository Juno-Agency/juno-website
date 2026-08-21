import {
  AfterViewInit,
  Directive,
  ElementRef,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { prefersReducedMotion } from '../utils/reduced-motion';

/**
 * Focuses the host once it enters the view. Re-fires every time the element is
 * recreated (e.g. on each intake step). Waits for the entrance animation to
 * settle, unless reduced motion is requested.
 */
@Directive({
  selector: '[appAutofocus]',
})
export class AutofocusDirective implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    const el = this.host.nativeElement;
    if (prefersReducedMotion()) {
      el.focus();
    } else {
      setTimeout(() => el.focus(), 420);
    }
  }
}
