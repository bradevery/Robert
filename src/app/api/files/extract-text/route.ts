import { NextRequest, NextResponse } from 'next/server';

import { createChatCompletion } from '@/lib/ai/openai-client';
import { getAuthScope } from '@/lib/auth-scope';
import { extractTextFromFile } from '@/lib/file-utils';

export async function POST(request: NextRequest) {
  try {
    const scope = await getAuthScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const mimeType = file.type;
    const fileName = file.name.toLowerCase();

    // Determine MIME type if generic or missing
    let finalMimeType = mimeType;
    if (!finalMimeType || finalMimeType === 'application/octet-stream') {
      if (fileName.endsWith('.pdf')) {
        finalMimeType = 'application/pdf';
      } else if (fileName.endsWith('.docx')) {
        finalMimeType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileName.endsWith('.doc')) {
        finalMimeType = 'application/msword';
      } else if (fileName.endsWith('.txt')) {
        finalMimeType = 'text/plain';
      }
    }

    try {
      // 1. Extract raw text
      const rawText = await extractTextFromFile(buffer, finalMimeType);

      // 2. Logic based on file type
      if (finalMimeType === 'application/pdf') {
        // "SI C'EST UN PDF ENVOYER DIRECT A CHATGPT"
        // Use AI to clean/structure the raw PDF text
        const cleanedText = await createChatCompletion(
          [
            {
              role: 'system',
              content:
                'Tu es un expert en extraction et nettoyage de documents. Ton but est de rendre le texte lisible et structuré.',
            },
            {
              role: 'user',
              content: `Voici le contenu brut extrait d'un fichier PDF (CV ou document). Reformate-le en texte clair et structuré. Corrige les problèmes d'encodage, de sauts de ligne ou de mise en page si possible. Retourne uniquement le texte nettoyé, sans markdown excessif ni commentaires.\n\nContenu brut:\n${rawText.slice(
                0,
                50000
              )}`, // Limit content to avoid token limits
            },
          ],
          {
            model: 'gpt-4o-mini', // Fast and effective for cleaning
            temperature: 0.3,
          }
        );
        return NextResponse.json({ text: cleanedText });
      } else {
        // "SI C'EST UN DOCS EXTRARIRE D'ABORD AVEC MAMOTH"
        // For DOCX/DOC (handled by Mammoth/TextDecoder in extractTextFromFile), return raw text directly
        return NextResponse.json({ text: rawText });
      }
    } catch (extractionError) {
      console.error('Extraction error:', extractionError);
      return NextResponse.json(
        {
          error:
            extractionError instanceof Error
              ? extractionError.message
              : 'Failed to extract text',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('extract-text error:', error);
    return NextResponse.json(
      { error: 'Internal server error during text extraction' },
      { status: 500 }
    );
  }
}
