import definition from "@/data/carriers/harbor.json";
import { carrierFormSchema } from "@/lib/form-schema";

export const harborForm = carrierFormSchema.parse(definition);

const birthDate = harborForm.fields.find(
  (field) => field.key === "date_of_birth",
);
const residence = harborForm.fields.find(
  (field) => field.key === "residence_state",
);
const breed = harborForm.fields.find((field) => field.key === "dog_breed");
if (
  birthDate?.type !== "date" ||
  birthDate.validation?.minAge === undefined ||
  residence?.type !== "select" ||
  breed?.type !== "select"
) {
  throw new Error("Harbor eligibility and breed metadata is missing.");
}

export const minimumAge = birthDate.validation.minAge;
export const allowedStates = residence.options;
export const allowedBreeds = breed.options;
