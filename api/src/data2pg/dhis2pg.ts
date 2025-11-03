import { getDhis2DataSetRepository, getDhis2EventRepository, getDhis2LastSyncRepository, getDhis2LogRepository } from "../entities/Dhis2";
import { CHWS_CUSTOM_QUERY, SITES_CUSTOM_QUERY } from "../controllers/ORGUNITS/org-units-custom";
import { milisecond_to_date } from "../functions/date-utils";
import { notEmpty } from "../functions/functions";
import { APP_ENV } from "../providers/constantes";
import { In } from "typeorm";
import axios from "axios";

const { NODE_ENV, DHIS2_PROTOCOL, DHIS2_PROD_HOST, DHIS2_DEV_HOST, DHIS2_PORT, DHIS2_USER, DHIS2_PASS } = APP_ENV;

const DHIS2_URL = `${DHIS2_PROTOCOL}://${NODE_ENV === 'production' ? DHIS2_PROD_HOST : DHIS2_DEV_HOST}`;

const DEFAULT_PAGE_SIZE = 1000000;

const EXCLUDED_IDS: RegExp[] = [
    /^test_/,
    /^temp_/,
    /^backup_/
];

type Dhis2Source = 'events' | 'datasets';

interface Sites {
    id: string;
    uuid: string;
    name: string;
    districtId: string;
    districtName: string;
}

interface Chws {
    id: string,
    uuid: string,
    siteId: string
}

function ihMonthYear(part: 'month' | 'year' | 'all' | 'period' | 'full', inputValue: any): any {
    let actualDate: Date | null = null;

    try {
        if (typeof inputValue === 'number') {
            // Assume it's a timestamp in milliseconds
            actualDate = new Date(inputValue);
        } else if (typeof inputValue === 'string') {
            if (/^\d{13}$/.test(inputValue)) {
                // Timestamp in milliseconds as string
                actualDate = new Date(Number(inputValue));
            } else {
                actualDate = new Date(inputValue);
            }
        } else if (inputValue instanceof Date) {
            actualDate = inputValue;
        } else {
            return null;
        }

        if (isNaN(actualDate.getTime())) {
            return null; // Invalid date
        }
    } catch (error) {
        return null;
    }

    let shiftedDate: Date;
    let finalMonth: string;
    let finalYear: number;
    let startDate: string;
    let endDate: string;

    if (actualDate.getDate() >= 21) {
        // Add one month
        shiftedDate = new Date(actualDate);
        shiftedDate.setMonth(shiftedDate.getMonth() + 1);

        finalMonth = String(shiftedDate.getMonth() + 1).padStart(2, '0');
        finalYear = shiftedDate.getFullYear();

        const monthStart = new Date(actualDate.getFullYear(), actualDate.getMonth(), 20);
        const nextMonthStart = new Date(shiftedDate.getFullYear(), shiftedDate.getMonth(), 19);

        startDate = monthStart.toISOString().split('T')[0];
        endDate = nextMonthStart.toISOString().split('T')[0];
    } else {
        finalMonth = String(actualDate.getMonth() + 1).padStart(2, '0');
        finalYear = actualDate.getFullYear();

        const prevMonth = new Date(actualDate.getFullYear(), actualDate.getMonth() - 1, 20);
        const monthStart = new Date(actualDate.getFullYear(), actualDate.getMonth(), 19);

        startDate = prevMonth.toISOString().split('T')[0];
        endDate = monthStart.toISOString().split('T')[0];
    }

    switch (part) {
        case 'month':
            return finalMonth;
        case 'year':
            return finalYear;
        case 'all':
            return { year: finalYear, month: finalMonth };
        case 'period':
            return { start_date: startDate, end_date: endDate };
        case 'full':
            return {
                year: finalYear,
                month: finalMonth,
                start_date: startDate,
                end_date: endDate,
            };
        default:
            return null;
    }
}


// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getValue(dataValues: { dataElement: string, value: any }[], elementId: string): string {
    for (let i = 0; i < dataValues.length; i++) {
        const data = dataValues[i];
        if (data.dataElement == elementId) {
            return data.value;
        }
    }
    return '';
}

