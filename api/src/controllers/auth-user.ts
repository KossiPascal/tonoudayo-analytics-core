import { Request, Response, NextFunction } from 'express';
import { Routes, TokenUser, Users, generateSelectedUserOrgUnitsAndContact, getUsersRepository, hashUserToken, jwSecretKey, userTokenGenerated } from '../entities/User';
import { httpHeaders, notEmpty } from '../functions/functions';
import { Roles, getRolesRepository } from '../entities/Roles';
import crypto from 'crypto';
import { ROUTES_LIST, _superuser, can_view_reports, can_logout, can_manage_data, can_view_dashboards, must_change_default_password, can_delete_role, can_delete_user, can_update_role, can_update_user, can_create_user, can_create_role, can_view_roles, can_view_users, AUTHORIZATIONS_LIST, dashboardsRoute, reportsRoute, usersRoute, can_use_offline_mode, roleAuthorizations, _public, can_update_password, can_update_profile } from '../providers/authorizations-pages';
import { SITES_CUSTOM_QUERY, ZONES_CUSTOM_QUERY, CHWS_CUSTOM_QUERY } from './ORGUNITS/org-units-custom';
import { APP_ENV } from '../providers/constantes';
import request from 'request';
import * as jwt from 'jsonwebtoken';
import { ChwsMap, SupervisorsMap, ZonesMap, SitesMap } from '../models/org-units/orgunits-map';
import { ChwCustomQuery, SupervisorCustomQuery, ZoneCustomQuery, SiteCustomQuery } from '../models/org-units/orgunits-query';

// import uuidv4 from 'uuid';


const { NODE_ENV, CHT_PROD_HOST, CHT_DEV_HOST, CHT_PORT } = APP_ENV;

const USER_CHT_HOST = `${NODE_ENV === 'production' ? CHT_PROD_HOST : CHT_DEV_HOST}:${CHT_PORT}`;


function hashPassword(password: string): { salt: string, hashedPassword: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return { salt, hashedPassword };
}

function verifyPassword(password: string, salt: string, hashedPassword: string): boolean {
    const inputHashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return inputHashedPassword === hashedPassword;
}

