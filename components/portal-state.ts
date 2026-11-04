import type { CustomerProfile } from "@/lib/profile";

export type PortalStep = "profile" | "provider" | "quote";
export type ProfileScreen = "options" | "create" | "samples";

interface PortalState {
  step: PortalStep;
  profileScreen: ProfileScreen;
  profile?: CustomerProfile;
  revision: number;
  quoteOpened: boolean;
}

type PortalAction =
  | { type: "profile_screen_opened"; screen: ProfileScreen }
  | { type: "profile_selected"; profile: CustomerProfile }
  | { type: "step_opened"; step: "profile" | "provider" }
  | { type: "provider_selected" };

export const initialPortalState: PortalState = {
  step: "profile",
  profileScreen: "options",
  revision: 0,
  quoteOpened: false,
};

export function portalReducer(state: PortalState, action: PortalAction): PortalState {
  switch (action.type) {
    case "profile_screen_opened":
      return { ...state, step: "profile", profileScreen: action.screen };
    case "profile_selected":
      return {
        ...state,
        profile: action.profile,
        step: "provider",
        profileScreen: "options",
        revision: state.revision + 1,
        quoteOpened: false,
      };
    case "step_opened":
      if (action.step === "provider" && !state.profile) return state;
      return { ...state, step: action.step, profileScreen: "options" };
    case "provider_selected":
      return state.profile ? { ...state, step: "quote", quoteOpened: true } : state;
  }
}
