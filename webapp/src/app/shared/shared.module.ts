import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormatRolePipe } from "@kossi-pipes/format-role.pipe";
import { TogoPhonePipe } from "@kossi-pipes/togo-phone.pipe";
import { LocalizeNumberPipe } from "@kossi-pipes/number.pipe";
import { PhonePipe } from "@kossi-pipes/phone.pipe";
import { SafeHtmlPipe } from "@kossi-pipes/safe-html.pipe";


@NgModule({
  declarations: [
    SafeHtmlPipe,
    LocalizeNumberPipe,
    PhonePipe,
    FormatRolePipe,
    TogoPhonePipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SafeHtmlPipe,
    LocalizeNumberPipe,
    PhonePipe,
    FormatRolePipe,
    TogoPhonePipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class SharedModule { }
