import { Component, OnInit } from '@angular/core';
import { SitesMap, ZonesMap, SupervisorsMap, ChwsMap } from '@kossi-models/org-unit-interface';
import { ApiService } from '@kossi-services/api.service';
import { ModalService } from '@kossi-services/modal.service';
import { SnackbarService } from '@kossi-services/snackbar.service';
import { UserContextService } from '@kossi-services/user-context.service';
import { User, Roles } from '@kossi-models/user-role';
import { ConstanteService } from '@kossi-src/app/services/constantes.service';
import { userRoles } from '@kossi-shared/functions';
import { NewUserUtils } from '@kossi-models/interfaces';
import { CreateUpdateDeleteShowUserComponent } from './create-update-delete-show/create-update-delete-show.component';

@Component({
  standalone: false,
  selector: 'app-users-view',
  templateUrl: `./users.component.html`,
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {

  users$: User[] = [];
  roles$: Roles[] = [];

  sites: SitesMap[] = [];
  private zonesList: ZonesMap[] = [];
  private supervisorsList: SupervisorsMap[] = [];
  private chwsList: ChwsMap[] = [];
  
  APP_LOGO: string = '';
  USER!: User | null;


  constructor(private userCtx: UserContextService, private api: ApiService, private snackbar: SnackbarService, private mService: ModalService, private cst: ConstanteService) {
    this.initializeComponent();
  }

  private async initializeComponent() {
    this.APP_LOGO = this.cst.APP_LOGO;
    this.USER = await this.userCtx.currentUser();
  }

  ngOnInit(): void {
    this.GetUsers();
    this.GetRoles();
    this.GetSites();
    this.GetZones();
    this.GetSupervisors();
    this.GetChws();
  }


  OrgUnitsIsEmpty(user: User): boolean {
    const data = [...(user.sites ?? []), ...(user.zones ?? [])];
    return data.length === 0;
  }

  isSuperUser(user: User) {
    const role = userRoles(user.authorizations ?? [], user.routes ?? [])
    return role?.isSuperUser === true;
  }

  GetRoles() {
    this.api.GetRoles().subscribe((_c$: { status: number, data: Roles[] | any }) => {
      if (_c$.status == 200) this.roles$ = _c$.data;
    }, (err: any) => { });
  }

  GetUsers() {
    this.api.getUsers().subscribe((res: { status: number, data: any }) => {
      if (res.status === 200) {
        this.users$ = res.data;
      }
    }, (err: any) => { console.log(err) });
  }

  GetSites() {
    this.api.GetSites().subscribe((res: { status: number, data: SitesMap[] }) => {
      if (res.status === 200) this.sites = res.data;
    }, (err: any) => { console.log(err) });
  }

  GetZones() {
    this.api.GetZones().subscribe((res: { status: number, data: ZonesMap[] }) => {
      if (res.status === 200) this.zonesList = res.data;
    }, (err: any) => { console.log(err) });
  }

  GetSupervisors() {
    this.api.GetSupervisors().subscribe((res: { status: number, data: SupervisorsMap[] }) => {
      if (res.status === 200) this.supervisorsList = res.data;
    }, (err: any) => { console.log(err) });
  }

  GetChws() {
    this.api.GetChws().subscribe((res: { status: number, data: ChwsMap[] }) => {
      if (res.status === 200) this.chwsList = res.data;
    }, (err: any) => { console.log(err) });
  }

  generateSelectedUser(user?: User | null): NewUserUtils {
    return {
      sites: this.sites,
      zones: this.zonesList,
      supervisors: this.supervisorsList,
      chws: this.chwsList,
      user: user ?? null,
      roles: this.roles$
    }
  }

  openDeleteUserModal(user: User) {
    this.mService.open(CreateUpdateDeleteShowUserComponent, { data: { SELECTED_USER: user, IS_DELETE_MODE:true } }).subscribe((data?: { deleted: boolean }) => {
      if (data && data.deleted == true) {
        this.GetUsers();
        return this.snackbar.show({ msg: 'Supprimé avec succès!', color: 'success', duration: 3000 });
      }
    });
  }

  openCreateOrEditUserModal(user?: User) {
    this.mService.open(CreateUpdateDeleteShowUserComponent, { data: { ORGUNITS: this.generateSelectedUser(user), IS_CREATE_OR_UPDATE:true } }).subscribe((data?: { registered: boolean, updated: boolean }) => {
      if (data) {
        if (data.registered == true) {
          this.GetUsers();
          return this.snackbar.show({ msg: 'Sauvegardé avec succès', color: 'success', duration: 3000 });
        }
        if (data.updated == true) {
          this.GetUsers();
          return this.snackbar.show({ msg: 'Modifié avec succès', color: 'success', duration: 3000 });
        } 
      }
    });
  }

  openSelectedRolesModal(user: User) {
    const rolesIds = user.roles.filter(role => role && role.id).map(role => role.id);
    this.mService.open(CreateUpdateDeleteShowUserComponent, { data: { SELECTED_USER: user, ROLES: this.roles$, SELECTED_ROLE: rolesIds, IS_SHOW_ROLES: true } });
  }

}
