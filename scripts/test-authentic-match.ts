#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import {
  AuthenticMatch,
  defaultAuthenticMatchConfig,
} from '../src/lib/authentic-match';

const prisma = new PrismaClient();

// Données de test
const testCV = `
Jean Dupont
Développeur Full Stack

Expérience professionnelle:
- 3 ans chez TechCorp (Startup) - Développeur React/Node.js
- 2 ans chez WebAgency (PME) - Développeur Frontend

Formation:
- Master Informatique (Bac+5) - Université de Paris
- Licence Informatique (Bac+3) - Université de Lyon

Compétences techniques:
- React, Vue.js, Angular
- Node.js, Express.js
- PostgreSQL, MongoDB
- Docker, Git

Langues:
- Français (Natif)
- Anglais (B2 - TOEIC 850)

Soft skills:
- Travail en équipe
- Communication
- Résolution de problèmes
- Créativité

Mobilité:
- Paris, Lyon, Toulouse
- Télétravail possible
- Disponible immédiatement
`;

const testJob = `
Développeur Full Stack Senior
TechStartup - Paris

Description du poste:
Nous recherchons un développeur full stack senior pour rejoindre notre équipe dynamique.

Missions:
- Développement d'applications web avec React et Node.js
- Architecture microservices
- Collaboration avec l'équipe produit
- Mentorat des développeurs juniors

Profil recherché:
- 5+ ans d'expérience en développement web
- Maîtrise de React et Node.js
- Expérience avec les bases de données (PostgreSQL)
- Connaissance de Docker et Kubernetes
- Anglais courant (B2 minimum)
- Formation Bac+5 en informatique

Compétences techniques requises:
- React, Redux
- Node.js, Express.js
- PostgreSQL, Redis
- Docker, Kubernetes
- Git, CI/CD

Soft skills:
- Leadership
- Communication
- Esprit d'équipe
- Innovation

Conditions:
- CDI
- Salaire: 50-70k€
- Télétravail 2 jours/semaine
- Tickets restaurant
- Mutuelle
`;

