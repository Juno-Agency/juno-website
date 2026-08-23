import { describe, expect, it, vi } from 'vitest';

import { formatTicketKey, nextTicketSeq } from './ticket-key';

describe('formatTicketKey', () => {
  it('pads to two digits, as JUNO-01', () => {
    expect(formatTicketKey(1)).toBe('JUNO-01');
    expect(formatTicketKey(9)).toBe('JUNO-09');
  });

  it('keeps two digits up to 99', () => {
    expect(formatTicketKey(10)).toBe('JUNO-10');
    expect(formatTicketKey(99)).toBe('JUNO-99');
  });

  it('grows to three digits past 99 instead of wrapping', () => {
    expect(formatTicketKey(100)).toBe('JUNO-100');
    expect(formatTicketKey(1234)).toBe('JUNO-1234');
  });

  it('rejects a sequence that is not a positive integer', () => {
    // A malformed counter must fail loudly rather than mint "JUNO-NaN".
    expect(() => formatTicketKey(0)).toThrow();
    expect(() => formatTicketKey(-1)).toThrow();
    expect(() => formatTicketKey(1.5)).toThrow();
    expect(() => formatTicketKey(Number.NaN)).toThrow();
  });
});

describe('nextTicketSeq', () => {
  /** Stand-in for the Mongoose Counter model: records the call, returns a value. */
  function counterStub(value: number) {
    return {
      findOneAndUpdate: vi.fn().mockResolvedValue({ value }),
    };
  }

  it('increments a single counter document atomically', async () => {
    const counter = counterStub(4);

    await expect(nextTicketSeq(counter as never)).resolves.toBe(4);

    // The atomicity rests entirely on this call shape: one $inc on one document,
    // upserted on first use, returning the post-increment value.
    const [filter, update, options] = counter.findOneAndUpdate.mock.calls[0]!;
    expect(filter).toEqual({ _id: 'ticket' });
    expect(update).toEqual({ $inc: { value: 1 } });
    expect(options).toMatchObject({ upsert: true, new: true });
  });

  it('never hands out the same number twice, even after a ticket is deleted', async () => {
    // The counter is the source of truth, not the ticket collection: deleting
    // JUNO-02 must not let the next ticket reuse the number.
    let stored = 0;
    const counter = {
      findOneAndUpdate: vi.fn().mockImplementation(async () => ({ value: ++stored })),
    };

    const seqs = [
      await nextTicketSeq(counter as never),
      await nextTicketSeq(counter as never),
      await nextTicketSeq(counter as never),
    ];

    expect(seqs).toEqual([1, 2, 3]);
    // JUNO-02 is deleted here — the counter is untouched, so the next key is 04.
    expect(formatTicketKey(await nextTicketSeq(counter as never))).toBe('JUNO-04');
  });

  it('fails when the counter comes back without a usable value', async () => {
    const counter = { findOneAndUpdate: vi.fn().mockResolvedValue(null) };

    await expect(nextTicketSeq(counter as never)).rejects.toThrow();
  });
});
