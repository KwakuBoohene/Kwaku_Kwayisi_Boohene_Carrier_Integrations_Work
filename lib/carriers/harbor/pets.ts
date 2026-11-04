export function selectHarborPets(previous: string[], next: string[]) {
  if (!next.includes("None")) return [...next];
  const addedPet = next.some(
    (pet) => pet !== "None" && !previous.includes(pet),
  );
  return addedPet ? next.filter((pet) => pet !== "None") : ["None"];
}
