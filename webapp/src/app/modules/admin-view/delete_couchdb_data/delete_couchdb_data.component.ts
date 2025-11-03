import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SitesMap, ZonesMap, SupervisorsMap, ChwsMap } from '@kossi-models/org-unit-interface';
import { FamilyCustomQuery, FilterParams, PatientCustomQuery } from '@kossi-models/org-units';
import { ApiService } from '@kossi-services/api.service';
import { toArray } from '@kossi-shared/functions';


@Component({
  standalone: false,
  selector: 'app-admin-delete-couchdb',
  templateUrl: `./delete_couchdb_data.component.html`,

})
export class DeleteCouchdbDataComponent implements OnInit {
  responseMsg: string = '';
  _formGroup!: FormGroup;
  foundedDataToDelete: { id: string, rev: string, name?: string, form?: string, user: string, table: string }[] = []
  selectedListToBeDelete: { _deleted: boolean, _id: string, _rev: string, _table: string }[] = [];

  Sites$: SitesMap[] = [];
  Zones$: ZonesMap[] = [];
  Families$: FamilyCustomQuery[] = [];
  Supervisors$: SupervisorsMap[] = [];
  Chws$: ChwsMap[] = [];
  Patients$: PatientCustomQuery[] = [];


  sites$: SitesMap[] = [];
  zones$: ZonesMap[] = [];
  families$: FamilyCustomQuery[] = [];
  supervisors$: SupervisorsMap[] = [];
  chws$: ChwsMap[] = [];
  patients$: PatientCustomQuery[] = [];

  cibles$: { id:string, name:string, site_id:string, zone_id:string }[] | { id:string, name:string, site_id:string }[] = [];

  types$: string[] = ['chws-data', 'patients', 'families', 'supervisors-data', 'mentors-data', 'dashboards', 'reports'];

  constMsg: string = "Loading...";
  initMsg: string = this.constMsg;

  isLoading!: boolean;

  constructor(private api: ApiService) { }

  dataListToDeleteFilterFormGroup(): FormGroup {
    return new FormGroup({
      start_date: new FormControl("", [Validators.required, Validators.minLength(7)]),
      end_date: new FormControl("", [Validators.required, Validators.minLength(7)]),
      sites: new FormControl([], [Validators.required]),
      // sites: new FormControl("", [Validators.required]),
      cible: new FormControl("", [Validators.required]),
      type: new FormControl("", [Validators.required]),
    });
  }

  ngOnInit(): void {
    this._formGroup = this.dataListToDeleteFilterFormGroup();
    this.initAllData();
  }

  async initAllData() {
    this.isLoading = true;
    this.initMsg = 'Chargement des Pays ...';
    this.initMsg = 'Chargement des Sites ...';
              this.api.GetSites().subscribe(async (_q$: { status: number, data: SitesMap[] }) => {
                if (_q$.status == 200) this.Sites$ = _q$.data;
                this.initMsg = 'Chargement des Villages/Secteurs ...';
                this.api.GetZones().subscribe(async (_v$: { status: number, data: ZonesMap[] }) => {
                  if (_v$.status == 200) this.Zones$ = _v$.data;
                  this.initMsg = 'Chargement des Familles ...';
                  this.api.GetFamilys().subscribe(async (_f$: { status: number, data: FamilyCustomQuery[] }) => {
                    if (_f$.status == 200) this.Families$ = _f$.data;
                    this.initMsg = 'Chargement des Superviseurs ...';
                    this.api.GetSupervisors().subscribe(async (_w$: { status: number, data: SupervisorsMap[] }) => {
                      if (_w$.status == 200) this.Supervisors$ = _w$.data;
                      this.initMsg = 'Chargement des Asc ...';
                      this.api.GetChws().subscribe(async (_o$: { status: number, data: ChwsMap[] }) => {
                        if (_o$.status == 200) this.Chws$ = _o$.data;
                        // this.initDataFilted();
                        this.isLoading = false;
                      }, (err: any) => {
                        this.isLoading = false;
                        console.log(err.error);
                      });
                    }, (err: any) => {
                      this.isLoading = false;
                      console.log(err.error);
                    });
                  }, (err: any) => {
                    this.isLoading = false;
                    console.log(err.error);
                  });
                }, (err: any) => {
                  this.isLoading = false;
                  console.log(err.error);
                });
              }, (err: any) => {
                this.isLoading = false;
                console.log(err.error);
              });
  }

