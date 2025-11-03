
export type DatabaseName = 'users' |
    'user_info' |
    'token' |
    'chws_vaccination_dashboard' |
    'chws_performance_dashboard' |
    'chws_chart_performance_dashboard' |
    'promotion_reports' |
    'family_planning_reports' |
    'morbidity_reports' |
    'malaria_morbidity_reports' |
    'household_recaps_reports' |
    'pcime_newborn_reports' |
    'chws_reports' |
    'chws_meg_situation_reports';

export const LOCAL_REPPORTS_DB_NAME:DatabaseName[] = [
    'promotion_reports',
    'family_planning_reports',
    'morbidity_reports',
    'malaria_morbidity_reports',
    'household_recaps_reports',
    'pcime_newborn_reports',
    'chws_reports',
    'chws_meg_situation_reports',
];
export const LOCAL_DASHBOARDS_DB_NAME:DatabaseName[] = [
    'chws_vaccination_dashboard',
    'chws_performance_dashboard',
    'chws_chart_performance_dashboard'
];


export type FunctionAsStringName = 'ChwsTransformFunction' | 'promotionTransformFunction' | 'familyPlanningTransformFunction' | 'morbidityTransformFunction' | 'householdTransformFunction' | 'pcimneNewbornTransformFunction' | 'chwsMegTransformFunction' | 'vaccineTransformFunction' | 'performanceChartTransformFunction';

export type LocalDbName = 'local' | 'session' | 'coockie';

export type SyncStatus = 'success' | 'pending' | 'error' | 'offline' | 'outdated' | 'idle';
