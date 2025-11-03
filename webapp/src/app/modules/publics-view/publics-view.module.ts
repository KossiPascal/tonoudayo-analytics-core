import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PublicsRoutingModule } from './publics-view-routing.module';
import { TonoudayoGuideFormationComponent } from './publics/tonoudayo-guide-formation/tonoudayo-guide-formation.component';
import { TonoudayoChwsGuideFormationComponent } from './publics/tonoudayo-chws-guide-formation/tonoudayo-chws-guide-formation.component';
import { DocumentationComponent } from './publics/documentations/documentation.component';
import { PublicsViewComponent } from './publics-view.component';
import { ApksDownloadComponent } from './publics/apks-download/apks-download.component';

@NgModule({
  declarations: [
    PublicsViewComponent,
    DocumentationComponent,
    TonoudayoGuideFormationComponent,
    TonoudayoChwsGuideFormationComponent,
    ApksDownloadComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PublicsRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class PublicsModule { }