async function testAuthenticMatch() {
  console.log('🧪 Test du système AUTHENTIC-MATCH');
  console.log('==================================');

  try {
    // Créer l'instance du matcher
    const authenticMatch = new AuthenticMatch(
      prisma,
      defaultAuthenticMatchConfig
    );

    console.log("📊 Début de l'analyse...");
    const startTime = Date.now();

    // Effectuer l'analyse
    const result = await authenticMatch.analyzeMatch(
      testCV,
      testJob,
      'test-user'
    );

    const processingTime = Date.now() - startTime;

    console.log('✅ Analyse terminée !');
    console.log(`⏱️  Temps de traitement: ${processingTime}ms`);
    console.log('');

    // Afficher les résultats
    console.log('📈 RÉSULTATS DU MATCHING');
    console.log('========================');
    console.log(
      `Score global: ${Math.round(result.summary.overallScore * 100)}%`
    );
    console.log(`Niveau de match: ${result.summary.matchLevel}`);
    console.log(
      `Score d'authenticité: ${Math.round(
        result.authenticity.globalScore * 100
      )}%`
    );
    console.log('');

    // Détails des scores
    console.log('📊 SCORES DÉTAILLÉS');
    console.log('===================');
    console.log(
      `Compétences techniques: ${Math.round(
        result.score.breakdown.technical.score * 100
      )}%`
    );
    console.log(
      `  - Correspondances exactes: ${result.score.breakdown.technical.exact.length}`
    );
    console.log(
      `  - Compétences similaires: ${result.score.breakdown.technical.similar.length}`
    );
    console.log(
      `  - Compétences transférables: ${result.score.breakdown.technical.transferable.length}`
    );
    console.log(
      `  - Compétences manquantes: ${result.score.breakdown.technical.missing.length}`
    );
    console.log('');

    console.log(
      `Expérience: ${Math.round(
        result.score.breakdown.experience.score * 100
      )}%`
    );
    console.log(`  - Années CV: ${result.score.breakdown.experience.cvYears}`);
    console.log(
      `  - Années requises: ${result.score.breakdown.experience.requiredYears.min}-${result.score.breakdown.experience.requiredYears.max}`
    );
    console.log(
      `  - Années pertinentes: ${result.score.breakdown.experience.relevantYears}`
    );
    console.log('');

    console.log(
      `Formation: ${Math.round(result.score.breakdown.education.score * 100)}%`
    );
    console.log(
      `  - Diplôme CV: ${result.score.breakdown.education.cvDiploma}`
    );
    console.log(
      `  - Diplôme requis: ${result.score.breakdown.education.requiredDiploma}`
    );
    console.log(
      `  - Équivalent: ${
        result.score.breakdown.education.isEquivalent ? 'Oui' : 'Non'
      }`
    );
    console.log(
      `  - Explication: ${result.score.breakdown.education.explanation}`
    );
    console.log('');

    console.log(
      `Soft skills: ${Math.round(
        result.score.breakdown.softSkills.score * 100
      )}%`
    );
    console.log(
      `  - Correspondances: ${result.score.breakdown.softSkills.matched.length}`
    );
    console.log(
      `  - Manquantes: ${result.score.breakdown.softSkills.missing.length}`
    );
    console.log(
      `  - Transférables: ${result.score.breakdown.softSkills.transferable.length}`
    );
    console.log('');

    console.log(
      `Culture d'entreprise: ${Math.round(
        result.score.breakdown.cultural.score * 100
      )}%`
    );
    console.log(
      `  - Valeurs: ${Math.round(
        result.score.breakdown.cultural.valuesMatch * 100
      )}%`
    );
    console.log(
      `  - Environnement: ${Math.round(
        result.score.breakdown.cultural.environmentMatch * 100
      )}%`
    );
    console.log(
      `  - Aspirations: ${Math.round(
        result.score.breakdown.cultural.aspirationsMatch * 100
      )}%`
    );
    console.log('');

    // Analyse d'authenticité
    console.log("🛡️ ANALYSE D'AUTHENTICITÉ");
    console.log('==========================');
    console.log(
      `Score global: ${Math.round(result.authenticity.globalScore * 100)}%`
    );
    console.log(
      `Langage naturel: ${Math.round(
        result.authenticity.breakdown.naturalLanguage * 100
      )}%`
    );
    console.log(
      `Cohérence temporelle: ${Math.round(
        result.authenticity.breakdown.temporalCoherence * 100
      )}%`
    );
    console.log(
      `Personnalité: ${Math.round(
        result.authenticity.breakdown.personality * 100
      )}%`
    );
    console.log(
      `Densité mots-clés: ${Math.round(
        result.authenticity.breakdown.keywordDensity * 100
      )}%`
    );
    console.log(
      `Originalité: ${Math.round(
        result.authenticity.breakdown.uniqueness * 100
      )}%`
    );
    console.log('');

    if (result.authenticity.issues.length > 0) {
      console.log('⚠️  PROBLÈMES DÉTECTÉS');
      console.log('======================');
      result.authenticity.issues.forEach((issue, index) => {
        console.log(
          `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`
        );
      });
      console.log('');
    }

    // Suggestions
    console.log('💡 SUGGESTIONS NATURELLES');
    console.log('=========================');
    const naturalSuggestions = result.suggestions.filter(
      (s) => s.isNatural && s.preservesAuthenticity
    );
    naturalSuggestions.slice(0, 5).forEach((suggestion, index) => {
      console.log(
        `${index + 1}. [${suggestion.priority.toUpperCase()}] ${
          suggestion.suggestion
        }`
      );
      if (suggestion.example) {
        console.log(`   Exemple: ${suggestion.example}`);
      }
      console.log(`   Impact: ${suggestion.impact}/10`);
      console.log('');
    });

    // Points forts et améliorations
    console.log('🎯 RÉSUMÉ');
    console.log('==========');
    console.log('Points forts:');
    result.summary.strengths.forEach((strength, index) => {
      console.log(`  ✅ ${strength}`);
    });
    console.log('');

    console.log("Axes d'amélioration:");
    result.summary.improvements.forEach((improvement, index) => {
      console.log(`  🔄 ${improvement}`);
    });
    console.log('');

    console.log('Prochaines étapes:');
    result.summary.nextSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
    console.log('');

    // Métriques de performance
    console.log('📊 MÉTRIQUES DE PERFORMANCE');
    console.log('===========================');
    const metrics = await authenticMatch.getPerformanceMetrics();
    console.log(`Analyses totales: ${metrics.totalAnalyses}`);
    console.log(`Temps moyen: ${metrics.avgProcessingTime}ms`);
    console.log(
      `Score d'authenticité moyen: ${Math.round(
        metrics.avgAuthenticityScore * 100
      )}%`
    );
    console.log(
      `Score de matching moyen: ${Math.round(metrics.avgMatchScore * 100)}%`
    );
    console.log(`Taux de cache: ${Math.round(metrics.cacheHitRate * 100)}%`);
    console.log('');

    console.log('🎉 Test terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
testAuthenticMatch();
