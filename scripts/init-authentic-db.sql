-- ============================================
-- Script d'initialisation AUTHENTIC-MATCH
-- Base de données optimisée pour le marché français
-- ============================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Configuration française
SET lc_time = 'fr_FR.UTF-8';
SET lc_numeric = 'fr_FR.UTF-8';
SET lc_monetary = 'fr_FR.UTF-8';

-- ============================================
-- CONFIGURATION OPTIMALE
-- ============================================

-- Paramètres pour recherche française
ALTER DATABASE authentic_match SET default_text_search_config = 'french';

-- Créer une configuration de recherche française améliorée
CREATE TEXT SEARCH CONFIGURATION french_enhanced (COPY = french);

-- Ajouter un dictionnaire de synonymes français
CREATE TEXT SEARCH DICTIONARY french_synonyms (
    TEMPLATE = synonym,
    SYNONYMS = french_synonyms
);

-- Configuration des synonymes (sera rempli par french-data.sql)
CREATE TABLE IF NOT EXISTS french_synonyms_data (
    word TEXT,
    synonyms TEXT[]
);

-- ============================================
-- FONCTIONS UTILITAIRES FRANÇAISES
-- ============================================

-- Fonction pour normaliser le texte français
CREATE OR REPLACE FUNCTION normalize_french_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(unaccent(trim(input_text)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour calculer l'âge à partir de la date de naissance
CREATE OR REPLACE FUNCTION calculate_age(birthdate DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM age(birthdate));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour parser le niveau d'études français
CREATE OR REPLACE FUNCTION parse_education_level(diploma TEXT)
RETURNS INTEGER AS $$
BEGIN
    CASE
        WHEN diploma ILIKE '%doctorat%' OR diploma ILIKE '%phd%' OR diploma ILIKE '%bac+8%' THEN RETURN 8;
        WHEN diploma ILIKE '%master%' OR diploma ILIKE '%bac+5%' OR diploma ILIKE '%ingénieur%' THEN RETURN 5;
        WHEN diploma ILIKE '%licence%' OR diploma ILIKE '%bachelor%' OR diploma ILIKE '%bac+3%' THEN RETURN 3;
        WHEN diploma ILIKE '%bts%' OR diploma ILIKE '%dut%' OR diploma ILIKE '%bac+2%' THEN RETURN 2;
        WHEN diploma ILIKE '%bac%' THEN RETURN 0;
        ELSE RETURN NULL;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour vérifier la cohérence temporelle
CREATE OR REPLACE FUNCTION check_date_coherence(
    start_date DATE,
    end_date DATE,
    birth_date DATE DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier que la date de fin est après la date de début
    IF end_date IS NOT NULL AND start_date > end_date THEN
        RETURN FALSE;
    END IF;
    
    -- Vérifier que les dates ne sont pas dans le futur
    IF start_date > CURRENT_DATE OR (end_date IS NOT NULL AND end_date > CURRENT_DATE) THEN
        RETURN FALSE;
    END IF;
    
    -- Si date de naissance fournie, vérifier la cohérence
    IF birth_date IS NOT NULL THEN
        -- Pas d'expérience avant 14 ans (âge minimum légal stage)
        IF EXTRACT(YEAR FROM age(start_date, birth_date)) < 14 THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- FONCTIONS DE MATCHING AVANCÉES
-- ============================================

-- Fonction de calcul de similarité avec boost français
CREATE OR REPLACE FUNCTION calculate_authentic_similarity(
    resume_embedding vector,
    job_embedding vector,
    education_match FLOAT DEFAULT 0.5,
    experience_match FLOAT DEFAULT 0.5,
    cultural_match FLOAT DEFAULT 0.5,
    authenticity_score FLOAT DEFAULT 0.5
) RETURNS FLOAT AS $$
DECLARE
    vector_similarity FLOAT;
    final_score FLOAT;
BEGIN
    -- Similarité vectorielle de base
    vector_similarity := 1 - (resume_embedding <=> job_embedding);
    
    -- Score AUTHENTIC avec pondération adaptative
    final_score := (
        vector_similarity * 0.35 +
        education_match * 0.20 +
        experience_match * 0.20 +
        cultural_match * 0.15 +
        authenticity_score * 0.10
    );
    
    RETURN LEAST(final_score, 1.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour détecter la sur-optimisation
CREATE OR REPLACE FUNCTION detect_over_optimization(
    cv_text TEXT,
    keyword_density FLOAT
) RETURNS JSONB AS $$
DECLARE
    issues JSONB := '[]'::JSONB;
    generic_phrases INTEGER;
    repetitions INTEGER;
BEGIN
    -- Vérifier la densité de mots-clés
    IF keyword_density > 0.15 THEN
        issues := issues || jsonb_build_object(
            'type', 'keyword_stuffing',
            'severity', 'high',
            'message', 'Densité de mots-clés trop élevée'
        );
    END IF;
    
    -- Détecter les phrases génériques
    generic_phrases := (
        SELECT COUNT(*)
        FROM (VALUES 
            ('dynamique et motivé'),
            ('forte capacité d''adaptation'),
            ('excellent relationnel'),
            ('esprit d''équipe'),
            ('rigoureux et organisé')
        ) AS phrases(phrase)
        WHERE cv_text ILIKE '%' || phrase || '%'
    );
    
    IF generic_phrases > 3 THEN
        issues := issues || jsonb_build_object(
            'type', 'generic_content',
            'severity', 'medium',
            'message', 'Trop de phrases génériques'
        );
    END IF;
    
    RETURN issues;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS POUR COHÉRENCE
-- ============================================

-- Trigger pour vérifier la cohérence des dates d'expérience
CREATE OR REPLACE FUNCTION check_experience_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Extraire les dates du JSON
    IF NEW.data ? 'experiences' THEN
        -- Vérifier chaque expérience
        IF NOT (
            SELECT bool_and(
                check_date_coherence(
                    (exp->>'startDate')::DATE,
                    (exp->>'endDate')::DATE,
                    (NEW.data->'basics'->>'birthDate')::DATE
                )
            )
            FROM jsonb_array_elements(NEW.data->'experiences') AS exp
        ) THEN
            RAISE EXCEPTION 'Incohérence dans les dates d''expérience';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger
CREATE TRIGGER trigger_check_experience_dates
    BEFORE INSERT OR UPDATE ON resumes
    FOR EACH ROW
    EXECUTE FUNCTION check_experience_dates();

-- ============================================
-- INDEX OPTIMISÉS POUR LA FRANCE
-- ============================================

-- Index pour recherche textuelle française
CREATE INDEX idx_resume_french_search ON resumes 
USING gin(to_tsvector('french', unaccent(raw_text)));

-- Index pour recherche par localisation
CREATE INDEX idx_french_location ON french_resume_contexts 
USING gist(to_tsvector('french', mobilite_geographique::text));

-- Index pour recherche par diplôme
CREATE INDEX idx_french_diploma_level ON french_resume_contexts 
USING btree(niveau_rncp);

-- Index composé pour matching rapide
CREATE INDEX idx_matching_composite ON matching_analyses 
USING btree(overall_score DESC, authenticity_score DESC, created_at DESC);

-- ============================================
-- VUES MATÉRIALISÉES POUR PERFORMANCE
-- ============================================

-- Vue pour statistiques en temps réel
CREATE MATERIALIZED VIEW mv_matching_stats AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_matches,
    AVG(overall_score) as avg_score,
    AVG(authenticity_score) as avg_authenticity,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY processing_time) as median_time
FROM matching_analyses
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at)
WITH DATA;

-- Index sur la vue
CREATE UNIQUE INDEX idx_mv_matching_stats_hour ON mv_matching_stats(hour);

-- Refresh automatique toutes les heures
CREATE OR REPLACE FUNCTION refresh_matching_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_matching_stats;
END;
$$ LANGUAGE plpgsql;

-- Planifier le refresh avec pg_cron
SELECT cron.schedule('refresh-matching-stats', '0 * * * *', 'SELECT refresh_matching_stats();');

-- ============================================
-- PARTITIONNEMENT POUR SCALABILITÉ
-- ============================================

-- Partitionner les analyses par mois
CREATE TABLE matching_analyses_partitioned (
    LIKE matching_analyses INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Créer les partitions pour les 12 prochains mois
DO $$
DECLARE
    start_date DATE := DATE_TRUNC('month', CURRENT_DATE);
    end_date DATE;
    partition_name TEXT;
BEGIN
    FOR i IN 0..11 LOOP
        end_date := start_date + INTERVAL '1 month';
        partition_name := 'matching_analyses_' || TO_CHAR(start_date, 'YYYY_MM');
        
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF matching_analyses_partitioned
            FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date
        );
        
        -- Index sur chaque partition
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS idx_%I_score ON %I(overall_score DESC)',
            partition_name, partition_name
        );
        
        start_date := end_date;
    END LOOP;
END $$;

-- ============================================
-- SÉCURITÉ ET AUDIT
-- ============================================

-- Table d'audit conforme RGPD
CREATE TABLE rgpd_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    ip_address INET,
    user_agent TEXT,
    justification TEXT, -- Requis pour certaines actions
    retention_date DATE, -- Date de suppression automatique
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour nettoyage RGPD
CREATE INDEX idx_rgpd_retention ON rgpd_audit_log(retention_date);

-- Fonction de nettoyage RGPD automatique
CREATE OR REPLACE FUNCTION cleanup_rgpd_data()
RETURNS void AS $$
BEGIN
    -- Supprimer les logs expirés
    DELETE FROM rgpd_audit_log WHERE retention_date < CURRENT_DATE;
    
    -- Anonymiser les vieux CV (> 3 ans)
    UPDATE resumes SET
        raw_text = 'Données supprimées conformément au RGPD',
        data = jsonb_build_object(
            'rgpd_deleted', true,
            'deletion_date', CURRENT_DATE
        )
    WHERE created_at < NOW() - INTERVAL '3 years'
    AND NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = resumes.user_id 
        AND email LIKE '%@authentic-match.fr' -- Garder les comptes internes
    );
