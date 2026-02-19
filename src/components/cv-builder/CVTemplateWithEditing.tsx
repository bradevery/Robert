'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';

import { TemplateLayout1 } from '@/components/templates/TemplateLayout1';
import { TemplateType } from '@/components/templates/TemplateSelector';

import { useResumeStore } from '@/stores/resume-simple';
// Using custom button components instead of Button to avoid client/server issues

// Template simple pour affichage direct
interface CVTemplateWithEditingProps {
  resume: any;
  onUpdate: (field: string, value: string) => void;
  onEditingStateChange?: (isEditing: boolean) => void;
  onContextMenu?: (event: React.MouseEvent, itemId: string) => void;
  selectedTemplate?: TemplateType;
  designSettings?: {
    fontSize: number;
    lineSpacing: number;
    margins: number;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: string;
    borderRadius: number;
    shadowIntensity: number;
  };
}

// Template system with multiple CV layouts

export const CVTemplateWithEditing: React.FC<CVTemplateWithEditingProps> = ({
  resume,
  onUpdate,
  onEditingStateChange,
  _onContextMenu,
  _selectedTemplate = 'layout1',
  designSettings,
}) => {
  const { setValue } = useResumeStore();
  const [isAnyFieldEditing, setIsAnyFieldEditing] = useState(false);
  const [_editingItems, setEditingItems] = useState<Set<string>>(new Set());

  // Handle field updates directly
  const handleUpdate = (field: string, value: string) => {
    onUpdate(field, value);
  };

  // Global editing state management
  const handleEditStart = () => {
    setIsAnyFieldEditing(true);
    onEditingStateChange?.(true);
  };

  const handleEditEnd = () => {
    setIsAnyFieldEditing(false);
    onEditingStateChange?.(false);
    setEditingItems(new Set()); // Clear all editing items
  };

  // Item-specific editing management
  const _handleItemEditStart = (itemId: string) => {
    setEditingItems((prev) => new Set(prev).add(itemId));
    handleEditStart();
  };

  const _handleItemEditEnd = (itemId: string) => {
    setEditingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      if (newSet.size === 0) {
        handleEditEnd();
      }
      return newSet;
    });
  };

  // Handle Escape key to close editing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isAnyFieldEditing) {
        handleEditEnd();
      }
    };

    if (isAnyFieldEditing) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnyFieldEditing]);

  // Handle item actions
  const handleAddItem = (sectionId: string) => {
    console.log('Adding item to section:', sectionId);

    // Get current section data
    const currentSection = resume?.data?.sections?.[sectionId];
    const currentItems = currentSection?.items || [];

    // Create a new empty item based on section type
    let newItem: any = {};

    switch (sectionId) {
      case 'experience':
        newItem = {
          id: Date.now().toString(),
          position: '',
          workplace: '',
          description: '',
          location: '',
          startDate: '',
          endDate: '',
          link: '',
          highlights: [''],
          companyLogo: '',
        };
        break;
      case 'education':
        newItem = {
          id: Date.now().toString(),
          degree: '',
          institution: '',
          location: '',
          gpa: '',
          maxGpa: '',
          startDate: '',
          endDate: '',
          bullets: [''],
        };
        break;
      case 'projects':
      case 'activity':
        newItem = {
          id: Date.now().toString(),
          title: '',
          date: '',
          location: '',
          link: '',
          description: '',
          tags: [],
          bullets: [''],
        };
        break;
      case 'skills':
        newItem = {
          id: Date.now().toString(),
          name: '',
        };
        break;
      case 'languages':
        newItem = {
          id: Date.now().toString(),
          name: '',
          level: 0,
          levelText: '',
          fluency: '',
        };
        break;
      case 'courses':
        newItem = {
          id: Date.now().toString(),
          title: '',
          description: '',
        };
        break;
      case 'volunteer':
        newItem = {
          id: Date.now().toString(),
          role: '',
          institution: '',
          dateRange: '',
          description: '',
        };
        break;
      case 'achievement':
        newItem = {
          id: Date.now().toString(),
          title: '',
          description: '',
        };
        break;
      case 'talent':
        newItem = {
          id: Date.now().toString(),
          title: '',
        };
        break;
      case 'passion':
        newItem = {
          id: Date.now().toString(),
          title: '',
        };
        break;
      case 'social':
        newItem = {
          id: Date.now().toString(),
          title: '',
          link: '',
        };
        break;
      case 'certifications':
      case 'awards':
        newItem = {
          id: Date.now().toString(),
          title: '',
          issuer: '',
          date: '',
        };
        break;
      case 'publications':
        newItem = {
          id: Date.now().toString(),
          title: '',
          publisher: '',
          releaseDate: '',
        };
        break;
      case 'references':
        newItem = {
          id: Date.now().toString(),
          name: '',
          position: '',
          email: '',
        };
        break;
      default:
        newItem = {
          id: Date.now().toString(),
          title: '',
          description: '',
        };
    }

    // Add the new item to the section using setValue directly
    const updatedItems = [...currentItems, newItem];
    setValue(`data.sections.${sectionId}.items`, updatedItems);
  };

  const handleDeleteItem = (sectionId: string, itemIndex: number) => {
    console.log('Deleting item:', { sectionId, itemIndex });

    // Get current section data
    const currentSection = resume?.data?.sections?.[sectionId];
    const currentItems = currentSection?.items || [];

    // Remove the item at the specified index using setValue directly
    const updatedItems = currentItems.filter(
      (_: any, index: number) => index !== itemIndex
    );
    setValue(`data.sections.${sectionId}.items`, updatedItems);
  };

  const _handleFieldToggle = (
    sectionId: string,
    itemIndex: number,
    fieldId: string,
    visible: boolean
  ) => {
    console.log('Toggling field:', { sectionId, itemIndex, fieldId, visible });
    // TODO: Implement field visibility toggle
  };

  if (!resume) {
    return (
      <div className='flex items-center justify-center min-h-[600px]'>
        <div className='text-center'>
          <div className='w-12 h-12 mx-auto mb-4 border-b-2 border-blue-500 rounded-full animate-spin'></div>
          <p className='text-gray-600'>Chargement du CV...</p>
        </div>
      </div>
    );
  }

  const renderTemplate = () => {
    // Only Layout1 template available now
    return (
      <TemplateLayout1
        resume={resume}
        onUpdate={handleUpdate}
        onEditingStateChange={onEditingStateChange}
        handleAddItem={handleAddItem}
        handleDeleteItem={handleDeleteItem}
        designSettings={designSettings}
      />
    );
  };

  return (
    <div className='cv-template-editing'>
      {/* Only render the selected template - no template selector on CV page */}
      {renderTemplate()}
    </div>
  );
};
