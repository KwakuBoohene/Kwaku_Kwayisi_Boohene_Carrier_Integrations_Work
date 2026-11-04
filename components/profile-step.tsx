import { sampleProfiles } from "@/data/profiles";
import type { CustomerProfile } from "@/lib/profile";
import { stateName } from "@/lib/us-states";
import type { ProfileScreen } from "./portal-state";
import { ProfileForm } from "./profile-form";

interface ProfileStepProps {
  screen: ProfileScreen;
  profile?: CustomerProfile;
  onScreen: (screen: ProfileScreen) => void;
  onChoose: (profile: CustomerProfile) => void;
  onContinue: () => void;
}

function ProfileOptions({ profile, onScreen, onContinue }: ProfileStepProps) {
  return (
    <section className="space-y-5" aria-labelledby="profile-options-heading">
      <h2 id="profile-options-heading" className="text-xl font-semibold">Choose a profile</h2>
      {profile && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-teal-200 bg-teal-50 p-5">
          <p>Selected profile: <strong>{profile.first_name} {profile.last_name}</strong></p>
          <button type="button" onClick={onContinue} className="font-medium text-teal-900 underline underline-offset-4">
            Continue with this profile
          </button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => onScreen("create")}
          className="rounded-lg bg-teal-800 p-6 text-left text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">
          <span className="block text-lg font-semibold">Create a temporary profile</span>
          <span className="mt-2 block text-sm text-teal-50">Enter your own test details to explore the quote process.</span>
        </button>
        <button type="button" onClick={() => onScreen("samples")}
          className="rounded-lg border border-slate-300 bg-white p-6 text-left focus-visible:outline-2 focus-visible:outline-teal-800">
          <span className="block text-lg font-semibold">Use a sample profile</span>
          <span className="mt-2 block text-sm text-slate-600">Skip setup and try Maya or Sam.</span>
        </button>
      </div>
      <p className="text-sm text-slate-600">Temporary profiles stay in this page and disappear when you refresh.</p>
    </section>
  );
}

function SampleProfiles({ onChoose }: Pick<ProfileStepProps, "onChoose">) {
  return (
    <section aria-labelledby="samples-heading">
      <h2 id="samples-heading" className="text-xl font-semibold">Choose a sample profile</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {Object.entries(sampleProfiles).map(([key, profile]) => (
          <div key={key} className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">{profile.first_name} {profile.last_name}</h3>
            <p className="mt-2 text-sm text-slate-600">{stateName(profile.state)} · {profile.email}</p>
            <button type="button" onClick={() => onChoose(profile)}
              className="mt-4 rounded-md bg-teal-800 px-4 py-2 font-medium text-white focus-visible:outline-teal-700">
              {`Use ${profile.first_name} ${profile.last_name}`}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProfileStep(props: ProfileStepProps) {
  if (props.screen === "options") return <ProfileOptions {...props} />;
  return (
    <div className="space-y-5">
      <button type="button" onClick={() => props.onScreen("options")}
        className="text-sm font-medium text-teal-800 underline underline-offset-4">Back to profile options</button>
      {props.screen === "create" ? <ProfileForm onCreate={props.onChoose} /> : <SampleProfiles onChoose={props.onChoose} />}
    </div>
  );
}
