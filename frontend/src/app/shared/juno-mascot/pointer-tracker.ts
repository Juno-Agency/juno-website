import { Injectable } from '@angular/core';

/** One animation frame, handed to every subscribed mascot. */
export interface MascotFrame {
  /** Seconds since the loop started. */
  readonly t: number;
  /** Seconds since the previous frame, clamped so tab switches don't jump. */
  readonly dt: number;
  /** Last known pointer position, in viewport coordinates. */
  readonly px: number;
  readonly py: number;
  /** False until the visitor has actually moved a pointer (touch, mobile). */
  readonly hasPointer: boolean;
}

type Subscriber = (frame: MascotFrame) => void;

/**
 * A single `pointermove` listener and a single `requestAnimationFrame` loop
 * shared by every mascot on the page — four instances should not mean four
 * listeners and four loops. The loop only runs while at least one mascot is
 * subscribed and the tab is visible.
 */
@Injectable({ providedIn: 'root' })
export class PointerTracker {
  private readonly subscribers = new Set<Subscriber>();
  private raf = 0;
  private started = 0;
  private last = 0;
  private px = 0;
  private py = 0;
  private hasPointer = false;
  private listening = false;

  private readonly onPointerMove = (e: PointerEvent) => {
    this.px = e.clientX;
    this.py = e.clientY;
    this.hasPointer = true;
  };

  private readonly onVisibility = () => {
    if (document.hidden) this.stop();
    else this.start();
  };

  /** Registers a mascot. The returned function unregisters it. */
  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    this.listen();
    this.start();
    return () => {
      this.subscribers.delete(fn);
      if (this.subscribers.size === 0) this.stop();
    };
  }

  private listen(): void {
    if (this.listening) return;
    this.listening = true;
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  private start(): void {
    if (this.raf || this.subscribers.size === 0 || document.hidden) return;
    this.last = 0;
    this.raf = requestAnimationFrame(this.tick);
  }

  private stop(): void {
    if (!this.raf) return;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private readonly tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick);
    if (!this.started) this.started = now;
    const t = (now - this.started) / 1000;
    // A backgrounded tab resumes with a huge gap; cap it so nothing snaps.
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0.016;
    this.last = now;
    const frame: MascotFrame = {
      t,
      dt,
      px: this.px,
      py: this.py,
      hasPointer: this.hasPointer,
    };
    for (const fn of this.subscribers) fn(frame);
  };
}
