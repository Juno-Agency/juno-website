import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';
import { prefersReducedMotion } from '../core/reduced-motion';

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

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;
    if (prefersReducedMotion()) {
      el.focus();
    } else {
      setTimeout(() => el.focus(), 420);
    }
  }
}
