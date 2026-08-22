import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { prefersReducedMotion } from '../../utils/reduced-motion';
import { blobPath, eyeOffset } from './blob';
import { MascotFrame, PointerTracker } from './pointer-tracker';
import { SPRING_REST, Spring, springStep } from './spring';

/** Resting deformation of the body, as a fraction of its radius. */
const AMP_IDLE = 0.025;
/** Extra deformation added while hovered. */
const AMP_HOVER = 0.03;
/** Furthest the pupils travel from their resting spot, in viewBox units. */
const GAZE_MAX = 2.2;
/** Distance (px) at which the gaze reaches that maximum. */
const GAZE_REACH = 320;
/** The face drifts with the gaze, but only a little — enough to read as a head turn. */
const FACE_FOLLOW = 0.3;
/** Seconds between blinks, randomised in [BLINK_MIN, BLINK_MIN + BLINK_SPREAD]. */
const BLINK_MIN = 4;
const BLINK_SPREAD = 3;
const BLINK_DUR = 0.14;
/** How fast the body sinks into the squash while held down. */
const PRESS_SPEED = 22;
/** How far the click squashes the body: 1 = fully compressed. */
const POP_SQUASH = 0.22;
const POP_WIDEN = 0.18;
/** Extra wobble while the body is still ringing. */
const POP_AMP = 0.05;
const EYE_L_X = 24.5;
const EYE_R_X = 39.5;
const EYE_Y = 30;

/**
 * The JUNO mascot: a wobbling body whose eyes follow the pointer.
 *
 * Everything is written straight to the DOM from a shared rAF loop rather than
 * through bindings — sixty change-detection passes a second for a decorative
 * logo would be wasteful, and the component has no reactive state to render.
 */
