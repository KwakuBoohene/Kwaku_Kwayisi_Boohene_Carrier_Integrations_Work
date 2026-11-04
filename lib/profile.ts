import { z } from "zod";
import { calendarDateSchema } from "./dates";
import { stateNames } from "./us-states";

export const customerProfileSchema = z.object({
  first_name: z.string().trim().min(1, "Enter a first name."),
  last_name: z.string().trim().min(1, "Enter a last name."),
  date_of_birth: calendarDateSchema,
  email: z.email({ error: "Enter a valid email address." }),
  state: z.string().trim().toUpperCase().refine(code => Object.hasOwn(stateNames, code), "Enter a valid two-letter US state code."),
  zip: z.string().regex(/^\d{5}$/, "Enter a five-digit ZIP code."),
  personal_property_value: z.number({ error: "Enter the value of your belongings." }).nonnegative("Property value cannot be negative."),
  has_dog: z.boolean({ error: "Select whether you have a dog." }),
  dog_breed: z.string().trim().nullable(),
  claims_last_3_years: z.number({ error: "Enter your three-year claims count." }).int("Claims must be a whole number.").nonnegative("Claims cannot be negative."),
});

export type CustomerProfile = z.infer<typeof customerProfileSchema>;
