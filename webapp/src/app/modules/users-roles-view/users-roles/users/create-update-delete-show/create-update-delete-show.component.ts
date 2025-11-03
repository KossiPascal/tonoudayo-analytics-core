import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { NewUserUtils } from '@kossi-models/interfaces';
import { SitesMap, ZonesMap } from '@kossi-models/org-unit-interface';
import { ApiService } from '@kossi-services/api.service';
import { ModalService } from '@kossi-services/modal.service';
import { UserContextService } from '@kossi-services/user-context.service';
import { User, Roles } from '@kossi-models/user-role';
import { ConstanteService } from '@kossi-src/app/services/constantes.service';
import { toTitleCase } from '@kossi-shared/functions';

@Component({
  standalone: false,
  selector: 'app-create-update-delete-users',
  templateUrl: `./create-update-delete-show.component.html`,
  styleUrls: ['./create-update-delete-show.component.css'],
})
export class CreateUpdateDeleteShowUserComponent implements OnInit {

  @Input() SELECTED_ROLE!: number[];
  @Input() SELECTED_USER!: User;

  // for show user roles
  @Input() IS_SHOW_ROLES!:boolean
  @Input() ROLES!: Roles[];


  // for delete user
  @Input() IS_DELETE_MODE!: boolean;
  

  // for create or update user
  @Input() IS_CREATE_OR_UPDATE!: boolean;
  @Input() ORGUNITS: NewUserUtils = {
    sites: [],
    zones: [],
    supervisors: [],
    chws: [],
    user: null,
    roles: []
  }

  userForm!: FormGroup;

  isEditMode: boolean = false;
  isProcessing: boolean = false;

  APP_LOGO: string = '';

  sites: SitesMap[] = [];
  zones: ZonesMap[] = [];

  showPassword: boolean = false;

  message!: string;

  visibleSection: string = 'info';

  private isToOpenList: { [key: string]: boolean } = {};

  constructor(private api: ApiService, private userCtx: UserContextService, private mService: ModalService, private cst: ConstanteService) {
    this.APP_LOGO = this.cst.APP_LOGO;

  }

  toggleSection(section: string) {
    this.visibleSection = this.visibleSection === section ? '' : section;
  }
  

  ngOnInit(): void {
    if (this.IS_CREATE_OR_UPDATE == true) {
      this.isEditMode = this.ORGUNITS.user != null;

      this.userForm = this.userFormGroup(this.ORGUNITS.user);

      this.SELECTED_ROLE = this.ORGUNITS.user?.rolesIds ?? [];
      // this.ROLES = this.ORGUNITS.roles ?? [];
      this.sites = this.ORGUNITS.user?.sites ?? [];
      this.zones = this.ORGUNITS.user?.zones ?? [];
    }
  }


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isListOpenToShow(elmId: string): boolean {
    return this.isToOpenList[elmId] ?? false;
  }

  toggleList(elmId: string) {
    const cible = this.isToOpenList[elmId];
    this.isToOpenList[elmId] = !(cible === true);
  }

  orgUnitsIsEmpty(): boolean {
    const data = [
      ...(this.sites ?? []),
      ...(this.zones ?? [])
    ];
    return data.length === 0;
  }

  rolesIsEmpty(): boolean {
    return (this.SELECTED_ROLE ?? []).length === 0;
  }

  containsOrgUnits(cible: 'sites' | 'zones', elemId: string): boolean {
    if (cible === 'sites') {
      const ok0 = ((this.sites ?? []).map(c => c.id)).includes(elemId);
      const vL = (this.zones ?? []).map(r => r.site_id);
      const ok1 = vL.includes(elemId);
      const ok2 = this.generateZones(elemId).length === vL.length;
      return ok0 || ok1 && ok2;
    }
    if (cible === 'zones') {
      const ok0 = ((this.zones ?? []).map(c => c.id)).includes(elemId);
      return ok0
    }
    return false;
  }
  
  generateSites() {
    return this.ORGUNITS.sites;
  }
  generateZones(siteId: string) {
    return this.ORGUNITS.zones.filter((d: ZonesMap) => siteId === d.site_id);
  }

  selectSites(site: SitesMap) {
    const index = this.findObj(this.sites, site).index;
    if (index !== -1) {
      this.sites.splice(index, 1);
      this.zones = this.zones.filter(r => r.site_id !== site.id);
    } else {
      this.sites.push(site);
      this.zones = [...this.zones.filter(r => r.site_id !== site.id), ...this.ORGUNITS.zones.filter((r: ZonesMap) => r.site_id === site.id)];
    }
  }
  selectZones(zone: ZonesMap) {
    const index = this.findObj(this.zones, zone).index;
    if (index !== -1) {
      this.zones.splice(index, 1);
    } else {
      this.zones.push(zone);
    }
  }

