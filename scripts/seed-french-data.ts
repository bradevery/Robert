#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { seedFrenchData } from '../src/lib/data/french-baseline';

const prisma = new PrismaClient();

async function main() {
  console.log('🇫🇷 Initialisation des données françaises...');

  try {
    // Charger les données françaises de base
    await seedFrenchData(prisma);

    // Créer des métriques initiales
    await prisma.matchingMetrics.create({
      data: {
        date: new Date(),
        totalMatches: 0,
        authenticMatches: 0,
        avgAuthenticityScore: 0,
        avgMatchScore: 0,
        suggestionsGenerated: 0,
        suggestionsAccepted: 0,
        avgProcessingTime: 0,
        cacheHitRate: 0,
      },
    });

    console.log('✅ Données françaises initialisées avec succès !');

    // Afficher les statistiques
    const diplomaCount = await prisma.frenchDiploma.count();
    const skillCount = await prisma.frenchSkillOntology.count();
    const companyCount = await prisma.frenchCompany.count();

    console.log('\n📊 Statistiques:');
    console.log(`- Diplômes: ${diplomaCount}`);
    console.log(`- Compétences: ${skillCount}`);
    console.log(`- Entreprises: ${companyCount}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
main();
