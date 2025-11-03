import * as jwt from 'jsonwebtoken';
import { Entity, Column, Repository, DataSource, PrimaryColumn, In } from "typeorm"
import { AppDataSource } from '../data-source';
import { notEmpty } from '../functions/functions';
import { GetRolesAndNamesPagesAuthorizations, Roles } from './Roles';
import { ROUTES_LIST, AUTHORIZATIONS_LIST, _superuser, can_use_offline_mode, roleAuthorizations } from '../providers/authorizations-pages';
import { SITES_CUSTOM_QUERY, SUPERVISORS_CUSTOM_QUERY, ZONES_CUSTOM_QUERY, CHWS_CUSTOM_QUERY } from '../controllers/ORGUNITS/org-units-custom';
import { SECRET_PRIVATE_KEY } from '../providers/constantes';
import { SitesMap, ZonesMap, SupervisorsMap, ChwsMap, GetSitesMap, GetZonesMap, GetChwsMap, GetSupervisorsMap } from '../models/org-units/orgunits-map';
import { SupervisorCustomQuery, SiteCustomQuery, ChwCustomQuery, ZoneCustomQuery } from '../models/org-units/orgunits-query';

let Connection: DataSource = AppDataSource.manager.connection;


@Entity("user", {
    orderBy: {
        username: "ASC",
        id: "DESC"
    }
})
export class Users {

    @PrimaryColumn({ type: 'text', nullable: false })
    id!: string

    @Column({ unique: true, type: 'varchar', nullable: false })
    username!: string

    @Column({ nullable: true })
    fullname!: string

    @Column({ type: 'varchar', nullable: true })
    email!: string

    @Column({ type: 'varchar', nullable: true })
    phone!: string | null

    @Column({ type: 'timestamp', nullable: true })
    email_verified_at!: Date;

    @Column({ type: 'varchar', nullable: true })
    remember_token!: string

    @Column({ type: 'text', nullable: true })
    password!: string

    @Column({ type: 'text', nullable: true })
    salt!: string

    @Column({ type: 'jsonb', nullable: true })
    roles!: number[]

    @Column({ type: 'text', nullable: true })
    token!: string

    @Column({ nullable: false, default: false })
    isActive!: boolean

    @Column({ nullable: false, default: false })
    isDeleted!: boolean

    @Column({ nullable: false, default: false })
    hasChangedDefaultPassword!: boolean

    @Column({ nullable: false, default: false })
    mustLogin!: boolean

    @Column({ type: 'jsonb', nullable: true })
    sites!: SitesMap[]

    @Column({ type: 'jsonb', nullable: true })
    zones!: ZonesMap[]

    @Column({ type: 'jsonb', nullable: true })
    supervisors!: SupervisorsMap[]

    @Column({ type: 'jsonb', nullable: true })
    chws!: ChwsMap[]

    @Column({ type: 'timestamp', nullable: true })
    deletedAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    created_at!: Date

    @Column({ type: 'text', nullable: true })
    created_by!: Users

    @Column({ type: 'timestamp', nullable: true })
    updated_at!: Date

    @Column({ type: 'text', nullable: true })
    updated_by!: Users
}

export async function getUsersRepository(): Promise<Repository<Users>> {
    return Connection.getRepository(Users);
}

export interface SelectedUserOrgUnitsAndContact {
    sites: SitesMap[]
    zones: ZonesMap[]
    supervisors: SupervisorsMap[]
    chws: ChwsMap[]
}


export interface TokenUser {
    id: string
    username: string
    fullname: string
    email: string
    phone: string | null
    hasChangedDefaultPassword: boolean
    rolesIds?: number[]
    rolesNames?: string[]
    roles?: Roles[]
    routes: Routes[]
    authorizations: string[]
    sites?: SitesMap[]
    zones?: ZonesMap[]
    supervisors?: SupervisorsMap[]
    chws?: ChwsMap[]
}

export interface Routes {
    path: string;
    label: string
    authorizations: string[];
}

export interface UserRole {
    isSuperUser: boolean,
    canUseOfflineMode: boolean,
    canViewReports: boolean,
    canViewDashboards: boolean,
    canManageData: boolean,
    canCreateUser: boolean,
    canUpdateUser: boolean,
    canDeleteUser: boolean,
    canCreateRole: boolean,
    canUpdateRole: boolean,
    canDeleteRole: boolean,
    canValidateData: boolean,
    canSendDataToDhis2: boolean,
    canViewUsers: boolean,
    canViewRoles: boolean,
    canDownloadData: boolean,
    canSendSms: boolean,
    canLogout: boolean,
    canUpdateProfile: boolean,
    canUpdatePassword: boolean,
    canUpdateLanguage: boolean,
    canViewNotifications: boolean,
    mustChangeDefaultPassword: boolean,
}

export interface FullRolesUtils {
    rolesObj: Roles[]
    rolesIds: number[]
    rolesNames: string[]
    routes: Routes[]
    authorizations: string[]
}

