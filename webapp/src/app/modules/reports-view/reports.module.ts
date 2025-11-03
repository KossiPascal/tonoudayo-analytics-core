import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsOrgunitsFilterComponent } from '@kossi-components/orgunits-filter/reports-orgunits-filter/reports-orgunits-filter.component';
import { ReportsViewComponent } from './reports-view.component';
import { GoogleLoaderComponent } from '@kossi-components/loading/google-loader/google-loader.component';
import { SharedModule } from '@kossi-src/app/shared/shared.module';
import { ReportsPaginationTableComponent } from '@kossi-components/pagination-table/reports-pagination/reports-pagination-table.component';
import { RepportsHeaderSelectorComponent } from '@kossi-components/base-header/repports-header/repports-header.component';

@NgModule({
  declarations: [
    ReportsViewComponent,
    ReportsOrgunitsFilterComponent,
    RepportsHeaderSelectorComponent,
    ReportsPaginationTableComponent,
    // SampleLoaderComponent,
    // GraduationLoaderComponent,
    // SnakeLoaderComponent,
    GoogleLoaderComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportsRoutingModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],

})
export class ReportsModule { }
