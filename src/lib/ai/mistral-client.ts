/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mistral } from '@mistralai/mistralai';
import { z } from 'zod';

function getMistralClient() {
  return new Mistral({
    apiKey: process.env.MISTRAL_API_KEY,
  });
}

// Schéma de validation Zod pour l'extraction française (simplifié et flexible)
const FrenchKeywordSchema = z.object({
  hardSkills: z
    .array(
      z.object({
        name: z.string(),
        level: z.string(), // Plus flexible
        years: z.number().optional(),
        context: z.string().optional(),
      })
    )
    .default([]),

  softSkills: z
    .array(
      z.union([
        z.string(), // Accepte les strings simples
        z.object({
          name: z.string(),
          examples: z.array(z.string()).optional(),
          validated: z.boolean().optional().default(false),
        }),
      ])
    )
    .default([]),

  tools: z
    .array(
      z.object({
        name: z.string(),
        version: z.string().optional(),
        proficiency: z.string().optional(), // Plus flexible
      })
    )
    .default([]),

  education: z
    .object({
      level: z.string().default(''),
      diploma: z.string().default(''),
      school: z.string().optional(),
      specialization: z.string().optional(),
      year: z.number().optional(),
    })
    .default({ level: '', diploma: '' }),

  experience: z
    .object({
      totalYears: z.number().default(0),
      relevantYears: z.number().optional().default(0),
      companies: z
        .array(
          z.object({
            name: z.string(),
            type: z.string().optional(), // Plus flexible
            duration: z.number().optional(),
          })
        )
        .default([]),
      seniorityLevel: z.string().optional().default(''),
    })
    .default({
      totalYears: 0,
      relevantYears: 0,
      companies: [],
      seniorityLevel: '',
    }),

  languages: z
    .array(
      z.object({
        language: z.string(),
        level: z.string(), // Plus flexible
        certification: z.string().optional(),
      })
    )
    .default([]),

  mobility: z
    .object({
      currentLocation: z.string().default(''),
      targetLocations: z.array(z.string()).default([]),
      remote: z.boolean().optional().default(false),
      relocation: z.boolean().optional().default(false),
    })
    .default({
      currentLocation: '',
      targetLocations: [],
      remote: false,
      relocation: false,
    }),

  culture: z
    .object({
      workEnvironment: z.array(z.string()).default([]),
      values: z.array(z.string()).default([]),
      aspirations: z.array(z.string()).default([]),
    })
    .default({ workEnvironment: [], values: [], aspirations: [] }),
});

export type FrenchExtractedData = z.infer<typeof FrenchKeywordSchema>;

