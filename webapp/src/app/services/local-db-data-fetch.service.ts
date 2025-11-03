import { Injectable } from '@angular/core';
// import axios from 'axios';
import { ChwsReport, FamilyPlanningReport, HouseholdRecapReport, MorbidityReport, PcimeNewbornReport, PcimeNewbornReportUtils, PromotionReport, ChwsMegQuantityUtils, ChwsMegSituationReport } from '@kossi-models/reports';
import { IndexedDbService } from './indexed-db.service';
import { ApiService } from './api.service';
import { ChwsChartPerformanceDashboard, ChwsPerformanceDashboard, ChwsVaccinationDashboard, ChwsVaccinationDashboardDbOutput } from '@kossi-models/dashboards';
import { notNull } from '../shared/functions';
import { UserContextService } from './user-context.service';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { IndicatorsDataOutput } from '@kossi-models/interfaces';
import { FunctionsService } from './functions.service';
import { DbSyncService } from './db-sync.service';


@Injectable({
  providedIn: 'root'
})
export class LocalDbDataFetchService {
  private readonly keyPath: string = 'id';

  constructor(private indexdb: IndexedDbService, private db: DbSyncService, private api: ApiService, private userCtx: UserContextService, private func: FunctionsService) { }

  // ############################## REPORTS ################################



  async GetPromotionReports({ months, year, chws }: { months: string[], year: number, chws: string[] }, isOnline: boolean): Promise<IndicatorsDataOutput<PromotionReport> | undefined> {
    const USER = await this.userCtx.currentUser();
    let promotionReport: PromotionReport[] | undefined;

    if (USER?.role.canUseOfflineMode === true && !isOnline) {
      promotionReport = await this.indexdb.getAll<PromotionReport>('promotion_reports', this.keyPath, (item) => {
        return months.includes(item.month) && year === parseInt(`${item.year}`) && notNull(item.chw?.id) && chws.includes(item.chw!.id);
      });
    } else {
      try {
        promotionReport = await firstValueFrom(
          this.api.GetPromotionReports({ months, year, chws }).pipe(
            map((res$: { status: number; data: PromotionReport[] }) => res$.status === 200 ? res$.data : undefined),
            catchError(() => of(undefined))
          )
        );
        if (promotionReport && promotionReport.length > 0) {
          await this.indexdb.saveMany<PromotionReport>({ dbName: 'promotion_reports', datas: promotionReport, callback: () => this.db.SyncPromotionReports({ months, year, chws }).subscribe() });

        }

      } catch (error) {
        console.error("Error fetching ChwsReports:", error);
        return undefined;
      }
    }

    return await this.func.executeIndexDBStoredFunction<PromotionReport>('promotionTransformFunction', promotionReport) as IndicatorsDataOutput<PromotionReport> | undefined;

  }

  async GetFamilyPlanningReports({ months, year, chws }: { months: string[], year: number, chws: string[] }, isOnline: boolean): Promise<IndicatorsDataOutput<FamilyPlanningReport> | undefined> {
    const USER = await this.userCtx.currentUser();
    let familyPlanningReport: FamilyPlanningReport[] | undefined;

    if (USER?.role.canUseOfflineMode === true && !isOnline) {
      familyPlanningReport = await this.indexdb.getAll<FamilyPlanningReport>('family_planning_reports', this.keyPath, (item) => {
        return months.includes(item.month) && year === parseInt(`${item.year}`) && notNull(item.chw?.id) && chws.includes(item.chw!.id);
      });
    } else {
      try {
        familyPlanningReport = await firstValueFrom(
          this.api.GetFamilyPlanningReports({ months, year, chws }).pipe(
            map((res$: { status: number; data: FamilyPlanningReport[] }) => res$.status === 200 ? res$.data : undefined),
            catchError(() => of(undefined))
          )
        );
        if (familyPlanningReport && familyPlanningReport.length > 0) {
          await this.indexdb.saveMany<FamilyPlanningReport>({ dbName: 'family_planning_reports', datas: familyPlanningReport, callback: () => this.db.SyncFamilyPlanningReports({ months, year, chws }).subscribe() });
        }
      } catch (error) {
        console.error("Error fetching ChwsReports:", error);
        return undefined;
      }
    }
    return await this.func.executeIndexDBStoredFunction<FamilyPlanningReport>('familyPlanningTransformFunction', familyPlanningReport) as IndicatorsDataOutput<FamilyPlanningReport> | undefined;

  }