function getDataValuesAsMap(dataValues: { dataElement: string, value: any }[], excludeDataElement?: string[]) {
    var finalData: any = {};
    for (let i = 0; i < dataValues.length; i++) {
        const data = dataValues[i];
        if (notEmpty(excludeDataElement)) {
            if (!excludeDataElement!.includes(data.dataElement)) {
                finalData[data.dataElement] = data.value;
            }
        } else {
            finalData[data.dataElement] = data.value;
        }
    }
    return finalData;
}

function getMostRecentDate(dates: (string | Date)[]): string {
    const mostRecent = dates.reduce((latest, current) => {
        return new Date(current) > new Date(latest) ? current : latest;
    });
    return new Date(mostRecent).toISOString(); // ou `.toString()` selon le format voulu
}



function getFirstDayOfMonth(someDate: any): string {
    const date = someDate instanceof Date ? someDate : new Date(someDate);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
    }
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
}


async function logMessage(message: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const _repo = await getDhis2LogRepository();
    await _repo.save({ log: `[${timestamp}] ${message}\n` });
}

async function getLastSyncDate(source: Dhis2Source, orgUnit: Sites): Promise<string> {
    const defaultDate = "2020-01-01T00:00:00.000Z";
    try {
        const _repo = await getDhis2LastSyncRepository();
        const found = await _repo.findOneBy({ orgUnit: orgUnit.uuid, source });
        return found?.lastSync ?? defaultDate;
    } catch (error) {
        await logMessage(`⚠️ Erreur lecture date sync: ${(error as Error).message}`);
        return defaultDate;
    }
}

async function updateLastSyncDate(source: Dhis2Source, orgUnit: Sites, lastSync: string): Promise<void> {
    if (!source || !lastSync) return;
    try {
        const _repo = await getDhis2LastSyncRepository();
        const existing = await _repo.findOneBy({ orgUnit: orgUnit.uuid, source });
        if (existing) {
            existing.lastSync = lastSync;
            await _repo.save(existing);
        } else {
            await _repo.save({ source, lastSync });
        }
        await logMessage(`🕒 Date de synchronisation mise à jour : ${lastSync}`);
    } catch (error) {
        await logMessage(`⚠️ Erreur mise à jour date sync: ${(error as Error).message}`);
    }
}

// --- FETCH EVENTS ---
async function fetchEvents(params: { page: number, program: string, orgUnitUid: string, startDate: string, endDate: string }): Promise<any[]> {
    try {
        if (!DHIS2_USER || !DHIS2_PASS) {
            await logMessage(`❌ Authentification DHIS2 manquante.`);
            return [];
        }
        if (!params.program) {
            await logMessage(`❌ You must set program`);
            return [];
        }
        const orgUnit = params.orgUnitUid;
        const programId = params.program;
        const startDate = params.startDate;
        const endDate = params.endDate;

        const eventsUrl = `${DHIS2_URL}/api/events.json?program=${programId}&orgUnit=${orgUnit}&lastUpdatedStartDate=${startDate}&lastUpdatedEndDate=${endDate}&pageSize=${DEFAULT_PAGE_SIZE}&page=${params.page}`;
        const fieldsFilter = `&fields=event,orgUnit,orgUnitName,program,eventDate,status,lastUpdated,dataValues[dataElement,value]`;

        const { data } = await axios.get(`${eventsUrl}${fieldsFilter}`, {
            auth: { username: DHIS2_USER, password: DHIS2_PASS },
        });

        return data?.events ?? [];
    } catch (error) {
        await logMessage(`⚠️ Erreur fetch events: ${(error as Error).message}`);
        return [];
    }
}

