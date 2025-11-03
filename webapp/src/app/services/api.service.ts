import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstanteService } from './constantes.service';
import { Observable, switchMap } from 'rxjs';
import { User, Roles } from '@kossi-models/user-role';
import { notNull } from '../shared/functions';
import { UserContextService } from './user-context.service';
import { SyncOrgUnit, getOrgUnitFromDbFilter } from '@kossi-models/org-units';
import { Dhis2DataValueSetParams } from '@kossi-models/dhis2';
import { from } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ApiService {

  backendUrl!: string;
  customHeaders!: { headers: HttpHeaders };

  constructor(private http: HttpClient, private cst: ConstanteService, private userCtx: UserContextService,) {
    this.initializeService();
  }

  private async initializeService() {
    this.backendUrl = this.cst.backenUrl();
    this.customHeaders = await this.cst.CustomHttpHeaders();
  }

  async ApiParams(params?: any, mustLoggedIn: boolean = true): Promise<{ [key: string]: any }> {
    // if (mustLoggedIn && !this.userCtx.isLoggedIn()) return this.auth.logout();
    const fparams: any = notNull(params) ? params : {};
    const user = await this.userCtx.currentUser();
    fparams['userId'] = user?.id;
    fparams['appLoadToken'] = this.userCtx.APP_AUTH_TOKEN;
    return fparams;
  }




  getConfigs(): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/configs`;
    return from(this.ApiParams({ userHttpUrl, noLogData: true })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  appVersion(): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/configs/version`;
    return from(this.ApiParams({ userHttpUrl, noLogData: true })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  //START AUTH
  // public(url: string, prodApp?: boolean, ): Observable<any> {
  //   const userHttpUrl = `${this.backendUrl}/auth-user/${url}`;
  //   return from(this.ApiParams({prodApp}, false)).pipe(
  //     switchMap(fparams =>
  //       this.http.post(userHttpUrl, fparams, this.customHeaders)
  //     )
  //   );
  // }

  login(params: { credential: string, password: string }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/login`;
    return from(this.ApiParams({ ...params, loginModeCredents: true, userHttpUrl }, false)).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  register(user: User): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/register`;
    return from(this.ApiParams({ ...user, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  /** Rafraîchir le token */
  newToken(updateReload: boolean = false): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/new-token`;
    return from(this.ApiParams({ updateReload, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  //END AUTH

  getAllMigrationsPathList(): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/sql/getall`;
    return from(this.ApiParams({ userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  runAllMigrationsAvailable(runAllMigrations: boolean = true): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/sql/runall`;
    return from(this.ApiParams({ runAllMigrations, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  getOneMigrationsPath(migrationName: string): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/sql/getone`;
    return from(this.ApiParams({ migrationName, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  runOneMigrationAvailable(migrationName: string, runOneMigrations: boolean = true): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/sql/runone`;
    return from(this.ApiParams({ migrationName, runOneMigrations, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }


  saveSurvey(params: any): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/survey/save`;
    return from(this.ApiParams({ survey: params, userHttpUrl }, false)).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  getAverage(): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/survey/get-averages`;
    return from(this.ApiParams({ userHttpUrl }, false)).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  //START ADMIN

  sendSms(params: { phoneNumbers: string[], message: string }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/sms/send-sms`;
    return from(this.ApiParams({ ...params, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  sendCustomSms(params: { phone: string, message: string }[]): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/sms/send-coustom-sms`;
    return from(this.ApiParams({ phoneNumbersMessage: params, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  getUsers(): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/users`;
    return from(this.ApiParams({ userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  updateProfile(params: { id: string | undefined, fullname: string; email: string; phone: string; }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/update-user-profile`;
    return from(this.ApiParams({ ...params, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  updateUser(user: User): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/update-user`;
    return from(this.ApiParams({ ...user, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  updatePassword(params: { id: string | undefined, oldPassword: string, newPassword: string }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/update-user-password`;
    return from(this.ApiParams({ ...params, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  deleteUser(user: User, permanentDelete: boolean = false): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/delete-user`;
    return from(this.ApiParams({ ...user, permanentDelete, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  GetRoles(): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/roles`;
    return from(this.ApiParams({ userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  CreateRole(params: Roles): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/create-role`;
    return from(this.ApiParams({ ...params, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  UpdateRole(params: Roles): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/update-role`;
    return from(this.ApiParams({ ...params, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  DeleteRole(params: Roles): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/delete-role`;
    return from(this.ApiParams({ ...params, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  UserAuthorizations(): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/authorizations`;
    return from(this.ApiParams({ userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  UserRoutes(): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/auth-user/routes`;
    return from(this.ApiParams({ userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  ApiTokenAccessAction(params: { action: string, id?: number, token?: string, isActive?: boolean }): any {
    const userHttpUrl = `${this.backendUrl}/auth-user/api-access-key`;
    return from(this.ApiParams({ ...params, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  //END ADMIN


  //START REPPORTS
  GetPromotionReports({ months, year, chws, sync }: { months: string[], year: number, chws: string[], sync?: boolean }): Observable<any> {
    sync = sync ?? false;
    const userHttpUrl = `${this.backendUrl}/reports/promotion-reports`;
    return from(this.ApiParams({ months, year, chws, sync, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  GetFamilyPlanningReports({ months, year, chws, sync }: { months: string[], year: number, chws: string[], sync?: boolean }): Observable<any> {
    sync = sync ?? false;
    const userHttpUrl = `${this.backendUrl}/reports/family-planning-reports`;
    return from(this.ApiParams({ months, year, chws, sync, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  GetMorbidityReports({ months, year, chws, sync }: { months: string[], year: number, chws: string[], sync?: boolean }): Observable<any> {
    sync = sync ?? false;
    const userHttpUrl = `${this.backendUrl}/reports/morbidity-reports`;
    return from(this.ApiParams({ months, year, chws, sync, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  GetHouseholdRecapReports({ months, year, chws, sync }: { months: string[], year: number, chws: string[], sync?: boolean }): Observable<any> {
    sync = sync ?? false;
    const userHttpUrl = `${this.backendUrl}/reports/household-recaps-reports`;
    return from(this.ApiParams({ months, year, chws, sync, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  GetPcimeNewbornReports({ months, year, chws, sync }: { months: string[], year: number, chws: string[], sync?: boolean }): Observable<any> {
    sync = sync ?? false;
    const userHttpUrl = `${this.backendUrl}/reports/pcime-newborn-reports`;
    return from(this.ApiParams({ months, year, chws, sync, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  GetChwsReports({ months, year, chws, sync }: { months: string[], year: number, chws: string[], sync?: boolean }): Observable<any> {
    sync = sync ?? false;
    const userHttpUrl = `${this.backendUrl}/reports/chws-reports`;
    return from(this.ApiParams({ months, year, chws, sync, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  GetChwsMegSituationReports({ months, year, chws, sync }: { months: string[], year: number, chws: string[], sync?: boolean }): Observable<any> {
    sync = sync ?? false;
    const userHttpUrl = `${this.backendUrl}/reports/chws-meg-situation-reports`;
    return from(this.ApiParams({ months, year, chws, sync, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  //END REPPORTS



  //START VALIDATE REPPORTS
  ValidatePromotionReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/promotion-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  CancelValidatePromotionReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/cancel-promotion-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  ValidateFamilyPlanningReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/family-planning-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  CancelValidateFamilyPlanningReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/cancel-family-planning-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  ValidateMorbidityReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/morbidity-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  CancelValidateMorbidityReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/cancel-morbidity-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  ValidateHouseholdRecapReports({ months, year, chws, dataIds }: { months: string[], year: number, chws: string[], dataIds: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/household-recaps-reports-validation`;
    return from(this.ApiParams({ months, year, chws, dataIds, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  CancelValidateHouseholdRecapReports({ months, year, chws, dataIds }: { months: string[], year: number, chws: string[], dataIds: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/cancel-household-recaps-reports-validation`;
    return from(this.ApiParams({ months, year, chws, dataIds, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  ValidatePcimeNewbornReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/pcime-newborn-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  CancelValidatePcimeNewbornReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/cancel-pcime-newborn-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  ValidateChwsReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/chws-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  CancelValidateChwsReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/cancel-chws-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  ValidateChwsMegSituationReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/chws-meg-situation-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  CancelValidateChwsMegSituationReports({ months, year, chws }: { months: string[], year: number, chws: string[] }): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/reports/cancel-chws-meg-situation-reports-validation`;
    return from(this.ApiParams({ months, year, chws, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  //END VALIDATE REPPORTS



  //START DASHBOARD
  GetChwsVaccinationDashboards({ months, year, chws, sync }: { months: string[], year: number, chws: string[], sync?: boolean }): Observable<any> {
    sync = sync ?? false;
    const userHttpUrl = `${this.backendUrl}/dashboards/chws-vaccination-dashboards`;
    return from(this.ApiParams({ months, year, chws, sync, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  GetChwsPerformanceDashboards({ months, year, chws, sync }: { months: string[], year: number, chws: string[], sync?: boolean }): Observable<any> {
    sync = sync ?? false;
    const userHttpUrl = `${this.backendUrl}/dashboards/chws-performance-dashboards`;
    return from(this.ApiParams({ months, year, chws, sync, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  // GetChwsChartPerformanceDashboards({ year, chws, sync }: { year: number, chws: string[], sync?: boolean }): Observable<any> {
  //   sync = sync ?? false;
  //   const userHttpUrl = `${this.backendUrl}/dashboards/chws-chart-performance-dashboards`;
  //   return from(this.ApiParams({ year, chws, sync, userHttpUrl })).pipe(
  //     switchMap(fparams =>
  //       this.http.post(userHttpUrl, fparams, this.customHeaders)
  //     )
  //   );
  // }
  //END DASHBOARD



  GetSites(param?: getOrgUnitFromDbFilter): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/org-units/sites`;
    return from(this.ApiParams({ ...param, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  GetZones(param?: getOrgUnitFromDbFilter): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/org-units/zones`;
    return from(this.ApiParams({ ...param, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  GetFamilys(param?: getOrgUnitFromDbFilter): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/org-units/families`;
    return from(this.ApiParams({ ...param, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  GetSupervisors(param?: getOrgUnitFromDbFilter): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/org-units/supervisors`;
    return from(this.ApiParams({ ...param, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  GetChws(param?: getOrgUnitFromDbFilter): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/org-units/chws`;
    return from(this.ApiParams({ ...param, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  GetPatients(param?: getOrgUnitFromDbFilter): Observable<any> {
    const userHttpUrl = `${this.backendUrl}/org-units/patients`;
    return from(this.ApiParams({ ...param, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  //END ORG UNITS


  //START DATABASES UTILS
  GetDataToDeleteFromCouchDb(params: { cible: string[], start_date: string, end_date: string, type: string }): any {
    const fparams = this.ApiParams();
    const userHttpUrl = `${this.backendUrl}/database/couchdb/list-data-to-delete`;
    return from(this.ApiParams({ ...params, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  deleteDataFromCouchDb(data: { _deleted: boolean, _id: string, _rev: string, _table: string }[], typeOfData: string): any {
    const userHttpUrl = `${this.backendUrl}/database/couchdb/detele-data`;
    return from(this.ApiParams({ data_to_delete: data, type: typeOfData, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  updateUserFacilityContactPlace(params: { contact: string, parent: string, new_parent: string }): any {
    const userHttpUrl = `${this.backendUrl}/database/couchdb/update-user-facility-contact-place`;
    return from(this.ApiParams({ ...params, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  getDatabaseEntities(): any {
    const userHttpUrl = `${this.backendUrl}/database/postgres/entities`;
    return from(this.ApiParams({ userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  truncateDatabase(params: { procide: boolean, entities: { name: string, table: string }[], action: "TRUNCATE" | "DROP" }): any {
    const userHttpUrl = `${this.backendUrl}/database/postgres/truncate`;
    return from(this.ApiParams({ ...params, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }
  //END DATABASES UTILS



  //START DHIS2
  SendChwsReportsToDhis2({ username, password, data, period, months, year, chws, orgunit }: Dhis2DataValueSetParams): any {
    const userHttpUrl = `${this.backendUrl}/dhis2/send/monthly-activity`;
    return from(this.ApiParams({ username, password, data, period, months, year, chws, orgunit, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  SendFamilyPlanningActivitiesToDhis2({ username, password, data, period, months, year, chws, orgunit }: Dhis2DataValueSetParams): any {
    const userHttpUrl = `${this.backendUrl}/dhis2/send/family-planning-activity`;
    return from(this.ApiParams({ username, password, data, period, months, year, chws, orgunit, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  SendHouseholdActivitiesToDhis2({ username, password, data, period, months, year, chws, orgunit }: Dhis2DataValueSetParams): any {
    const userHttpUrl = `${this.backendUrl}/dhis2/send/household-activity`;
    return from(this.ApiParams({ username, password, data, period, months, year, chws, orgunit, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  SendMorbidityActivitiesToDhis2({ username, password, data, period, months, year, chws, orgunit }: Dhis2DataValueSetParams): any {
    const fparams = this.ApiParams();
    const userHttpUrl = `${this.backendUrl}/dhis2/send/morbidity-activity`;
    return from(this.ApiParams({ username, password, data, period, months, year, chws, orgunit, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  SendPcimneNewbornActivitiesToDhis2({ username, password, data, period, months, year, chws, orgunit }: Dhis2DataValueSetParams): any {
    const userHttpUrl = `${this.backendUrl}/dhis2/send/pcimne-newborn-activity`;
    return from(this.ApiParams({ username, password, data, period, months, year, chws, orgunit, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  SendPromotionActivitiesToDhis2({ username, password, data, period, months, year, chws, orgunit }: Dhis2DataValueSetParams): any {
    const userHttpUrl = `${this.backendUrl}/dhis2/send/promotional-activity`;
    return from(this.ApiParams({ username, password, data, period, months, year, chws, orgunit, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  SendChwsMegSituationActivitiesToDhis2({ username, password, data, period, months, year, chws, orgunit }: Dhis2DataValueSetParams): any {
    const userHttpUrl = `${this.backendUrl}/dhis2/send/chws-meg-situation-activity`;
    return from(this.ApiParams({ username, password, data, period, months, year, chws, orgunit, userHttpUrl })).pipe(
      switchMap(fparams =>
        this.http.post(userHttpUrl, fparams, this.customHeaders)
      )
    );
  }

  //END DHIS2



  // async get(dbName: 'users' | 'dashboard') {
  //   try {
  //     const response = await axios.get('/api/data');
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     throw error;
  //   }
  // }

}