  async GetMorbidityReports({ months, year, chws }: { months: string[], year: number, chws: string[] }, isOnline: boolean): Promise<IndicatorsDataOutput<MorbidityReport> | undefined> {
    const USER = await this.userCtx.currentUser();
    let morbidityReport: MorbidityReport[] | undefined;

    if (USER?.role.canUseOfflineMode === true && !isOnline) {
      morbidityReport = await this.indexdb.getAll<MorbidityReport>('morbidity_reports', this.keyPath, (item) => {
        return months.includes(item.month) && year === parseInt(`${item.year}`) && notNull(item.chw?.id) && chws.includes(item.chw!.id);
      });
    } else {
      try {
        morbidityReport = await firstValueFrom(
          this.api.GetMorbidityReports({ months, year, chws }).pipe(
            map((res$: { status: number; data: MorbidityReport[] }) => res$.status === 200 ? res$.data : undefined),
            catchError(() => of(undefined))
          )
        );
        if (morbidityReport && morbidityReport.length > 0) {
          await this.indexdb.saveMany<MorbidityReport>({ dbName: 'morbidity_reports', datas: morbidityReport, callback: () => this.db.SyncMorbidityReports({ months, year, chws }).subscribe() });
        }
      } catch (error) {
        console.error("Error fetching ChwsReports:", error);
        return undefined;
      }
    }
    return await this.func.executeIndexDBStoredFunction<MorbidityReport>('morbidityTransformFunction', morbidityReport) as IndicatorsDataOutput<MorbidityReport> | undefined;
  }

  async GetHouseholdRecapReports({ months, year, chws }: { months: string[], year: number, chws: string[] }, isOnline: boolean): Promise<IndicatorsDataOutput<HouseholdRecapReport[]> | undefined> {
    const USER = await this.userCtx.currentUser();
    let householdRecapReport: HouseholdRecapReport[] | undefined;

    if (USER?.role.canUseOfflineMode === true && !isOnline) {
      householdRecapReport = await this.indexdb.getAll<HouseholdRecapReport>('household_recaps_reports', this.keyPath, (item) => {
        return months.includes(item.month) && year === parseInt(`${item.year}`) && notNull(item.chw?.id) && chws.includes(item.chw!.id);
      });
    } else {
      try {
        householdRecapReport = await firstValueFrom(
          this.api.GetHouseholdRecapReports({ months, year, chws }).pipe(
            map((res$: { status: number; data: HouseholdRecapReport[] }) => res$.status === 200 ? res$.data : undefined),
            catchError(() => of(undefined))
          )
        );
        if (householdRecapReport && householdRecapReport.length > 0) {
          await this.indexdb.saveMany<HouseholdRecapReport>({ dbName: 'household_recaps_reports', datas: householdRecapReport, callback: () => this.db.SyncHouseholdRecapReports({ months, year, chws }).subscribe() });
        }
      } catch (error) {
        console.error("Error fetching ChwsReports:", error);
        return undefined;
      }
    }
    return await this.func.executeIndexDBStoredFunction<HouseholdRecapReport>('householdTransformFunction', householdRecapReport) as IndicatorsDataOutput<HouseholdRecapReport[]> | undefined;

  }

  async GetPcimeNewbornReports({ months, year, chws }: { months: string[], year: number, chws: string[] }, isOnline: boolean): Promise<IndicatorsDataOutput<PcimeNewbornReportUtils[]> | undefined> {
    const USER = await this.userCtx.currentUser();
    let PcimeNewbornReport: PcimeNewbornReport[] | undefined;

    if (USER?.role.canUseOfflineMode === true && !isOnline) {
      PcimeNewbornReport = await this.indexdb.getAll<PcimeNewbornReport>('pcime_newborn_reports', this.keyPath, (item) => {
        return months.includes(item.month) && year === parseInt(`${item.year}`) && notNull(item.chw?.id) && chws.includes(item.chw!.id);
      });
    } else {
      try {
        PcimeNewbornReport = await firstValueFrom(
          this.api.GetPcimeNewbornReports({ months, year, chws }).pipe(
            map((res$: { status: number; data: PcimeNewbornReport[] }) => res$.status === 200 ? res$.data : undefined),
            catchError(() => of(undefined))
          )
        );
        if (PcimeNewbornReport && PcimeNewbornReport.length > 0) {
          await this.indexdb.saveMany<PcimeNewbornReport>({ dbName: 'pcime_newborn_reports', datas: PcimeNewbornReport, callback: () => this.db.SyncPcimeNewbornReports({ months, year, chws }).subscribe() });
        }
      } catch (error) {
        console.error("Error fetching ChwsReports:", error);
        return undefined;
      }
    }
    return await this.func.executeIndexDBStoredFunction<PcimeNewbornReport>('pcimneNewbornTransformFunction', PcimeNewbornReport) as IndicatorsDataOutput<PcimeNewbornReportUtils[]> | undefined;

  }

