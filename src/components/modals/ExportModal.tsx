'use client';

import { Download, FileText, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossierId: string;
  dossierTitle: string;
}

type ExportFormat = 'pdf' | 'docx';

const EXPORT_OPTIONS: {
  format: ExportFormat;
  label: string;
  description: string;
}[] = [
  {
    format: 'pdf',
    label: 'PDF',
    description: "Format standard, idéal pour l'envoi par email",
  },
  {
    format: 'docx',
    label: 'Word (DOCX)',
    description: 'Format éditable, pour modifications ultérieures',
  },
];

export default function ExportModal({
  isOpen,
  onClose,
  dossierId,
  dossierTitle,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [includeConfidential, setIncludeConfidential] = useState(false);
  const [anonymize, setAnonymize] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/dossiers/${dossierId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: selectedFormat,
          includeConfidential,
          anonymize,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dossierTitle.replace(
        /[^a-z0-9]/gi,
        '_'
      )}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export réussi !');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-md p-6 mx-4 bg-white shadow-xl rounded-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl'>
              <Download className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-900'>Exporter</h2>
              <p className='text-sm text-gray-500 truncate max-w-[200px]'>
                {dossierTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Format Selection */}
        <div className='mb-6 space-y-3'>
          <label className='block text-sm font-medium text-gray-700'>
            Format d'export
          </label>
          {EXPORT_OPTIONS.map((option) => (
            <button
              key={option.format}
              onClick={() => setSelectedFormat(option.format)}
              className={`w-full p-4 text-left border-2 rounded-xl transition-colors ${
                selectedFormat === option.format
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className='flex items-center gap-3'>
                <FileText
                  className={`w-5 h-5 ${
                    selectedFormat === option.format
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                />
                <div>
                  <p
                    className={`font-medium ${
                      selectedFormat === option.format
                        ? 'text-blue-900'
                        : 'text-gray-900'
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className='text-sm text-gray-500'>{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Options */}
        <div className='mb-6 space-y-3'>
          <label className='block text-sm font-medium text-gray-700'>
            Options
          </label>

          <label className='flex items-center gap-3 p-3 bg-gray-50 cursor-pointer rounded-xl'>
            <input
              type='checkbox'
              checked={includeConfidential}
              onChange={(e) => setIncludeConfidential(e.target.checked)}
              className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
            />
            <div>
              <p className='text-sm font-medium text-gray-900'>
                Inclure informations confidentielles
              </p>
              <p className='text-xs text-gray-500'>
                Coordonnées, prétentions salariales...
              </p>
            </div>
          </label>

          <label className='flex items-center gap-3 p-3 bg-gray-50 cursor-pointer rounded-xl'>
            <input
              type='checkbox'
              checked={anonymize}
              onChange={(e) => setAnonymize(e.target.checked)}
              className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
            />
            <div>
              <p className='text-sm font-medium text-gray-900'>
                Anonymiser les candidats
              </p>
              <p className='text-xs text-gray-500'>Masquer noms et photos</p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
          <Button
            variant='outline'
            onClick={onClose}
            className='rounded-xl'
            disabled={isExporting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className='gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
          >
            {isExporting ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Download className='w-4 h-4' />
            )}
            Exporter
          </Button>
        </div>
      </div>
    </div>
  );
}
