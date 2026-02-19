import jsPDF from 'jspdf';

interface QAItem {
  question: string;
  answer: string;
  category: 'technique' | 'fonctionnel' | 'comportemental' | 'motivation';
}

interface CoachingResult {
  briefing: string;
  qa: QAItem[];
  fiche2min: string;
  pointsForts: string[];
  risques: string[];
  conseilsPresentation: string[];
}

export function exportCoachingToPDF(data: CoachingResult) {
  const doc = new jsPDF();
  let y = 20;
  const lineHeight = 7;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const maxLineWidth = pageWidth - margin * 2;

  // Helper to add text and advance Y
  const addText = (
    text: string,
    size = 12,
    style = 'normal',
    color = '#000000'
  ) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(color);

    const lines = doc.splitTextToSize(text, maxLineWidth);

    // Check page break
    if (y + lines.length * lineHeight > 280) {
      doc.addPage();
      y = 20;
    }

    doc.text(lines, margin, y);
    y += lines.length * lineHeight;
  };

  const addHeader = (text: string) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    y += 5;
    addText(text, 16, 'bold', '#059669'); // Emerald color
    y += 5;
  };

  // Title
  addText('Kit de Coaching Soutenance', 24, 'bold', '#059669');
  y += 10;
  addText('Généré par Robert.IA', 10, 'italic', '#666666');
  y += 15;

  // 1. Briefing
  addHeader('1. Briefing Mission');
  addText(data.briefing, 11);
  y += 10;

  // 2. Fiche 2min
  addHeader('2. Fiche "2 minutes pour convaincre"');
  // Draw a box background
  // We can't easily calculate height of text beforehand without splitting, but let's just print text
  addText(data.fiche2min, 11, 'italic');
  y += 10;

  // 3. Forces & Risques
  addHeader('3. Analyse SWOT (Forces & Risques)');
  addText('Points Forts :', 12, 'bold');
  data.pointsForts.forEach((p) => addText(`• ${p}`, 11));
  y += 5;

  addText('Points de Vigilance :', 12, 'bold');
  data.risques.forEach((p) => addText(`• ${p}`, 11));
  y += 10;

  // 4. Q&A
  addHeader('4. Questions / Réponses Probables');
  data.qa.forEach((qa, i) => {
    // Keep Q&A together if possible
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    addText(`Q${i + 1}: ${qa.question}`, 11, 'bold');
    addText(`R: ${qa.answer}`, 11, 'normal', '#444444');
    y += 5;
  });

  // 5. Conseils
  if (data.conseilsPresentation?.length) {
    addHeader('5. Conseils de Présentation');
    data.conseilsPresentation.forEach((c) => addText(`- ${c}`, 11));
  }

  doc.save('Coaching_Kit.pdf');
}
