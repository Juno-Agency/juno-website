import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { SeoService } from './seo.service';

@Component({ template: '' })
class Page {}

describe('SeoService', () => {
  let router: Router;
  let meta: Meta;

  const content = (selector: string) => meta.getTag(selector)?.content;

  beforeEach(() => {
    // Le document est partagé entre les tests : on repart de balises vierges.
    document.head.innerHTML = '';
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'a', title: 'Titre A', data: { description: 'Description A' }, component: Page },
          { path: 'b', title: 'Titre B', data: { description: 'Description B' }, component: Page },
          { path: 'admin', title: 'Back-office', component: Page },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    meta = TestBed.inject(Meta);
    TestBed.inject(SeoService).init();
  });

  it('aligne og:title sur le titre de la page, pas sur celui de la précédente', async () => {
    await router.navigateByUrl('/a');
    expect(content('property="og:title"')).toBe('Titre A');

    await router.navigateByUrl('/b');
    expect(content('property="og:title"')).toBe('Titre B');
    expect(content('name="twitter:title"')).toBe('Titre B');
  });

  it('pose description et og:url propres à la page', async () => {
    await router.navigateByUrl('/b?utm_source=x');
    expect(content('name="description"')).toBe('Description B');
    expect(content('property="og:description"')).toBe('Description B');
    expect(content('property="og:url"')).toBe('https://agency-juno.com/b');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://agency-juno.com/b',
    );
  });

  it('ne touche pas aux pages sans description', async () => {
    await router.navigateByUrl('/a');
    await router.navigateByUrl('/admin');
    expect(content('property="og:title"')).toBe('Titre A');
  });
});
