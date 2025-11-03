import { IndicatorsDataOutput } from "./interfaces";
import { ChwsReport, FamilyPlanningReport, HouseholdRecapReport, MorbidityReport, PcimeNewbornReport, PromotionReport, ChwsMegQuantityUtils } from "./reports";

export interface ReportsHealth {
  IS_VALIDATED: ReportsActions;
  IS_ON_DHIS2: ReportsActions;
  ON_FETCHING: ReportsActions;
  ON_VALIDATION: ReportsActions;
  ON_CANCEL_VALIDATION: ReportsActions;
  ON_DHIS2_SENDING: ReportsActions;
  ON_DHIS2_SENDING_ERROR: ReportsActions;
}

export interface ReportsFilterData {
  CHWS_NEEDED: string[];
  CHWS_SELECTED: string[];
  SEND_DHIS2_ORGUNITS: { id?: string, external_id?: string, name?: string }[];
}


export interface ReportsData {
  MONTHLY_ACTIVITY: IndicatorsDataOutput<ChwsReport> | undefined;
  FAMILY_PLANNING: IndicatorsDataOutput<FamilyPlanningReport> | undefined;
  HOUSE_HOLD_RECAP: IndicatorsDataOutput<HouseholdRecapReport[]> | undefined;
  MORBIDITY: IndicatorsDataOutput<MorbidityReport> | undefined;
  PCIMNE_NEWBORN: PcimeNewbornReport | undefined;
  PROMOTION: IndicatorsDataOutput<PromotionReport> | undefined;
  CHWS_MEG_QUANTITIES: IndicatorsDataOutput<ChwsMegQuantityUtils[]> | undefined;
}

export interface ReportsActions {
  MONTHLY_ACTIVITY?: boolean | string;
  FAMILY_PLANNING?: boolean | string;
  HOUSE_HOLD_RECAP?: boolean | string;
  MORBIDITY?: boolean | string;
  PCIMNE_NEWBORN?: boolean | string;
  PROMOTION?: boolean | string;
  CHWS_MEG_QUANTITIES?: boolean | string;
}


// export interface ReportsElements {
//   MONTHLY_ACTIVITY: ChwsReport | undefined;
//   FAMILY_PLANNING: FamilyPlanningReport | undefined;
//   HOUSE_HOLD_RECAP: HouseholdRecapReport[] | undefined;
//   MORBIDITY: MorbidityReport | undefined;
//   PCIMNE_NEWBORN: PcimeNewbornReport | undefined;
//   PROMOTION: PromotionReport | undefined;
//   CHWS_MEG_QUANTITIES: ChwsMegQuantityUtils[] | undefined;
// }
