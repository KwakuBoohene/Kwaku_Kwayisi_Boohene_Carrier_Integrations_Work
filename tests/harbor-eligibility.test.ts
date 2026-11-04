import { describe, expect, it } from "vitest";
import { sampleProfiles } from "@/data/profiles";
import { checkHarborEligibility } from "@/lib/carriers/harbor/eligibility";
import { harborRequestAdaptor } from "@/lib/carriers/harbor/adapter";

const referenceDate = "2026-11-03";

describe("Harbor eligibility", () => {
  it("accepts Maya in a supported state", () => {
    expect(
      checkHarborEligibility(
        {
          date_of_birth: sampleProfiles.A.date_of_birth,
          residence_state: "Oregon",
        },
        referenceDate,
      ),
    ).toEqual({ eligible: true, reasons: [] });
  });

  it("reports both of Sam's reasons and blocks a fully completed request", () => {
    const result = checkHarborEligibility(
      {
        date_of_birth: sampleProfiles.B.date_of_birth,
        residence_state: "Nevada",
      },
      referenceDate,
    );
    expect(result.eligible).toBe(false);
    expect(result.reasons).toEqual([
      {
        code: "minimum_age",
        field: "date_of_birth",
        message: expect.stringContaining("21"),
      },
      {
        code: "unsupported_state",
        field: "residence_state",
        message: expect.stringContaining("Nevada"),
      },
    ]);
    const request = harborRequestAdaptor(
      sampleProfiles.B,
      {
        phone: "775-555-0100",
        contents_coverage: 25000,
        pets: ["None"],
        claims_last_5_years: 1,
      },
      referenceDate,
    );
    expect(request.ok).toBe(false);
    expect(request).not.toHaveProperty("request");
    if (!request.ok) expect(request.eligibilityReasons).toEqual(result.reasons);
  });

  it("uses calendar birthdays, the leap-day assumption, and rejects impossible dates", () => {
    const applicant = {
      date_of_birth: "2005-11-03",
      residence_state: "Oregon",
    };
    expect(checkHarborEligibility(applicant, "2026-11-02").eligible).toBe(
      false,
    );
    expect(checkHarborEligibility(applicant, "2026-11-03").eligible).toBe(true);
    const leapApplicant = { ...applicant, date_of_birth: "2004-02-29" };
    expect(checkHarborEligibility(leapApplicant, "2025-02-28").eligible).toBe(
      false,
    );
    expect(checkHarborEligibility(leapApplicant, "2025-03-01").eligible).toBe(
      true,
    );
    expect(() =>
      checkHarborEligibility(
        { ...applicant, date_of_birth: "2005-02-29" },
        referenceDate,
      ),
    ).toThrow("Invalid calendar date");
    expect(() => checkHarborEligibility(applicant, "2026-02-30")).toThrow(
      "Invalid calendar date",
    );
  });
});
