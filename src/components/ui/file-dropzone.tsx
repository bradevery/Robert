'use client';

import { CheckCircle, UploadCloud, X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

function validateFile(file: File, maxSize: number): string | null {
  if (!ACCEPTED_MIME.includes(file.type)) {
    return 'Format non supporté. Utilisez PDF, DOC, DOCX ou TXT.';
  }
  if (file.size > maxSize) {
    return `Fichier trop volumineux. Taille max: ${Math.round(
      maxSize / (1024 * 1024)
    )} Mo.`;
  }
  return null;
}

interface FileDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  placeholder?: string;
  accept?: string;
  maxSize?: number;
  /** Accent color for hover/active states */
  accent?: 'blue' | 'purple' | 'orange';
}

export function FileDropzone({
  file,
  onFileChange,
  disabled = false,
  placeholder = 'Glissez-déposez ou cliquez pour importer',
  accept = '.pdf,.doc,.docx,.txt',
  maxSize = MAX_FILE_SIZE_BYTES,
  accent = 'blue',
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accentClasses = {
    blue: {
      drag: 'border-blue-500 bg-blue-50/50',
      selected: 'border-green-300 bg-green-50/30',
      idle: 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30',
      icon: 'bg-blue-100 text-blue-600',
      iconSelected: 'bg-green-100 text-green-600',
    },
    purple: {
      drag: 'border-purple-500 bg-purple-50/50',
      selected: 'border-green-300 bg-green-50/30',
      idle: 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30',
      icon: 'bg-purple-100 text-purple-600',
      iconSelected: 'bg-green-100 text-green-600',
    },
    orange: {
      drag: 'border-orange-500 bg-orange-50/50',
      selected: 'border-green-300 bg-green-50/30',
      idle: 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30',
      icon: 'bg-orange-100 text-orange-600',
      iconSelected: 'bg-green-100 text-green-600',
    },
  }[accent];

  const handleFileSelect = useCallback(
    (f: File) => {
      const error = validateFile(f, maxSize);
      if (error) {
        toast.error(error);
        return;
      }
      onFileChange(f);
    },
    [maxSize, onFileChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFileSelect(files[0]);
      // Reset input so same file can be re-selected
      e.target.value = '';
    },
    [handleFileSelect]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFileChange(null);
    },
    [onFileChange]
  );

  const borderClass = isDragging
    ? accentClasses.drag
    : file
    ? accentClasses.selected
    : accentClasses.idle;

  return (
    <div className='relative group'>
      <div
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : () => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[120px] ${borderClass} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <input
          ref={inputRef}
          type='file'
          accept={accept}
          onChange={handleInputChange}
          className='hidden'
          disabled={disabled}
        />

        {file ? (
          <>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${accentClasses.iconSelected}`}
            >
              <CheckCircle className='w-5 h-5' />
            </div>
            <p className='text-sm font-semibold text-gray-900 truncate max-w-[90%]'>
              {file.name}
            </p>
            <p className='text-xs text-gray-500 mt-0.5'>
              {formatFileSize(file.size)}
            </p>
          </>
        ) : (
          <>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${accentClasses.icon}`}
            >
              <UploadCloud className='w-5 h-5' />
            </div>
            <p className='text-sm font-medium text-gray-700'>{placeholder}</p>
            <p className='text-xs text-gray-400 mt-1'>
              PDF, DOC, DOCX, TXT &middot; Max{' '}
              {Math.round(maxSize / (1024 * 1024))} Mo
            </p>
          </>
        )}
      </div>

      {file && !disabled && (
        <button
          type='button'
          onClick={handleClear}
          className='absolute top-2 right-2 p-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all'
        >
          <X className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}
