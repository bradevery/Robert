#!/usr/bin/env tsx
/**
 * Script de configuration Supabase pour AUTHENTIC-MATCH
 *
 * Usage:
 *   npx tsx scripts/setup-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables manquantes:');
  console.error('   SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n📝 Créez un projet sur https://supabase.com');
  console.error('   puis copiez les credentials dans .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  console.log('🚀 Configuration Supabase pour AUTHENTIC-MATCH\n');

  try {
    // 1. Activer pgvector
    console.log('1️⃣  Activation de pgvector...');
    const { error: vectorError } = await supabase.rpc('exec_sql', {
      query: 'CREATE EXTENSION IF NOT EXISTS vector;',
    });

    if (vectorError && !vectorError.message.includes('already exists')) {
      console.error('⚠️  pgvector:', vectorError.message);
      console.log('   Activez-le manuellement dans SQL Editor:');
      console.log('   CREATE EXTENSION vector;');
    } else {
      console.log('✅ pgvector activé');
    }

    // 2. Activer unaccent pour le français
    console.log('\n2️⃣  Activation de unaccent (recherche française)...');
    const { error: unaccentError } = await supabase.rpc('exec_sql', {
      query: 'CREATE EXTENSION IF NOT EXISTS unaccent;',
    });

    if (!unaccentError || unaccentError.message.includes('already exists')) {
      console.log('✅ unaccent activé');
    }

    // 3. Créer fonction de recherche française
    console.log('\n3️⃣  Création fonction recherche française...');
    const searchFunction = `
      CREATE OR REPLACE FUNCTION search_resumes_french(search_query text)
      RETURNS TABLE(id uuid, title text, score float)
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          r.id,
          r.title,
          ts_rank(
            to_tsvector('french', unaccent(r.raw_text)),
            plainto_tsquery('french', unaccent(search_query))
          ) as score
        FROM resumes r
        WHERE to_tsvector('french', unaccent(r.raw_text)) @@ 
              plainto_tsquery('french', unaccent(search_query))
        ORDER BY score DESC
        LIMIT 50;
      END;
      $$;
    `;

    const { error: funcError } = await supabase.rpc('exec_sql', {
      query: searchFunction,
    });

    if (!funcError) {
      console.log('✅ Fonction de recherche créée');
    }

    // 4. Créer index pour performance
    console.log('\n4️⃣  Création des index...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_resumes_slug ON resumes(slug);',
      'CREATE INDEX IF NOT EXISTS idx_matches_resume_id ON matches(resume_id);',
      'CREATE INDEX IF NOT EXISTS idx_matches_job_id ON matches(job_id);',
      'CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(overall_score DESC);',
    ];

    for (const index of indexes) {
      await supabase.rpc('exec_sql', { query: index });
    }
    console.log('✅ Index créés');

    // 5. Activer Row Level Security
    console.log('\n5️⃣  Configuration Row Level Security (RLS)...');
    const rlsPolicies = `
      -- Activer RLS
      ALTER TABLE IF EXISTS resumes ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS matches ENABLE ROW LEVEL SECURITY;

      -- Politique: Les utilisateurs voient leurs propres CVs
      DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
      CREATE POLICY "Users can view own resumes" ON resumes
        FOR SELECT USING (auth.uid() = user_id);

      -- Politique: Les utilisateurs modifient leurs propres CVs
      DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
      CREATE POLICY "Users can update own resumes" ON resumes
        FOR UPDATE USING (auth.uid() = user_id);

      -- Politique: Les utilisateurs créent leurs propres CVs
      DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
      CREATE POLICY "Users can insert own resumes" ON resumes
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      -- Politique: Les utilisateurs suppriment leurs propres CVs
      DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;
      CREATE POLICY "Users can delete own resumes" ON resumes
        FOR DELETE USING (auth.uid() = user_id);
    `;

    await supabase.rpc('exec_sql', { query: rlsPolicies });
    console.log('✅ RLS configuré');

    console.log('\n✅ Configuration Supabase terminée avec succès !');
    console.log('\n📊 Prochaines étapes:');
    console.log('   1. npx prisma db push (pour créer les tables)');
    console.log(
      '   2. npx tsx scripts/load-french-data.ts (charger données FR)'
    );
    console.log("   3. npm run dev (démarrer l'app)");
  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message);
    console.error('\n💡 Solution:');
    console.error(
      '   Exécutez les commandes SQL manuellement dans Supabase SQL Editor'
    );
    console.error('   https://app.supabase.com/project/_/sql');
  }
}

// Fonction helper pour exécuter du SQL
async function execSQL(sql: string) {
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error && !error.message.includes('already exists')) {
    throw error;
  }
}

setupDatabase();
