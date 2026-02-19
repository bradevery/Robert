'use client';

import { Check, Download, Link, Loader2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import {
  downloadPDF,
  generateShareableLink,
  PDFExportOptions,
} from '@/lib/pdf/export';

import { Button } from './button';

interface ExportButtonProps {
  elementRef: React.RefObject<HTMLElement>;
  filename?: string;
  documentId?: string;
  documentType?: 'cv' | 'dossier' | 'propale';
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function ExportButton({
  elementRef,
  filename = 'document.pdf',
  documentId,
  documentType,
  className,
  variant = 'default',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = useCallback(async () => {
    if (!elementRef.current) return;

    setIsExporting(true);
    try {
      const options: PDFExportOptions = {
        filename,
        format: 'a4',
        orientation: 'portrait',
        quality: 2,
      };
      await downloadPDF(elementRef.current, options);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
      setShowMenu(false);
    }
  }, [elementRef, filename]);

  const handleShare = useCallback(async () => {
    if (!documentId || !documentType) return;

    setIsExporting(true);
    try {
      const shareUrl = await generateShareableLink(documentId, documentType);
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setIsExporting(false);
    }
  }, [documentId, documentType]);

  return (
    <div className='relative'>
      <Button
        variant={variant}
        className={className}
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className='w-4 h-4 animate-spin mr-2' />
        ) : (
          <Download className='w-4 h-4 mr-2' />
        )}
        Exporter
      </Button>

      {showMenu && (
        <div
          ref={menuRef}
          className='absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50'
        >
          <button
            onClick={handleExportPDF}
            className='w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
          >
            <Download className='w-4 h-4' />
            Télécharger en PDF
          </button>

          {documentId && documentType && (
            <button
              onClick={handleShare}
              className='w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
            >
              {copied ? (
                <>
                  <Check className='w-4 h-4 text-green-600' />
                  <span className='text-green-600'>Lien copié!</span>
                </>
              ) : (
                <>
                  <Link className='w-4 h-4' />
                  Copier le lien
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface SimpleExportButtonProps {
  elementRef: React.RefObject<HTMLElement>;
  filename?: string;
  className?: string;
}

export function SimpleExportButton({
  elementRef,
  filename = 'document.pdf',
  className,
}: SimpleExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!elementRef.current) return;

    setIsExporting(true);
    try {
      await downloadPDF(elementRef.current, { filename });
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  }, [elementRef, filename]);

  return (
    <Button
      variant='outline'
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <Loader2 className='w-4 h-4 animate-spin mr-2' />
      ) : (
        <Download className='w-4 h-4 mr-2' />
      )}
      {isExporting ? 'Exportation...' : 'Exporter PDF'}
    </Button>
  );
}
