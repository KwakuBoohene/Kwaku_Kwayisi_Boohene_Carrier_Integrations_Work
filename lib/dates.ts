import { z } from "zod";

export const calendarDateSchema = z.iso.date().refine(value => !value.startsWith("0000"));

export function parseCalendarDate(value: string) {
  const result = calendarDateSchema.safeParse(value);
  if (!result.success) return undefined;
  const [year, month, day] = result.data.split("-").map(Number);
  return { year, month, day };
}

export function requireCalendarDate(value: string) {
  const date = parseCalendarDate(value);
  if (!date) throw new RangeError(`Invalid calendar date: ${value}`);
  return date;
}