END;
$$ LANGUAGE plpgsql;

-- Planifier le nettoyage RGPD quotidien
SELECT cron.schedule('cleanup-rgpd', '0 3 * * *', 'SELECT cleanup_rgpd_data();');

-- ============================================
-- MONITORING ET ALERTES
-- ============================================

-- Fonction pour vérifier la santé du système
CREATE OR REPLACE FUNCTION check_system_health()
RETURNS TABLE(
    metric TEXT,
    value NUMERIC,
    status TEXT,
    message TEXT
) AS $$
BEGIN
    -- Vérifier le taux d'authenticité
    RETURN QUERY
    SELECT 
        'authenticity_rate'::TEXT,
        AVG(global_score)::NUMERIC,
        CASE 
            WHEN AVG(global_score) < 0.5 THEN 'critical'
            WHEN AVG(global_score) < 0.7 THEN 'warning'
            ELSE 'ok'
        END::TEXT,
        CASE 
            WHEN AVG(global_score) < 0.5 THEN 'Taux d''authenticité critique'
            WHEN AVG(global_score) < 0.7 THEN 'Taux d''authenticité faible'
            ELSE 'Taux d''authenticité normal'
        END::TEXT
    FROM authenticity_scores
    WHERE calculated_at > NOW() - INTERVAL '1 hour';
    
    -- Vérifier les performances
    RETURN QUERY
    SELECT 
        'avg_processing_time'::TEXT,
        AVG(processing_time)::NUMERIC,
        CASE 
            WHEN AVG(processing_time) > 10000 THEN 'critical'
            WHEN AVG(processing_time) > 5000 THEN 'warning'
            ELSE 'ok'
        END::TEXT,
        CASE 
            WHEN AVG(processing_time) > 10000 THEN 'Temps de traitement critique'
            WHEN AVG(processing_time) > 5000 THEN 'Temps de traitement élevé'
            ELSE 'Performances normales'
        END::TEXT
    FROM matching_analyses
    WHERE created_at > NOW() - INTERVAL '1 hour';
    
    -- Vérifier le cache hit rate
    RETURN QUERY
    SELECT 
        'cache_hit_rate'::TEXT,
        (COUNT(*) FILTER (WHERE hit_count > 0)::NUMERIC / COUNT(*)::NUMERIC)::NUMERIC,
        CASE 
            WHEN COUNT(*) FILTER (WHERE hit_count > 0)::NUMERIC / COUNT(*)::NUMERIC < 0.5 THEN 'warning'
            ELSE 'ok'
        END::TEXT,
        CASE 
            WHEN COUNT(*) FILTER (WHERE hit_count > 0)::NUMERIC / COUNT(*)::NUMERIC < 0.5 THEN 'Cache peu efficace'
            ELSE 'Cache performant'
        END::TEXT
    FROM embedding_cache
    WHERE created_at > NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONNÉES DE TEST
