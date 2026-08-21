import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
} from '@angular/core';
import { prefersReducedMotion } from '../utils/reduced-motion';

/**
 * Adds the `in` class when the host scrolls into view, then stops observing.
 * Pair with the global `.r` helper (or section-specific `.in` styles) to
 * trigger entrance animations. Honours prefers-reduced-motion by revealing
 * immediately.
 */
@Directive({
  selector: '[appReveal]',
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      el.classList.add('in');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
    );
    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