  SelectAllData() {
    if (this.selectedListToBeDelete.length == this.foundedDataToDelete.length) {
      this.selectedListToBeDelete = [];
    } else {
      this.selectedListToBeDelete = this.foundedDataToDelete.map(d => {
        return { _deleted: true, _id: d.id, _rev: d.rev, _table: d.table };
      });
    }
  }

  containsData(data: { id: string, rev: string, name?: string, form?: string, user: string, table: string }): boolean {
    const dt = this.selectedListToBeDelete.find(d => d._id === data.id);
    return dt !== undefined && dt !== null;
  }

  AddOrRemoveData(data: { id: string, rev: string, name?: string, form?: string, user: string, table: string }) {
    const [found, index] = (() => {
      let foundIndex = -1;
      const foundObject = this.selectedListToBeDelete.find((dt, idx) => {
        if (dt._id === data.id) {
          foundIndex = idx;
          return true;
        }
        return false;
      });
      return [foundObject, foundIndex];
    })();
    if (index !== -1) {
      this.selectedListToBeDelete.splice(index, 1);
    } else {
      this.selectedListToBeDelete.push({ _deleted: true, _id: data.id, _rev: data.rev, _table: data.table });
    }
  }

  getListOfDataToDeleteFromCouchDb() {
    this.initMsg = this.constMsg;
    this.isLoading = true;
    this.foundedDataToDelete = [];
    this.selectedListToBeDelete = [];
    this.responseMsg = '';
    const cibles = toArray(this._formGroup.value.cible);
    var chwVillageSecteur: string[] = [];

    if (['chws-data', 'patients', 'families'].includes(this._formGroup.value.type)) {
      chwVillageSecteur = (this.zones$.filter(v => cibles.includes(v.site_id))).map(v => v.id);
    }

    const param = {
      cible: [...cibles, ...chwVillageSecteur],
      type: this._formGroup.value.type,
      start_date: this._formGroup.value.start_date,
      end_date: this._formGroup.value.end_date
    };

    this.api.GetDataToDeleteFromCouchDb(param).subscribe(async (res: { status: number, data: any }) => {
      console.log(res)
      if (res.status == 200) {
        this.foundedDataToDelete = (res.data.reduce((unique: any[], r: any) => {
          if (r && !(unique.find(i => i.id === r.id))) {
            unique.push(r);
          }
          return unique;
        }, []));
        // for (let d = 0; d < this.foundedDataToDelete.length; d++) {
        //   const data = this.foundedDataToDelete[d];
        //   this.selectedListToBeDelete.push({ _deleted: true, _id: data.id, _rev: data.rev })
        // }
      } else {
        this.responseMsg = res.data;
      }
      this.isLoading = false;
    }, (err: any) => {
      console.log(err.error);
      this.isLoading = false;
      this.responseMsg = err.toString();
    });
  }

  deleteSelectedDataFromCouchDb() {
    this.initMsg = this.constMsg;
    this.responseMsg = '';
    if (this.selectedListToBeDelete.length > 0) {
      this.api.deleteDataFromCouchDb(this.selectedListToBeDelete, this._formGroup.value.type).subscribe(async (res: { status: number, data: any }) => {
        if (res.status == 200) {
          this.responseMsg = 'Done successfuly !';
          this.foundedDataToDelete = [];
          this.selectedListToBeDelete = [];
        } else {
          this.responseMsg = 'Problem with query, retry!';
        }
        // this.responseMsg = res.data.toString();
        // if (res.status == 200) console.log(res.data);
      }, (err: any) => {
        console.log(err);
        this.responseMsg = 'Error found when deleting ...';
        // this.responseMsg = err.toString();
      });
    } else {
      this.responseMsg = 'Not data provied!';
    }
  }