@Component({
  selector: 'juno-mascot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      #svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      (pointerenter)="hovered = true"
      (pointerleave)="hovered = false"
      (pointerdown)="onPress()"
      (pointerup)="onRelease()"
    >
      <ellipse #shadow cx="32" cy="58" rx="15" ry="3" fill="rgba(0,0,0,0.30)" />
      <g #char>
        <path #body [attr.d]="restPath" fill="#fcfcfb" />
        <g #face>
          <g #eyeL>
            <circle [attr.cx]="EYE_L_X" [attr.cy]="EYE_Y" r="3.1" fill="#141414" />
            <circle cx="25.4" cy="30.6" r="1.15" fill="#fcfcfb" />
          </g>
          <g #eyeR>
            <circle [attr.cx]="EYE_R_X" [attr.cy]="EYE_Y" r="3.1" fill="#141414" />
            <circle cx="40.4" cy="30.6" r="1.15" fill="#fcfcfb" />
          </g>
          <path
            d="M24 41 Q32 48 40 41"
            stroke="#141414"
            stroke-width="2.6"
            fill="none"
            stroke-linecap="round"
          />
        </g>
      </g>
    </svg>
  `,
  styles: `
    /* Sizing belongs to the parent, which styles <juno-mascot> itself — the
       <svg> lives in this component's template and is out of reach of the
       parent's encapsulated rules. */
    :host {
      display: inline-block;
      width: 40px;
      height: 40px;
      line-height: 0;
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
      /* the float lifts the character past the viewBox */
      overflow: visible;
    }
  `,
})
export class JunoMascot {
  protected readonly EYE_L_X = EYE_L_X;
  protected readonly EYE_R_X = EYE_R_X;
  protected readonly EYE_Y = EYE_Y;
  protected readonly restPath = blobPath(0, 0);

  protected hovered = false;

  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');
  private readonly shadow = viewChild.required<ElementRef<SVGEllipseElement>>('shadow');
  private readonly char = viewChild.required<ElementRef<SVGGElement>>('char');
  private readonly body = viewChild.required<ElementRef<SVGPathElement>>('body');
  private readonly face = viewChild.required<ElementRef<SVGGElement>>('face');
  private readonly eyeL = viewChild.required<ElementRef<SVGGElement>>('eyeL');
  private readonly eyeR = viewChild.required<ElementRef<SVGGElement>>('eyeR');

  private hover = 0;
  private pressed = false;
  private pop: Spring = { value: 0, velocity: 0 };
  private gazeX = 0;
  private gazeY = 0;
  private blinkIn = BLINK_MIN + Math.random() * BLINK_SPREAD;
  private blinkLeft = 0;
  private rect: DOMRect | null = null;

  /** Sink into the squash and stay there for as long as the press lasts. */
  protected onPress(): void {
    this.pressed = true;
    // A blink sells the impact — it reads as a flinch.
    this.blinkLeft = BLINK_DUR;
    this.blinkIn = BLINK_MIN + Math.random() * BLINK_SPREAD;
  }

  /**
   * Let go: the spring takes over from wherever the squash got to and rings
   * down. Bound to the window as well as the element, so releasing the button
   * somewhere else doesn't leave the mascot stuck flat.
   */
  protected readonly onRelease = () => {
    this.pressed = false;
  };

  private readonly invalidateRect = () => {
    this.rect = null;
  };

  constructor() {
    const tracker = inject(PointerTracker);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (prefersReducedMotion()) return;

      let unsubscribe: (() => void) | null = null;
      const stop = () => {
        unsubscribe?.();
        unsubscribe = null;
      };
      // Nothing animates off-screen: a mascot in the footer costs nothing
      // while the visitor is reading the hero.
      const io = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) unsubscribe ??= tracker.subscribe(this.frame);
        else stop();
      });
      io.observe(this.svg().nativeElement);

      addEventListener('scroll', this.invalidateRect, { passive: true });
      addEventListener('resize', this.invalidateRect, { passive: true });
      addEventListener('pointerup', this.onRelease);
      addEventListener('pointercancel', this.onRelease);

      destroyRef.onDestroy(() => {
        io.disconnect();
        stop();
        removeEventListener('scroll', this.invalidateRect);
        removeEventListener('resize', this.invalidateRect);
        removeEventListener('pointerup', this.onRelease);
        removeEventListener('pointercancel', this.onRelease);
      });
    });
  }

  private readonly frame = (f: MascotFrame) => {
    // Exponential smoothing, frame-rate independent.
    const ease = (current: number, target: number, speed: number) =>
      current + (target - current) * Math.min(1, f.dt * speed);

    this.hover = ease(this.hover, this.hovered ? 1 : 0, 8);

    if (this.pressed) {
      // Held down: ease into the squash, no spring, and hold it there.
      this.pop = { value: ease(this.pop.value, -1, PRESS_SPEED), velocity: 0 };
    } else if (this.pop.value !== 0 || this.pop.velocity !== 0) {
      const next = springStep(this.pop, f.dt);
      this.pop =
        Math.abs(next.value) < SPRING_REST && Math.abs(next.velocity) < SPRING_REST
          ? { value: 0, velocity: 0 }
          : next;
    }
    const pop = this.pop.value;

    this.body().nativeElement.setAttribute(
      'd',
      blobPath(f.t, AMP_IDLE + AMP_HOVER * this.hover + POP_AMP * Math.abs(pop)),
    );

    let targetX = 0;
    let targetY = 0;
    if (f.hasPointer) {
      // Measured on the <svg>, which never moves — the body carries a
      // per-frame transform and would report a drifting box.
      this.rect ??= this.svg().nativeElement.getBoundingClientRect();
      const { x, y } = eyeOffset(
        f.px - (this.rect.left + this.rect.width / 2),
        f.py - (this.rect.top + this.rect.height / 2),
        GAZE_MAX + 0.6 * this.hover,
        GAZE_REACH + 100 * this.hover,
      );
      targetX = x;
      targetY = y;
    }
    this.gazeX = ease(this.gazeX, targetX, 9);
    this.gazeY = ease(this.gazeY, targetY, 9);

    this.blinkIn -= f.dt;
    if (this.blinkIn <= 0) {
      this.blinkLeft = BLINK_DUR;
      this.blinkIn = BLINK_MIN + Math.random() * BLINK_SPREAD;
    }
    let lid = 1;
    if (this.blinkLeft > 0) {
      this.blinkLeft -= f.dt;
      const p = 1 - Math.max(0, this.blinkLeft) / BLINK_DUR;
      lid = 1 - 0.94 * Math.sin(p * Math.PI);
    }

    // Float: the whole character rises, the shadow stays on the ground.
    const lift = -1.5 + 1.5 * Math.cos(f.t * 1.85) + 1.2 * this.hover;
    const up = -lift / 3;
    const sx = 1 + 0.05 * this.hover - POP_WIDEN * pop;
    const sy = 1 - 0.06 * this.hover + POP_SQUASH * pop;
    this.char().nativeElement.setAttribute(
      'transform',
      `translate(0 ${lift.toFixed(2)}) translate(32 60) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-32 -60)`,
    );

    const shadow = this.shadow().nativeElement;
    shadow.setAttribute('rx', (15 - 2.4 * up).toFixed(2));
    shadow.setAttribute('fill', `rgba(0,0,0,${(0.3 - 0.1 * up).toFixed(3)})`);

    const fx = (this.gazeX * FACE_FOLLOW).toFixed(3);
    const fy = (this.gazeY * FACE_FOLLOW).toFixed(3);
    this.face().nativeElement.setAttribute('transform', `translate(${fx} ${fy})`);

    const gx = this.gazeX.toFixed(3);
    const gy = this.gazeY.toFixed(3);
    const k = lid.toFixed(3);
    this.eyeL()
      .nativeElement.setAttribute(
        'transform',
        `translate(${gx} ${gy}) translate(${EYE_L_X} ${EYE_Y}) scale(1 ${k}) translate(${-EYE_L_X} ${-EYE_Y})`,
      );
    this.eyeR()
      .nativeElement.setAttribute(
        'transform',
        `translate(${gx} ${gy}) translate(${EYE_R_X} ${EYE_Y}) scale(1 ${k}) translate(${-EYE_R_X} ${-EYE_Y})`,
      );
  };
}
