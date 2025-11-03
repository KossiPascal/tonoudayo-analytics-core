import { ChartDataSet } from "./interfaces"

export interface ChwsPerformanceDashboard {
  id: string
  year: number
  month: string
  householdCount: number
  patientCount: number
  newborn0To2MonthsCount: number
  child2To60MonthsCount: number
  child5To14YearsCount: number
  adultOver14YearsCount: number
  consultationCount: number
  followupCount: number
  allActionsCount: number
  lineChart: ChwsPerformanceDashboardUtils
  barChart: ChwsPerformanceDashboardUtils
  yearLineChart: ChwsPerformanceDashboardUtils
  yearBarChart: ChwsPerformanceDashboardUtils
  site: { id: string, name: string }
  // supervisor: { id: string, name: string, phone: string }
  zone: { id: string, name: string }
  chw: { id: string, name: string, phone: string } | null
  is_validate?:boolean
  validate_user_id?:string
  already_on_dhis2?:boolean
  already_on_dhis2_user_id?:string

}


export interface ChwsChartPerformanceDashboard {
  id: string
  year: number
  lineChart: ChwsPerformanceDashboardUtils
  barChart: ChwsPerformanceDashboardUtils
  site: { id: string, name: string }
  // supervisor: { id: string, name: string, phone: string }
  zone: { id: string, name: string }
  chw: { id: string, name: string, phone: string } | null
  is_validate?:boolean
  validate_user_id?:string
  already_on_dhis2?:boolean
  already_on_dhis2_user_id?:string
}



export interface ChwsPerformanceDashboardUtils {
  title: string
  type: 'line' | 'bar',
  absisseLabels: number[] | string[],
  datasets: ChartDataSet[]
}


export interface ChwsVaccinationDashboardDbOutput {
  id: string
  month: string
  year: number
  children_vaccines: {
    family_id: string,
    family_name: string,
    family_code: string,
    family_fullname: string,
    data: ChwsVaccinationDashboard[]
  }[]
  site: { id: string, name: string }
  // supervisor: { id: string, name: string, phone: string }
  zone: { id: string, name: string }
  chw: { id: string, name: string, phone: string } | null
  is_validate?:boolean
  validate_user_id?:string
  already_on_dhis2?:boolean
  already_on_dhis2_user_id?:string
}




export interface ChwsVaccinationDashboard {
  family_id: string, 
  family_name: string, 
  family_code: string, 
  family_fullname: string, 
  child_id: string
  child_name: string
  child_code: string
  child_sex: string
  chw_phone: string
  parent_phone: string
  neighbor_phone: string
  child_age_in_days: number
  child_age_in_months: number
  child_age_in_years: number
  child_age_str: string
  vaccine_BCG: boolean
  vaccine_VPO_0: boolean
  vaccine_PENTA_1: boolean
  vaccine_VPO_1: boolean
  vaccine_PENTA_2: boolean
  vaccine_VPO_2: boolean
  vaccine_PENTA_3: boolean
  vaccine_VPO_3: boolean
  vaccine_VPI_1: boolean
  vaccine_VAR_1: boolean
  vaccine_VAA: boolean
  vaccine_VPI_2: boolean
  vaccine_MEN_A: boolean
  vaccine_VAR_2: boolean

  no_BCG_reason: string | null | ''
  no_VPO_0_reason: string | null | ''
  no_PENTA_1_reason: string | null | ''
  no_VPO_1_reason: string | null | ''
  no_PENTA_2_reason: string | null | ''
  no_VPO_2_reason: string | null | ''
  no_PENTA_3_reason: string | null | ''
  no_VPO_3_reason: string | null | ''
  no_VPI_1_reason: string | null | ''
  no_VAR_1_reason: string | null | ''
  no_VAA_reason: string | null | ''
  no_VPI_2_reason: string | null | ''
  no_MEN_A_reason: string | null | ''
  no_VAR_2_reason: string | null | ''
}

