
import { DataSource, QueryRunner } from 'typeorm';
import { AppDataSource } from '../data-source';
import { CouchdbFetchCible, IndexTarget } from '../models/Interfaces';
let Connection: DataSource = AppDataSource.manager.connection;

// sudo systemctl restart postgresql

export async function RefreshMaterializedView(couchdbCible: CouchdbFetchCible): Promise<void> {

    const functions = [];

    const viewsName: { name: string; cible: IndexTarget; couchdbCible: CouchdbFetchCible; group: 'Data' | 'Reports' | 'Dashboards' | 'Maps' | 'Telemetries'; type: 'view' | 'mat_view' }[] = [
        { name: 'district_view', cible: 'id', group: 'Data', couchdbCible: 'medic', type: 'mat_view' },
        { name: 'site_view', cible: 'id', group: 'Data', couchdbCible: 'medic', type: 'mat_view' },
        { name: 'zone_view', cible: 'id', group: 'Data', couchdbCible: 'medic', type: 'mat_view' },
        { name: 'family_view', cible: 'id', group: 'Data', couchdbCible: 'medic', type: 'mat_view' },

        { name: 'chw_view', cible: 'id', group: 'Data', couchdbCible: 'medic', type: 'mat_view' },
        { name: 'patient_view', cible: 'id', group: 'Data', couchdbCible: 'medic', type: 'mat_view' },
        { name: 'users_view', cible: 'id', group: 'Data', couchdbCible: 'medic', type: 'mat_view' },
        
    ];

    const filteredViewsName = viewsName.filter(v => v.couchdbCible == couchdbCible);

    for (let i = 0; i < filteredViewsName.length; i++) {
        const view = filteredViewsName[i];
        if (view.couchdbCible == couchdbCible) {
            try {
                if (i == 0) console.log(`Start Refreshing ${view.group} views ...`);
                await CreateViewIndex(view.name, { cible: view.cible });
                await Connection.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view.name};`);
                if (i == filteredViewsName.length) console.log(`${view.group} views are Refreshed successfuly!`);
            } catch (error) { }
        }
    }
}

export async function RefreshViewTable(viewName: string, queryRunner?: QueryRunner): Promise<void> {
    await (queryRunner ?? Connection).query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName};`);
}

function indexMap(viewName: string): Record<IndexTarget, { create: string[]; drop: string[] }> {
    return {
        only_id: {
            create: [
                `CREATE UNIQUE INDEX IF NOT EXISTS ${viewName}_id_idx ON ${viewName} (id);`,
            ],
            drop: [
                `DROP INDEX IF EXISTS ${viewName}_id_idx;`,
            ],
        },
        id: {
            create: [
                `CREATE UNIQUE INDEX IF NOT EXISTS ${viewName}_id_idx ON ${viewName} (id);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_month_idx ON ${viewName} (month);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_year_idx ON ${viewName} (year);`,
            ],
            drop: [
                `DROP INDEX IF EXISTS ${viewName}_id_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_month_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_year_idx;`,
            ],
        },
        id_reco: {
            create: [
                `CREATE UNIQUE INDEX IF NOT EXISTS ${viewName}_id_idx ON ${viewName} (id);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_month_idx ON ${viewName} (month);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_year_idx ON ${viewName} (year);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_reco_idx ON ${viewName} (reco_id);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_reco_month_idx ON ${viewName} (reco_id, month);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_reco_year_idx ON ${viewName} (reco_id, year);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_reco_month_year_idx ON ${viewName} (reco_id, month, year);`,
            ],
            drop: [
                `DROP INDEX IF EXISTS ${viewName}_id_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_month_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_year_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_reco_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_reco_month_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_reco_year_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_reco_month_year_idx;`,
            ],
        },
        reco_month_year: {
            create: [
                `CREATE UNIQUE INDEX IF NOT EXISTS ${viewName}_reco_month_year_idx ON ${viewName} (reco_id, month, year);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_id_idx ON ${viewName} (id);`,
            ],
            drop: [
                `DROP INDEX IF EXISTS ${viewName}_reco_month_year_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_id_idx;`,
            ],
        },
        reco_month: {
            create: [
                `CREATE UNIQUE INDEX IF NOT EXISTS ${viewName}_reco_month_idx ON ${viewName} (reco_id, month);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_id_idx ON ${viewName} (id);`,
            ],
            drop: [
                `DROP INDEX IF EXISTS ${viewName}_reco_month_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_id_idx;`,
            ],
        },
        reco_year: {
            create: [
                `CREATE UNIQUE INDEX IF NOT EXISTS ${viewName}_reco_year_idx ON ${viewName} (reco_id, year);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_id_idx ON ${viewName} (id);`,
            ],
            drop: [
                `DROP INDEX IF EXISTS ${viewName}_reco_year_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_id_idx;`,
            ],
        },
        month: {
            create: [
                `CREATE INDEX IF NOT EXISTS ${viewName}_month_idx ON ${viewName} (month);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_id_idx ON ${viewName} (id);`,
            ],
            drop: [
                `DROP INDEX IF EXISTS ${viewName}_month_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_id_idx;`,
            ],
        },
        year: {
            create: [
                `CREATE INDEX IF NOT EXISTS ${viewName}_year_idx ON ${viewName} (year);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_id_idx ON ${viewName} (id);`,
            ],
            drop: [
                `DROP INDEX IF EXISTS ${viewName}_year_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_id_idx;`,
            ],
        },
        year_month: {
            create: [
                `CREATE INDEX IF NOT EXISTS ${viewName}_year_month_idx ON ${viewName} (year, month);`,
                `CREATE INDEX IF NOT EXISTS ${viewName}_id_idx ON ${viewName} (id);`,
            ],
            drop: [
                `DROP INDEX IF EXISTS ${viewName}_year_month_idx;`,
                `DROP INDEX IF EXISTS ${viewName}_id_idx;`,
            ],
        },
    };
}

export async function CreateViewIndex(viewName: string, opt: { cible: IndexTarget; queryRunner?: QueryRunner }): Promise<void> {
    const runner = opt.queryRunner ?? Connection;

    const queries = indexMap(viewName)[opt.cible];

    if (!queries) {
        throw new Error(`Unknown index target '${opt.cible}' for view '${viewName}'`);
    }

    for (const sql of queries.create) {
        await runner.query(sql);
    }
}

export async function DropViewIndexAndTable(viewName: string, opt: { cible: IndexTarget; queryRunner?: QueryRunner }): Promise<void> {
    const runner = opt.queryRunner ?? Connection;

    const queries = indexMap(viewName)[opt.cible];
    if (!queries) {
        throw new Error(`Unknown index target '${opt.cible}' for view '${viewName}'`);
    }

    for (const sql of queries.drop) {
        await runner.query(sql);
    }

    await runner.query(`DROP MATERIALIZED VIEW IF EXISTS ${viewName} CASCADE;`);
}

export async function DropFunction(functionName: string, queryRunner?: QueryRunner): Promise<void> {
    const runner = queryRunner ?? Connection;
    await runner.query(`DROP FUNCTION IF EXISTS ${functionName};`);
}