  userFormGroup(user?: User | null): FormGroup {
    const isExistingUser = !!user;
    // const isSuperUser = this.userCtx.currentUser?.isSuperUser === true;
    const username = user?.username ?? '';

    const formControls: { [key: string]: FormControl } = {
      username: new FormControl(
        { value: username, disabled: isExistingUser && username != '' },
        [Validators.required, Validators.minLength(4)]
      ),
      fullname: new FormControl(user?.fullname ?? ''),
      email: new FormControl(user?.email ?? ''),
      isActive: new FormControl(user?.isActive === true),
      password: new FormControl('', isExistingUser ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)]),
      passwordConfirm: new FormControl('', isExistingUser ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)]),
    };

    const validators = isExistingUser ? null : [this.matchValidator('password', 'passwordConfirm', 8)];

    return new FormGroup(formControls, validators);
  }

  findObj<T>(objs: T[], obj: T): { found: T | undefined, index: number } {
    const [found, index] = (() => {
      let foundIndex = -1;
      const foundObject = objs.find((dt, idx) => {
        if ((dt as any).id === (obj as any).id) {
          foundIndex = idx;
          return true;
        }
        return false;
      });
      return [foundObject, foundIndex];
    })();
    return { found: found, index: index }
  }
  matchValidator(source: string, target: string, passwordMinLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sourceCtrl = control.get(source);
      const targetCtrl = control.get(target);
      if (sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value) {
        const isValidSource = sourceCtrl.value?.length >= passwordMinLength;
        const isValidTarget = targetCtrl.value?.length >= passwordMinLength;
        if (isValidSource && isValidTarget) {
          this.message = 'Les mots de passe ne sont pas identiques!'
        }
        return { mismatch: true };
      }
      return null;
    };
  }

  passwordMatchError(form: FormGroup): boolean {
    if (form) {
      return form.getError('password') && form.get('passwordConfirm')?.touched;
    }
    return true;
  }

  addOrRemoveRole(roleId: number) {
    const index = this.SELECTED_ROLE.indexOf(roleId);
    if (index !== -1) {
      this.SELECTED_ROLE.splice(index, 1);
    } else {
      this.SELECTED_ROLE.push(roleId);
    }
  }

  registerOrUpdate(): void {
    this.message = '';
    this.isProcessing = true;

    const password = this.userForm.value.password;
    const passwordConfirm = this.userForm.value.passwordConfirm;
    const isPasswordEmpty = !password?.trim();
    const isPasswordConfirmEmpty = !passwordConfirm?.trim();
    const isPasswordMismatch = !isPasswordEmpty && password !== passwordConfirm;

    if (this.isEditMode) {
      if ((password || passwordConfirm) && isPasswordMismatch) {
        this.message = 'Les mots de passe ne concordent pas. Effacez-les si vous ne souhaitez pas les modifier.';
        this.isProcessing = false;
        return;
      }
    } else {
      if (isPasswordEmpty) {
        this.message = 'Le mot de passe est obligatoire.';
        this.isProcessing = false;
        return;
      }
      if (isPasswordConfirmEmpty) {
        this.message = 'Veuillez confirmer le mot de passe.';
        this.isProcessing = false;
        return;
      }
      if (isPasswordMismatch) {
        this.message = 'Les mots de passe ne concordent pas.';
        this.isProcessing = false;
        return;
      }
    }

    if (this.orgUnitsIsEmpty() || this.rolesIsEmpty()) {
      this.message = 'Les unités organisationnelles ou les rôles sont vides. Ils sont requis.';
      this.isProcessing = false;
      return;
    }

    const dataToSave: any = {
      id: this.ORGUNITS?.user?.id,
      username: this.ORGUNITS?.user?.username ?? this.userForm.value.username,
      fullname: this.userForm.value.fullname,
      email: this.userForm.value.email,
      password: isPasswordEmpty ? undefined : password,
      isActive: this.userForm.value.isActive === true,
      roles: this.SELECTED_ROLE,
      sites: this.sites,
      zones: this.zones,
      supervisors: this.ORGUNITS.supervisors.filter(c => this.sites.some(d => d.id === c.site_id)),
      chws: this.ORGUNITS.chws.filter(r => this.zones.some(v => v.id === r.site_id))
    };

    const apiActionToDo = this.ORGUNITS?.user ? this.api.updateUser(dataToSave) : this.api.register(dataToSave);

    apiActionToDo.subscribe((res: { status: number, data: any }) => {
      if (res.status === 200) {
        const actionType = this.ORGUNITS?.user ? { updated: true } : { registered: true };
        this.mService.close(actionType);
      } else {
        this.message = res.data;
        this.isProcessing = false;
      }
    }, (err: any) => {
      this.message = 'Erreur inconnue!';
      this.isProcessing = false;
    });
  }



  async delete() {
    this.message = '';
    this.isProcessing = true;
    const user = await this.userCtx.currentUser();
    if (this.SELECTED_USER && user && this.SELECTED_USER.id != user.id) {
      this.api.deleteUser(this.SELECTED_USER).subscribe((res: { status: number, data: any }) => {
        if (res.status === 200) {
          this.mService.close({ deleted: true });
        } else {
          this.message = 'Erreur lors de la suppression, reessayez!';
          this.isProcessing = false;
        }
      }, (err: any) => {
        this.message = 'Erreur lors de la suppression, reessayez!';
        this.isProcessing = false;
      });
    } else {
      this.message = 'Vous ne pouvez supprimer cet utilisateur';
      this.isProcessing = false;
    }

  }




  containsRole(roleId: number): boolean {
    return this.SELECTED_ROLE.includes(roleId);
  }

  titleCase(input: string){
    return toTitleCase(input);
  }


}
