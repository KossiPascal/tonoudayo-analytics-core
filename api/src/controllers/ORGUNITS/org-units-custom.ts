import { DistrictCustomQuery, SiteCustomQuery, SupervisorCustomQuery, ZoneCustomQuery, ChwCustomQuery, FamilyCustomQuery, PatientCustomQuery } from "../../models/org-units/orgunits-query";
import { AppDataSource } from "../../data-source";
import { DataSource } from "typeorm";


let Connection: DataSource = AppDataSource.manager.connection;

export async function DISTRICTS_CUSTOM_QUERY(siteList?: SiteCustomQuery[]): Promise<DistrictCustomQuery[]> {
    const sites: SiteCustomQuery[] = siteList ?? await Connection.query(`SELECT * FROM site_view;`);
    if (!sites || sites.length === 0) return [];

    const seenDistrictIds = new Set<string>();
    const uniqueDistricts: DistrictCustomQuery[] = [];

    for (const site of sites) {
        const district = site.district;
        if (!seenDistrictIds.has(district.id)) {
            seenDistrictIds.add(district.id);
            uniqueDistricts.push(district);
        }
    }
    return uniqueDistricts;
}



export async function SITES_CUSTOM_QUERY(): Promise<SiteCustomQuery[]> {
    return await Connection.query(`SELECT * FROM site_view;`);
}

export async function SUPERVISORS_CUSTOM_QUERY(): Promise<SupervisorCustomQuery[]> {
    return await Connection.query(`SELECT * FROM chw_view;`);
}

export async function ZONES_CUSTOM_QUERY(): Promise<ZoneCustomQuery[]> {
    return await Connection.query(`
        SELECT 
            vs.*,
            json_build_object('id', rc.id, 'name', rc.name) AS chw 
        FROM 
            zone_view vs 
        LEFT JOIN 
            chw_view rc ON vs.chw_id = rc.id
    `);
}

export async function CHWS_CUSTOM_QUERY(): Promise<ChwCustomQuery[]> {
    return await Connection.query(`SELECT * FROM chw_view;`);
}

export async function GetChwIdByDhis2Uid(uid: string): Promise<string | undefined> {
    const results = await Connection.query(`SELECT * FROM chw_view WHERE external_id = $1`, [uid]);
    if (Array.isArray(results) && results.length > 0) {
        const firstResult: any = results[0];
        return firstResult.id;
    }
    return undefined;
}

export async function FAMILIES_CUSTOM_QUERY(): Promise<FamilyCustomQuery[]> {
    return await Connection.query(`
        SELECT 
            f.*, 
            ro.id AS chw_id,
            json_build_object('id', ro.id, 'name', ro.name) AS chw 
        FROM 
            family_view f 
        LEFT JOIN 
            (SELECT DISTINCT ON (zone_id) id, name, zone_id FROM chw_view) AS ro ON ro.zone_id = f.zone_id
    `);
}

export async function PATIENTS_CUSTOM_QUERY(): Promise<PatientCustomQuery[]> {
    return await Connection.query(`SELECT * FROM patient_view;`);
}