export async function jwSecretKey({ userId, user, userToken, isOfflineUser }: { userId?: string, user?: Users, userToken?: TokenUser, isOfflineUser?: boolean }): Promise<{ expiredIn: number, secretOrPrivateKey: string }> {
    isOfflineUser = isOfflineUser ?? false;

    if (userId || user) {
        if (userId) {
            const _repo = await getUsersRepository();
            const userF = await _repo.findOneBy({ id: userId });
            if (userF) user = userF;
        }

        if (user) {
            const data = await GetRolesAndNamesPagesAuthorizations(user.roles);
            isOfflineUser = (data?.authorizations ?? []).includes(can_use_offline_mode);
        }
    } else if (userToken) {
        isOfflineUser = userToken.authorizations.includes(can_use_offline_mode);
    }

    const offlinetimesecond = 60 * 60 * 24 * 366;
    const onlinetimesecond = 60 * 60;
    return {
        expiredIn: isOfflineUser ? offlinetimesecond : onlinetimesecond,
        secretOrPrivateKey: SECRET_PRIVATE_KEY,
    }
}

export async function userTokenGenerated(user: Users, param: { checkValidation?: boolean, outPutInitialRoles?: boolean, outPutOrgUnits?: boolean } = { checkValidation: true, outPutInitialRoles: false, outPutOrgUnits: false }): Promise<TokenUser | null> {

    const data = await GetRolesAndNamesPagesAuthorizations(user.roles);

    var rolesIds: number[] = data && notEmpty(data) ? data.rolesIds : [];
    var rolesNames: string[] = data && notEmpty(data) ? data.rolesNames : [];
    var roles: Roles[] = data && notEmpty(data) ? data.rolesObj : [];
    var routes: Routes[] = data && notEmpty(data) ? data.routes : [];
    var authorizations: string[] = data && notEmpty(data) ? data.authorizations : [];
    var isSuperUser: boolean = data && notEmpty(data) ? (data.authorizations.includes(_superuser)) : false;

    if (param.checkValidation === true && (!user.isActive || user.isDeleted || rolesIds.length == 0 && !isSuperUser || routes.length == 0 && !isSuperUser || authorizations.length == 0)) {
        return null;
    }

    const tokenUser: TokenUser = {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        hasChangedDefaultPassword: user.hasChangedDefaultPassword,
        routes: isSuperUser ? ROUTES_LIST : routes,
        authorizations: isSuperUser ? [...AUTHORIZATIONS_LIST, _superuser] : authorizations,
        rolesIds: param.outPutInitialRoles === true ? rolesIds : undefined,
        rolesNames: param.outPutInitialRoles === true ? rolesNames : undefined,
        roles: param.outPutInitialRoles === true ? roles : undefined,
    };

    if (param.outPutOrgUnits === true) {
        const orgUnits = await generateSelectedUserOrgUnitsAndContact({tokenUser:tokenUser, isSuperUser:isSuperUser, chws: user.chws});
        if (orgUnits) {
            tokenUser.sites = orgUnits.sites;
            tokenUser.zones = orgUnits.zones;
            tokenUser.supervisors = orgUnits.supervisors;
            tokenUser.chws = orgUnits.chws;
        }
    }


    return tokenUser;
}

export async function generateSelectedUserOrgUnitsAndContact({chws, tokenUser, isSuperUser }:{chws: ChwsMap[], tokenUser?: TokenUser, isSuperUser?:boolean}): Promise<SelectedUserOrgUnitsAndContact|undefined> {
    
    if (isSuperUser !== false && isSuperUser != true) {
        if (!tokenUser) return;
        const role = roleAuthorizations(tokenUser.authorizations ?? [], tokenUser.routes ?? []);
        isSuperUser = role.isSuperUser;
    }
    
    const allSites = await SITES_CUSTOM_QUERY();
    const allZones = await ZONES_CUSTOM_QUERY();
    const allSupervisors = await SUPERVISORS_CUSTOM_QUERY();
    const allChws = await CHWS_CUSTOM_QUERY();

    let sitesQuery:SiteCustomQuery[] = [];
    let zonesQuery:ZoneCustomQuery[] = [];
    let supervisorsQuery:SupervisorCustomQuery[] = [];
    let chwsQuery:ChwCustomQuery[] = [];

    if (isSuperUser !== true) {
        const sitesIds = chws ? [...new Set(chws.map(r => r.site_id))] : [];
        const zonesIds = chws ? [...new Set(chws.map(r => r.site_id))] : [];
        const chwsIds = chws ? [...new Set(chws.map(r => r.id))] : [];
    
        sitesQuery = sitesIds.length > 0 ? allSites.filter(r=>r.id && sitesIds.includes(r.id)) : [];
        zonesQuery = zonesIds.length > 0 ? allZones.filter(r=>r.id && zonesIds.includes(r.id)) : [];
        supervisorsQuery = allChws.filter(r=>r.site && r.site.id && sitesIds.includes(r.site.id));
        chwsQuery = chwsIds.length > 0 ? allChws.filter(r=>r.id && chwsIds.includes(r.id)) : [];
    }

    return {
        sites: (isSuperUser === true ? allSites : sitesQuery).map(d => GetSitesMap(d)),
        zones: (isSuperUser === true ? allZones : zonesQuery).map(d => GetZonesMap(d)),
        supervisors: (isSuperUser === true ? allSupervisors : supervisorsQuery).map(d => GetSupervisorsMap(d)),
        chws: (isSuperUser === true ? allChws : chwsQuery).map(d => GetChwsMap(d)),
    }
    
}

export async function hashUserToken(user: TokenUser): Promise<string> {
    const secret = await jwSecretKey({ userToken: user });
    return jwt.sign(user, secret.secretOrPrivateKey, { expiresIn: secret.expiredIn });
}