"use client";

import { useReducer } from "react";
import { sampleProfiles } from "@/data/profiles";
import type { CustomerProfile } from "@/lib/profile";
import { ProfileForm } from "./profile-form";
import { QuoteSession } from "./quote-session";

interface ProfileChoice {
  profile?: CustomerProfile;
  revision: number;
}

function selectProfile(state: ProfileChoice, profile: CustomerProfile | undefined): ProfileChoice {
  return { profile, revision: state.revision + 1 };
}

export function QuoteForm() {
  const [choice, choose] = useReducer(selectProfile, { revision: 0 });
  return <div className="mt-8 space-y-6">
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-slate-600">Skip setup with a sample:</span>
      {Object.entries(sampleProfiles).map(([key, profile]) => <button type="button" key={key}
        className="rounded border border-slate-300 bg-white px-3 py-2 font-medium text-teal-800 focus-visible:outline-teal-700"
        onClick={() => choose(profile)}>{`Use sample ${key} — ${profile.first_name} ${profile.last_name}`}</button>)}
    </div>
    {choice.profile ? <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Quote for {choice.profile.first_name} {choice.profile.last_name}</h2>
        <button type="button" className="text-sm font-medium text-teal-800 underline underline-offset-4"
          onClick={() => choose(undefined)}>Create another profile</button>
      </div>
      <QuoteSession key={choice.revision} profile={choice.profile} />
    </> : <ProfileForm key={choice.revision} onCreate={choose} />}
  </div>;
}