// --- FETCH DATASETS---
async function fetchDataValueSets(params: { dataSet: string, orgUnitUid: string, startDate: string, endDate: string }): Promise<any[]> {
    try {
        if (!DHIS2_USER || !DHIS2_PASS) {
            await logMessage(`❌ Authentification DHIS2 manquante.`);
            return [];
        }
        if (!params.dataSet) {
            await logMessage(`❌ You must set dataValueSets`);
            return [];
        }

        const dataSet = params.dataSet;
        const orgUnit = params.orgUnitUid;
        const startDate = getFirstDayOfMonth(params.startDate);
        const endDate = getFirstDayOfMonth(params.endDate);

        const dataSetUrl = `${DHIS2_URL}/api/dataValueSets.json?dataSet=${dataSet}&orgUnit=${orgUnit}&startDate=${startDate}&endDate=${endDate}`;

        const { data } = await axios.get(dataSetUrl, {
            auth: { username: DHIS2_USER, password: DHIS2_PASS },
        });

        return data?.dataValues ?? [];
    } catch (error) {
        await logMessage(`⚠️ Erreur fetch dataValueSets: ${(error as Error).message}`);
        return [];
    }
}

async function fetchDhis2Data(source: Dhis2Source, params: { page: number, program: string, dataSet: string, orgUnitUid: string, startDate: string, endDate: string }): Promise<any[]> {
    return source == 'events' ? await fetchEvents(params) : await fetchDataValueSets(params);
}

async function saveToPostgres(data: any[], source: Dhis2Source, orgUnit: Sites, allChws: Chws[]) {
    if (!data || data.length === 0) return;

    await logMessage(`✅ Sauvegarde de ${data.length} ${source}s...`);
    try {
        if (source == 'events') {
            const _repo = await getDhis2EventRepository();
            for (const item of data) {
                const reportedDate = milisecond_to_date(getValue(item.dataValues, 'RlquY86kI66'), 'dateOnly');
                const entity = _repo.create({
                    id: item.event,
                    form: getValue(item.dataValues, 'plW6bCSnXKU'),
                    reported_date: reportedDate,
                    month:ihMonthYear('month', reportedDate),
                    year: ihMonthYear('year', reportedDate),
                    district: '',
                    site: { id: orgUnit.id, uid: item.orgUnit, name: item.orgUnitName },
                    // chw: await GetChwIdByDhis2Uid(getValue(item.dataValues, 'JkMyqI3e6or')),
                    chw: (allChws.find(c => c.uuid == getValue(item.dataValues, 'JkMyqI3e6or')))?.id,
                    fields: getDataValuesAsMap(item.dataValues, ['JkMyqI3e6or', 'plW6bCSnXKU', 'RlquY86kI66', 'JC752xYegbJ', 'qZKDFwp706E']),
                    eventDate: item.eventDate,
                    lastUpdated: item.lastUpdated,
                    status: item.status,

                })
                await _repo.save(entity);
            }
        }

        if (source == 'datasets') {
            const _repo = await getDhis2DataSetRepository();
            for (const item of data) {
                const entity = _repo.create({
                    id: `${item.orgUnit}_${item.dataSet}_${item.period}`,
                    dataSet: item.dataSet,
                    orgUnit: item.orgUnit,
                    period: item.period,
                    dataValues: { dataElement: item.dataElement, value: item.value },
                    categoryOptionCombo: item.categoryOptionCombo,
                    attributeOptionCombo: item.attributeOptionCombo,

                    lastUpdated: item.lastUpdated,
                });
                await _repo.save(entity);
            }
        }
    } catch (error) {
        await logMessage(`❌ Erreur de sauvegarde PostgreSQL: ${(error as Error).message}`);
    }
}

async function deleteFromPostgres(ids: string[], source: Dhis2Source) {
    if (ids.length === 0) return;
    await logMessage(`🗑️ Suppression de ${ids.length} documents...`);
    try {
        const repo = source === 'events'
            ? await getDhis2EventRepository()
            : await getDhis2DataSetRepository();
        await repo.delete({ id: In(ids) });
    } catch (error) {
        await logMessage(`❌ Erreur suppression PostgreSQL: ${(error as Error).message}`);
    }
}

