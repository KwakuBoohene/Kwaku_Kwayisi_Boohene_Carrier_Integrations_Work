"use client";

import { useEffect, useReducer, useRef } from "react";
import { initialPortalState, portalReducer, type PortalStep } from "./portal-state";
import { ProfileStep } from "./profile-step";
import { ProviderStep } from "./provider-step";
import { QuoteSession } from "./quote-session";

const steps = ["profile", "provider", "quote"];

function Progress({ current }: { current: PortalStep }) {
  const index = steps.indexOf(current);
  return (
    <nav aria-label="Quote progress">
      <ol className="grid grid-cols-3 gap-2 text-sm">
        {steps.map((step, position) => (
          <li key={step} aria-current={step === current ? "step" : undefined}
            className={`rounded-md px-3 py-3 ${step === current ? "bg-teal-800 font-semibold text-white" : position < index ? "bg-teal-100 text-teal-950" : "bg-slate-100 text-slate-500"}`}>
            <span className="mr-2">{position + 1}</span><span className="capitalize">{step}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function QuotePortal() {
  const [portal, dispatch] = useReducer(portalReducer, initialPortalState);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => content.current?.focus(), [portal.step, portal.profileScreen]);
  return (
    <div className="mt-8 space-y-7">
      <Progress current={portal.step} />
      <div ref={content} tabIndex={-1} role="region" aria-label={`${portal.step} step`} className="outline-none">
        {portal.step === "profile" && <ProfileStep screen={portal.profileScreen} profile={portal.profile}
          onScreen={screen => dispatch({ type: "profile_screen_opened", screen })}
          onChoose={profile => dispatch({ type: "profile_selected", profile })}
          onContinue={() => dispatch({ type: "step_opened", step: "provider" })} />}
        {portal.step === "provider" && portal.profile && <ProviderStep profile={portal.profile}
          onBack={() => dispatch({ type: "step_opened", step: "profile" })}
          onSelect={() => dispatch({ type: "provider_selected" })} />}
        {portal.profile && portal.quoteOpened && (
          <section key={portal.revision} hidden={portal.step !== "quote"} className="space-y-5" aria-labelledby="harbor-heading">
            <div className="flex flex-wrap justify-between gap-3 text-sm font-medium text-teal-800">
              <button type="button" onClick={() => dispatch({ type: "step_opened", step: "provider" })}
                className="underline underline-offset-4">Back to providers</button>
              <button type="button" onClick={() => dispatch({ type: "step_opened", step: "profile" })}
                className="underline underline-offset-4">Change profile</button>
            </div>
            <div>
              <h2 id="harbor-heading" className="text-xl font-semibold">Harbor Assurance</h2>
              <p className="mt-1 text-slate-600">Renters insurance for {portal.profile.first_name} {portal.profile.last_name}</p>
            </div>
            <QuoteSession profile={portal.profile} />
          </section>
        )}
      </div>
    </div>
  );
}
