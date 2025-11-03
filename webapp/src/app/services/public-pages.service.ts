import { Injectable } from '@angular/core';
import { ConstanteService } from './constantes.service';

@Injectable({
  providedIn: 'root'
})
export class PublicPagesService {

  constructor(private cst:ConstanteService){}

  downloadAPK(prodApp: boolean){
    // const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const link = document.createElement('a');
    link.href = this.cst.backenUrl(`publics/download/tonoudayo-${prodApp ? 'prod' : 'dev'}-apk`);
    link.download = `tonoudayo-${prodApp ? 'prod' : 'dev'}.apk`;
    link.click();
  }

  openGuidePage(){
    // const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const link = document.createElement('a');
    link.href = this.cst.backenUrl(`publics/tonoudayo-guide-formation`);
    link.target = '_blank';
    link.click();
  }

  openChwsGuidePage(){
    // const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const link = document.createElement('a');
    link.href = this.cst.backenUrl(`publics/tonoudayo-chws-guide-formation`);
    link.target = '_blank';
    link.click();
  }
}
