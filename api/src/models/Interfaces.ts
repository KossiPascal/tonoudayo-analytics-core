export interface IndicatorsDataOutput<T> {
    site: { id: string, name: string }
    // supervisor: { id: string, name: string, phone: string }
    zone: { id: string, name: string }
    chw: { id: string, name: string, phone: string } | null
    chw_type: string
    is_validate?: boolean
    validate_user_id?: string
    already_on_dhis2?: boolean
    already_on_dhis2_user_id?: string
    data: T
}


export interface CouchDbFetchData {
    viewName: string,
    startKey: string[];
    endKey: string[];
    // medic_host: string;
    // medic_username: string;
    // medic_password: string;
    // port: number;
    // ssl_verification: boolean;
    descending: boolean
    dhisusername: string
    dhispassword: string
}

export type IndexTarget = 'only_id' | 'id' | 'id_reco' | 'reco_month_year' | 'reco_month' | 'reco_year' | 'month' | 'year' | 'year_month';

export type CouchdbFetchCible = 'medic' | 'users' | 'logs' | 'sentinel' | 'users_meta';

