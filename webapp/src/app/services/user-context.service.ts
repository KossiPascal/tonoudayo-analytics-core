import { Injectable } from '@angular/core';
import { AppStorageService } from './local-storage.service';
import { User } from '../models/user-role';
import { jwtDecode } from "jwt-decode";
import { IndexedDbService } from './indexed-db.service';
import { userRoles } from '@kossi-shared/functions';

@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  constructor(private indexdb: IndexedDbService, private store: AppStorageService) { }

  APP_AUTH_TOKEN: string = 'Kossi TSOLEGNAGBO Pascal 26/03/1989 Lomé/Kara Integrate Health (+228) 92645651 (Token du 12 Avril 2025 à 16:10:23)';
  APP_ADMIN_PRIVILEGE: string = `${this.APP_AUTH_TOKEN} PRIVILEGES`;

  async isLoggedIn(userObj: User | null = null): Promise<boolean> {
    try {
      const user = (userObj ?? await this.currentUser()) as User | null;
      const currentTime = Math.floor(Date.now() / 1000);
      return user && user != null ? (currentTime < user.exp) : false;
    } catch (error) {
      return false;
    }
  }

  async currentUser(userTokens?:{ id: string, data: string}[]): Promise<User | null> {
    userTokens = userTokens ?? await this.indexdb.getAll<{ id: string, data: string }>('token');


    const mcdp: { id: string, data: boolean } | undefined = await this.indexdb.getOne<{ id: string; data: any }>('user_info', 'mustChangeDefaultPassword');

    const jsonUser: any = userTokens.reduce((acc, { id, data }) => {
      (acc as any)[id] = data;
      return acc;
    }, {});

    if (!jsonUser || !jsonUser.user || !jsonUser.persons) return null;

    const user = jwtDecode(jsonUser.user) as User;
    if (!user) return null;

    user.mustChangeDefaultPassword = jsonUser.mustChangeDefaultPassword;

    if (jsonUser.orgunits) {
      const ou = jwtDecode(jsonUser.orgunits) as any;
      if ((ou.sites ?? '') !== '') user.sites = ou.sites;
      if ((ou.zones ?? '') !== '') user.zones = ou.zones;
    }
    if (!jsonUser.persons) return null
    const ps = jwtDecode(jsonUser.persons) as any;
    if ((ps.chws ?? '') !== '') user.chws = ps.chws;
    if ((ps.chws ?? '') !== '') user.chws = ps.chws;

    // if (!user.chws || user.chws.length === 0) return null;
   
    user.role = userRoles(user.authorizations ?? [], user.routes ?? [])

    return user;
  }

  async token(): Promise<string> {
    const token = await this.indexdb.getOne<{ id: string, data: string }>('token', 'user');
    return token?.data ?? '';
  }

  async defaultPage(userObj: User | null = null): Promise<string> {
    const user = userObj ?? await this.currentUser();
    if (user) {
      const lastVisitedUrl = this.store.get({ db: 'session', name: 'lastVisitedUrl' })
      if ((lastVisitedUrl ?? '') != '') return lastVisitedUrl!;
      if (user.role.isSuperUser) return '/admin/users';
    }
    return '/dashboards';
  }




  authorizations(userCtx: User | null): string[] {
    return userCtx?.authorizations ?? [];
  }


}
