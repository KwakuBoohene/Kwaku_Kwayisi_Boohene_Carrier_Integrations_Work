import { describe, expect, it } from "vitest";
import { customerProfileSchema } from "@/lib/profile";
import { sampleProfiles } from "@/data/profiles";
import type { FormAnswers } from "@/lib/form-schema";
import {
  harborRequestAdaptor,
  prepareHarborAnswers,
} from "@/lib/carriers/harbor/adapter";

const referenceDate = "2026-11-03";
const completeAnswers: FormAnswers = {
  phone: "503-555-0100",
  contents_coverage: 50000,
  pets: ["Dog", "Cat"],
  claims_last_5_years: 0,
  building_has_sprinklers: false,
};
const expectedRequest = {
  applicant_full_name: "Maya Torres",
  date_of_birth: "03/12/1994",
  contact_email: "maya@example.com",
  phone: "503-555-0100",
  residence_state: "Oregon",
  postal_code: "97205",
  contents_coverage: 50000,
  pets: ["Dog", "Cat"],
  dog_breed: "Labrador",
  claims_last_5_years: 0,
  building_has_sprinklers: false,
};

function expectFailure(answers: FormAnswers, field: string) {
  const result = harborRequestAdaptor(sampleProfiles.A, answers, referenceDate);
  expect(result.ok).toBe(false);
  expect(result).not.toHaveProperty("request");
  if (!result.ok) expect(result.fieldErrors).toHaveProperty(field);
}