-- ============================================

-- Insérer quelques diplômes français de référence
INSERT INTO french_diplomas (name, level, rncp, type, equivalents, domains) VALUES
('Master Informatique', 'Bac+5', 7, 'Master', ARRAY['Master 2', 'DESS', 'DEA', 'Diplôme d''ingénieur'], ARRAY['Informatique', 'Numérique']),
('Licence Informatique', 'Bac+3', 6, 'Licence', ARRAY['Bachelor', 'Licence Pro'], ARRAY['Informatique']),
('BTS SIO', 'Bac+2', 5, 'BTS', ARRAY['DUT Informatique', 'DEUST'], ARRAY['Informatique', 'Réseaux']),
('Diplôme d''ingénieur', 'Bac+5', 7, 'Ingénieur', ARRAY['Master', 'Master of Science'], ARRAY['Ingénierie', 'Informatique']);

-- Message de succès
DO $$
BEGIN
    RAISE NOTICE '✅ Base de données AUTHENTIC-MATCH initialisée avec succès !';
    RAISE NOTICE '📊 Extensions installées : pgvector, unaccent, pg_trgm, pg_cron';
    RAISE NOTICE '🇫🇷 Configuration française appliquée';
    RAISE NOTICE '🔐 Sécurité RGPD activée';
    RAISE NOTICE '⚡ Optimisations performance en place';
END $$;




