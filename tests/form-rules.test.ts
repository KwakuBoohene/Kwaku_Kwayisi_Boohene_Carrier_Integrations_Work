import { describe, expect, it } from "vitest";
import { harborForm } from "@/lib/carriers/harbor/definition";
import { harborRequestAdaptor } from "@/lib/carriers/harbor/adapter";
import { selectHarborPets } from "@/lib/carriers/harbor/pets";
import { isFieldVisible, validateField } from "@/lib/form-rules";
import { sampleProfiles } from "@/data/profiles";

function field(key: string) {
  const definition = harborForm.fields.find(field => field.key === key);
  if (!definition) throw new Error(`Missing test field: ${key}`);
  return definition;
}

describe("Form rules", () => {
  it("requires a breed only when its conditional dog question is visible", () => {
    const breed = field("dog_breed");
    expect(isFieldVisible(breed, { pets: ["None"] })).toBe(false);
    expect(validateField(breed, { pets: ["None"] })).toBeUndefined();
    expect(isFieldVisible(breed, { pets: ["Dog"] })).toBe(true);
    expect(validateField(breed, { pets: ["Dog"] })).toContain("required");
    expect(validateField(breed, { pets: ["Dog"], dog_breed: "Other" })).toBeUndefined();
  });

  it("applies declared required, pattern, minimum, and exact option constraints", () => {
    expect(validateField(field("phone"), { phone: " " })).toContain("required");
    expect(validateField(field("postal_code"), { postal_code: "01234" })).toBeUndefined();
    expect(validateField(field("postal_code"), { postal_code: "01234-5678" })).toBeUndefined();
    expect(validateField(field("postal_code"), { postal_code: "123" })).toBeDefined();
    expect(validateField(field("claims_last_5_years"), { claims_last_5_years: 0 })).toBeUndefined();
    expect(validateField(field("claims_last_5_years"), { claims_last_5_years: -1 })).toBeDefined();
    expect(validateField(field("contents_coverage"), { contents_coverage: 50000 })).toBeUndefined();
    expect(validateField(field("contents_coverage"), { contents_coverage: "50000" })).toBeDefined();
    expect(validateField(field("contents_coverage"), { contents_coverage: 32000 })).toBeDefined();
  });

  it("makes None exclusive and preserves unanswered versus false sprinklers", () => {
    expect(selectHarborPets(["Dog"], ["Dog", "None"])).toEqual(["None"]);
    expect(selectHarborPets(["None"], ["None", "Cat"])).toEqual(["Cat"]);
    expect(selectHarborPets(["Dog"], ["Dog", "Cat"])).toEqual(["Dog", "Cat"]);
    expect(selectHarborPets(["None"], [])).toEqual([]);
    const answers = { phone: "503-555-0100", contents_coverage: 50000, pets: ["None"], claims_last_5_years: 0 };
    const unanswered = harborRequestAdaptor(sampleProfiles.A, answers, "2026-11-04");
    const no = harborRequestAdaptor(sampleProfiles.A, { ...answers, building_has_sprinklers: false }, "2026-11-04");
    expect(unanswered.ok).toBe(true);
    expect(no.ok).toBe(true);
    if (unanswered.ok) expect(unanswered.request).not.toHaveProperty("building_has_sprinklers");
    if (no.ok) expect(no.request.building_has_sprinklers).toBe(false);
  });
});
