export interface SitesMap { id: string, external_id: string, name: string, }
export interface ZonesMap { id: string, external_id: string, name: string,  site_id: string }
export interface SupervisorsMap { id: string, external_id: string, name: string,  site_id: string }
export interface ChwsMap { id: string, external_id: string, name: string,  site_id: string, zone_id: string }



export function GetSitesMap<T>(data:T|any):SitesMap {
    return { id: data.id, external_id: data.external_id, name: data.name };
}
export function GetZonesMap<T>(data:T|any):ZonesMap {
    return { id: data.id, external_id: data.external_id, name: data.name, site_id: data.site.id };
}
export function GetSupervisorsMap<T>(data:T|any):SupervisorsMap {
    return { id: data.id, external_id: data.external_id, name: data.name, site_id: data.site.id };
}
export function GetChwsMap<T>(data:T|any):ChwsMap {
    return { id: data.id, external_id: data.external_id, name: data.name, site_id: data.site.id, zone_id: data.zone.id };
}