describe("Harbor adapter", () => {
  it("maps known fields for both profiles without mutating their values", () => {
    const custom = customerProfileSchema.parse({
      first_name: "Alex", last_name: "Mensah", date_of_birth: "1990-06-15",
      email: "alex@example.com", state: "ca", zip: "90210", personal_property_value: 18000,
      has_dog: false, dog_breed: null, claims_last_3_years: 0,
    });
    expect(prepareHarborAnswers(custom).answers).toMatchObject({
      applicant_full_name: "Alex Mensah", residence_state: "California", postal_code: "90210",
    });
    expect(customerProfileSchema.safeParse({ ...custom, first_name: " " }).success).toBe(false);
    expect(customerProfileSchema.safeParse({ ...custom, claims_last_3_years: -1 }).success).toBe(false);
    expect(customerProfileSchema.safeParse({ ...custom, date_of_birth: "2000-02-30" }).success).toBe(false);
    const original = structuredClone(sampleProfiles);
    expect(prepareHarborAnswers(sampleProfiles.A).answers).toEqual({
      applicant_full_name: "Maya Torres",
      date_of_birth: "1994-03-12",
      contact_email: "maya@example.com",
      residence_state: "Oregon",
      postal_code: "97205",
      pets: ["Dog"],
      dog_breed: "Labrador",
    });
    expect(prepareHarborAnswers(sampleProfiles.B).answers).toEqual({
      applicant_full_name: "Sam Lee",
      date_of_birth: "2006-01-20",
      contact_email: "sam@example.com",
      residence_state: "Nevada",
      postal_code: "89501",
    });
    const answers = prepareHarborAnswers(
      sampleProfiles.A,
      completeAnswers,
    ).answers;
    if (Array.isArray(answers.pets)) answers.pets.push("Other");
    expect(completeAnswers.pets).toEqual(["Dog", "Cat"]);
    expect(sampleProfiles).toEqual(original);
  });

  it("asks for unavailable and incomplete information instead of guessing", () => {
    const missing = [
      "phone",
      "contents_coverage",
      "pets",
      "claims_last_5_years",
      "building_has_sprinklers",
    ];
    expect(prepareHarborAnswers(sampleProfiles.A).missingFields).toEqual(
      missing,
    );
    expect(prepareHarborAnswers(sampleProfiles.B).missingFields).toEqual(
      missing,
    );
    const known = prepareHarborAnswers(sampleProfiles.A).answers;
    for (const field of [
      "phone",
      "contents_coverage",
      "claims_last_5_years",
      "building_has_sprinklers",
    ]) {
      expect(known).not.toHaveProperty(field);
    }
    expectFailure({}, "phone");
    const { pets: _pets, ...withoutPetAnswer } = completeAnswers;
    expectFailure(withoutPetAnswer, "pets");
    expectFailure({ ...completeAnswers, pets: [] }, "pets");
  });

  it("handles partial pets, conditional breeds, and explicit breed normalization", () => {
    expect(prepareHarborAnswers(sampleProfiles.A).missingFields).toContain(
      "pets",
    );
    expect(
      prepareHarborAnswers(sampleProfiles.A, { pets: ["Dog"] }).missingFields,
    ).not.toContain("pets");
    expect(prepareHarborAnswers(sampleProfiles.B).answers).not.toHaveProperty(
      "pets",
    );
    expect(prepareHarborAnswers(sampleProfiles.B).answers).not.toHaveProperty(
      "dog_breed",
    );
    expect(
      prepareHarborAnswers(sampleProfiles.B, { pets: ["Dog"] }).missingFields,
    ).toContain("dog_breed");
    expect(
      prepareHarborAnswers({ ...sampleProfiles.A, dog_breed: "Poodle" }).answers
        .dog_breed,
    ).toBe("Other");
    expect(
      prepareHarborAnswers({ ...sampleProfiles.A, dog_breed: " labrador " })
        .answers.dog_breed,
    ).toBe("Labrador");
    expect(
      prepareHarborAnswers({ ...sampleProfiles.A, dog_breed: null })
        .missingFields,
    ).toContain("dog_breed");
    expect(
      prepareHarborAnswers(
        { ...sampleProfiles.B, dog_breed: "Labrador" },
        { pets: ["Dog"] },
      ).missingFields,
    ).toContain("dog_breed");
    const none = prepareHarborAnswers(sampleProfiles.A, {
      pets: ["None"],
      dog_breed: "Pit Bull",
    });
    expect(none.answers).not.toHaveProperty("dog_breed");
    expect(none.missingFields).not.toContain("dog_breed");
  });

  it("serializes exact valid requests and rejects invalid answers or edited eligibility", () => {
    expect(
      harborRequestAdaptor(sampleProfiles.A, completeAnswers, referenceDate),
    ).toEqual({
      ok: true,
      request: expectedRequest,
    });
    const { building_has_sprinklers: _sprinklers, ...withoutSprinklers } =
      completeAnswers;
    const noDog = harborRequestAdaptor(
      sampleProfiles.A,
      {
        ...withoutSprinklers,
        pets: ["None"],
        dog_breed: "ignored",
        unknown_key: "ignored",
      },
      referenceDate,
    );
    expect(noDog.ok).toBe(true);
    if (noDog.ok) {
      expect(noDog.request).not.toHaveProperty("dog_breed");
      expect(noDog.request).not.toHaveProperty("building_has_sprinklers");
      expect(noDog.request).not.toHaveProperty("unknown_key");
      expect(noDog.request.claims_last_5_years).toBe(0);
    }
    const emptyOptional = harborRequestAdaptor(
      sampleProfiles.A,
      {
        ...completeAnswers,
        building_has_sprinklers: "",
      },
      referenceDate,
    );
    expect(emptyOptional.ok).toBe(true);
    if (emptyOptional.ok)
      expect(emptyOptional.request).not.toHaveProperty(
        "building_has_sprinklers",
      );
    const invalidAnswers: [FormAnswers, string][] = [
      [{ contents_coverage: "50000" }, "contents_coverage"],
      [{ contents_coverage: 32000 }, "contents_coverage"],
      [{ pets: ["None", "Dog"] }, "pets"],
      [{ claims_last_5_years: -1 }, "claims_last_5_years"],
      [{ claims_last_5_years: 0.5 }, "claims_last_5_years"],
      [{ claims_last_5_years: Infinity }, "claims_last_5_years"],
      [{ date_of_birth: "1994-02-30" }, "date_of_birth"],
      [{ contact_email: "invalid" }, "contact_email"],
      [{ postal_code: "9720" }, "postal_code"],
      [{ building_has_sprinklers: "false" }, "building_has_sprinklers"],
    ];
    for (const [overrides, field] of invalidAnswers)
      expectFailure({ ...completeAnswers, ...overrides }, field);
    const edited = harborRequestAdaptor(
      sampleProfiles.A,
      {
        ...completeAnswers,
        date_of_birth: "2006-01-20",
        residence_state: "Nevada",
      },
      referenceDate,
    );
    expect(edited.ok).toBe(false);
    if (!edited.ok)
      expect(edited.eligibilityReasons.map((reason) => reason.code)).toEqual([
        "minimum_age",
        "unsupported_state",
      ]);
    const invalidBirth = harborRequestAdaptor(
      sampleProfiles.A,
      {
        ...completeAnswers,
        date_of_birth: "invalid",
        residence_state: "Nevada",
      },
      referenceDate,
    );
    if (invalidBirth.ok) throw new Error("Invalid birth date must fail.");
    expect(
      invalidBirth.eligibilityReasons.map((reason) => reason.code),
    ).toEqual(["unsupported_state"]);
  });
});
