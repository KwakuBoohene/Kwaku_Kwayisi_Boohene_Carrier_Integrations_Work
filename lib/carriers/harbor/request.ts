import type { FormAnswers } from "@/lib/form-schema";
import { validateField } from "@/lib/form-rules";
import { harborForm } from "./definition";

export interface HarborQuoteRequest {
  applicant_full_name: string;
  date_of_birth: string;
  contact_email: string;
  phone: string;
  residence_state: string;
  postal_code: string;
  contents_coverage: number;
  pets: string[];
  dog_breed?: string;
  claims_last_5_years: number;
  building_has_sprinklers?: boolean;
}

// Harbor's JSON supplies the runtime checks that narrow the dynamic answers.
export function validateHarborAnswers(
  answers: FormAnswers,
  missingFields: string[],
  fieldErrors: Record<string, string>,
): answers is FormAnswers & HarborQuoteRequest {
  for (const field of harborForm.fields) {
    const error = validateField(field, answers);
    if (error) fieldErrors[field.key] = error;
    else if (field.required && missingFields.includes(field.key)) {
      fieldErrors[field.key] = `Please complete ${field.label.toLowerCase()}.`;
    }
  }
  if (Array.isArray(answers.pets) && answers.pets.includes("None") && answers.pets.length > 1) {
    fieldErrors.pets = "Select None on its own or choose your pets.";
  }
  const claims = answers.claims_last_5_years;
  if (typeof claims === "number" && !Number.isInteger(claims)) {
    fieldErrors.claims_last_5_years = "Enter a whole number of claims.";
  }
  return Object.keys(fieldErrors).length === 0;
}

export function serializeHarborRequest(answers: HarborQuoteRequest): HarborQuoteRequest {
  const [year, month, day] = answers.date_of_birth.split("-");
  return { ...answers, date_of_birth: `${month}/${day}/${year}`, pets: [...answers.pets] };
}
