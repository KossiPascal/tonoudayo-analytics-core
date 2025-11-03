

export interface FilterParams {
  start_date?: string
  end_date?: string
  forms?: string[]
  names?: string[]
  codes?: string[]
  external_ids?: string[]
  sites?: string[]
  zones?: string[]
  families: string[]
  supervisors?: string[]
  chws?: string[]
  patients?: string[]
  type?: any
  dhisusername?: string
  dhispassword?: string
}

export interface SyncOrgUnit {
  year: number
  month: string
  site: boolean
  zone: boolean
  supervisor: boolean
  chw: boolean
  family: boolean
  patient: boolean
}

export interface OrgUnitSyncResult {
  status: number
  Site?: SyncOutputUtils
  Zone?: SyncOutputUtils
  Family?: SyncOutputUtils
  Supervisor?: SyncOutputUtils
  Chw?: SyncOutputUtils
  Patient?: SyncOutputUtils
  Message?: SyncOutputUtils
  validationError?: string
  InnerCatch?: string
  AxioCatch?: string
  GlobalCatch?: string
}

export interface AllFormsSyncResult {
  adult?: SyncOutputUtils
  familyPlanning?: SyncOutputUtils
  pregnant?: SyncOutputUtils
  newborn?: SyncOutputUtils
  pcimne?: SyncOutputUtils
  delivery?: SyncOutputUtils
  chwMeg?: SyncOutputUtils
  referal?: SyncOutputUtils
  vaccination?: SyncOutputUtils
  event?: SyncOutputUtils
  fsMeg?: SyncOutputUtils
  promotionalActivity?: SyncOutputUtils
  death?: SyncOutputUtils
  catchErrors?: string
  Message?: SyncOutputUtils
}

export interface SyncOutputUtils {
  SuccessCount: number,
  Errors: string,
  ErrorCount: number,
  ErrorElements: string,
  ErrorIds: string
}

export interface getOrgUnitFromDbFilter {
  id?: string,
  patients?: string[],
  sites?: string[],
  zones?: string[],
  supervisors?: string[],
  chws?: string[]
}

export interface FamilyCustomQuery {
  id: string
  name: string
  external_id: string
  household_has_working_latrine: boolean
  household_has_good_water_access: boolean

  site: { id: string, name: string }
  zone: { id: string, name: string }
  // supervisor: { id: string, name: string, phone: string }
  chw: { id: string, name: string, phone: string }
}

export interface PatientCustomQuery {
  id: string
  name: string
  phone: string
  external_id: string
  sex: string
  date_of_birth: string
  has_birth_certificate: boolean

  site: { id: string, name: string }
  zone: { id: string, name: string }
  family: { id: string, name: string, phone: string }
  // supervisor: { id: string, name: string, phone: string }
  chw: { id: string, name: string, phone: string }
}