  async GetChwsReports({ months, year, chws }: { months: string[]; year: number; chws: string[] }, isOnline: boolean): Promise<IndicatorsDataOutput<ChwsReport> | undefined> {
    const USER = await this.userCtx.currentUser();
    let ChwsReports: ChwsReport[] | undefined;

    if (USER?.role.canUseOfflineMode === true && !isOnline) {
      ChwsReports = await this.indexdb.getAll<ChwsReport>('chws_reports', this.keyPath, (item) => {
        return months.includes(item.month) && year === parseInt(`${item.year}`) && notNull(item.chw?.id) && chws.includes(item.chw!.id);
      });
    } else {
      try {
        ChwsReports = await firstValueFrom(
          this.api.GetChwsReports({ months, year, chws }).pipe(
            map((res$: { status: number; data: ChwsReport[] }) => res$.status === 200 ? res$.data : undefined),
            catchError(() => of(undefined))
          )
        );
        if (ChwsReports && ChwsReports.length > 0) {
          await this.indexdb.saveMany<ChwsReport>({ dbName: 'chws_reports', datas: ChwsReports, callback: () => this.db.SyncChwsReports({ months, year, chws }).subscribe() });
        }
      } catch (error) {
        console.error("Error fetching ChwsReports:", error);
        return undefined;
      }
    }
    return await this.func.executeIndexDBStoredFunction<ChwsReport>('ChwsTransformFunction', ChwsReports) as IndicatorsDataOutput<ChwsReport> | undefined;
  }

  async GetChwsMegSituationReports({ months, year, chws }: { months: string[], year: number, chws: string[] }, isOnline: boolean): Promise<IndicatorsDataOutput<ChwsMegQuantityUtils[]> | undefined> {
    const USER = await this.userCtx.currentUser();
    let chwsMegReports: ChwsMegSituationReport[] | undefined;

    if (USER?.role.canUseOfflineMode === true && !isOnline) {
      chwsMegReports = await this.indexdb.getAll<ChwsMegSituationReport>('chws_meg_situation_reports', this.keyPath, (item) => {
        return months.includes(item.month) && year === parseInt(`${item.year}`) && notNull(item.chw?.id) && chws.includes(item.chw!.id);
      });
    } else {
      try {
        chwsMegReports = await firstValueFrom(
          this.api.GetChwsMegSituationReports({ months, year, chws }).pipe(
            map((res$: { status: number, data: ChwsMegSituationReport[] }) => res$.status === 200 ? res$.data : undefined),
            catchError(() => of(undefined))
          )
        );
        if (chwsMegReports && chwsMegReports.length > 0) {
          await this.indexdb.saveMany<ChwsMegSituationReport>({ dbName: 'chws_meg_situation_reports', datas: chwsMegReports, callback: () => this.db.SyncChwsMegSituationReports({ months, year, chws }).subscribe() });
        }
      } catch (error) {
        console.error("Error fetching ChwsReports:", error);
        return undefined;
      }
    }
    return await this.func.executeIndexDBStoredFunction<ChwsMegSituationReport>('chwsMegTransformFunction', chwsMegReports) as IndicatorsDataOutput<ChwsMegQuantityUtils[]> | undefined;

  }

  // ############################## DASHBOARDS ################################

