export interface CustomerProfile {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  state: string;
  zip: string;
  personal_property_value: number;
  has_dog: boolean;
  dog_breed: string | null;
  claims_last_3_years: number;
}
