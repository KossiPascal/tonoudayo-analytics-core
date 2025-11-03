import { MigrationInterface, QueryRunner } from "typeorm";
import { DropFunction } from "../data2pg/refresh-view";
import { getSqlFileContent, SqlBaseViewMigration } from "../postgresql/SqlBaseViewMigration";
import { IndexTarget } from "../models/Interfaces";

export class FunctionsBeforeViews1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(getSqlFileContent('date_to_ih_month_year', 'functions_before_views'));
        // await queryRunner.query(getSqlFileContent('extract_as_type', 'functions_before_views'));
        await queryRunner.query(getSqlFileContent('parse_json_boolean', 'functions_before_views'));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.dropFunction(queryRunner);
    }

    private async dropFunction(queryRunner: QueryRunner): Promise<void> {
        await DropFunction('date_to_ih_month_year(TEXT, ANYELEMENT)', queryRunner);
        // await DropFunction('extract_as_type(JSONB, TEXT, TEXT)', queryRunner);
        await DropFunction('parse_json_boolean(TEXT)', queryRunner);
    }
}


// Start Général Views
export class OrgUnitsView1710000000000 extends SqlBaseViewMigration {
    protected viewsNames = ['district_view', 'site_view', 'zone_view', 'family_view'];
    protected cible: IndexTarget = 'id';
    protected schema = 'views/orgunits';
}

export class PersonsView1710000000001 extends SqlBaseViewMigration {
    protected viewsNames = ['chw_view', 'patient_view'];
    protected cible: IndexTarget = 'id';
    protected schema = 'views/persons';
}

export class UsersView1710000000002 extends SqlBaseViewMigration {
    protected viewsNames = ['users_view'];
    protected cible: IndexTarget = 'only_id';
    protected schema = 'views/persons';
}

export class FormsView1710000000003 extends SqlBaseViewMigration {
    protected viewsNames = ['death_report_data_view'];
    protected cible: IndexTarget = 'id';
    protected schema = 'views';
}

export class FormsView1710000000004 extends SqlBaseViewMigration {
    protected viewsNames = ['delivery_data_view'];
    protected cible: IndexTarget = 'id';
    protected schema = 'views';
}

export class FormsView1710000000005 extends SqlBaseViewMigration {
    protected viewsNames = ['family_planning_data_view'];
    protected cible: IndexTarget = 'id';
    protected schema = 'views';
}

export class FormsView1710000000006 extends SqlBaseViewMigration {
    protected viewsNames = ['home_visit_view'];
    protected cible: IndexTarget = 'id';
    protected schema = 'views';
}

export class FormsView1710000000007 extends SqlBaseViewMigration {
    protected viewsNames = ['newborn_data_view'];
    protected cible: IndexTarget = 'id';
    protected schema = 'views';
}

export class FormsView1710000000008 extends SqlBaseViewMigration {
    protected viewsNames = ['pcime_data_view'];
    protected cible: IndexTarget = 'id';
    protected schema = 'views';
}

export class FormsView1710000000009 extends SqlBaseViewMigration {
    protected viewsNames = ['postnatal_data_view'];
    protected cible: IndexTarget = 'id';
    protected schema = 'views';
}

export class FormsView1710000000010 extends SqlBaseViewMigration {
    protected viewsNames = ['pregnant_data_view'];
    protected cible: IndexTarget = 'id';
    protected schema = 'views';
}


// newborn_data_view
// pcime_data_view
// postnatal_data_view
// pregnant_data_view
// prenatal_data_view
// recap_activity_fp_data_view
// recap_activity_maternal_data_view
// recap_activity_pcime_data_view
// recap_activity_research_data_view
// vaccination_data_view

