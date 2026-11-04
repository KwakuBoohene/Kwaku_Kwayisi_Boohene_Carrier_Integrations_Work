import type { CustomerProfile } from "@/lib/profile";
import type { AnswerValue, FormAnswers } from "@/lib/form-schema";
import { isFieldVisible } from "@/lib/form-rules";
import { harborForm } from "@/lib/carriers/harbor/definition";
import { prepareHarborAnswers, type HarborQuoteRequest, type HarborRequestResult } from "@/lib/carriers/harbor/adapter";
import { selectHarborPets } from "@/lib/carriers/harbor/pets";

interface QuoteFormState {
  customerAnswers: FormAnswers;
  referenceDate?: string;
  editing: boolean;
  attempts: number;
  request?: HarborQuoteRequest;
}

type QuoteFormAction =
  | { type: "date_ready"; date: string }
  | { type: "answer_changed"; profile: CustomerProfile; key: string; value: AnswerValue | undefined }
  | { type: "editing_changed"; editing: boolean }
  | { type: "submitted"; date: string; result: HarborRequestResult; revealProfile: boolean };

export const initialQuoteFormState: QuoteFormState = {
  customerAnswers: {}, editing: false, attempts: 0,
};

function updatedAnswers(
  profile: CustomerProfile,
  previous: FormAnswers,
  key: string,
  value: AnswerValue | undefined,
): FormAnswers {
  const next = { ...previous, [key]: value };
  if (key === "pets" && Array.isArray(value)) {
    const pets = prepareHarborAnswers(profile, previous).answers.pets;
    next.pets = selectHarborPets(Array.isArray(pets) ? pets : [], value);
  }
  const effective = prepareHarborAnswers(profile, next).answers;
  for (const field of harborForm.fields) {
    if (!isFieldVisible(field, effective)) delete next[field.key];
  }
  return next;
}

export function quoteFormReducer(state: QuoteFormState, action: QuoteFormAction): QuoteFormState {
  switch (action.type) {
    case "date_ready":
      return { ...state, referenceDate: action.date };
    case "answer_changed":
      return {
        ...state,
        customerAnswers: updatedAnswers(action.profile, state.customerAnswers, action.key, action.value),
        request: undefined,
      };
    case "editing_changed":
      return { ...state, editing: action.editing };
    case "submitted":
      return {
        ...state,
        referenceDate: action.date,
        attempts: state.attempts + 1,
        request: action.result.ok ? action.result.request : undefined,
        editing: state.editing || action.revealProfile,
      };
  }
}
