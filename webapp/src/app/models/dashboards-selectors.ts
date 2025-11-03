import { ChwsPerformanceDashboard, ChwsVaccinationDashboard } from "./dashboards";
import { IndicatorsDataOutput } from "./interfaces";

export interface DashboardsHealth {
  ON_FETCHING: DashboardsActions;
}
  
export interface DashboardsData {
  CHWS_PERFORMANCES: IndicatorsDataOutput<ChwsPerformanceDashboard> | undefined;
  CHWS_VACCINES: IndicatorsDataOutput<ChwsVaccinationDashboard[]> | undefined;
}

export interface DashboardsActions {
  CHWS_PERFORMANCES?: boolean | string;
  CHWS_VACCINES?: boolean | string;
}
