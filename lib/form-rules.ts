import { z } from "zod";
import type { AnswerValue, FormAnswers, FormField } from "./form-schema";
import { calendarDateSchema } from "./dates";

export function isMissing(value: AnswerValue | undefined) {
  return value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0);
}

export function isFieldVisible(field: FormField, answers: FormAnswers) {
  if (!field.showIf) return true;
  const value = answers[field.showIf.field];
  return Array.isArray(value) && value.includes(field.showIf.includes);
}

function fieldAnswerSchema(field: FormField): z.ZodType<AnswerValue> {
  switch (field.type) {
    case "text":
      return field.pattern ? z.string().regex(new RegExp(field.pattern)) : z.string();
    case "email":
      return z.email();
    case "tel":
      return z.string();
    case "date":
      return calendarDateSchema;
    case "select":
      return z.union([z.string(), z.number()]).refine(value =>
        field.options.some(option => option === value));
    case "multiselect":
      return z.array(z.string().refine(value => field.options.includes(value)));
    case "number":
      return field.min === undefined ? z.number() : z.number().min(field.min);
    case "boolean":
      return z.boolean();
  }
}

export function validateField(field: FormField, answers: FormAnswers): string | undefined {
  if (!isFieldVisible(field, answers)) return undefined;
  const value = answers[field.key];
  if (isMissing(value)) return field.required ? `${field.label} is required.` : undefined;
  return fieldAnswerSchema(field).safeParse(value).success
    ? undefined : `Enter a valid ${field.label.toLowerCase()}.`;
}
