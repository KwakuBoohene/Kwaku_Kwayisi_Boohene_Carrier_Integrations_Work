import { z } from "zod";

const baseField = {
  key: z.string(),
  label: z.string(),
  required: z.boolean(),
  showIf: z.object({ field: z.string(), includes: z.string() }).optional(),
};

const formFieldSchema = z.discriminatedUnion("type", [
  z.object({ ...baseField, type: z.literal("text"), pattern: z.string().optional() }),
  z.object({ ...baseField, type: z.literal("email") }),
  z.object({ ...baseField, type: z.literal("tel") }),
  z.object({
    ...baseField, type: z.literal("date"), format: z.string(),
    validation: z.object({ minAge: z.number().optional() }).optional(),
  }),
  z.object({
    ...baseField, type: z.literal("select"),
    options: z.union([z.array(z.string()), z.array(z.number())]),
  }),
  z.object({ ...baseField, type: z.literal("multiselect"), options: z.array(z.string()) }),
  z.object({ ...baseField, type: z.literal("number"), min: z.number().optional() }),
  z.object({ ...baseField, type: z.literal("boolean") }),
]);

export const carrierFormSchema = z.object({
  carrier: z.string(),
  product: z.string(),
  fields: z.array(formFieldSchema),
});

export type FormField = z.infer<typeof formFieldSchema>;
export type CarrierForm = z.infer<typeof carrierFormSchema>;
export type AnswerValue = string | number | boolean | string[];
export type FormAnswers = Partial<Record<string, AnswerValue>>;

// A prefilled pet answer can be useful without being complete.
export interface PreparedAnswers {
  answers: FormAnswers;
  missingFields: string[];
}
