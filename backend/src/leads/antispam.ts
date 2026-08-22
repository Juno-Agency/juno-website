/**
 * Fail-safe spam heuristics for the public intake form. Pure and side-effect
 * free so it's easy to test. A real user never trips these:
 *  - `website` is a honeypot rendered off-screen — only bots fill it;
 *  - `startedAt` is the client timestamp of when the form opened — a submission
 *    faster than a human could complete the multi-step wizard is a bot.
 * When either fires, the caller drops the lead but still answers 201 so the bot
 * can't tell it was rejected.
 */
export function isBotSubmission(input: {
  website?: string;
  startedAt?: number;
  now: number;
  minFillMs: number;
}): boolean {
  const { website, startedAt, now, minFillMs } = input;
  if (website && website.trim().length > 0) return true;
  if (typeof startedAt === 'number' && Number.isFinite(startedAt)) {
    const elapsed = now - startedAt;
    // Only reject a plausible-but-too-fast submission; ignore absent/garbage
    // timestamps (fail open) so a real user is never blocked.
    if (elapsed >= 0 && elapsed < minFillMs) return true;
  }
  return false;
}
