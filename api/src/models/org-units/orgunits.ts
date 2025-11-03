
export interface SiteView {
  id: string
  rev: string
  year: number
  month: string
  name: string
  external_id: string
  code: string
  geolocation: object | null
  reported_date_timestamp: number
  reported_date: string
  reported_full_date: string | null
}

export interface ZoneView {
  id: string
  rev: string
  year: number
  month: string
  name: string
  external_id: string
  code: string
  geolocation: object | null
  site_id: string | null
  chw_id: string
  reported_date_timestamp: number
  reported_date: string
  reported_full_date: string | null
}

export interface SupervisorView {
  id: string
  rev: string
  year: number
  month: string
  name: string
  code: string
  external_id: string
  role: string
  sex: 'M' | 'F' | null
  date_of_birth: string
  phone: string
  email: string
  profession: string
  geolocation: object | null
  site_id: string | null
  reported_date_timestamp: number
  reported_date: string
  reported_full_date: string | null
}

export interface ChwView {
  id: string
  rev: string
  year: number
  month: string
  name: string
  code: string
  external_id: string
  role: string
  sex: 'M' | 'F' | null
  date_of_birth: string
  phone: string
  email: string
  profession: string
  geolocation: object | null
  site_id: string | null
  zone_id: string | null
  reported_date_timestamp: number
  reported_date: string
  reported_full_date: string | null
}

export interface FamilyView {
  id: string
  rev: string
  year: number
  month: string
  given_name: string
  name: string
  external_id: string
  code: string
  household_has_working_latrine: boolean | null
  household_has_good_water_access: boolean | null
  geolocation: object | null
  site_id: string | null
  zone_id: string | null
  chw_id: string | null
  reported_date_timestamp: number
  reported_date: string
  reported_full_date: string | null
}

export interface PatientView {
  id: string
  rev: string
  year: number
  month: string
  name: string
  code: string
  external_id: string
  role: string
  sex: 'M' | 'F' | null
  date_of_birth: string
  age_in_year_on_creation: number
  age_in_month_on_creation: number
  age_in_day_on_creation: number
  phone: string | null
  profession: string | null
  relationship_with_household_head: string
  has_birth_certificate: boolean | null
  place_of_death: string | null
  is_home_death: boolean | null
  is_stillbirth: boolean | null
  geolocation: object | null
  site_id: string | null
  zone_id: string | null
  family_id: string | null
  chw_id: string | null
  date_of_death: string | null
  year_of_death: number | null
  month_of_death: string | null
  reported_date_timestamp: number
  reported_date: string
  reported_full_date: string | null
}
