import { Injectable } from '@angular/core';
// import axios from 'axios';
import { RETRY_MILLIS } from '../shared/functions';
import { FamilyPlanningReport, HouseholdRecapReport, ChwsReport, MorbidityReport, PromotionReport, PcimeNewbornReport, ChwsMegSituationReport } from '@kossi-models/reports';
import { IndexedDbService } from './indexed-db.service';
import { ApiService } from './api.service';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { ChwsChartPerformanceDashboard, ChwsPerformanceDashboard, ChwsVaccinationDashboard, ChwsVaccinationDashboardDbOutput } from '@kossi-models/dashboards';

@Injectable({
  providedIn: 'root'
})
export class DbSyncService {
  private readonly keyPath: string = 'id';

  constructor(private indexdb: IndexedDbService, private api: ApiService) {
  }

  async all({ months, year, chws }: { months: string[], year: number, chws: string[] }): Promise<boolean> {
    console.info('Start sync from cloud to local ...');
    try {
      const d1 = await this.SyncChwsReports({ months, year, chws }).toPromise();
      const d2 = await this.SyncPromotionReports({ months, year, chws }).toPromise();
      const d3 = await this.SyncFamilyPlanningReports({ months, year, chws }).toPromise();
      const d4 = await this.SyncMorbidityReports({ months, year, chws }).toPromise();
      const d5 = await this.SyncHouseholdRecapReports({ months, year, chws }).toPromise();
      const d6 = await this.SyncPcimeNewbornReports({ months, year, chws }).toPromise();
      const d7 = await this.SyncChwsVaccinationDashboards({ months, year, chws }).toPromise();
      const d8 = await this.SyncChwsPerformanceDashboards({ months, year, chws }).toPromise();
      // const d9 = await this.SyncChwsChartPerformanceDashboards({ year, chws }).toPromise();
      const d9 = true;
      const d10 = await this.SyncChwsMegSituationReports({ months, year, chws }).toPromise();


      console.info('Successfully synced to local!');

      return d1 === true && d2 === true && d3 === true && d4 === true && d5 === true && d6 === true && d7 === true && d8 === true && d9 === true && d10 === true;
    } catch (err) {
      console.error('Error initialising watching for db changes (changes.service.ts: 108)', err);
      console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
      setTimeout(() => this.all({ months, year, chws }), RETRY_MILLIS);
      return false;
    }
  }

  SyncPromotionReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<boolean> {
    return this.api.GetPromotionReports({ months, year, chws, sync: true }).pipe(
      switchMap(async (res$: { status: number, data: PromotionReport[] }) => {
        if (res$.status !== 200) {
          console.error('❌ Error while syncing PromotionReport.');
          console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
          setTimeout(() => this.SyncPromotionReports({ months, year, chws }).subscribe(), RETRY_MILLIS);
          return false;
        }
        if (res$.data.length > 0) {
          await this.indexdb.saveMany<PromotionReport>({ dbName: 'promotion_reports', datas: res$.data, callback: () => this.SyncPromotionReports({ months, year, chws }).subscribe() });
        }
        return true;
      }),
      catchError((err: any) => {
        console.error('❌ Error while syncing PromotionReport:', err);
        console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
        setTimeout(() => this.SyncPromotionReports({ months, year, chws }).subscribe(), RETRY_MILLIS);
        return of(false);
      })
    );
  }



  SyncFamilyPlanningReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<boolean> {
    return this.api.GetFamilyPlanningReports({ months, year, chws, sync: true }).pipe(
      switchMap(async (res$: { status: number, data: FamilyPlanningReport[] }) => {
        if (res$.status !== 200) {
          console.error('❌ Error while syncing FamilyPlanningReport:');
          console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
          setTimeout(() => this.SyncFamilyPlanningReports({ months, year, chws }), RETRY_MILLIS);
          return false;
        }
        if (res$.data.length > 0) {
          await this.indexdb.saveMany<FamilyPlanningReport>({ dbName: 'family_planning_reports', datas: res$.data, callback: () => this.SyncFamilyPlanningReports({ months, year, chws }).subscribe() });
        }
        return true;
      }),
      catchError((err: any) => {
        console.error('❌ Error while syncing FamilyPlanningReport:', err);
        console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
        setTimeout(() => this.SyncFamilyPlanningReports({ months, year, chws }), RETRY_MILLIS);
        return of(false);
      })
    );
  }

  SyncMorbidityReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<boolean> {
    return this.api.GetMorbidityReports({ months, year, chws, sync: true }).pipe(
      switchMap(async (res$: { status: number, data: MorbidityReport[] }) => {
        if (res$.status !== 200) {
          console.error('❌ Error while syncing MorbidityReport:');
          console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
          setTimeout(() => this.SyncMorbidityReports({ months, year, chws }), RETRY_MILLIS);
          return false;
        }
        if (res$.data.length > 0) {
          await this.indexdb.saveMany<MorbidityReport>({ dbName: 'morbidity_reports', datas: res$.data, callback: () => this.SyncMorbidityReports({ months, year, chws }).subscribe() });
        }
        return true;
      }),
      catchError((err: any) => {
        console.error('❌ Error while syncing HealthProblemsMorbidityReport:', err);
        console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
        setTimeout(() => this.SyncMorbidityReports({ months, year, chws }), RETRY_MILLIS);
        return of(false);
      })
    );
  }

  SyncHouseholdRecapReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<boolean> {
    return this.api.GetHouseholdRecapReports({ months, year, chws, sync: true }).pipe(
      switchMap(async (res$: { status: number, data: HouseholdRecapReport[] }) => {
        if (res$.status !== 200) {
          console.error('❌ Error while syncing HouseholdRecapReport:');
          console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
          setTimeout(() => this.SyncHouseholdRecapReports({ months, year, chws }), RETRY_MILLIS);
          return false;
        }
        if (res$.data.length > 0) {
          await this.indexdb.saveMany<HouseholdRecapReport>({ dbName: 'household_recaps_reports', datas: res$.data, callback: () => this.SyncHouseholdRecapReports({ months, year, chws }).subscribe() });
        }
        return true;
      }),
      catchError((err: any) => {
        console.error('❌ Error while syncing HouseholdRecapReport:', err);
        console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
        setTimeout(() => this.SyncHouseholdRecapReports({ months, year, chws }), RETRY_MILLIS);
        return of(false);
      })
    );
  }

  SyncPcimeNewbornReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<boolean> {
    return this.api.GetPcimeNewbornReports({ months, year, chws, sync: true }).pipe(
      switchMap(async (res$: { status: number, data: PcimeNewbornReport[] }) => {
        if (res$.status !== 200) {
          console.error('❌ Error while syncing PcimeNewbornReport:');
          console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
          setTimeout(() => this.SyncPcimeNewbornReports({ months, year, chws }), RETRY_MILLIS);
          return false;
        }
        if (res$.data.length > 0) {
          await this.indexdb.saveMany<PcimeNewbornReport>({ dbName: 'pcime_newborn_reports', datas: res$.data, callback: () => this.SyncPcimeNewbornReports({ months, year, chws }).subscribe() });
        }
        return true;
      }),
      catchError((err: any) => {
        console.error('❌ Error while syncing PcimeNewbornReport:', err);
        console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
        setTimeout(() => this.SyncPcimeNewbornReports({ months, year, chws }), RETRY_MILLIS);
        return of(false);
      })
    );
  }

  SyncChwsReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<boolean> {
    return this.api.GetChwsReports({ months, year, chws, sync: true }).pipe(
      switchMap(async (res$: { status: number, data: ChwsReport[] }) => {
        if (res$.status !== 200) {
          console.error('❌ Error while syncing ChwsReport:');
          console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
          setTimeout(() => this.SyncChwsReports({ months, year, chws }), RETRY_MILLIS);
          return false;
        }
        if (res$.data.length > 0) {
          await this.indexdb.saveMany<ChwsReport>({ dbName: 'chws_reports', datas: res$.data, callback: () => this.SyncChwsReports({ months, year, chws }).subscribe() });
        }
        return true;
      }),
      catchError((err: any) => {
        console.error('❌ Error while syncing ChwsReport:', err);
        console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
        setTimeout(() => this.SyncChwsReports({ months, year, chws }), RETRY_MILLIS);
        return of(false);
      })
    );
  }

  SyncChwsMegSituationReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<boolean> {
    return this.api.GetChwsMegSituationReports({ months, year, chws, sync: true }).pipe(
      switchMap(async (res$: { status: number, data: ChwsMegSituationReport[] }) => {
        if (res$.status !== 200) {
          console.error('❌ Error while syncing ChwsMegSituationReports:');
          console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
          setTimeout(() => this.SyncChwsMegSituationReports({ months, year, chws }), RETRY_MILLIS);
          return false;
        }
        if (res$.data.length > 0) {
          await this.indexdb.saveMany<ChwsMegSituationReport>({ dbName: 'chws_meg_situation_reports', datas: res$.data, callback: () => this.SyncChwsMegSituationReports({ months, year, chws }).subscribe() });
        }
        return true;
      }),
      catchError((err: any) => {
        console.error('❌ Error while syncing ChwsMegSituationReports:', err);
        console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
        setTimeout(() => this.SyncChwsMegSituationReports({ months, year, chws }), RETRY_MILLIS);
        return of(false);
      })
    );
  }

  // ##################### DASHBOARDS #####################
  SyncChwsVaccinationDashboards({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<boolean> {
    return this.api.GetChwsVaccinationDashboards({ months, year, chws, sync: true }).pipe(
      switchMap(async (res$: { status: number, data: ChwsVaccinationDashboardDbOutput[] }) => {
        if (res$.status !== 200) {
          console.error('❌ Error while syncing ChwsVaccinationDashboard:');
          console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
          setTimeout(() => this.SyncChwsVaccinationDashboards({ months, year, chws }), RETRY_MILLIS);
          return false;
        }
        if (res$.data.length > 0) {
          await this.indexdb.saveMany<ChwsVaccinationDashboardDbOutput>({ dbName: 'chws_vaccination_dashboard', datas: res$.data, callback: () => this.SyncChwsVaccinationDashboards({ months, year, chws }) });
        }
        return true;
      }),
      catchError((err: any) => {
        console.error('❌ Error while syncing ChwsVaccinationDashboard:', err);
        console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
        setTimeout(() => this.SyncChwsVaccinationDashboards({ months, year, chws }), RETRY_MILLIS);
        return of(false);
      })
    );
  }

  SyncChwsPerformanceDashboards({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<boolean> {
    return this.api.GetChwsPerformanceDashboards({ months, year, chws, sync: true }).pipe(
      switchMap(async (res$: { status: number, data: ChwsPerformanceDashboard[], chart: ChwsChartPerformanceDashboard[] }) => {
        if (res$.status !== 200) {
          console.error('❌ Error while syncing ChwsPerformanceDashboard:');
          console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
          setTimeout(() => this.SyncChwsPerformanceDashboards({ months, year, chws }), RETRY_MILLIS);
          return false;
        }
        if (res$.data.length > 0) {
          await this.indexdb.saveMany<ChwsPerformanceDashboard>({ dbName: 'chws_performance_dashboard', datas: res$.data, callback: () => this.SyncChwsPerformanceDashboards({ months, year, chws }) });
        }
        if (res$.data.length > 0) {
          await this.indexdb.saveMany<ChwsChartPerformanceDashboard>({ dbName: 'chws_chart_performance_dashboard', datas: res$.data, callback: () => this.SyncChwsPerformanceDashboards({ months, year, chws }) });
        }
        return true;
      }),
      catchError((err: any) => {
        console.error('❌ Error while syncing ChwsPerformanceDashboard:', err);
        console.log(`🔄 Retrying in ${RETRY_MILLIS / 1000} seconds...`);
        setTimeout(() => this.SyncChwsPerformanceDashboards({ months, year, chws }), RETRY_MILLIS);
        return of(false);
      })
    );
  }

}