  ParamsToFilter(): FilterParams {
    const values: any = this._formGroup.value;
    var params: FilterParams = {
      start_date: values.start_date,
      end_date: values.end_date,
      sites: toArray(values.sites) as string[],
      zones: toArray(values.zones) as string[],
      families: toArray(values.families) as string[],
      supervisors: toArray(values.supervisors) as string[],
      chws: toArray(values.chws) as string[],
      patients: toArray(values.patients) as string[],
      type: values.type
    }
    return params;
  }



  genarateSupervisors() {
    this.zones$ = [];
    this.families$ = [];
    this.supervisors$ = [];
    this.chws$ = [];
    this.patients$ = [];
    this._formGroup.value.sites = [];
    this._formGroup.value.families = [];
    this._formGroup.value.supervisors = [];
    this._formGroup.value.chws = [];
    this._formGroup.value.patients = [];

    const sites: string[] = toArray(this._formGroup.value.sites);
    this.supervisors$ = this.Supervisors$.filter(chw => sites.includes(chw.site_id));
  }

  genarateZones() {
    this.zones$ = [];
    this.families$ = [];
    this.supervisors$ = [];
    this.chws$ = [];
    this.patients$ = [];
    this._formGroup.value.sites = [];
    this._formGroup.value.families = [];
    this._formGroup.value.supervisors = [];
    this._formGroup.value.chws = [];
    this._formGroup.value.patients = [];

    const sites: string[] = toArray(this._formGroup.value.sites);
    this.zones$ = this.Zones$.filter(zones => sites.includes(zones.site_id));
  }

  genarateChws() {
    this.families$ = [];
    this.supervisors$ = [];
    this.chws$ = [];
    this.patients$ = [];
    this._formGroup.value.families = [];
    this._formGroup.value.supervisors = [];
    this._formGroup.value.chws = [];
    this._formGroup.value.patients = [];

    const sites: string[] = toArray(this._formGroup.value.sites);
    this.chws$ = this.Chws$.filter(chw => sites.includes(chw.site_id));
  }

  genarateFamilies() {
    this.families$ = [];
    this.supervisors$ = [];
    this.chws$ = [];
    this.patients$ = [];
    this._formGroup.value.families = [];
    this._formGroup.value.supervisors = [];
    this._formGroup.value.chws = [];
    this._formGroup.value.patients = [];

    const sites: string[] = toArray(this._formGroup.value.sites);
    this.families$ = this.Families$.filter(family => sites.includes(family.site.id));
  }

  genaratePatients({ chws, supervisors }: { chws: string[], supervisors: string[] }) {
    this.supervisors$ = [];
    this.chws$ = [];
    this.patients$ = [];
    this._formGroup.value.families = [];
    this._formGroup.value.supervisors = [];
    this._formGroup.value.chws = [];
    this._formGroup.value.patients = [];

    const families: string[] = toArray(this._formGroup.value.families);
    this.patients$ = this.Patients$.filter(patient => families.includes(patient.family.id));
  }

  generateCible() {
    this.families$ = [];
    this.supervisors$ = [];
    this.chws$ = [];
    this.patients$ = [];
    this.zones$ = [];
    this._formGroup.value.sites = "";
    this._formGroup.value.families = "";
    this._formGroup.value.supervisors = "";
    this._formGroup.value.chws = "";
    this._formGroup.value.patients = "";
    if (['chw-data', 'patients', 'families'].includes(this._formGroup.value.type)) {
      const sites: string[] = toArray(this._formGroup.value.sites);
      this.cibles$ = this.Chws$.filter(chw => sites.includes(chw.site_id));
    } else if (this._formGroup.value.type === 'supervisors-data') {
      const sites: string[] = toArray(this._formGroup.value.sites);
      this.cibles$ = this.Supervisors$.filter(chw => sites.includes(chw.site_id));
    } else if (this._formGroup.value.type === 'mentors-data') {
      // this.genarateMentor();
    } else if (['dashboards', 'reports'].includes(this._formGroup.value.type)) {
      const sites: string[] = toArray(this._formGroup.value.sites);
      this.cibles$ = this.Chws$.filter(chw => sites.includes(chw.site_id));
    }
  }
}
