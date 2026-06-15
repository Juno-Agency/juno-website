import { LEAD_STATUS } from './lead.schema';

export interface StatsInput {
  status: string;
  type: string;
  secteur: string;
  budget: string | null;
  createdAt: Date;
}

interface CountPair {
  label: string;
  count: number;
}

const DAY = 86_400_000;

function tally(values: string[]): CountPair[] {
  const map = new Map<string, number>();
  for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/** Aggregates raw leads into the metrics shown in the back-office. */
export function buildStats(leads: StatsInput[], now: Date = new Date()) {
  const total = leads.length;

  const byStatus: Record<string, number> = {};
  for (const s of LEAD_STATUS) byStatus[s] = 0;
  for (const l of leads) byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;

  const signedQuotes = byStatus['WON'] ?? 0;
  const sentQuotes = byStatus['QUOTED'] ?? 0;
  const lostQuotes = byStatus['LOST'] ?? 0;
  const decided = signedQuotes + lostQuotes;

  const conversionRate = total ? signedQuotes / total : 0;
  const signatureRate = decided ? signedQuotes / decided : 0;

  const last30Days = leads.filter(
    (l) => now.getTime() - l.createdAt.getTime() <= 30 * DAY,
  ).length;

  // Weekly timeline over the last 8 weeks (Monday-aligned).
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  const dow = (monday.getDay() + 6) % 7; // 0 = Monday
  monday.setDate(monday.getDate() - dow);

  const timeline: { period: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(monday);
    start.setDate(monday.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const count = leads.filter(
      (l) => l.createdAt >= start && l.createdAt < end,
    ).length;
    const label = `${String(start.getDate()).padStart(2, '0')}/${String(
      start.getMonth() + 1,
    ).padStart(2, '0')}`;
    timeline.push({ period: label, count });
  }

  return {
    total,
    last30Days,
    byStatus,
    byType: tally(leads.map((l) => l.type)),
    bySecteur: tally(leads.map((l) => l.secteur)),
    byBudget: tally(leads.map((l) => l.budget ?? 'Non renseigné')),
    sentQuotes,
    signedQuotes,
    lostQuotes,
    conversionRate,
    signatureRate,
    timeline,
  };
}
