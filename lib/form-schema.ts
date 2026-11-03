interface BaseField {
  key: string;
  label: string;
  required: boolean;
  showIf?: { field: string; includes: string };
}

export type FormField = BaseField & (
  | { type: "text"; pattern?: string }
  | { type: "email" | "tel" }
  | { type: "date"; format: string; validation?: { minAge?: number } }
  | { type: "select"; options: string[] | number[] }
  | { type: "multiselect"; options: string[] }
  | { type: "number"; min?: number }
  | { type: "boolean" }
);

export interface CarrierForm {
  carrier: string;
  product: string;
  fields: FormField[];
}

export type AnswerValue = string | number | boolean | string[];
export type FormAnswers = Partial<Record<string, AnswerValue>>;

// A prefilled pet answer can be useful without being complete.
export interface PreparedAnswers {
  answers: FormAnswers;
  missingFields: string[];
}
