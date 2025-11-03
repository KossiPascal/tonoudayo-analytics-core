import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SendDhis2ModalComponent } from '@kossi-modals/send-dhis2-modal/send-dhis2-modal.component';
import { SitesMap, ZonesMap, SupervisorsMap, ChwsMap } from '@kossi-models/org-unit-interface';
import { ReportsData, ReportsFilterData, ReportsHealth } from '@kossi-models/reports-selectors';
import { FormGroupService } from '@kossi-services/form-group.service';
import { ModalService } from '@kossi-services/modal.service';
import { SnackbarService } from '@kossi-services/snackbar.service';
import { UserContextService } from '@kossi-services/user-context.service';
import { currentYear, currentMonth, getMonthsList, getYearsList, notNull } from '@kossi-shared/functions';
import { Subject, takeUntil, from } from "rxjs";

@Component({
  standalone: false,
  selector: 'orgunits-filter-modal',
  template: ``,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export abstract class BaseOrgunitsFilterComponent<T> implements OnInit, OnChanges, OnDestroy {

  private stateChange!: any;
  @Input() CHANGE_STATE: any;
  @Output() onValidateAllReports: EventEmitter<any> = new EventEmitter();
  @Output() onCancelAllValidation: EventEmitter<any> = new EventEmitter();
  @Output() onSendAllReportsToDhis2 = new EventEmitter<FormGroup>();

  private destroy$ = new Subject<void>();

  protected form!: FormGroup;

  REPORTS_DATA: ReportsData = {
    MONTHLY_ACTIVITY: undefined,
    FAMILY_PLANNING: undefined,
    HOUSE_HOLD_RECAP: undefined,
    MORBIDITY: undefined,
    PCIMNE_NEWBORN: undefined,
    PROMOTION: undefined,
    CHWS_MEG_QUANTITIES: undefined,
  };

  REPORTS_HEADER: ReportsHealth = {
    ON_FETCHING: {},
    IS_VALIDATED: {},
    IS_ON_DHIS2: {},
    ON_VALIDATION: {},
    ON_CANCEL_VALIDATION: {},
    ON_DHIS2_SENDING: {},
    ON_DHIS2_SENDING_ERROR: {},
  };

  REPORTS_FILTER: ReportsFilterData = {
    CHWS_NEEDED: [],
    CHWS_SELECTED: [],
    SEND_DHIS2_ORGUNITS: [],
  }

  Months$: { labelEN: string; labelFR: string; id: string; uid: number }[] = [];
  Years$: number[] = [];
  month$!: { labelEN: string; labelFR: string; id: string; uid: number };
  year$!: number;

  Sites$: SitesMap[] = [];
  Zones$: ZonesMap[] = [];
  Supervisors$: SupervisorsMap[] = [];
  Chws$: ChwsMap[] = [];

  sites: SitesMap[] = [];
  zones: ZonesMap[] = [];
  supervisors: SupervisorsMap[] = [];
  chws: ChwsMap[] = [];

  HAS_VALIDATE_REPORTS_PERMISSION!: boolean;

  constructor(protected userCtx: UserContextService, protected fGroup: FormGroupService, protected mService: ModalService, protected snackbar: SnackbarService) {
    this.initializeComponent();
    this.initViewJs();

    this.fGroup.REPORTS_HEADER$.pipe(takeUntil(this.destroy$)).subscribe(dataSaved => {
      if (dataSaved) {
        Object.entries(this.REPORTS_HEADER).forEach(([key, value]) => {
          (this.REPORTS_HEADER as any)[key] = dataSaved[key] ?? (Array.isArray(value) ? [] : {});
        });
      }
    });

    this.fGroup.REPORTS_FILTER$.pipe(takeUntil(this.destroy$)).subscribe(dataSaved => {
      if (dataSaved) {
        Object.keys(this.REPORTS_FILTER).forEach(key => {
          (this.REPORTS_FILTER as any)[key] = dataSaved[key] ?? [];
        });
      }
    });

    this.fGroup.REPORTS_DATA$.pipe(takeUntil(this.destroy$)).subscribe(dataSaved => {
      if (dataSaved) {
        Object.keys(this.REPORTS_DATA).forEach(key => {
          (this.REPORTS_DATA as any)[key] = (dataSaved as any)[key];
        });
      }
    });

  }

  private initializeComponent() {
    from(this.userCtx.currentUser()).pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (!(this.Sites$.length > 0)) this.Sites$ = user?.sites ?? [];
      if (!(this.Zones$.length > 0)) this.Zones$ = user?.zones ?? [];
      if (!(this.Supervisors$.length > 0)) this.Supervisors$ = user?.supervisors ?? [];
      if (!(this.Chws$.length > 0)) this.Chws$ = user?.chws ?? [];
        this.sitesGenerate();
        this.chwsGenerate();

        this.HAS_VALIDATE_REPORTS_PERMISSION = user?.role.canValidateData ?? false;
    });
  }

  ngOnInit(): void {
    this.year$ = currentYear();
    this.month$ = currentMonth();
    this.Months$ = getMonthsList().filter(m => this.month$ && m.uid <= this.month$.uid);
    this.Years$ = getYearsList().filter(y => this.year$ && y <= this.year$);
    this.form = this.CreateFormGroup();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['CHANGE_STATE']) {
      this.stateChange = changes['CHANGE_STATE'].currentValue;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  START_ORGUNIT_FILTER(event: Event) {
    event.preventDefault();
    this.form.value['org_units'] = this.ORG_UNITS;
    this.fGroup.setFormGroup(this.form);
  }


  async ValidateAllReports(event: Event) {
    event.preventDefault();
    if (this.onValidateAllReports) {
      this.onValidateAllReports.emit();
    }
  }

  async CancelAllValidation(event: Event) {
    event.preventDefault();
    if (this.onCancelAllValidation) {
      this.onCancelAllValidation.emit();
    }
  }

  async SendAllReportsToDhis2(dhis2Form?: FormGroup) {
    if (this.onSendAllReportsToDhis2 && dhis2Form) {
      this.onSendAllReportsToDhis2.emit(dhis2Form);
    }
  }

  openAllSendReportsToDhis2Modal(event: Event) {
    event.preventDefault();
    const CHWS_NEEDED = this.REPORTS_FILTER.CHWS_NEEDED ?? 0;
    const CHWS_SELECTED = this.REPORTS_FILTER.CHWS_SELECTED ?? 0;
    if (CHWS_SELECTED.length > 0 && CHWS_NEEDED.length != CHWS_SELECTED.length) {
      this.snackbar.show({ msg: 'Pour envoyer les données au DHIS2, il faut selectionner tous ASC', color: 'warning', position: 'TOP' });
    } else {
      if (this.ORG_UNIT) {
        this.mService.open(SendDhis2ModalComponent, { data: { REPPORT_NAME: 'ALL' } }).subscribe((result?: { dhis2Form?: FormGroup, submited?: boolean }) => {
          if (result && result.submited) {
            // console.log("Données reçues depuis la modal :", result);
            if (result.dhis2Form) {
              this.SendAllReportsToDhis2(result.dhis2Form);
            } else {
              this.snackbar.show({ msg: 'DHIS2_ORGUNIT est vide, impossible d\'envoyer les données', color: 'warning', position: 'TOP' });
            }
          }
        });
      }
    }
  }

  initMonths(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (Number(selectElement.value) < this.year$) {
      this.Months$ = getMonthsList();
    } else {
      this.Months$ = getMonthsList().filter(m => this.month$ && m.uid <= this.month$.uid);
    }
    // this.Months$ = getMonthsList().filter(m => this.month$ && m.uid <= this.month$.uid);
  }

  sitesGenerate() {
    this.setOrgUnitsValues({ site: true, chws: true });
    this.sites = this.Sites$;
    this.setMultipleValues('site', this.sites.map(c => c.id));
    this.chwsGenerate();
  }

  chwsGenerate() {
    this.setOrgUnitsValues({ chws: true });
    const value = this.getVal('site');
    if (notNull(value) && this.Chws$.length > 0) {
      if (this.Sites$.length > 0) {
        this.chws = this.Chws$.filter(d => value.includes(d.site_id));
      } else {
        this.chws = this.Chws$;
      }
      this.setMultipleValues('chws', this.chws.map(r => r.id));
    } else {
      this.chws = this.Chws$;
      this.setMultipleValues('chws', this.Chws$.map(r => r.id));
    }
  }

  selectAll(cible: 'site' | 'chws' | 'year' | 'months', event: Event) {
    const checkbox = document.getElementById(`all-${cible}`) as HTMLInputElement;
    if (checkbox) {
      if (cible === 'chws') {
        this.setMultipleValues(cible, checkbox.checked ? this.chws.map(r => r.id) : []);
      }
      if (cible === 'year') {
        this.setMultipleValues(cible, checkbox.checked ? this.Years$ : []);
      }
      if (cible === 'months') {
        this.setMultipleValues(cible, checkbox.checked ? this.Months$.map(r => r.id) : []);
      }
    }
  }

  isChecked(cible: 'site' | 'chws' | 'year' | 'months') {
    const value = this.getVal(cible);

    if (cible === 'site') {
      return notNull(value) && value.length === this.sites.map(r => r.id).length;
    }
    if (cible === 'chws') {
      return notNull(value) && value.length === this.chws.map(r => r.id).length;
    }
    if (cible === 'year') {
      return notNull(value) && value.length === this.Years$.length;
    }
    if (cible === 'months') {
      return notNull(value) && value.length === this.Months$.map(r => r.id).length;
    }
    return false;
  }

  selectedLength(cible: 'site' | 'chws' | 'year' | 'months') {
    const val = this.getVal(cible);
    return notNull(val) ? val.length : 0;
  }


  private initViewJs() {

    $(document).ready(function () {
      const $overlay = $("#overlay");
      const $orgunitFilterModal = $("#modal-container");

      // Fonction pour ouvrir le modal
      function openModal() {
        $orgunitFilterModal.addClass("open");
        $overlay.addClass("open");
        $("body").addClass("modal-open");
      }

      // Fonction pour fermer le modal
      function closeModal() {
        $orgunitFilterModal.removeClass("open");
        $overlay.removeClass("open");
        $("body").removeClass("modal-open");
      }

      // Ouvrir le modal en cliquant sur le bouton "Filtrer"
      $(".open-modal-button").on("click", openModal);

      // Fermer le modal sur le bouton "X" ou le bouton "Appliquer le filtre"
      $(".close").on("click", function (event) {
        event.preventDefault(); // Empêche le rechargement de la page au clic sur "Appliquer le filtre"
        closeModal();
      });
      // Fermer le modal sur le bouton "X" ou le bouton "Appliquer le filtre"
      $(".modal-validate").on("click", function (event) {
        closeModal();
      });

      // Fermer en cliquant sur l'overlay
      $overlay.on("click", closeModal);

      // Fermer avec la touche "Échap"
      $(document).on("keydown", function (event) {
        if (event.key === "Escape") closeModal();
      });
    });
  }

  private CreateFormGroup(): FormGroup {
    const form: any = {
      year: new FormControl(this.year$, [Validators.required]),
      months: new FormControl([this.month$.id], [Validators.required]),
    };
    if (this.Sites$.length > 1) form['site'] = new FormControl('', [Validators.required]);
    if (this.Chws$.length > 1) form['chws'] = new FormControl('', [Validators.required]);
    return new FormGroup(form);
  }

  private setOrgUnitsValues(dt: { site?: boolean, chws: boolean }) {
    if (dt.site === true) {
      this.sites = [];
      this.setMultipleValues('site', []);
    }
    if (dt.chws === true) {
      this.chws = [];
      this.setMultipleValues('chws', []);
    }
  }

  private getVal(field: 'site' | 'chws' | 'year' | 'months') {
    return this.form.value[field];
  }

  private setMultipleValues(field: 'site' | 'chws' | 'year' | 'months', values: any): void {
    if (!this.form.controls[field]) {
      this.form.addControl(field, new FormControl([]));
    }
    this.form.controls[field].setValue(Array.isArray(values) ? values : [values]);
  }

  get ORG_UNIT() {
    return this.REPORTS_FILTER.SEND_DHIS2_ORGUNITS;
  }

  get ORG_UNITS() {
    const chws = this.chws.filter(r => (this.form.value.chws ?? []).includes(r.id));
    return {
      site: this.sites.filter(r => (this.form.value.site ?? []).includes(r.id)),
      supervisors: this.supervisors.filter(r => (this.form.value.supervisor ?? []).includes(r.id)),
      zone: this.zones.filter(r => (this.form.value.zone ?? []).includes(r.id)),
      chws: chws,
      all_chws_ids: this.Chws$.map(r => r.id),
      selected_chws_ids: chws.map(r => r.id),
    }
  }

  get ON_ALL_FETCHING() {
    const r1 = this.REPORTS_HEADER?.ON_FETCHING?.MONTHLY_ACTIVITY == true;
    const r2 = this.REPORTS_HEADER?.ON_FETCHING?.FAMILY_PLANNING == true;
    const r3 = this.REPORTS_HEADER?.ON_FETCHING?.HOUSE_HOLD_RECAP == true;
    const r4 = this.REPORTS_HEADER?.ON_FETCHING?.MORBIDITY == true;
    const r5 = this.REPORTS_HEADER?.ON_FETCHING?.PCIMNE_NEWBORN == true;
    const r6 = this.REPORTS_HEADER?.ON_FETCHING?.PROMOTION == true;
    const r7 = this.REPORTS_HEADER?.ON_FETCHING?.CHWS_MEG_QUANTITIES == true;
    return r1 || r2 || r3 || r4 || r5 || r6 || r7;
  }

  get IS_ALL_REPPORTS_VALIDATED() {
    const r1 = this.REPORTS_HEADER?.IS_VALIDATED?.MONTHLY_ACTIVITY == true;
    const r2 = this.REPORTS_HEADER?.IS_VALIDATED?.FAMILY_PLANNING == true;
    const r3 = this.REPORTS_HEADER?.IS_VALIDATED?.HOUSE_HOLD_RECAP == true;
    const r4 = this.REPORTS_HEADER?.IS_VALIDATED?.MORBIDITY == true;
    const r5 = this.REPORTS_HEADER?.IS_VALIDATED?.PCIMNE_NEWBORN == true;
    const r6 = this.REPORTS_HEADER?.IS_VALIDATED?.PROMOTION == true;
    const r7 = this.REPORTS_HEADER?.IS_VALIDATED?.CHWS_MEG_QUANTITIES == true;
    return r1 && r2 && r3 && r4 && r5 && r6 && r7;
  }

  get ON_ALL_DHIS2_SENDING() {
    const r1 = this.REPORTS_HEADER?.ON_DHIS2_SENDING?.MONTHLY_ACTIVITY == true;
    const r2 = this.REPORTS_HEADER?.ON_DHIS2_SENDING?.FAMILY_PLANNING == true;
    const r3 = this.REPORTS_HEADER?.ON_DHIS2_SENDING?.HOUSE_HOLD_RECAP == true;
    const r4 = this.REPORTS_HEADER?.ON_DHIS2_SENDING?.MORBIDITY == true;
    const r5 = this.REPORTS_HEADER?.ON_DHIS2_SENDING?.PCIMNE_NEWBORN == true;
    const r6 = this.REPORTS_HEADER?.ON_DHIS2_SENDING?.PROMOTION == true;
    const r7 = this.REPORTS_HEADER?.ON_DHIS2_SENDING?.CHWS_MEG_QUANTITIES == true;
    return r1 && r2 && r3 && r4 && r5 && r6 && r7;
  }

  get IS_ALL_ON_DHIS2() {
    const r1 = this.REPORTS_HEADER?.IS_ON_DHIS2?.MONTHLY_ACTIVITY == true;
    const r2 = this.REPORTS_HEADER?.IS_ON_DHIS2?.FAMILY_PLANNING == true;
    const r3 = this.REPORTS_HEADER?.IS_ON_DHIS2?.HOUSE_HOLD_RECAP == true;
    const r4 = this.REPORTS_HEADER?.IS_ON_DHIS2?.MORBIDITY == true;
    const r5 = this.REPORTS_HEADER?.IS_ON_DHIS2?.PCIMNE_NEWBORN == true;
    const r6 = this.REPORTS_HEADER?.IS_ON_DHIS2?.PROMOTION == true;
    const r7 = this.REPORTS_HEADER?.IS_ON_DHIS2?.CHWS_MEG_QUANTITIES == true;
    return r1 && r2 && r3 && r4 && r5 && r6 && r7;
  }

  get IS_ALL_REPORTS_LOADED() {
    const r1 = this.REPORTS_DATA?.MONTHLY_ACTIVITY?.data != undefined;
    const r2 = this.REPORTS_DATA?.FAMILY_PLANNING?.data != undefined;
    const r3 = this.REPORTS_DATA?.HOUSE_HOLD_RECAP?.data != undefined;
    const r4 = this.REPORTS_DATA?.MORBIDITY?.data != undefined;
    const r5 = this.REPORTS_DATA?.PCIMNE_NEWBORN != undefined;
    const r6 = this.REPORTS_DATA?.PROMOTION?.data != undefined;
    const r7 = this.REPORTS_DATA?.CHWS_MEG_QUANTITIES?.data != undefined;
    return r1 && r2 && r3 && r4 && r5 && r6 && r7;
  }

  get ON_ALL_VALIDATION() {
    const r1 = this.REPORTS_HEADER?.ON_VALIDATION?.MONTHLY_ACTIVITY == true;
    const r2 = this.REPORTS_HEADER?.ON_VALIDATION?.FAMILY_PLANNING == true;
    const r3 = this.REPORTS_HEADER?.ON_VALIDATION?.HOUSE_HOLD_RECAP == true;
    const r4 = this.REPORTS_HEADER?.ON_VALIDATION?.MORBIDITY == true;
    const r5 = this.REPORTS_HEADER?.ON_VALIDATION?.PCIMNE_NEWBORN == true;
    const r6 = this.REPORTS_HEADER?.ON_VALIDATION?.PROMOTION == true;
    const r7 = this.REPORTS_HEADER?.ON_VALIDATION?.CHWS_MEG_QUANTITIES == true;
    return r1 || r2 || r3 || r4 || r5 || r6 || r7;
  }

  get ON_ALL_CANCEL_VALIDATION() {
    const r1 = this.REPORTS_HEADER?.ON_CANCEL_VALIDATION?.MONTHLY_ACTIVITY == true;
    const r2 = this.REPORTS_HEADER?.ON_CANCEL_VALIDATION?.FAMILY_PLANNING == true;
    const r3 = this.REPORTS_HEADER?.ON_CANCEL_VALIDATION?.HOUSE_HOLD_RECAP == true;
    const r4 = this.REPORTS_HEADER?.ON_CANCEL_VALIDATION?.MORBIDITY == true;
    const r5 = this.REPORTS_HEADER?.ON_CANCEL_VALIDATION?.PCIMNE_NEWBORN == true;
    const r6 = this.REPORTS_HEADER?.ON_CANCEL_VALIDATION?.PROMOTION == true;
    const r7 = this.REPORTS_HEADER?.ON_CANCEL_VALIDATION?.CHWS_MEG_QUANTITIES == true;
    return r1 || r2 || r3 || r4 || r5 || r6 || r7;
  }

  get CAN_ALL_VALIDATE_REPORTS(): boolean {
    return this.IS_ALL_REPORTS_LOADED && this.HAS_VALIDATE_REPORTS_PERMISSION;
  }

  get CAN_SEND_TO_DHIS2() {
    return this.CAN_ALL_VALIDATE_REPORTS && notNull(this.form.value['org_units']) && this.IS_ALL_REPPORTS_VALIDATED == true;
  }

}