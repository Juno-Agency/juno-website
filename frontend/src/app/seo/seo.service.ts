import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router, TitleStrategy } from '@angular/router';
import { filter } from 'rxjs';

import { canonicalUrl } from './seo';

/**
 * Métadonnées de partage et de référencement par page. Le titre vient déjà de
 * `route.title` ; la description se déclare dans `route.data.description`. Le
 * prérendu fige le résultat dans le HTML servi, c'est ce que lisent les robots
 * de LinkedIn, WhatsApp ou Slack, qui n'exécutent pas le JavaScript.
 *
 * Une route sans description (le back-office) n'est pas touchée.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly titleStrategy = inject(TitleStrategy);
  private readonly doc = inject(DOCUMENT);

  init(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.update(e.urlAfterRedirects));
  }

  private update(url: string): void {
    const description = this.leaf().data['description'] as string | undefined;
    if (!description) return;

    const canonical = canonicalUrl(url);
    // Le titre du document n'est pas encore à jour à NavigationEnd : on le
    // recalcule depuis la route, sinon og:title resterait celui de la page d'avant.
    const title = this.titleStrategy.buildTitle(this.router.routerState.snapshot) ?? '';

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.setCanonical(canonical);
  }

  private leaf(): ActivatedRouteSnapshot {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route;
  }

  private setCanonical(href: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
