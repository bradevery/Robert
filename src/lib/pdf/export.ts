import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFExportOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  quality?: number;
}

const defaultOptions: PDFExportOptions = {
  filename: 'document.pdf',
  format: 'a4',
  orientation: 'portrait',
  margin: 10,
  quality: 2,
};

/**
 * Export a DOM element to PDF
 */
export async function exportToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<Blob> {
  const opts = { ...defaultOptions, ...options };

  // Capture the element as canvas
  const canvas = await html2canvas(element, {
    scale: opts.quality,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  // Calculate dimensions
  const imgWidth = opts.format === 'a4' ? 210 : 215.9; // mm
  const pageHeight = opts.format === 'a4' ? 297 : 279.4; // mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Create PDF
  const pdf = new jsPDF({
    orientation: opts.orientation,
    unit: 'mm',
    format: opts.format,
  });

  let heightLeft = imgHeight;
  let position = opts.margin || 0;

  // Add first page
  pdf.addImage(
    canvas.toDataURL('image/png'),
    'PNG',
    opts.margin || 0,
    position,
    imgWidth - (opts.margin || 0) * 2,
    imgHeight
  );
  heightLeft -= pageHeight;

  // Add additional pages if needed
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      opts.margin || 0,
      position,
      imgWidth - (opts.margin || 0) * 2,
      imgHeight
    );
    heightLeft -= pageHeight;
  }

  return pdf.output('blob');
}

/**
 * Download a PDF from a DOM element
 */
export async function downloadPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const blob = await exportToPDF(element, options);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = options.filename || 'document.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a shareable link for a PDF
 */
export async function generateShareableLink(
  documentId: string,
  documentType: 'cv' | 'dossier' | 'propale'
): Promise<string> {
  const response = await fetch('/api/share/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, documentType }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate shareable link');
  }

  const data = await response.json();
  return data.shareUrl;
}
