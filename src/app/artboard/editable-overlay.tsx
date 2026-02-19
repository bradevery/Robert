'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Edit3, Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface EditableOverlayProps {
  isEditable: boolean;
  resume: any;
  onUpdate: (field: string, value: string) => void;
}

export const EditableOverlay: React.FC<EditableOverlayProps> = ({
  isEditable,
  resume,
  onUpdate,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editableElements, setEditableElements] = useState<
    Array<{
      id: string;
      field: string;
      value: string;
      rect: DOMRect;
      element: HTMLElement;
    }>
  >([]);

  useEffect(() => {
    if (!isEditable) return;

    // Scanner les éléments éditables dans le DOM
    const scanEditableElements = () => {
      const elements = document.querySelectorAll('[data-editable]');
      const newEditableElements: typeof editableElements = [];

      elements.forEach((element, index) => {
        const field = element.getAttribute('data-editable');
        if (field) {
          const rect = element.getBoundingClientRect();
          newEditableElements.push({
            id: `editable-${index}`,
            field,
            value: element.textContent || '',
            rect,
            element: element as HTMLElement,
          });
        }
      });

      setEditableElements(newEditableElements);
    };

    // Scanner initialement
    scanEditableElements();

    // Re-scanner quand la window est redimensionnée
    window.addEventListener('resize', scanEditableElements);

    // Observer les changements du DOM
    const observer = new MutationObserver(scanEditableElements);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      window.removeEventListener('resize', scanEditableElements);
      observer.disconnect();
    };
  }, [isEditable, resume]);

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSave = () => {
    if (editingField) {
      onUpdate(editingField, editValue);
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  if (!isEditable) return null;

  return (
    <>
      {/* Overlay pour les boutons d'édition */}
      {editableElements.map((element) => (
        <button
          key={element.id}
          className='absolute z-50 p-1 bg-blue-600 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 shadow-lg'
          style={{
            left: `${element.rect.right - 25}px`,
            top: `${element.rect.top - 5}px`,
          }}
          onClick={() => handleEdit(element.field, element.value)}
          title='Cliquer pour éditer'
        >
          <Edit3 className='w-3 h-3' />
        </button>
      ))}

      {/* Modal d'édition */}
      {editingField && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg p-6 w-96 shadow-xl'>
            <h3 className='text-lg font-semibold mb-4'>Modifier le contenu</h3>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {editingField.replace(/\./g, ' > ')}
              </label>
              {editingField.includes('summary') ||
              editingField.includes('description') ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  rows={4}
                  placeholder='Entrez votre texte...'
                />
              ) : (
                <input
                  type='text'
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Entrez votre texte...'
                />
              )}
            </div>

            <div className='flex justify-end space-x-3'>
              <button
                onClick={handleCancel}
                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
              >
                <X className='w-4 h-4 mr-2 inline' />
                Annuler
              </button>
              <button
                onClick={handleSave}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
              >
                <Save className='w-4 h-4 mr-2 inline' />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicator qu'on est en mode édition */}
      <div className='fixed top-4 right-4 z-40 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg'>
        ✏️ Mode édition - Survolez pour modifier
      </div>
    </>
  );
};
