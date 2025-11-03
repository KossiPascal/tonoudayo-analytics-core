CREATE MATERIALIZED VIEW IF NOT EXISTS drug_management_data_view AS
    SELECT
        (doc->>'_id')::UUID AS id,
        (doc->>'_rev')::TEXT AS rev,
        (doc->>'form')::TEXT AS form,

        CAST(doc->>'reported_date' AS BIGINT) AS reported_date_timestamp,
        TO_CHAR(TO_TIMESTAMP((doc->>'reported_date')::BIGINT / 1000), 'YYYY-MM-DD')::DATE AS reported_date,
        TO_CHAR(TO_TIMESTAMP((doc->>'reported_date')::BIGINT / 1000), 'YYYY-MM-DD HH24:MI:SS')::TIMESTAMP AS reported_full_date,

        date_to_ih_month_year('month', (doc->>'reported_date')::BIGINT)::TEXT AS month,
        date_to_ih_month_year('year', (doc->>'reported_date')::BIGINT)::INTEGER AS year,

        NULLIF(doc->'fields'->>'chw_id', '') AS chw_id,
        NULLIF(doc->'fields'->>'chw_name', '') AS chw_name,
        NULLIF(doc->'fields'->>'this_month', '') AS this_month,
        NULLIF(doc->'fields'->>'this_year', '') AS this_year,
        NULLIF(doc->'fields'->>'last_year', '') AS last_year,
        NULLIF(doc->'fields'->>'action_name', '') AS action_name,

        CASE
            WHEN doc->'fields'->>'chw_sex' IN ('male', 'homme', 'm')
                THEN 'M'
            WHEN doc->'fields'->>'chw_sex' IN ('female', 'femme', 'f')
                THEN 'F'
            ELSE NULL
        END::VARCHAR(1) AS chw_sex,


        CASE
            WHEN jsonb_typeof(doc->'geolocation') = 'object'
                AND NULLIF(doc->'geolocation'->>'latitude', '') IS NOT NULL
                AND NULLIF(doc->'geolocation'->>'longitude', '') IS NOT NULL
                THEN doc->'geolocation'
            ELSE NULL
        END::JSONB AS geolocation

    FROM couchdb
    WHERE
        doc->>'form' IS NOT NULL
        AND doc->'fields' IS NOT NULL
        AND doc->>'form' = 'drugs_management';