function generateShortId(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

export const ADMIN_USER_ID: string = 'Wy9bzA7a5kF'


function availableUid<T>(datas: Array<T>): string {
    let newId: string;
    if (!datas || datas.length == 0) {
        return generateShortId(11);
    }
    do {
        newId = generateShortId(11);
    } while (datas.some((d: any) => (d.id ?? d.uid ?? d.uuid ?? d._id) === newId));
    return newId;
}

export async function CurrentUser(currentUserId: string): Promise<Users | null> {
    const userRepo = await getUsersRepository();
    const userFound = await userRepo.findOneBy({ id: currentUserId });
    return userFound;
}

export class AuthUserController {
    static DefaultAdminCreation = async () => {
        const userRepo = await getUsersRepository();

        // const allusers = await userRepo.find();

        // for (const user of allusers) {
        //     user.roles = user.roles.map(u=>parseInt(`${u}`))
        //     await userRepo.save(user);
        // }

        const existingUsers = await userRepo.count();
        if (existingUsers > 0) return;

        const roleRepo = await getRolesRepository();
        const existingRoles = await roleRepo.count();

        if (existingRoles === 0) {

            const chwRoutes = [reportsRoute, dashboardsRoute];
            const managersRoutes = [reportsRoute, dashboardsRoute];
            const adminRoutes = [reportsRoute, dashboardsRoute];
            const usersManagerRoutes = [usersRoute];

            

            const chwAuthorizations = [_public, can_view_reports, can_view_dashboards, can_use_offline_mode, can_logout];
            const managersAuthorizations = [_public, can_view_reports, can_view_dashboards, can_manage_data, can_logout, can_update_profile, can_update_password, must_change_default_password];
            const adminAuthorizations = [_public, can_view_reports, can_view_dashboards, can_manage_data, can_logout, can_update_profile, can_update_password, must_change_default_password];
            const usersManagerAuthorizations = [_public, can_view_users, can_create_user, can_update_user, can_delete_user, can_view_roles, can_create_role, can_update_role, can_delete_role, can_update_profile, can_update_password, must_change_default_password];

            const rolesData: { id: number; name: string; routes: Routes[]; authorizations: string[] }[] = [
                { id: 1, name: 'superuser', routes: [], authorizations: [_superuser] },
                { id: 2, name: 'admin', routes: adminRoutes, authorizations: adminAuthorizations },
                { id: 3, name: 'chw', routes: chwRoutes, authorizations: chwAuthorizations },
                { id: 4, name: 'supervisors', routes: managersRoutes, authorizations: managersAuthorizations },
                { id: 5, name: 'users_manager', routes: usersManagerRoutes, authorizations: usersManagerAuthorizations },
            ];

            const roles = rolesData.map(({ id, name, routes, authorizations }) => {
                const role = new Roles();
                role.id = id;
                role.name = name;
                role.routes = routes;
                role.authorizations = authorizations;
                return role;
            });

            await roleRepo.save(roles);
        }

        const usersData = [
            { id: ADMIN_USER_ID, username: 'admin', fullname: 'Admin', password: 'district', roles: [1], phone: null },
            { id: availableUid([]), username: 'manager', fullname: 'Manager', password: 'manager', roles: [2], phone: null },
        ];

        const users = usersData.map(({ id, username, fullname, phone, password, roles }) => {
            const hash = hashPassword(password);
            const user = new Users();
            user.id = id;
            user.username = username;
            user.phone = phone;
            user.fullname = fullname;
            user.password = hash.hashedPassword;
            user.salt = hash.salt;
            user.roles = roles;
            user.isActive = true;
            user.mustLogin = true;
            return user;
        });

        await userRepo.save(users);
    };

    static getChwParam = (chws: ChwCustomQuery[]): ChwsMap[] => {
        return chws.map(r => ({
            id: r.id,
            external_id: r.external_id,
            name: r.name,
            site_id: r.site.id,
            zone_id: r.zone.id
        }));
    };

    static getSupervisorParam = (chws: SupervisorCustomQuery[]): SupervisorsMap[] => {
        return chws.map(chw => ({
            id: chw.id,
            external_id: chw.external_id,
            name: chw.name,
            site_id: chw.site.id
        }));
    };

    static getZoneParam = (data: ZoneCustomQuery[]): ZonesMap[] => {
        return data.map(r => ({
            id: r.id,
            external_id: r.external_id,
            name: r.name,
            site_id: r.site.id,
        }));
    };

    static getSiteParam = (data: SiteCustomQuery[]): SitesMap[] => {
        return data.map(r => ({
            id: r.id,
            external_id: r.external_id,
            name: r.name,
        }));
    };

    static startTchecking = async (user: Users, res: Response) => {

        const userToken = await userTokenGenerated(user);

        if (!userToken) return res.status(201).json({ status: 201, data: 'Vous n\'êtes pas autorisé à effectuer cette action!' });

        const role = roleAuthorizations(userToken.authorizations ?? [], userToken.routes ?? []);
        const selectedUserOU = await generateSelectedUserOrgUnitsAndContact({isSuperUser:role.isSuperUser, chws: user.chws});

        const token = await hashUserToken(userToken);
        const userRepo = await getUsersRepository();
        user.token = token;

        if (role.mustChangeDefaultPassword && !user.hasChangedDefaultPassword) {
            const secret = await jwSecretKey({ user: user });
            const dataToSend: any = {
                status: 200,
                token: token,
                mustChangeDefaultPassword: true,
                orgunits: jwt.sign({}, secret.secretOrPrivateKey),
                persons: jwt.sign({chws:['']}, secret.secretOrPrivateKey),
            };

            return res.status(200).json(dataToSend);
        }


        user.mustLogin = false;

        if (selectedUserOU && !role.isSuperUser) {
            user.sites = selectedUserOU?.sites;
            user.zones = selectedUserOU?.zones;
            user.supervisors = selectedUserOU?.supervisors;
            user.chws = selectedUserOU?.chws;
        }
        await userRepo.save(user);

        const orgunits = {
            sites: selectedUserOU?.sites ?? [],
            zones: selectedUserOU?.zones ?? []
        };
        const persons = {
            supervisors: selectedUserOU?.supervisors ?? [],
            chws: selectedUserOU?.chws ?? []
        }

        const secret = await jwSecretKey({ user: user });

        const dataToSend: any = {
            status: 200,
            token: token,
            mustChangeDefaultPassword: false,
            orgunits: jwt.sign(orgunits, secret.secretOrPrivateKey),
            persons: jwt.sign(persons, secret.secretOrPrivateKey),
        };

        return res.status(200).json(dataToSend);

    }

    static login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { credential, password } = req.body;
            if (!credential || !password) return res.status(201).json({ status: 201, data: 'Nom utilisatuer ou mot de passe inconnu!, Reesayer!' });

            const userRepo = await getUsersRepository();
            const user = await userRepo.findOne({ where: [{ username: credential }, { email: credential }] });

            if (user) {
                if (!user.isActive || user.isDeleted) return res.status(201).json({ status: 201, data: "Vous n'avez pas la permission de vous connecter. Contactez votre administrateur!" });
                const isPasswordValid = verifyPassword(password, user.salt ?? 'ZerD2345~@PRET', user.password);
                if (!isPasswordValid) return res.status(201).json({ status: 201, data: 'Nom utilisatuer ou mot de passe inconnu!, Reesayer!' });
                await AuthUserController.startTchecking(user, res);
            } else {
                const chtUrl = `https://${USER_CHT_HOST}/medic/org.couchdb.user:${credential}`;

                request({
                    url: chtUrl,
                    method: 'GET',
                    headers: httpHeaders(credential, password)
                }, async function (error: any, response: any, body: any) {
                    if (error) return res.status(201).json({ status: 201, data: `${error || 'Erreur Interne Du Serveur'}` });

                    try {
                        const { _id, name, phone, roles, facility_id, contact_id }: { _id: string, name: string, phone: string | null, roles: string[], facility_id: string[], contact_id: string } = JSON.parse(body);

                        if (!roles || !Array.isArray(roles)) {
                            return res.status(201).json({ status: 201, data: `Impossible de vous connecter au serveur` });
                        }

                        const roleMapping: { [key: string]: number } = {
                            chw: 3,
                            supervisor: 4,
                        };

                        const roleKeys = Object.keys(roleMapping);
                        const userRoles = roleKeys.filter(role => roles.includes(role));

                        if (userRoles.length == 0) {
                            return res.status(201).json({ status: 201, data: `Impossible de vous connecter au serveur` });
                        }

                        const [chwList, zoneList, siteList] =
                            await Promise.all([
                                CHWS_CUSTOM_QUERY(),
                                ZONES_CUSTOM_QUERY(),
                                SITES_CUSTOM_QUERY(),
                            ]);

                        let CHWS: ChwCustomQuery[] = [];
                        let SUPERVISORS: SupervisorCustomQuery[] = [];

                        if (roles.includes('chw')) {
                            CHWS = [...CHWS, ...chwList.filter(r => r.id === contact_id)];
                        }


                        // Suppression des doublons
                        CHWS = Array.from(new Set(CHWS.map(r => r.id))).map(id => CHWS.find(r => r.id === id)).filter(r => r != undefined && r != null);
                        SUPERVISORS = Array.from(new Set(SUPERVISORS.map(c => c.id))).map(id => SUPERVISORS.find(c => c.id === id)).filter(r => r != undefined && r != null);

                        if (CHWS.length == 0) {
                            return res.status(201).json({ status: 201, data: `Impossible de vous connecter au serveur` });
                        }

                        const ZONES = zoneList.filter(v => CHWS.some(r => r.zone.id === v.id));
                        const SITES = siteList.filter(d => CHWS.some(r => r.site.id === d.id));

                        var users: Users[] = await userRepo.find();
                        const u = new Users();
                        const { salt, hashedPassword } = hashPassword(password);

                        u.id = availableUid(users);
                        u.username = name;
                        u.phone = phone;
                        u.fullname = name.toUpperCase();
                        u.password = hashedPassword;
                        u.salt = salt;
                        u.roles = userRoles.map(role => roleMapping[role]);
                        u.isActive = true;
                        u.mustLogin = true;
                        u.chws = AuthUserController.getChwParam(CHWS);
                        if (SUPERVISORS.length > 0) u.supervisors = AuthUserController.getSupervisorParam(SUPERVISORS);
                        if (ZONES.length > 0) u.zones = AuthUserController.getZoneParam(ZONES);
                        if (SITES.length > 0) u.sites = AuthUserController.getSiteParam(SITES);

                        const sUser = await userRepo.save(u);
                        await AuthUserController.startTchecking(sUser, res);

                    } catch (err: any) {
                        return res.status(500).json({ status: 500, data: `${err || 'Erreur Interne Du Serveur'}` });
                    }
                });
            }
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err || 'Erreur Interne Du Serveur'}` });
        }
    };

    static register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, id, username, email, phone, password, fullname, roles, isActive, sites, zones, supervisors, chws } = req.body;

            if (!userId) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });

            if (!username || !password) return res.status(201).json({ status: 201, data: 'Informations Invalide, Reesayer!' });

            const userRepo = await getUsersRepository();
            const userFound = await userRepo.findOne({ where: [{ username: username }, notEmpty(email) && email !== '@' ? { email: email } : {}] });

            if (userFound && notEmpty(userFound)) return res.status(201).json({ status: 201, data: 'Identifiants Invalides, Reesayer un autre!' });
            var users: Users[] = await userRepo.find();

            const { salt, hashedPassword } = hashPassword(password);

            const user = new Users();
            user.id = id ?? availableUid(users);
            user.username = username;
            user.fullname = fullname;
            user.email = email;
            user.phone = phone;
            user.password = hashedPassword;
            user.salt = salt;
            user.roles = roles;
            user.isActive = isActive === true;
            user.sites = sites;
            user.zones = zones;
            user.supervisors = supervisors;
            user.chws = chws;
            user.created_at = new Date();
            user.created_by = userId;

            await userRepo.save(user);

            return res.status(200).json({ status: 200, data: 'Utilisateur enrégistré avec succès' });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err?.message || 'Erreur Interne Du Serveur'}` });
        }
    };

    static newToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, updateReload } = req.body;
            if (!userId) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });
            const userRepo = await getUsersRepository();
            const user = await userRepo.findOneBy({ id: userId });
            if (!user || user && (!user.isActive || user.isDeleted)) return res.status(201).json({ status: 201, data: 'error' });

            await AuthUserController.startTchecking(user, res);

            // const token = await userToken(user);
            // if (token) {
            //     user.token = token as string;
            //     if (updateReload == true) user.mustLogin = false;
            //     await userRepo.save(user);
            //     return res.status(200).json({ status: 200, data: token });
            // }
            // return res.status(201).json({ status: 201, data: `Vous n'êtes pas autorisé à effectuer cette action!` });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err?.message || 'Erreur Interne Du Serveur'}` });
        }
    }

    static CheckReloadUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.body;
            if (!userId) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });
            const userRepo = await getUsersRepository();
            const user = await userRepo.findOneBy({ id: userId });
            if (!user || user && (!user.isActive || user.isDeleted)) return res.status(201).json({ status: 201, data: 'error' });
            if (user.mustLogin) return res.status(202).json({ status: 202, data: 'error' });
            return res.status(200).json({ status: 200, data: user.token });
        } catch (err) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    };


    static allUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.body;
            const userRepo = await getUsersRepository();
            var currentUser: Users | null = await userRepo.findOneBy({ id: userId });
            if (!currentUser) return res.status(201).json({ status: 200, data: 'Vous devez vous déconnecter et reessayer!' });
            const currentUserToken = await userTokenGenerated(currentUser, { checkValidation: false, outPutInitialRoles: true, outPutOrgUnits: true });
            if (!currentUserToken) return res.status(201).json({ status: 200, data: 'Vous devez vous déconnecter et reessayer!' });

            var users: Users[] = await userRepo.find();
            var finalUsers: Users[] = await Promise.all(users.map(async user => {
                // const formatedRoles = await GetRolesAndNamesPagesAuthorizations(user.roles);
                const tokenUser = await userTokenGenerated(user, { checkValidation: false, outPutInitialRoles: true, outPutOrgUnits: true });
                // const finalRoles = formatedRoles && notEmpty(formatedRoles) ? formatedRoles.rolesObj : [];
                const newUser: any = { ...(tokenUser as TokenUser), isDeleted: user.isDeleted, isActive: user.isActive };
                return newUser;
            }));

            const role = roleAuthorizations(currentUserToken.authorizations ?? [], currentUserToken.routes ?? []);

            if (role.isSuperUser !== true) {
                finalUsers = finalUsers.filter(async user => {
                    const uToken = await userTokenGenerated(user, { checkValidation: false, outPutInitialRoles: true, outPutOrgUnits: true });
                    if (uToken) {
                        const uRole = roleAuthorizations(uToken.authorizations ?? [], uToken.routes ?? []);
                        return uRole.isSuperUser !== true
                    }
                    return true;
                })
            }
            return res.status(200).json({ status: 200, data: finalUsers });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, id, username, phone, email, password, fullname, roles, isActive, sites, zones, supervisors, chws } = req.body;
            if (!userId || !id) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });

            const userRepo = await getUsersRepository();
            const user = await userRepo.findOneBy({ id: id });
            if (!user) return res.status(201).json({ status: 201, data: 'Aucun utilisateur trouvé' });

            if (password && notEmpty(password)) {
                const { salt, hashedPassword } = hashPassword(password);
                user.password = hashedPassword;
                user.salt = salt;
            }
            user.fullname = fullname;
            user.phone = phone;
            user.email = email;
            user.roles = roles;
            user.isActive = isActive === true;
            user.sites = sites;
            user.zones = zones;
            user.supervisors = supervisors;
            user.chws = chws;
            user.updated_at = new Date();
            user.updated_by = userId;
            user.mustLogin = true;
            const userToken = await userTokenGenerated(user);
            if (userToken) {
                const token = await hashUserToken(userToken);
                user.token = token;
                await userRepo.save(user);
                return res.status(200).json({ status: 200, data: user.token });
            }
            return res.status(201).json({ status: 201, data: 'Erreur rencontrée, réessayer' });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err.message || 'Erreur Interne Du Serveur'}` });
        }
    };

    static updateUserPassWord = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, id, oldPassword, newPassword } = req.body;
            if (!userId || !id) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });

            const userRepo = await getUsersRepository();
            const user = await userRepo.findOneBy({ id: id });
            if (!user) return res.status(201).json({ status: 201, data: 'Aucun utilisateur trouvé' });

            if (oldPassword && notEmpty(oldPassword) && newPassword && notEmpty(newPassword)) {
                const isOldPasswordValid = verifyPassword(oldPassword, user.salt, user.password);
                if (!isOldPasswordValid) return res.status(201).json({ status: 201, data: 'L\'ancien mot de passe n\'est pas correct' });
                if (newPassword && notEmpty(newPassword)) {
                    const { salt, hashedPassword } = hashPassword(newPassword);
                    user.password = hashedPassword;
                    user.salt = salt;
                }
            }
            user.mustLogin = true;
            user.updated_at = new Date();
            user.updated_by = userId;
            user.hasChangedDefaultPassword = true;

            const userToken = await userTokenGenerated(user);
            if (userToken) {
                const token = await hashUserToken(userToken);
                user.token = token;
                await userRepo.save(user);
                return res.status(200).json({ status: 200, data: user.token });
            }
            return res.status(201).json({ status: 201, data: 'Erreur rencontrée, réessayer' });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err.message || 'Erreur Interne Du Serveur'}` });
        }
    };


    static updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, id, fullname, email, phone } = req.body;
            if (!userId || !id) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });

            const userRepo = await getUsersRepository();
            const user = await userRepo.findOneBy({ id: id });
            if (!user) return res.status(201).json({ status: 201, data: 'Aucun utilisateur trouvé' });

            user.fullname = fullname;
            user.email = email;
            user.phone = phone;
            user.updated_at = new Date();
            user.updated_by = userId;

            user.mustLogin = true;

            const userToken = await userTokenGenerated(user);
            if (userToken) {
                const token = await hashUserToken(userToken);
                user.token = token;
                await userRepo.save(user);
                return res.status(200).json({ status: 200, data: user.token });
            }
            return res.status(201).json({ status: 201, data: 'Erreur rencontrée, réessayer' });

        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err.message || 'Erreur Interne Du Serveur'}` });
        }
    };


    static deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, id, permanentDelete } = req.body;
            if (!userId || !id) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });
            const userRepo = await getUsersRepository();
            const isSuperUser = true;

            if (!(isSuperUser != true && id)) return res.status(201).json({ status: 201, data: 'Vous ne pouvez pas supprimer cet utilisateur' });
            const user = await userRepo.findOneBy({ id: id });
            if (!user) return res.status(200).json({ status: 200, data: 'Supprimé avec succès' });
            if (permanentDelete != true) {
                user.token = '';
                user.roles = [];
                user.isActive = false;
                user.isDeleted = true;
                user.deletedAt = new Date();
                user.mustLogin = true;
                await userRepo.save(user);
                return res.status(200).json({ status: 200, data: 'Supprimé avec succès' });
            } else {
                await userRepo.delete({ id: id });
                return res.status(200).json({ status: 200, data: 'Supprimé avec succès' });
            }
            // return res.status(201).json({ status: 201, data: 'No user found' });

        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static GetRolesList = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.body;
            if (!userId) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });
            const repo = await getRolesRepository();
            var roles: Roles[] = await repo.find();
            return res.status(200).json({ status: 200, data: roles });
        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static CreateRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, id, name, routes, authorizations } = req.body;
            if (!userId) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });
            const repo = await getRolesRepository();
            const roleFound = await repo.findOne({ where: [notEmpty(id) ? { id: id } : {}, notEmpty(name) ? { name: name } : {}] });

            if (roleFound && notEmpty(roleFound)) return res.status(201).json({ status: 201, data: 'Le Role existe deja' });
            const role: Roles = new Roles();
            role.name = name;
            role.authorizations = authorizations;
            role.routes = routes;
            await repo.save(role);
            var roles: Roles[] = await repo.find();
            return res.status(200).json({ status: 200, data: roles });

        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static UpdateRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, id, name, authorizations, routes } = req.body;
            if (!userId || !id) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });

            const repo = await getRolesRepository();
            const role = await repo.findOne({ where: [{ id: id }, { name: name }] });

            if (!(role && notEmpty(role) && id)) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });

            const userRepo = await getUsersRepository();
            const users = await userRepo.find();
            const selectedUsers = users.filter(user => user.roles.includes(id));
            selectedUsers.forEach(user => {
                user.mustLogin = true;
                userRepo.save(user);
            });

            // role.id = id;
            role.name = name;
            role.routes = routes;
            role.authorizations = authorizations;
            await repo.save(role);

            var roles: Roles[] = await repo.find();

            return res.status(200).json({ status: 200, data: roles });

        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static DeleteRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, id, isSuperUser } = req.body;
            if (!userId || !id) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });

            if (isSuperUser !== true) return res.status(201).json({ status: 201, data: 'Vous ne pouvez pas supprimer cet utilisateur' });
            const repo = await getRolesRepository();
            const role = await repo.findOneBy({ id: id });
            if (!role) return res.status(201).json({ status: 201, data: 'Pas de role trouvé' });
            const userRepo = await getUsersRepository();
            const users = await userRepo.find();
            const selectedUsers = users.filter(user => user.roles.includes(id));

            role.isDeleted = true;
            role.deletedAt = new Date();
            repo.save(role);

            selectedUsers.forEach(user => {
                const index = user.roles.indexOf(id);
                if (index !== -1) {
                    user.roles.splice(index, 1);
                    user.mustLogin = true;
                    userRepo.save(user);
                }
            });

            return res.status(200).json({ status: 200, data: 'success' });

        } catch (err: any) {
            return res.status(500).json({ status: 500, data: `${err}` });
        }
    }

    static UserAuthorizations = async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.body;
        if (!userId) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });
        return res.status(200).json({ status: 200, data: AUTHORIZATIONS_LIST });
    }

    static UserRoutes = async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.body;
        if (!userId) return res.status(201).json({ status: 201, data: 'Aucun utilisateur selectionné' });
        return res.status(200).json({ status: 200, data: ROUTES_LIST });
    }


}
