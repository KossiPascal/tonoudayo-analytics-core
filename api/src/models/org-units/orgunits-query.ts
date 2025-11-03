

export interface DistrictCustomQuery {
    id: string
    name: string
    // external_id: string
}

export interface SiteCustomQuery {
    id: string
    name: string
    external_id: string
    district: { id: string, name: string }
    // supervisor: { id: string, name: string, phone: string }
}

export interface ZoneCustomQuery {
    id: string
    name: string
    external_id: string

    district: { id: string, name: string }
    site: { id: string, name: string }
    chw: { id: string, name: string, phone: string }
}
export interface FamilyCustomQuery {
    id: string
    name: string
    external_id: string
    household_has_working_latrine: boolean
    household_has_good_water_access: boolean

    district: { id: string, name: string }
    site: { id: string, name: string }
    zone: { id: string, name: string }
    // supervisor: { id: string, name: string, phone: string }
    chw: { id: string, name: string, phone: string }
}
export interface SupervisorCustomQuery {
    id: string
    name: string
    phone: string
    external_id: string

    district: { id: string, name: string }
    site: { id: string, name: string }
}
export interface ChwCustomQuery {
    id: string
    name: string
    phone: string
    external_id: string
    role?: string
    
    district: { id: string, name: string }
    site: { id: string, name: string }
    zone: { id: string, name: string }
}
export interface PatientCustomQuery {
    id: string
    name: string
    phone: string
    external_id: string
    sex: string
    date_of_birth: string
    has_birth_certificate: boolean
    
    district: { id: string, name: string }
    site: { id: string, name: string }
    zone: { id: string, name: string }
    family: { id: string, name: string, phone: string }
    // supervisor: { id: string, name: string, phone: string }
    chw: { id: string, name: string, phone: string }
}






