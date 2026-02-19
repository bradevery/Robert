#!/usr/bin/env tsx
/**
 * Script de chargement des données françaises de base
 *
 * Usage:
 *   npx tsx scripts/load-french-data.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface FrenchBaseline {
  diplomas: any[];
  skills: Record<string, any[]>;
  languages: any[];
  companies: any[];
  conventions: any[];
  certifications: any[];
  sectors: any[];
  regions: any[];
}

async function loadFrenchData() {
  console.log('🇫🇷 Chargement des données françaises de base\n');

  try {
    // 1. Charger le fichier JSON
    console.log('1️⃣  Lecture du fichier french-baseline.json...');
    const dataPath = path.join(process.cwd(), 'data', 'french-baseline.json');
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const data: FrenchBaseline = JSON.parse(fileContent);
    console.log('✅ Données chargées');

    // 2. Créer les tables si nécessaire (en raw SQL)
    console.log('\n2️⃣  Création des tables référentielles...');
    await createTables();
    console.log('✅ Tables créées');

    // 3. Charger les diplômes
    console.log('\n3️⃣  Insertion des diplômes français...');
    let diplomaCount = 0;
    for (const diploma of data.diplomas) {
      try {
        await prisma.$executeRaw`
          INSERT INTO french_diplomas (name, level, rncp, type, equivalents, domains)
          VALUES (
            ${diploma.name},
            ${diploma.level},
            ${diploma.rncp},
            ${diploma.type},
            ${diploma.equivalents}::text[],
            ${diploma.domains}::text[]
          )
          ON CONFLICT (name) DO NOTHING
        `;
        diplomaCount++;
      } catch (e) {
        // Ignorer les doublons
      }
    }
    console.log(`✅ ${diplomaCount} diplômes insérés`);

    // 4. Charger les compétences
    console.log('\n4️⃣  Insertion des compétences...');
    let skillCount = 0;

    for (const [category, skills] of Object.entries(data.skills)) {
      for (const skill of skills) {
        try {
          await prisma.$executeRaw`
            INSERT INTO french_skill_ontology (
              skill_name, 
              category, 
              synonyms, 
              related_skills,
              sectors
            )
            VALUES (
              ${skill.name},
              ${skill.category || category},
              ${skill.synonyms || []}::text[],
              ${skill.related || skill.transferable || []}::text[],
              ${['Tech']}::text[]
            )
            ON CONFLICT (skill_name) DO NOTHING
          `;
          skillCount++;
        } catch (e) {
          // Ignorer les doublons
        }
      }
    }
    console.log(`✅ ${skillCount} compétences insérées`);

    // 5. Charger les niveaux de langue CECRL
    console.log('\n5️⃣  Insertion des niveaux de langue...');
    for (const lang of data.languages) {
      try {
        await prisma.$executeRaw`
          INSERT INTO language_levels (cecrl_code, description_fr, equivalents)
          VALUES (
            ${lang.cecrl},
            ${lang.description},
            ${lang.equivalents}::text[]
          )
          ON CONFLICT (cecrl_code) DO NOTHING
        `;
      } catch (e) {
        // Ignorer si la table n'existe pas
      }
    }
    console.log('✅ Niveaux de langue insérés');

    // 6. Charger les conventions collectives
    console.log('\n6️⃣  Insertion des conventions collectives...');
    for (const conv of data.conventions) {
      try {
        await prisma.$executeRaw`
          INSERT INTO french_conventions (name, code, sectors, typical_benefits)
          VALUES (
            ${conv.name},
            ${conv.code},
            ${conv.sectors}::text[],
            ${conv.benefits}::text[]
          )
          ON CONFLICT (name) DO NOTHING
        `;
      } catch (e) {
        // Ignorer si la table n'existe pas
      }
    }
    console.log('✅ Conventions collectives insérées');

    // 7. Charger les certifications
    console.log('\n7️⃣  Insertion des certifications...');
    for (const cert of data.certifications) {
      try {
        await prisma.$executeRaw`
          INSERT INTO french_certifications (
            name, 
            category, 
            issuer, 
            validity_years,
            sectors
          )
          VALUES (
            ${cert.name},
            ${cert.category},
            ${cert.provider},
            ${cert.validity_years},
            ${['Tous']}::text[]
          )
          ON CONFLICT (name) DO NOTHING
        `;
      } catch (e) {
        // Ignorer si la table n'existe pas
      }
    }
    console.log('✅ Certifications insérées');

    // 8. Statistiques finales
    console.log('\n📊 Statistiques:');
    const stats = await getStats();
    console.log(`   • Diplômes: ${stats.diplomas}`);
    console.log(`   • Compétences: ${stats.skills}`);
    console.log(`   • Niveaux langue: ${stats.languages}`);
    console.log(`   • Conventions: ${stats.conventions}`);
    console.log(`   • Certifications: ${stats.certifications}`);

    console.log('\n✅ Données françaises chargées avec succès !');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Configurer Mistral AI API key dans .env');
    console.log('   2. Configurer Upstash Redis dans .env');
    console.log('   3. npm run dev');
  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message);
    console.error('\n💡 Vérifiez que:');
    console.error('   1. Prisma est configuré (npx prisma db push)');
    console.error('   2. La connexion à Supabase fonctionne');
    console.error('   3. Le fichier data/french-baseline.json existe');
  } finally {
    await prisma.$disconnect();
  }
}

async function createTables() {
  const tables = `
    -- Table des diplômes français
    CREATE TABLE IF NOT EXISTS french_diplomas (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      level TEXT NOT NULL,
      rncp INTEGER,
      type TEXT,
      equivalents TEXT[] DEFAULT '{}',
      european_level TEXT,
      domains TEXT[] DEFAULT '{}'
    );

    -- Table ontologie des compétences
    CREATE TABLE IF NOT EXISTS french_skill_ontology (
      id SERIAL PRIMARY KEY,
      skill_name TEXT UNIQUE NOT NULL,
      category TEXT,
      synonyms TEXT[] DEFAULT '{}',
      related_skills TEXT[] DEFAULT '{}',
      parent_skill TEXT,
      sectors TEXT[] DEFAULT '{}',
      job_titles TEXT[] DEFAULT '{}'
    );

    -- Table niveaux de langue CECRL
    CREATE TABLE IF NOT EXISTS language_levels (
      id SERIAL PRIMARY KEY,
      cecrl_code TEXT UNIQUE NOT NULL,
      description_fr TEXT,
      equivalents TEXT[] DEFAULT '{}'
    );

    -- Table conventions collectives
    CREATE TABLE IF NOT EXISTS french_conventions (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      code TEXT,
      sectors TEXT[] DEFAULT '{}',
      typical_benefits TEXT[] DEFAULT '{}'
    );

    -- Table certifications reconnues
    CREATE TABLE IF NOT EXISTS french_certifications (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT,
      issuer TEXT,
      validity_years INTEGER,
      sectors TEXT[] DEFAULT '{}'
    );

    -- Index pour recherche
    CREATE INDEX IF NOT EXISTS idx_diplomas_level ON french_diplomas(level);
    CREATE INDEX IF NOT EXISTS idx_skills_category ON french_skill_ontology(category);
    CREATE INDEX IF NOT EXISTS idx_skills_name ON french_skill_ontology(skill_name);
  `;

  try {
    await prisma.$executeRawUnsafe(tables);
  } catch (error) {
    // Tables existent déjà
  }
}

async function getStats() {
  try {
    const diplomas = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM french_diplomas
    `;
    const skills = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM french_skill_ontology
    `;
    const languages = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM language_levels
    `;
    const conventions = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM french_conventions
    `;
    const certifications = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM french_certifications
    `;

    return {
      diplomas: Number(diplomas[0].count),
      skills: Number(skills[0].count),
      languages: Number(languages[0].count),
      conventions: Number(conventions[0].count),
      certifications: Number(certifications[0].count),
    };
  } catch (error) {
    return {
      diplomas: 0,
      skills: 0,
      languages: 0,
      conventions: 0,
      certifications: 0,
    };
  }
}

loadFrenchData();
