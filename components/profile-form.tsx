"use client";

import { useState, type SubmitEvent } from "react";
import { customerProfileSchema, type CustomerProfile } from "@/lib/profile";

type Errors = Record<string, string>;
interface ProfileInput {
  name: keyof CustomerProfile;
  label: string;
  type: string;
  min?: number;
  step?: string;
  pattern?: string;
  maxLength?: number;
  hint?: string;
}
const fields: ProfileInput[] = [
  { name: "first_name", label: "First name", type: "text" },
  { name: "last_name", label: "Last name", type: "text" },
  { name: "date_of_birth", label: "Birth date", type: "date" },
  { name: "email", label: "Email address", type: "email" },
  { name: "state", label: "State code", type: "text", maxLength: 2, hint: "Two letters, for example OR or NV." },
  { name: "zip", label: "ZIP code", type: "text", pattern: "[0-9]{5}", maxLength: 5 },
  { name: "personal_property_value", label: "Value of your belongings (USD)", type: "number", min: 0, step: "any" },
  { name: "claims_last_3_years", label: "Claims in the past 3 years", type: "number", min: 0, step: "1" },
  { name: "dog_breed", label: "Dog breed (optional)", type: "text", hint: "Leave blank if unknown or you do not have a dog." },
];
const inputStyle = "mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus-visible:outline-teal-700";

function numberValue(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" && value.trim() !== "" ? Number(value) : undefined;
}

function readProfile(data: FormData) {
  const dog = data.get("has_dog");
  const breed = data.get("dog_breed");
  return customerProfileSchema.safeParse({
    first_name: data.get("first_name"), last_name: data.get("last_name"),
    date_of_birth: data.get("date_of_birth"), email: data.get("email"),
    state: data.get("state"), zip: data.get("zip"),
    personal_property_value: numberValue(data, "personal_property_value"),
    claims_last_3_years: numberValue(data, "claims_last_3_years"),
    has_dog: dog === "true" ? true : dog === "false" ? false : undefined,
    dog_breed: dog === "true" && typeof breed === "string" ? breed.trim() || null : null,
  });
}

function ProfileFields({ errors }: { errors: Errors }) {
  return <div className="grid gap-5 sm:grid-cols-2">
    {fields.map(field => <div key={field.name}>
      <label htmlFor={`profile-${field.name}`} className="font-medium">{field.label}</label>
      <input id={`profile-${field.name}`} name={field.name} type={field.type} className={inputStyle}
        required={field.name !== "dog_breed"} min={field.min} step={field.step}
        pattern={field.pattern} maxLength={field.maxLength} aria-invalid={!!errors[field.name]}
        aria-describedby={`profile-${field.name}-help`} />
      <div id={`profile-${field.name}-help`} className="mt-1 text-sm">
        {field.hint && <p className="text-slate-600">{field.hint}</p>}
        {errors[field.name] && <p className="text-red-800">{errors[field.name]}</p>}
      </div>
    </div>)}
    <div>
      <label htmlFor="profile-has_dog" className="font-medium">Do you have a dog?</label>
      <select id="profile-has_dog" name="has_dog" defaultValue="" required className={inputStyle}
        aria-invalid={!!errors.has_dog} aria-describedby="profile-has_dog-help">
        <option value="">Select an answer</option><option value="true">Yes</option><option value="false">No</option>
      </select>
      {errors.has_dog && <p id="profile-has_dog-help" className="mt-1 text-sm text-red-800">{errors.has_dog}</p>}
    </div>
  </div>;
}

export function ProfileForm({ onCreate }: { onCreate: (profile: CustomerProfile) => void }) {
  const [errors, setErrors] = useState<Errors>({});
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = readProfile(new FormData(event.currentTarget));
    if (result.success) {
      onCreate(result.data);
      return;
    }
    const next: Errors = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      if (!next[key]) next[key] = key === "date_of_birth" ? "Enter a valid birth date." : issue.message;
    }
    setErrors(next);
    event.currentTarget.querySelector<HTMLElement>("[data-errors]")?.focus();
  }
  return <form noValidate onSubmit={submit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-5">
    <div>
      <h2 className="text-xl font-semibold">Create a temporary profile</h2>
      <p className="mt-2 text-sm text-slate-600">Use test details. This profile stays in memory and is discarded when you refresh.</p>
    </div>
    <div data-errors tabIndex={-1} role={Object.keys(errors).length ? "alert" : undefined}>
      {Object.keys(errors).length > 0 && <p className="font-medium text-red-800">Check the highlighted profile fields.</p>}
    </div>
    <ProfileFields errors={errors} />
    <button type="submit" className="rounded-md bg-teal-800 px-4 py-2 font-medium text-white focus-visible:outline-teal-700">Use this profile</button>
  </form>;
}
