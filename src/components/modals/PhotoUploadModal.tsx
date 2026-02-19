'use client';
/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Trash2, Upload, User, X } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUpload?: (photoUrl: string, shape?: 'round' | 'rectangle') => void;
  currentPhoto?: string;
  currentShape?: 'round' | 'rectangle';
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onPhotoUpload,
  currentPhoto,
  currentShape = 'round',
}) => {
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(
    currentPhoto || null
  );
  const [selectedShape, setSelectedShape] = useState<'round' | 'rectangle'>(
    currentShape
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      alert('Le fichier est trop volumineux. La taille maximale est de 10MB.');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedPhoto(result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSavePhoto = () => {
    if (uploadedPhoto) {
      onPhotoUpload?.(uploadedPhoto, selectedShape);
      onClose();
    }
  };

  const handleRemovePhoto = () => {
    setUploadedPhoto(null);
    onPhotoUpload?.('');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className='bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-100'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Uploader une photo
              </h2>
              <p className='text-gray-500 mt-1 text-sm'>
                Ajoutez une photo professionnelle à votre CV
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X className='w-5 h-5 text-gray-400' />
            </button>
          </div>

          {/* Content */}
          <div className='p-6'>
            {/* Current Photo Display */}
            <div className='flex justify-center mb-6'>
              <div className='relative'>
                {uploadedPhoto ? (
                  <div className='relative group'>
                    <img
                      src={uploadedPhoto}
                      alt='Photo de profil'
                      className={`w-32 h-32 object-cover border-4 border-gray-200 ${
                        selectedShape === 'round'
                          ? 'rounded-full'
                          : 'rounded-lg'
                      }`}
                    />
                    <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all'>
                      <div className='opacity-0 group-hover:opacity-100 flex space-x-2'>
                        <button
                          onClick={openFileDialog}
                          className='p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors'
                          title='Modifier'
                        >
                          <Camera className='w-4 h-4 text-gray-600' />
                        </button>
                        <button
                          onClick={handleRemovePhoto}
                          className='p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors'
                          title='Supprimer'
                        >
                          <Trash2 className='w-4 h-4 text-red-600' />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-32 h-32 bg-gray-100 border-4 border-gray-200 flex items-center justify-center ${
                      selectedShape === 'round' ? 'rounded-full' : 'rounded-lg'
                    }`}
                  >
                    <User className='w-12 h-12 text-gray-400' />
                  </div>
                )}
              </div>
            </div>

            {/* Upload Area */}
            {!uploadedPhoto && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                  ${
                    isDragOver
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
                onClick={openFileDialog}
              >
                {isUploading ? (
                  <div className='flex flex-col items-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2'></div>
                    <p className='text-gray-600'>Téléchargement en cours...</p>
                  </div>
                ) : (
                  <div className='flex flex-col items-center'>
                    <Upload className='w-12 h-12 text-gray-400 mb-3' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      Glissez-déposez votre photo ici
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      ou cliquez pour sélectionner un fichier
                    </p>
                    <div className='flex items-center space-x-4 text-sm text-gray-500'>
                      <span>Formats acceptés: JPG, PNG, JPEG</span>
                      <span>•</span>
                      <span>Max. 10MB</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shape Selection */}
            <div className='mb-6'>
              <h4 className='font-medium text-gray-900 mb-3'>
                Forme de la photo
              </h4>
              <div className='flex space-x-4'>
                <button
                  onClick={() => setSelectedShape('round')}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                    selectedShape === 'round'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='w-12 h-12 bg-gray-300 rounded-full mb-2'></div>
                  <span className='text-sm font-medium'>Ronde</span>
                </button>
                <button
                  onClick={() => setSelectedShape('rectangle')}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                    selectedShape === 'rectangle'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='w-12 h-12 bg-gray-300 rounded-lg mb-2'></div>
                  <span className='text-sm font-medium'>Rectangulaire</span>
                </button>
              </div>
            </div>

            {/* Options when photo is uploaded */}
            {uploadedPhoto && (
              <div className='space-y-4'>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <h4 className='font-medium text-gray-900 mb-3'>
                    Options de la photo
                  </h4>
                  <div className='grid grid-cols-2 gap-3'>
                    <button
                      onClick={openFileDialog}
                      className='flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <Camera className='w-4 h-4 mr-2 text-gray-600' />
                      <span className='text-sm font-medium'>Modifier</span>
                    </button>
                    <button
                      onClick={handleRemovePhoto}
                      className='flex items-center justify-center px-4 py-3 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors'
                    >
                      <Trash2 className='w-4 h-4 mr-2' />
                      <span className='text-sm font-medium'>Supprimer</span>
                    </button>
                  </div>
                </div>

                <div className='bg-blue-50 rounded-lg p-4'>
                  <div className='flex items-start'>
                    <div className='flex-shrink-0'>
                      <div className='w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center'>
                        <span className='text-blue-600 text-xs font-bold'>
                          💡
                        </span>
                      </div>
                    </div>
                    <div className='ml-3'>
                      <h4 className='text-sm font-medium text-blue-800 mb-1'>
                        Conseils pour une photo professionnelle
                      </h4>
                      <ul className='text-xs text-blue-700 space-y-1'>
                        <li>• Utilisez un arrière-plan neutre</li>
                        <li>• Regardez directement l'objectif</li>
                        <li>• Portez une tenue professionnelle</li>
                        <li>• Assurez-vous que l'éclairage est bon</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleFileInputChange}
              className='hidden'
            />
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50'>
            <div className='text-sm text-gray-600'>
              {uploadedPhoto ? (
                <span className='text-green-600 font-medium'>
                  ✓ Photo prête à être enregistrée
                </span>
              ) : (
                'Aucune photo sélectionnée'
              )}
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={onClose}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Annuler
              </button>
              {uploadedPhoto ? (
                <button
                  onClick={handleSavePhoto}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                >
                  Enregistrer
                </button>
              ) : (
                <button
                  onClick={openFileDialog}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
                >
                  Choisir une photo
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
