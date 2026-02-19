-- Script d'initialisation PostgreSQL pour CVBuilder
-- Création de l'extension pgvector et configuration optimale

-- Activer l'extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Activer d'autres extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Pour recherche textuelle
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Pour recherche sans accents

-- Vérification des extensions
SELECT 
    extname AS "Extension",
    extversion AS "Version"
FROM pg_extension
WHERE extname IN ('vector', 'uuid-ossp', 'pg_trgm', 'unaccent');

-- Configuration pour performances optimales
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Message de succès
DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL initialisé avec succès pour CVBuilder!';
    RAISE NOTICE 'Extensions installées: vector, uuid-ossp, pg_trgm, unaccent';
    RAISE NOTICE 'Base de données prête pour le matching CV-Job avancé';
END $$;




