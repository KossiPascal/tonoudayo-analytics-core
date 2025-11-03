import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { DashboardsViewComponent } from './dashboards-view.component';
import { GraduationLoaderComponent } from '@kossi-components/loading/graduation-loader/graduation-loader.component';
import { SharedModule } from '@kossi-src/app/shared/shared.module';
import { DashboardsOrgunitsFilterComponent } from '@kossi-components/orgunits-filter/dashboards-orgunits-filter/dashboards-orgunits-filter.component';
import { DashboardsPaginationTableComponent } from '@kossi-components/pagination-table/dashboards-pagination/dashboards-pagination-table.component';
import { DashboardsHeaderSelectorComponent } from '@kossi-components/base-header/dashboards-header/dashboards-header.component';
import {  } from '@kossi-modals/sms/sms.component';


@NgModule({
  declarations: [
    DashboardsViewComponent,
    DashboardsOrgunitsFilterComponent,
    DashboardsPaginationTableComponent,

    DashboardsHeaderSelectorComponent,

    GraduationLoaderComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DashboardsRoutingModule,
    SharedModule,    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],

})
export class DashboardsModule { }
