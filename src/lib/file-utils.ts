import mammoth from 'mammoth';
import pdf from 'pdf-parse';

export async function extractTextFromFile(
  buffer: ArrayBuffer,
  mimeType: string
): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const nodeBuffer = Buffer.from(buffer);

    if (mimeType === 'application/pdf') {
      return await extractTextFromPDF(nodeBuffer);
    } else if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return await extractTextFromDOCX(nodeBuffer);
    } else if (mimeType === 'application/msword') {
      return await extractTextFromDOC(uint8Array);
    } else if (mimeType.startsWith('text/')) {
      return new TextDecoder().decode(uint8Array);
    } else {
      // Fallback based on extension check failure or generic types
      // Attempt to detect if it's a PDF or DOCX by magic numbers could be added here
      // For now, throw error
      throw new Error(`Type de fichier non supporté: ${mimeType}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'extraction du texte:", error);
    throw new Error("Impossible d'extraire le texte du fichier");
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("Erreur lors de l'extraction du PDF:", error);
    throw new Error("Impossible d'extraire le texte du PDF");
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error("Erreur lors de l'extraction du DOCX avec Mammoth:", error);
    throw new Error("Impossible d'extraire le texte du DOCX");
  }
}

async function extractTextFromDOC(buffer: Uint8Array): Promise<string> {
  try {
    const text = new TextDecoder().decode(buffer);

    // Basic cleanup for raw DOC extraction (simplified version of surly-v2 logic)
    const textOnly = text
      .replace(/<[^>]*>/g, '') // Remove HTML-like tags
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Keep printable ASCII
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (textOnly.length < 50) {
      throw new Error('Contenu du document Word trop court ou illisible');
    }

    return textOnly;
  } catch (error) {
    console.error("Erreur lors de l'extraction du DOC:", error);

    try {
      const fallbackText = new TextDecoder('utf-8', { ignoreBOM: true }).decode(
        buffer
      );
      const cleanText = fallbackText
        .replace(/[^\x20-\x7E\n\r\t\u00C0-\u017F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanText.length > 50) {
        return cleanText;
      }
    } catch (fallbackError) {
      console.error('Erreur du fallback:', fallbackError);
    }

    throw new Error(
      "Impossible d'extraire le texte du document Word. Veuillez utiliser un fichier PDF ou texte."
    );
  }
}
export const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];
