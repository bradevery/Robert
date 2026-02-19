#!/usr/bin/env tsx

import { config } from 'dotenv';
import { Mistral } from '@mistralai/mistralai';

// Charger les variables d'environnement
config();

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

async function testMistralConnection() {
  console.log('🔗 Test de connexion Mistral AI');
  console.log('================================');

  if (!process.env.MISTRAL_API_KEY) {
    console.error('❌ MISTRAL_API_KEY non définie');
    process.exit(1);
  }

  console.log(`🔑 API Key: ${process.env.MISTRAL_API_KEY.substring(0, 10)}...`);
  console.log(
    `🤖 Modèle configuré: ${process.env.MISTRAL_MODEL || 'open-mistral-7b'}`
  );
  console.log('');

  // Modèles Mistral disponibles
  const availableModels = [
    'open-mistral-7b',
    'open-mixtral-8x7b',
    'mistral-7b-instruct',
    'mixtral-8x7b-instruct',
  ];

  console.log('📋 Modèles Mistral disponibles:');
  availableModels.forEach((model) => {
    console.log(`  - ${model}`);
  });
  console.log('');

  // Test avec le modèle configuré
  const modelToTest = process.env.MISTRAL_MODEL || 'open-mistral-7b';

  try {
    console.log(`🧪 Test avec le modèle: ${modelToTest}`);

    const response = await mistral.chat.complete({
      model: modelToTest,
      messages: [
        {
          role: 'user',
          content:
            'Bonjour, peux-tu me dire "Test de connexion réussi" en français ?',
        },
      ],
      maxTokens: 50,
    });

    console.log('✅ Connexion réussie !');
    console.log(`📝 Réponse: ${response.choices[0].message.content}`);
    console.log('');

    // Test avec JSON
    console.log('🧪 Test avec format JSON...');
    const jsonResponse = await mistral.chat.complete({
      model: modelToTest,
      messages: [
        {
          role: 'user',
          content:
            'Retourne un JSON simple avec {"status": "ok", "message": "test"}',
        },
      ],
      responseFormat: { type: 'json_object' },
      maxTokens: 50,
    });

    console.log('✅ Format JSON fonctionne !');
    console.log(`📝 Réponse JSON: ${jsonResponse.choices[0].message.content}`);
  } catch (error: any) {
    console.error('❌ Erreur de connexion:', error.message);

    if (error.message.includes('Invalid model')) {
      console.log('');
      console.log('💡 Solution:');
      console.log(
        '1. Vérifiez que MISTRAL_MODEL est défini correctement dans .env'
      );
      console.log('2. Utilisez un des modèles disponibles listés ci-dessus');
      console.log(
        '3. Ou supprimez MISTRAL_MODEL pour utiliser open-mistral-7b par défaut'
      );
    }

    process.exit(1);
  }
}

testMistralConnection();
