#!/usr/bin/env tsx

import { config } from 'dotenv';
import { extractFrenchContextualKeywords } from '../src/lib/ai/mistral-client';

// Charger les variables d'environnement
config();

// Vérifier que les variables d'environnement sont chargées
console.log('🔑 API Key chargée:', process.env.MISTRAL_API_KEY ? 'Oui' : 'Non');
console.log(
  '🤖 Modèle chargé:',
  process.env.MISTRAL_MODEL || 'open-mistral-7b'
);
console.log('');

async function testExtraction() {
  console.log("🧪 Test d'extraction des données contextuelles");
  console.log('===============================================');

  const cvText = `
    Développeur Fullstack avec 5 ans d'expérience en React, Node.js et PostgreSQL.
    Master en Informatique de l'Université Paris-Saclay.
    Maîtrise de l'anglais (B2).
    Expérience en gestion de projet Agile.
    Passionné par l'innovation et les nouvelles technologies.
    Localisation : Paris, France.
    Ouvert au télétravail.
  `;

  const jobText = `
    Nous recherchons un Développeur Backend Senior avec 7 ans d'expérience.
    Compétences requises : Node.js, Docker, Kubernetes, PostgreSQL.
    Diplôme Bac+5 en informatique ou équivalent.
    Anglais courant (C1).
    Esprit d'équipe et proactif.
    Environnement startup agile.
    Localisation : Paris ou télétravail.
  `;

  try {
    console.log('📄 Test extraction CV...');
    const cvData = await extractFrenchContextualKeywords(cvText, 'cv');
    console.log('✅ Extraction CV réussie !');
    console.log('📊 Données extraites :');
    console.log(JSON.stringify(cvData, null, 2));
    console.log('');

    console.log('💼 Test extraction Job...');
    const jobData = await extractFrenchContextualKeywords(jobText, 'job');
    console.log('✅ Extraction Job réussie !');
    console.log('📊 Données extraites :');
    console.log(JSON.stringify(jobData, null, 2));
  } catch (error: any) {
    console.error("❌ Erreur lors de l'extraction:", error.message);
    if (error.issues) {
      console.log('🔍 Détails des erreurs de validation :');
      error.issues.forEach((issue: any, index: number) => {
        console.log(
          `  ${index + 1}. ${issue.path.join('.')}: ${issue.message}`
        );
      });
    }
  }
}

testExtraction();
