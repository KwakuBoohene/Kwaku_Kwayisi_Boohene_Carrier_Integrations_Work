"use client";

import { useEffect, useReducer } from "react";
import type { CustomerProfile } from "@/lib/profile";
import type { AnswerValue } from "@/lib/form-schema";
import { isFieldVisible, validateField } from "@/lib/form-rules";
import { harborForm } from "@/lib/carriers/harbor/definition";
import {
  harborRequestAdaptor,
  prepareHarborAnswers,
} from "@/lib/carriers/harbor/adapter";
import { collectEligibilityReasons } from "@/lib/carriers/harbor/eligibility";
import { initialQuoteFormState, quoteFormReducer } from "./quote-form-state";

function localDate() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export function useQuoteForm(profile: CustomerProfile) {
  const [state, dispatch] = useReducer(quoteFormReducer, initialQuoteFormState);
  const { customerAnswers, referenceDate, editing, attempts, request } = state;
  useEffect(() => dispatch({ type: "date_ready", date: localDate() }), []);
  const initial = prepareHarborAnswers(profile);
  const prepared = prepareHarborAnswers(profile, customerAnswers);
  const knownKeys = new Set(
    harborForm.fields
      .filter(
        (field) =>
          field.key !== "claims_last_5_years" &&
          initial.answers[field.key] !== undefined &&
          !initial.missingFields.includes(field.key),
      )
      .map((field) => field.key),
  );
  const fields = harborForm.fields.filter((field) =>
    isFieldVisible(field, prepared.answers),
  );
  const reasons = referenceDate
    ? collectEligibilityReasons(prepared.answers, referenceDate)
    : [];
  const eligibilityErrors: Record<string, string> = {};
  for (const field of fields.filter(
    (field) => field.key === "date_of_birth" || field.key === "residence_state",
  )) {
    const error = validateField(field, prepared.answers);
    if (error) eligibilityErrors[field.key] = error;
  }
  const eligible =
    !!referenceDate &&
    !reasons.length &&
    !Object.keys(eligibilityErrors).length;
  const validation =
    attempts && referenceDate
      ? harborRequestAdaptor(profile, customerAnswers, referenceDate)
      : undefined;
  const errors =
    eligible && validation && !validation.ok
      ? validation.fieldErrors
      : eligibilityErrors;

  function update(key: string, value: AnswerValue | undefined) {
    dispatch({ type: "answer_changed", profile, key, value });
  }

  function submit() {
    const today = localDate();
    const result = harborRequestAdaptor(profile, customerAnswers, today);
    const revealProfile =
      !result.ok &&
      Object.keys(result.fieldErrors).some((key) => knownKeys.has(key));
    dispatch({ type: "submitted", date: today, result, revealProfile });
  }

  function setEditing(value: boolean) {
    dispatch({ type: "editing_changed", editing: value });
  }

  return {
    answers: prepared.answers,
    missingFields: prepared.missingFields,
    knownFields: fields.filter((field) => knownKeys.has(field.key)),
    questions: fields.filter((field) => !knownKeys.has(field.key)).map(field =>
      field.key === "claims_last_5_years" && field.type === "number"
        ? { ...field, min: Math.max(field.min ?? 0, profile.claims_last_3_years) }
        : field),
    claimsHint: `Starts with your known 3-year count (${profile.claims_last_3_years}). Increase it if you had more claims in the past 5 years.`,
    reasons,
    eligible,
    errors,
    editing,
    setEditing,
    attempts,
    request,
    ready: !!referenceDate,
    update,
    submit,
  };
}