async function processDhis2Sync(source: Dhis2Source, params: { allChws: Chws[], startDate: string, endDate: string, program: string, dataSet: string, orgUnit: Sites }): Promise<{ out: boolean, total: number, error?: any }> {
    let page = 1;
    let total = 0;

    try {
        const startProcess = async (): Promise<void> => {
            const paramToSend: any = { page: page, dataSet: params.dataSet, program: params.program, orgUnit: params.orgUnit.uuid, startDate: params.startDate, endDate: params.endDate };
            const dataToManage = await fetchDhis2Data(source, paramToSend);
            if (!dataToManage || dataToManage.length === 0) return;

            const validData: any[] = [];
            const deletedData: string[] = [];

            for (const data of dataToManage) {
                const id = source == 'events' ? data.event : `${data.orgUnit}_${data.dataSet}_${data.period}`;
                const isExcluded = EXCLUDED_IDS.some((p) => p.test(id));
                if (data.deleted || isExcluded) {
                    deletedData.push(id);
                } else {
                    validData.push(data);
                }
                total++;
            }

            await saveToPostgres(validData, source, params.orgUnit, params.allChws);
            await deleteFromPostgres(deletedData, source);

            page++;

            await startProcess();
        }

        await startProcess();

        await updateLastSyncDate(source, params.orgUnit, params.endDate);

        return { out: true, total: total };
    } catch (error: any) {
        // console.error(`[SYNC] Erreur de synchronisation :`, error);
        return { out: false, total: total, error: error };
    }
    // await sleep(12 * 60 * 60 * 1000); // 12h
}

export async function syncDhis2ToPostgres(): Promise<void> {
    await logMessage("🚀 Lancement de la synchronisation DHIS2 -> PostgreSQL");
    const _12hours = 60 * 60 * 1000 * 12; // 12 heures
    const oneMinute = 60 * 1000;
    let retryDelay = oneMinute; // 1 minute en cas d'erreur

    const output: any = { successCount: 0, errorCount: 0, error: '' };
    try {
        const source: Dhis2Source = 'events';

        const sites = await SITES_CUSTOM_QUERY();
        const chws = await CHWS_CUSTOM_QUERY();

        const allOrgUnit: Sites[] = sites ? sites.map(s => ({ id: s.id, uuid: s.external_id, name: s.name, districtId: s.district.id, districtName: s.district.name })) : [];
        const allChws: Chws[] = chws ? chws.map(c => ({ id: c.id, uuid: c.external_id, siteId: c.site.id })) : [];

        const params: any = {
            allChws,
            endDate: new Date().toISOString(),
            program: 'siupB4uk4O2',
            dataSet: '',
        }

        // while (true) {
        await logMessage(`🔁 Début de la synchronisation ${source} -> PostgreSQL...`);
        for (const orgUnit of allOrgUnit) {
            params['startDate'] = await getLastSyncDate(source, orgUnit);;
            params['orgUnit'] = orgUnit;
            const result = await processDhis2Sync(source, params);

            console.log(`[SYNC] Synchronisation terminée. ${result.total} événements enregistrés pour ${orgUnit.name}.`);
            if (result.out) {
                output.successCount += 1;
            } else {
                output.errorCount += 1;
                output.error = result.error;
            }
        }

        if (output.errorCount > 0) {
            console.error('[SYNC] Erreur pendant la synchronisation :', output.error);
            await logMessage(`❌ Erreur lors de la synchronisation: ${output.error.message}\n`);
            await logMessage(`🔄 Nouvelle tentative dans ${retryDelay / 1000} secondes...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            retryDelay = Math.min(retryDelay * 2, _12hours); // Augmentation progressive jusqu'à 12h
        } else {
            await logMessage("✅ Fin de la synchronisation DHIS2.\n");
            await logMessage(`🔁 Nouvelle synchronisation dans ${_12hours / 1000} secondes...`);
            setTimeout(async () => await processDhis2Sync(source, params), _12hours);
        }
        // }

    } catch (error) {
        await logMessage(`❌ Erreur finale sync: ${(error as Error).message}`);
        await logMessage(`🔄 Nouvelle tentative dans ${retryDelay / 1000} secondes...`);
        // await new Promise((resolve) => setTimeout(resolve, retryDelay));
        setTimeout(async () => await syncDhis2ToPostgres(), retryDelay);
    }
}