import { Entity, Column, Repository, DataSource, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";
import { AppDataSource } from "../data-source";

let Connection: DataSource = AppDataSource.manager.connection;


@Entity({ name: 'dhis2_last_synced_at' })
export class Dhis2LastSync {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  orgUnit!: string;

  @Column({ type: 'varchar', length: 100 })
  source!: string;

  @Column({ type: 'varchar', nullable: false })
  lastSync!: string;
}
export async function getDhis2LastSyncRepository(): Promise<Repository<Dhis2LastSync>> {
  return Connection.getRepository(Dhis2LastSync);
}



@Entity({ name: 'dhis2_events' })
export class Dhis2Event {
  @PrimaryColumn()
  id!: string

  @Column({ type: 'varchar', nullable: true })
  month!: string

  @Column({ nullable: true })
  year!: number

  @Column({ type: 'varchar', default: '', nullable: true })
  district!: string

  @Column('json', { nullable: true })
  site!: { id: string, uid: string, name: string };

  @Column({ type: 'varchar', default: '', nullable: true })
  form!: string

  @Column({ type: 'varchar', nullable: true })
  reported_date!: string

  @Column({ type: 'varchar', default: '', nullable: true })
  chw!: string

  @Column('json', { nullable: true })
  fields!: any;

  @Column()
  status!: string;

  @Column({ type: 'timestamp' })
  eventDate!: Date;

  @Column({ nullable: false, default: false })
  deleted!: boolean

  @Column({ type: 'timestamp' })
  lastUpdated!: Date;
}
export async function getDhis2EventRepository(): Promise<Repository<Dhis2Event>> {
  return Connection.getRepository(Dhis2Event);
}



@Entity({ name: 'dhis2_datasets' })
export class Dhis2DataSet {
  @PrimaryColumn()
  id!: string;

  @Column({ type: 'varchar', nullable: false })
  dataSet!: string;

  @Column({ type: 'varchar', nullable: false })
  period!: string;

  @Column({ type: 'varchar', nullable: false })
  orgUnit!: string;

  @Column({ type: 'varchar', nullable: true })
  categoryOptionCombo!: string;

  @Column({ type: 'varchar', nullable: true })
  attributeOptionCombo!: string;

  @Column('jsonb')
  dataValues!: { dataElement: string, value: any }

  @Column({ nullable: false, default: false })
  deleted!: boolean

  @Column({ type: 'timestamp' })
  lastUpdated!: Date;
}
export async function getDhis2DataSetRepository(): Promise<Repository<Dhis2DataSet>> {
  return Connection.getRepository(Dhis2DataSet);
}



@Entity({ name: 'dhis2_log' })
export class Dhis2Log {
  constructor() { };
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true, type: 'text', nullable: true })
  log!: string
}
export async function getDhis2LogRepository(): Promise<Repository<Dhis2Log>> {
  return Connection.getRepository(Dhis2Log);
}


export interface DataIndicators {
  orgUnit?: string;
  reported_date?: string;
  code_asc?: string;
  district?: string;
  data_source?: string;

  total_vad: { tonoudayo: number; dhis2: number };
  sum_total_vad: number;

  soins_pcime: { tonoudayo: number; dhis2: number };
  sum_soins_pcime: number;

  suivi_pcime: { tonoudayo: number; dhis2: number };
  sum_suivi_pcime: number;

  sum_soins_suivi: { tonoudayo: number; dhis2: number };
  sum_pcime: number;

  femmes_enceinte: { tonoudayo: number; dhis2: number };
  sum_femmes_enceinte: number;

  femmes_postpartum: { tonoudayo: number; dhis2: number };
  sum_femmes_postpartum: number;

  sum_enceinte_postpartum: { tonoudayo: number; dhis2: number };
  sum_maternel: number;

  home_visit: { tonoudayo: number; dhis2: number };
  sum_home_visit: number;

  pf: { tonoudayo: number; dhis2: number };
  sum_pf: number;

  reference_pf: { tonoudayo: number; dhis2: number };
  sum_reference_pf: number;

  reference_pcime: { tonoudayo: number; dhis2: number };
  sum_reference_pcime: number;

  reference_femmes_enceinte_postpartum: { tonoudayo: number; dhis2: number };
  sum_reference_femmes_enceinte_postpartum: number;

  diarrhee_pcime: { tonoudayo: number; dhis2: number };
  sum_diarrhee_pcime: number;

  paludisme_pcime: { tonoudayo: number; dhis2: number };
  sum_paludisme_pcime: number;

  pneumonie_pcime: { tonoudayo: number; dhis2: number };
  sum_pneumonie_pcime: number;

  malnutrition_pcime: { tonoudayo: number; dhis2: number };
  sum_malnutrition_pcime: number;

  prompt_pcime_diarrhee_24h: { tonoudayo: number; dhis2: number };
  sum_prompt_pcime_diarrhee_24h: number;

  prompt_pcime_diarrhee_48h: { tonoudayo: number; dhis2: number };
  sum_prompt_pcime_diarrhee_48h: number;

  prompt_pcime_diarrhee_72h: { tonoudayo: number; dhis2: number };
  sum_prompt_pcime_diarrhee_72h: number;

  prompt_pcime_paludisme_24h: { tonoudayo: number; dhis2: number };
  sum_prompt_pcime_paludisme_24h: number;

  prompt_pcime_paludisme_48h: { tonoudayo: number; dhis2: number };
  sum_prompt_pcime_paludisme_48h: number;

  prompt_pcime_paludisme_72h: { tonoudayo: number; dhis2: number };
  sum_prompt_pcime_paludisme_72h: number;

  prompt_pcime_pneumonie_24h: { tonoudayo: number; dhis2: number };
  sum_prompt_pcime_pneumonie_24h: number;

  prompt_pcime_pneumonie_48h: { tonoudayo: number; dhis2: number };
  sum_prompt_pcime_pneumonie_48h: number;

  prompt_pcime_pneumonie_72h: { tonoudayo: number; dhis2: number };
  sum_prompt_pcime_pneumonie_72h: number;

  femmes_enceintes_NC: { tonoudayo: number; dhis2: number };
  sum_femmes_enceintes_NC: number;

  femme_postpartum_NC: { tonoudayo: number; dhis2: number };
  sum_femme_postpartum_NC: number;

  test_de_grossesse: { tonoudayo: number; dhis2: number };
  sum_test_de_grossesse: number;

}