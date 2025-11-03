
export interface DeliveryDataView {

    id?: string
    rev?: string
    form?: string
    year?: number
    month?: string
    sex?:'M'|'F'|null
    date_of_birth?: string
    age_in_years?:number
    age_in_months?:number
    age_in_days?:number

    delivery_date?: string | null
    babies_alive_number?: number | null
    babies_deceased_number?: number | null
    cpon_done?: boolean | null
    cpon_done_date?: string | null
    has_health_problem?: boolean | null
    received_milda?: boolean | null
    is_home_delivery?: boolean | null

    site_id?: string | null
    zone_id?: string | null
    family_id?: string | null
    chw_id?: string | null
    patient_id?: string | null

    reported_date_timestamp?: number
    reported_date?: string
    reported_full_date?: string | null

    geolocation?: object | null;

}