export async function extractFrenchContextualKeywords(
  text: string,
  type: 'cv' | 'job'
): Promise<FrenchExtractedData> {
  const systemPrompt = `
Tu es un expert en analyse ${
    type === 'cv' ? 'de CV' : "d'offres d'emploi"
  } sur le marché français.
Tu comprends parfaitement :
- Le système éducatif français (LMD, Grandes Écoles, etc.)
- Les conventions collectives et statuts
- Les niveaux de langue CECRL
- La culture d'entreprise française

IMPORTANT : Tu dois retourner UNIQUEMENT un JSON valide avec cette structure exacte :

{
  "hardSkills": [{"name": "string", "level": "string"}],
  "softSkills": [{"name": "string"}],
  "tools": [{"name": "string", "category": "string"}],
  "education": {"level": "string", "diploma": "string", "institution": "string"},
  "experience": {"totalYears": number, "sectors": ["string"], "companyTypes": ["string"]},
  "languages": [{"language": "string", "level": "string"}],
  "mobility": {"currentLocation": "string", "remoteWork": boolean, "travel": boolean},
  "culture": {"workEnvironment": ["string"], "values": ["string"], "aspirations": ["string"]}
}

Ne retourne AUCUN texte en dehors du JSON.`;

  const userPrompt = `
Analyse ce ${type === 'cv' ? 'CV' : "cette offre d'emploi"} :

${text}

Extrais toutes les informations pertinentes selon le schéma JSON fourni.
Sois précis et factuel. N'invente rien.
Pour les compétences techniques, déduis le niveau d'après l'expérience.
Pour les soft skills, ne retiens que celles démontrées par des exemples.

IMPORTANT : Retourne UNIQUEMENT le JSON avec la structure exacte demandée, sans aucun texte supplémentaire.
`;

  try {
    // Vérifier que le texte n'est pas vide
    if (!text || text.trim().length < 20) {
      console.warn('Texte trop court, retour de données par défaut');
      return FrenchKeywordSchema.parse({});
    }

    const mistral = getMistralClient();
    const response = await mistral.chat.complete({
      model: process.env.MISTRAL_MODEL || 'open-mistral-7b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      responseFormat: { type: 'json_object' },
      maxTokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('Pas de contenu dans la réponse Mistral');
      return FrenchKeywordSchema.parse({});
    }

    const result = JSON.parse(content);

    // Valider avec Zod
    return FrenchKeywordSchema.parse(result);
  } catch (error: any) {
    console.error('Erreur extraction complète:', {
      error: error.message,
      stack: error.stack,
      type,
      textLength: text?.length,
    });

    // Retourner des données par défaut en cas d'erreur
    return FrenchKeywordSchema.parse({});
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const mistral = getMistralClient();
    const response = await mistral.embeddings.create({
      model: 'mistral-embed',
      inputs: [text],
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Erreur génération embedding:', error);
    throw new Error("Échec de la génération d'embedding");
  }
}

export async function analyzeAuthenticity(
  cvText: string,
  extractedData: FrenchExtractedData
): Promise<{
  globalScore: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
  recommendations: string[];
  breakdown: {
    naturalLanguage: number;
    temporalCoherence: number;
    personality: number;
    keywordDensity: number;
    uniqueness: number;
  };
}> {
  const systemPrompt = `
Tu es un expert en détection d'authenticité de CV français.
Ton rôle est d'analyser si un CV semble naturel et authentique, ou s'il a été sur-optimisé.

Critères d'analyse :
1. Langage naturel vs artificiel
2. Cohérence temporelle des expériences
3. Présence de personnalité et d'éléments humains
4. Densité de mots-clés (ne doit pas être excessive)
5. Originalité du contenu

Retourne une analyse détaillée avec scores et recommandations.
`;

  const userPrompt = `
Analyse l'authenticité de ce CV :

${cvText}

Données extraites :
${JSON.stringify(extractedData, null, 2)}

Fournis une analyse complète avec :
- Score global d'authenticité (0-1)
- Problèmes détectés avec sévérité
- Recommandations pour améliorer l'authenticité
- Détail des scores par critère

Retourne un JSON structuré.
`;

  try {
    const mistral = getMistralClient();
    const response = await mistral.chat.complete({
      model: process.env.MISTRAL_MODEL || 'open-mistral-7b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      responseFormat: { type: 'json_object' },
      maxTokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Erreur analyse authenticité:', error);
    throw new Error("Échec de l'analyse d'authenticité");
  }
}

export async function generateNaturalSuggestions(
  cvData: FrenchExtractedData,
  jobData: FrenchExtractedData,
  matchResult: any,
  authenticityScore: number
): Promise<
  Array<{
    id: string;
    type: 'improvement' | 'addition' | 'reformulation' | 'structure';
    section: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    example: string;
    impact: number;
    isNatural: boolean;
    preservesAuthenticity: boolean;
  }>
> {
  const systemPrompt = `
Tu es un expert en amélioration de CV français qui privilégie l'authenticité.
Ton rôle est de suggérer des améliorations naturelles qui préservent la personnalité du candidat.

Principes :
- Ne jamais suggérer d'inventer des compétences
- Valoriser l'existant plutôt que d'ajouter
- Proposer des reformulations naturelles
- Adapter au contexte français
- Maintenir l'authenticité avant tout

Génère des suggestions éthiques et naturelles.
`;

  const userPrompt = `
CV du candidat :
${JSON.stringify(cvData, null, 2)}

Offre d'emploi :
${JSON.stringify(jobData, null, 2)}

Résultat du matching :
${JSON.stringify(matchResult, null, 2)}

Score d'authenticité : ${authenticityScore}

Génère des suggestions naturelles pour améliorer le matching tout en préservant l'authenticité.
Chaque suggestion doit être :
- Réalisable avec les compétences existantes
- Naturelle et personnalisée
- Adaptée au contexte français
- Éthique

Retourne un JSON avec un tableau de suggestions.
`;

  try {
    const mistral = getMistralClient();
    const response = await mistral.chat.complete({
      model: process.env.MISTRAL_MODEL || 'open-mistral-7b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      responseFormat: { type: 'json_object' },
      maxTokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.suggestions || [];
  } catch (error) {
    console.error('Erreur génération suggestions:', error);
    throw new Error('Échec de la génération de suggestions');
  }
}

export async function detectDiplomaEquivalences(
  cvDiploma: string,
  jobRequirement: string
): Promise<{
  isEquivalent: boolean;
  confidence: number;
  explanation: string;
}> {
  const systemPrompt = `
Tu es un expert en équivalences de diplômes français.
Tu connais parfaitement le système LMD, les Grandes Écoles, et les équivalences internationales.

Analyse si deux diplômes sont équivalents selon les standards français.
`;

  const userPrompt = `
Diplôme du candidat : ${cvDiploma}
Exigence du poste : ${jobRequirement}

Détermine si ces diplômes sont équivalents selon les standards français.
Retourne :
- isEquivalent : boolean
- confidence : number (0-1)
- explanation : string détaillée

Retourne un JSON structuré.
`;

  try {
    const mistral = getMistralClient();
    const response = await mistral.chat.complete({
      model: process.env.MISTRAL_MODEL || 'open-mistral-7b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      responseFormat: { type: 'json_object' },
      maxTokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Erreur équivalence diplôme:', error);
    return {
      isEquivalent: false,
      confidence: 0.2,
      explanation: "Erreur lors de l'analyse d'équivalence",
    };
  }
}
