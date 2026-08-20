import { LeadPayload } from '../../core/juno-lead.service';

export type QuestionKind =
  | 'text'
  | 'email'
  | 'single'
  | 'cards'
  | 'multi'
  | 'refs'
  | 'final';

/** Which field of the payload a question writes to. */
export type DataKey = keyof LeadPayload;

export interface Option {
  /** Stored value (what lands in the payload). */
  value: string;
  /** Visible label. */
  label: string;
  /** Optional right-aligned description (used by `cards`). */
  desc?: string;
}

/** A chapter grouping several questions (shown in the left rail stepper). */
export interface SectionDef {
  /** 1-based chapter number. */
  id: 1 | 2 | 3;
  /** Short label, e.g. "Vous". */
  label: string;
  /** One-line reassurance shown under the active chapter. */
  hint: string;
}

export interface Question {
  kind: QuestionKind;
  /** Primary payload field this question fills (omitted for composite screens). */
  key?: DataKey;
  /** Title — may contain inline HTML (<em>, &nbsp;). */
  q: string;
  sub?: string;
  /** Placeholder for the `text` input. */
  ph?: string;
  opts?: Option[];
  /** When true, the step blocks until answered. */
  required?: boolean;
  /** Chapter this question belongs to (1–3). */
  section: 1 | 2 | 3;
}
