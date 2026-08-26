import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IntakeComponent } from './intake';
import { JunoLeadService, LeadResult } from '../../services/juno-lead.service';

/** Même clé que le composant : le brouillon autosauvegardé du prospect. */
const STORE_KEY = 'juno_intake_v1';

/**
 * JUNO-02 — la confirmation ne s'affiche et le brouillon ne s'efface qu'une
 * fois l'accusé de réception reçu. Sans ça, un prospect perdu ressemble à un
 * prospect reçu, et personne ne le sait.
 */
describe('IntakeComponent — envoi de la demande', () => {
  let reply: Subject<LeadResult>;
  let submit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    reply = new Subject<LeadResult>();
    submit = vi.fn(() => reply.asObservable());

    TestBed.configureTestingModule({
      imports: [IntakeComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        {
          provide: JunoLeadService,
          // Pas de doublon : le pré-contrôle se résout tout de suite et laisse passer l'envoi.
          useValue: { submit, exists: () => of(false) },
        },
      ],
    });
  });

  /** Composant amené au récapitulatif, consentement coché, brouillon sauvegardé. */
  function ready(): { fixture: ComponentFixture<IntakeComponent>; c: any } {
    const fixture = TestBed.createComponent(IntakeComponent);
    const c = fixture.componentInstance as any;
    c.data.set({ ...c.data(), nom: 'Noah', email: 'noah@example.com' });
    c.step.set(c.total);
    c.consent.set(true);
    fixture.detectChanges();
    expect(localStorage.getItem(STORE_KEY)).not.toBeNull();
    return { fixture, c };
  }

  it('n’affiche la confirmation qu’après l’accusé de réception', () => {
    const { fixture, c } = ready();
    c.submit();

    expect(c.sending()).toBe(true);
    expect(c.done()).toBe(false);

    reply.next({ ok: true, id: 'abc' });
    fixture.detectChanges();

    expect(c.done()).toBe(true);
    expect(c.sendFailed()).toBe(false);
    expect(localStorage.getItem(STORE_KEY)).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('.confirm')).not.toBeNull();
  });

  it('garde le brouillon et signale l’échec quand l’API ne répond pas', () => {
    const { fixture, c } = ready();
    c.submit();
    reply.next({ ok: false });
    fixture.detectChanges();

    expect(c.done()).toBe(false);
    expect(c.sending()).toBe(false);
    expect(c.sendFailed()).toBe(true);
    expect(c.err()).not.toBe('');
    expect(localStorage.getItem(STORE_KEY)).not.toBeNull();

    // Ce que le prospect voit : pas d'écran « Merci », un message et un bouton pour réessayer.
    const dom: HTMLElement = fixture.nativeElement;
    expect(dom.querySelector('.confirm')).toBeNull();
    expect(dom.querySelector('[role="alert"]')?.textContent).toContain('échoué');
    expect(dom.querySelector('.foot .go')?.textContent).toContain('Réessayer');
  });

  it('renvoie la demande lorsque le prospect réessaie', () => {
    const { fixture, c } = ready();
    c.submit();
    reply.next({ ok: false });

    reply = new Subject<LeadResult>();
    c.retry();
    expect(submit).toHaveBeenCalledTimes(2);

    reply.next({ ok: true, id: 'abc' });
    fixture.detectChanges();

    expect(c.done()).toBe(true);
    expect(localStorage.getItem(STORE_KEY)).toBeNull();
  });
});
