import type { CustomerProfile } from "@/lib/profile";
import type { FormAnswers, PreparedAnswers } from "@/lib/form-schema";
import { isFieldVisible, isMissing } from "@/lib/form-rules";
import { allowedBreeds, harborForm } from "./definition";
import {
  collectEligibilityReasons,
  type EligibilityReason,
} from "./eligibility";
import {
  serializeHarborRequest,
  validateHarborAnswers,
  type HarborQuoteRequest,
} from "./request";
import { stateName } from "./states";

export type { HarborQuoteRequest } from "./request";
export type HarborRequestResult =
  | { ok: true; request: HarborQuoteRequest }
  | {
      ok: false;
      fieldErrors: Record<string, string>;
      eligibilityReasons: EligibilityReason[];
    };

function profileAnswers(profile: CustomerProfile): FormAnswers {
  const answers: FormAnswers = {
    applicant_full_name: [profile.first_name.trim(), profile.last_name.trim()]
      .filter(Boolean)
      .join(" "),
    date_of_birth: profile.date_of_birth,
    contact_email: profile.email,
    residence_state: stateName(profile.state),
    postal_code: profile.zip,
  };
  if (profile.has_dog) {
    answers.pets = ["Dog"];
    const breed = profile.dog_breed?.trim();
    if (breed)
      answers.dog_breed =
        allowedBreeds.find(
          (option) =>
            typeof option === "string" &&
            option.toLowerCase() === breed.toLowerCase(),
        ) ?? "Other";
  }
  return answers;
}

export function prepareHarborAnswers(
  profile: CustomerProfile,
  customerAnswers: FormAnswers = {},
): PreparedAnswers {
  const mapped = profileAnswers(profile);
  const answers: FormAnswers = {};
  for (const field of harborForm.fields) {
    const value = Object.hasOwn(customerAnswers, field.key)
      ? customerAnswers[field.key]
      : mapped[field.key];
    if (value !== undefined)
      answers[field.key] = Array.isArray(value) ? [...value] : value;
  }
  const missingFields: string[] = [];
  for (const field of harborForm.fields) {
    if (!isFieldVisible(field, answers)) {
      delete answers[field.key];
      continue;
    }
    if (!field.required && isMissing(answers[field.key]))
      delete answers[field.key];
    if (
      isMissing(answers[field.key]) ||
      (field.key === "pets" && !Object.hasOwn(customerAnswers, "pets"))
    )
      missingFields.push(field.key);
  }
  return { answers, missingFields };
}

export function harborRequestAdaptor(
  profile: CustomerProfile,
  customerAnswers: FormAnswers,
  referenceDate: string,
): HarborRequestResult {
  const { answers, missingFields } = prepareHarborAnswers(
    profile,
    customerAnswers,
  );
  const fieldErrors: Record<string, string> = {};
  const valid = validateHarborAnswers(answers, missingFields, fieldErrors);
  const eligibilityReasons = collectEligibilityReasons(answers, referenceDate);
  if (!valid || eligibilityReasons.length) {
    return { ok: false, fieldErrors, eligibilityReasons };
  }
  return { ok: true, request: serializeHarborRequest(answers) };
}
