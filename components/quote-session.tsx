"use client";

import { useEffect, useRef } from "react";
import type { CustomerProfile } from "@/lib/profile";
import type { AnswerValue } from "@/lib/form-schema";
import { FormField } from "./form-field";
import { EligibilityNotice } from "./eligibility-notice";
import { useQuoteForm } from "./use-quote-form";

type FormState = ReturnType<typeof useQuoteForm>;
const buttonStyle =
  "rounded-md bg-teal-800 px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:opacity-50";

function reviewValue(value: AnswerValue | undefined) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value === undefined || value === "" ? "Not answered" : String(value);
}

function ProfileReview({ form }: { form: FormState }) {
  return (
    <section
      aria-labelledby="profile-heading"
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="profile-heading" className="text-lg font-semibold">
          Your profile
        </h2>
        <button
          type="button"
          onClick={() => form.setEditing(!form.editing)}
          className="text-sm font-medium text-teal-800 underline underline-offset-4"
        >
          {form.editing ? "Finish editing details" : "Edit prefilled details"}
        </button>
      </div>
      <div className="mt-5 space-y-4">
        {form.knownFields.map((field) =>
          form.editing ? (
            <FormField
              key={field.key}
              field={field}
              value={form.answers[field.key]}
              error={form.errors[field.key]}
              hint={field.key === "claims_last_5_years" ? form.claimsHint : undefined}
              onChange={(value) => form.update(field.key, value)}
            />
          ) : (
            <div key={field.key} className="grid gap-1 sm:grid-cols-2">
              <span className="text-sm text-slate-600">{field.label}</span>
              <span className="break-words font-medium">
                {reviewValue(form.answers[field.key])}
              </span>
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function Questions({ form }: { form: FormState }) {
  const pets = form.answers.pets;
  const incompletePets =
    form.missingFields.includes("pets") &&
    Array.isArray(pets) &&
    pets.length > 0;
  return (
    <section
      aria-labelledby="questions-heading"
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      <h2 id="questions-heading" className="text-lg font-semibold">
        A few more details
      </h2>
      <div className="mt-5 space-y-6">
        {form.questions.map((field) => (
          <div key={field.key}>
            <FormField
              field={field}
              value={form.answers[field.key]}
              error={form.errors[field.key]}
              hint={field.key === "claims_last_5_years" ? form.claimsHint : undefined}
              onChange={(value) => form.update(field.key, value)}
            />
            {field.key === "pets" && incompletePets && (
              <div className="mt-3 text-sm">
                <p className="text-slate-600">
                  We know about your dog. Add any other pets, or confirm this
                  list.
                </p>
                <button
                  type="button"
                  className="mt-2 font-medium text-teal-800 underline underline-offset-4"
                  onClick={() => form.update("pets", pets)}
                >
                  These are all my pets
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function QuoteSession({ profile }: { profile: CustomerProfile }) {
  const form = useQuoteForm(profile);
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (form.attempts) summary.current?.focus();
  }, [form.attempts]);
  if (!form.ready) return <p role="status">Checking eligibility…</p>;
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit();
      }}
    >
      <ProfileReview form={form} />
      <EligibilityNotice reasons={form.reasons} />
      {!form.eligible && !form.reasons.length && (
        <p role="alert" className="text-red-800">
          Correct the birth date or state in your profile before continuing.
        </p>
      )}
      {!!form.attempts && Object.keys(form.errors).length > 0 && (
        <div
          ref={summary}
          tabIndex={-1}
          role="alert"
          className="rounded-lg border border-red-200 p-5 text-red-900"
        >
          <h2 className="font-semibold">Check your answers</h2>
          <ul className="mt-2 list-disc pl-5">
            {Object.entries(form.errors).map(([key, error]) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {form.eligible && <Questions form={form} />}
      <button type="submit" disabled={!form.eligible} className={buttonStyle}>
        Prepare quote request
      </button>
      {form.request && (
        <section
          aria-labelledby="request-heading"
          className="rounded-lg border border-teal-200 bg-white p-5"
        >
          <h2
            id="request-heading"
            role="status"
            className="text-lg font-semibold"
          >
            Request prepared
          </h2>
          <pre className="mt-4 overflow-x-auto rounded bg-slate-100 p-4 text-sm">
            {JSON.stringify(form.request, null, 2)}
          </pre>
        </section>
      )}
    </form>
  );
}
