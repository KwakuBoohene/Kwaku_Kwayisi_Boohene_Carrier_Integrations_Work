import type { FormAnswers } from "@/lib/form-schema";
import { parseCalendarDate, requireCalendarDate } from "@/lib/dates";
import { allowedStates, minimumAge } from "./definition";

export interface EligibilityReason {
  code: "minimum_age" | "unsupported_state";
  field: "date_of_birth" | "residence_state";
  message: string;
}

export function collectEligibilityReasons(
  answers: FormAnswers,
  referenceDate: string,
) {
  const reference = requireCalendarDate(referenceDate);
  const reasons: EligibilityReason[] = [];
  const birth =
    typeof answers.date_of_birth === "string"
      ? parseCalendarDate(answers.date_of_birth)
      : undefined;
  if (birth) {
    // February 29 birthdays advance on March 1 in non-leap years.
    const beforeBirthday =
      reference.month < birth.month ||
      (reference.month === birth.month && reference.day < birth.day);
    const age = reference.year - birth.year - Number(beforeBirthday);
    if (age < minimumAge)
      reasons.push({
        code: "minimum_age",
        field: "date_of_birth",
        message: `Harbor requires applicants to be at least ${minimumAge}.`,
      });
  }
  const state = answers.residence_state;
  if (
    typeof state === "string" &&
    state.trim() &&
    !allowedStates.some((option) => option === state)
  )
    reasons.push({
      code: "unsupported_state",
      field: "residence_state",
      message: `Harbor does not support ${state}.`,
    });
  return reasons;
}

export function checkHarborEligibility(
  applicant: { date_of_birth: string; residence_state: string },
  referenceDate: string,
) {
  requireCalendarDate(applicant.date_of_birth);
  const reasons = collectEligibilityReasons(applicant, referenceDate);
  return { eligible: reasons.length === 0, reasons };
}
