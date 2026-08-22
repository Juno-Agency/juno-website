import { describe, expect, it } from 'vitest';
import {
  BLOB_POINTS,
  BLOB_RX,
  BLOB_RY,
  blobPath,
  blobRadius,
  eyeOffset,
} from './blob';

describe('blobRadius', () => {
  it('returns the base radius when the amplitude is zero', () => {
    for (const angle of [0, 1, 2.5, Math.PI, 5.9]) {
      expect(blobRadius(angle, 12.3, 0)).toBeCloseTo(1, 12);
    }
  });

  it('stays within the amplitude bounds', () => {
    const amp = 0.025;
    for (let t = 0; t < 40; t += 0.37) {
      for (let i = 0; i < 64; i++) {
        const r = blobRadius((i / 64) * Math.PI * 2, t, amp);
        expect(r).toBeGreaterThanOrEqual(1 - amp - 1e-9);
        expect(r).toBeLessThanOrEqual(1 + amp + 1e-9);
      }
    }
  });

  it('is seamless around the loop, so the outline never creases', () => {
    for (let t = 0; t < 10; t += 1.1) {
      expect(blobRadius(0, t, 0.05)).toBeCloseTo(blobRadius(Math.PI * 2, t, 0.05), 12);
    }
  });

  it('actually moves over time', () => {
    expect(blobRadius(1, 0, 0.05)).not.toBeCloseTo(blobRadius(1, 3, 0.05), 4);
  });
});

describe('blobPath', () => {
  it('emits one closed cubic spline per point', () => {
    const d = blobPath(0, 0.025);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    expect(d.match(/C/g)).toHaveLength(BLOB_POINTS);
  });

  it('is deterministic for a given time', () => {
    expect(blobPath(4.2, 0.025)).toBe(blobPath(4.2, 0.025));
  });

  it('keeps every coordinate finite and inside the 64-unit viewBox', () => {
    const nums = blobPath(7.7, 0.08).match(/-?\d+(\.\d+)?/g) ?? [];
    expect(nums.length).toBeGreaterThan(0);
    for (const n of nums) {
      const v = Number(n);
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(64);
    }
  });

  it('traces the reference silhouette when idle', () => {
    const [x0, y0] = (blobPath(0, 0).match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
    expect(x0).toBeCloseTo(32 + BLOB_RX, 1);
    expect(y0).toBeCloseTo(32, 1);
  });
});

describe('eyeOffset', () => {
  const MAX = 2.2;
  const REACH = 320;

  it('does not move when the pointer sits on the mascot', () => {
    expect(eyeOffset(0, 0, MAX, REACH)).toEqual({ x: 0, y: 0 });
  });

  it('never travels further than the allowed maximum', () => {
    for (const [dx, dy] of [[1000, 0], [0, -900], [700, 700], [-5000, 120]]) {
      const { x, y } = eyeOffset(dx, dy, MAX, REACH);
      expect(Math.hypot(x, y)).toBeLessThanOrEqual(MAX + 1e-9);
    }
  });

  it('saturates at full reach and stays there beyond it', () => {
    const at = eyeOffset(REACH, 0, MAX, REACH);
    const far = eyeOffset(REACH * 8, 0, MAX, REACH);
    expect(at.x).toBeCloseTo(MAX, 9);
    expect(far.x).toBeCloseTo(MAX, 9);
  });

  it('points towards the pointer', () => {
    const { x, y } = eyeOffset(-40, 30, MAX, REACH);
    expect(x).toBeLessThan(0);
    expect(y).toBeGreaterThan(0);
    expect(y / x).toBeCloseTo(30 / -40, 6);
  });

  it('reacts fast near the mascot rather than ramping linearly', () => {
    const half = eyeOffset(REACH / 2, 0, MAX, REACH).x;
    expect(half).toBeGreaterThan(MAX * 0.5);
  });
});
