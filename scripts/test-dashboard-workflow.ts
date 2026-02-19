#!/usr/bin/env tsx

import { config } from 'dotenv';
import fetch from 'node-fetch';

// Charger les variables d'environnement
config();

async function testDashboardWorkflow() {
  console.log('🧪 Test du Workflow Dashboard AUTHENTIC-MATCH');
  console.log('===============================================');

  // Test 1: Vérifier que le serveur répond
  console.log('\n📡 Test 1: Vérification du serveur...');
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Serveur accessible sur http://localhost:3000');
    } else {
      console.log('❌ Serveur non accessible');
      return;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion au serveur:', error);
    return;
  }

  // Test 2: Vérifier la page dashboard
  console.log('\n🏠 Test 2: Page Dashboard...');
  try {
    const response = await fetch('http://localhost:3000/dashboard');
    if (response.ok) {
      console.log('✅ Page dashboard accessible');
    } else {
      console.log('❌ Page dashboard non accessible');
    }
  } catch (error) {
    console.log('❌ Erreur accès dashboard:', error);
  }

  // Test 3: Vérifier la page authentic-match
  console.log('\n🎯 Test 3: Page Authentic Match...');
  try {
    const response = await fetch(
      'http://localhost:3000/dashboard/authentic-match'
    );
    if (response.ok) {
      console.log('✅ Page authentic-match accessible');
    } else {
      console.log('❌ Page authentic-match non accessible');
    }
  } catch (error) {
    console.log('❌ Erreur accès authentic-match:', error);
  }

  // Test 4: Test de l'API de matching
  console.log('\n🔍 Test 4: API Authentic Match...');
  const cvText = `
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
  `;

  const jobText = `
    Développeur Full Stack Senior
    
    Nous recherchons un développeur full stack expérimenté pour rejoindre notre équipe.
    
    Compétences requises:
    - React, Vue.js ou Angular (3+ ans)
    - Node.js, Express.js (3+ ans)
    - PostgreSQL, MongoDB
    - Docker, Kubernetes
    - Git, CI/CD
    
    Formation:
    - Bac+5 en informatique ou équivalent
    - Expérience de 5+ ans
    
    Langues:
    - Français (natif)
    - Anglais (courant - C1)
    
    Soft skills:
    - Esprit d'équipe
    - Proactivité
    - Capacité d'adaptation
    - Leadership technique
    
    Environnement:
    - Startup en croissance
    - Méthodes agiles
    - Télétravail possible
    - Paris ou Lyon
  `;

  try {
    const response = await fetch('http://localhost:3000/api/authentic-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cvText,
        jobText,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Authentic Match fonctionne');
      console.log(
        '📊 Score de matching:',
        (data.data.summary.overallScore * 100).toFixed(1) + '%'
      );
      console.log('🎯 Niveau de match:', data.data.summary.matchLevel);
    } else {
      const errorData = await response.json();
      console.log('❌ Erreur API Authentic Match:', errorData.error);
    }
  } catch (error) {
    console.log('❌ Erreur test API:', error);
  }

  // Test 5: Test de l'API d'optimisation CV
  console.log('\n✨ Test 5: API Optimisation CV...');
  try {
    const response = await fetch('http://localhost:3000/api/optimize-cv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalCV: cvText,
        jobDescription: jobText,
        matchingResult: {
          overallScore: 0.75,
          matchLevel: 'Bon match',
          strengths: [
            'Compétences techniques solides',
            'Expérience pertinente',
          ],
          improvements: [
            'Améliorer les soft skills',
            'Ajouter des certifications',
          ],
          authenticity: {
            globalScore: 0.8,
            issues: [],
            recommendations: [],
          },
          breakdown: {
            technical: 0.8,
            experience: 0.7,
            education: 0.9,
            softSkills: 0.6,
            cultural: 0.8,
          },
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Optimisation CV fonctionne');
      console.log(
        "📈 Score d'amélioration:",
        (data.data.score * 100).toFixed(1) + '%'
      );
      console.log('🔧 Améliorations:', data.data.improvements.length);
    } else {
      const errorData = await response.json();
      console.log('❌ Erreur API Optimisation CV:', errorData.error);
    }
  } catch (error) {
    console.log('❌ Erreur test API optimisation:', error);
  }

  console.log('\n🎉 Test du workflow terminé !');
  console.log('\n📋 Instructions pour tester manuellement:');
  console.log('1. Ouvrez http://localhost:3000/dashboard');
  console.log('2. Cliquez sur "Matching Authentique"');
  console.log('3. Téléchargez un CV (PDF, DOC, TXT)');
  console.log("4. Saisissez une description d'offre d'emploi");
  console.log("5. Lancez l'analyse et observez les résultats");
  console.log('6. Téléchargez le CV optimisé généré');
}

testDashboardWorkflow();
