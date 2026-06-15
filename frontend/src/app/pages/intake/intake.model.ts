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
}