  async GetChwsVaccinationDashboard({ months, year, chws }: { months: string[], year: number, chws: string[] }, isOnline: boolean): Promise<IndicatorsDataOutput<ChwsVaccinationDashboard[][]> | undefined> {
    const USER = await this.userCtx.currentUser();
    let chwsVaccineDashboard: ChwsVaccinationDashboardDbOutput[] | undefined;

    if (USER?.role.canUseOfflineMode === true && !isOnline) {
      chwsVaccineDashboard = await this.indexdb.getAll<ChwsVaccinationDashboardDbOutput>('chws_vaccination_dashboard', this.keyPath, (item) => {
        return months.includes(item.month) && year === parseInt(`${item.year}`) && notNull(item.chw?.id) && chws.includes(item.chw!.id);
      });
    } else {
      try {
        chwsVaccineDashboard = await firstValueFrom(
          this.api.GetChwsVaccinationDashboards({ months, year, chws }).pipe(
            map((res$: { status: number; data: ChwsVaccinationDashboardDbOutput[] }) => res$.status === 200 ? res$.data : undefined),
            catchError(() => of(undefined))
          )
        );
        if (chwsVaccineDashboard && chwsVaccineDashboard.length > 0) {
          await this.indexdb.saveMany<ChwsVaccinationDashboardDbOutput>({ dbName: 'chws_vaccination_dashboard', datas: chwsVaccineDashboard, callback: () => this.db.SyncChwsVaccinationDashboards({ months, year, chws }) });
        }
      } catch (error) {
        console.error("Error fetching ChwsReports:", error);
        return undefined;
      }
    }
    return await this.func.executeIndexDBStoredFunction<ChwsVaccinationDashboardDbOutput>('vaccineTransformFunction', chwsVaccineDashboard) as IndicatorsDataOutput<ChwsVaccinationDashboard[][]> | undefined;

  }

  async GetChwsPerformanceDashboard({ months, year, chws }: { months: string[], year: number, chws: string[] }, isOnline: boolean): Promise<IndicatorsDataOutput<ChwsPerformanceDashboard> | undefined> {
    const USER = await this.userCtx.currentUser();
    let chwsPerfDashboard: ChwsPerformanceDashboard[] | undefined;
    let chwsChartPerfDashboard: ChwsChartPerformanceDashboard[] = [];

    if (USER?.role.canUseOfflineMode === true && !isOnline) {
      chwsPerfDashboard = await this.indexdb.getAll<ChwsPerformanceDashboard>('chws_performance_dashboard', this.keyPath, (item) => {
        return months.includes(item.month) && year === parseInt(`${item.year}`) && notNull(item.chw?.id) && chws.includes(item.chw!.id);
      });
      if (chws.length === 1) {
        chwsChartPerfDashboard = await this.indexdb.getAll<ChwsChartPerformanceDashboard>('chws_chart_performance_dashboard', this.keyPath, (item) => {
          return year === parseInt(`${item.year}`) && notNull(item.chw?.id) && chws.includes(item.chw!.id);
        });
      }
    } else {
      try {
        const output = await firstValueFrom(
          this.api.GetChwsPerformanceDashboards({ months, year, chws }).pipe(
            map((res$: { status: number; data: ChwsPerformanceDashboard[], chart: ChwsChartPerformanceDashboard[] }) => res$.status === 200 ? { perf: res$.data, chart: res$.chart } : undefined),
            catchError(() => of(undefined))
          )
        );

        if (output) {
          chwsPerfDashboard = output.perf;
          chwsChartPerfDashboard = output.chart ?? [];

          if (chwsPerfDashboard && chwsPerfDashboard.length > 0) {
            await this.indexdb.saveMany<ChwsPerformanceDashboard>({ dbName: 'chws_performance_dashboard', datas: chwsPerfDashboard, callback: () => this.db.SyncChwsPerformanceDashboards({ months, year, chws }) });
          }
          if (chwsChartPerfDashboard && chwsChartPerfDashboard.length > 0) {
            await this.indexdb.saveMany<ChwsChartPerformanceDashboard>({ dbName: 'chws_chart_performance_dashboard', datas: chwsChartPerfDashboard, callback: () => this.db.SyncChwsPerformanceDashboards({ months, year, chws }) });
          }
        }
      } catch (error) {
        console.error("Error fetching ChwsReports:", error);
        return undefined;
      }
    }
    return await this.func.executeIndexDBStoredFunction<ChwsPerformanceDashboard>('performanceChartTransformFunction', chwsPerfDashboard, chwsChartPerfDashboard, true) as IndicatorsDataOutput<ChwsPerformanceDashboard> | undefined;

  }
}
