'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, GripVertical, Lock, Trash2, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { SectionKey } from '@/lib/reactive-resume-schema';

import { useResumeStore } from '@/stores/resume-simple';

interface RearrangeSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SectionItemProps {
  section: {
    id: string;
    name: string;
    visible: boolean;
    itemCount?: number;
    isLocked?: boolean;
  };
  onToggleVisibility: (id: string) => void;
  onDeleteSection: (id: string) => void;
}

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  onToggleVisibility,
  onDeleteSection,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled: section.isLocked, // Disable dragging for locked sections
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center p-4 bg-white border-2 rounded-lg group transition-all
        ${
          isDragging
            ? 'opacity-50 shadow-lg border-blue-300'
            : 'border-gray-200 hover:border-gray-300'
        }
        ${!section.visible ? 'opacity-60' : ''}
      `}
      {...attributes}
      layout
    >
      {/* Drag Handle */}
      <div
        {...(section.isLocked ? {} : listeners)}
        className={`mr-3 p-1 transition-colors ${
          section.isLocked
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing'
        }`}
      >
        {section.isLocked ? (
          <Lock className='w-5 h-5' />
        ) : (
          <GripVertical className='w-5 h-5' />
        )}
      </div>

      {/* Section Info */}
      <div className='flex-1'>
        <div className='flex items-center gap-2'>
          <h4 className='font-medium text-gray-900'>{section.name}</h4>
          {section.isLocked && (
            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600'>
              Position fixe
            </span>
          )}
        </div>
        {section.itemCount !== undefined && (
          <p className='text-sm text-gray-500'>
            {section.itemCount} élément{section.itemCount !== 1 ? 's' : ''}
          </p>
        )}
        {section.isLocked && (
          <p className='text-xs text-gray-400 mt-1'>
            Cette section reste toujours en première position
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className='flex items-center gap-1'>
        {/* Delete Button */}
        <button
          onClick={() => onDeleteSection(section.id)}
          disabled={section.isLocked}
          className={`
            p-2 rounded-lg transition-colors
            ${
              section.isLocked
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-red-500 hover:bg-red-50'
            }
          `}
          title={
            section.isLocked
              ? 'Cette section ne peut pas être supprimée'
              : 'Supprimer cette section'
          }
        >
          <Trash2 className='w-4 h-4' />
        </button>

        {/* Visibility Toggle */}
        <button
          onClick={() => onToggleVisibility(section.id)}
          disabled={section.isLocked}
          className={`
            p-2 rounded-lg transition-colors
            ${
              section.isLocked
                ? 'text-gray-300 cursor-not-allowed'
                : section.visible
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-50'
            }
          `}
          title={
            section.isLocked
              ? 'Cette section ne peut pas être masquée'
              : section.visible
              ? 'Masquer cette section'
              : 'Afficher cette section'
          }
        >
          {section.visible ? (
            <Eye className='w-5 h-5' />
          ) : (
            <EyeOff className='w-5 h-5' />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export const RearrangeSectionsModal: React.FC<RearrangeSectionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { resume, setLayout, updateSectionVisibility, deleteSection } =
    useResumeStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get sections data
  const sectionsData = useMemo(() => {
    if (!resume?.data) return [];

    const sectionNames: Record<string, string> = {
      basics: 'Informations personnelles',
      summary: 'Résumé professionnel',
      experience: 'Expérience professionnelle',
      education: 'Formation',
      skills: 'Compétences',
      projects: 'Projets',
      awards: 'Récompenses',
      certifications: 'Certifications',
      publications: 'Publications',
      volunteer: 'Bénévolat',
      languages: 'Langues',
      interests: "Centres d'intérêt",
      references: 'Références',
      profiles: 'Profils sociaux',
    };

    const sections = [];

    // Always add basics first and locked
    sections.push({
      id: 'basics',
      name: sectionNames.basics,
      visible: true,
      isLocked: true,
      itemCount: 1, // Always has personal info
    });

    // Get current layout order (excluding basics)
    const currentLayout = resume.data.metadata?.layout?.[0] || [
      ['summary', 'experience', 'education'],
      ['skills', 'projects', 'languages'],
    ];

    // Flatten layout to get section order
    const sectionOrder = currentLayout.flat().filter((id) => id !== 'basics');

    // Add sections from layout
    sectionOrder.forEach((sectionId) => {
      if (resume.data.sections?.[sectionId]) {
        const section = resume.data.sections[sectionId];
        sections.push({
          id: sectionId,
          name: sectionNames[sectionId] || sectionId,
          visible: section?.visible !== false,
          itemCount: Array.isArray(section?.items)
            ? section.items.length
            : undefined,
          isLocked: false,
        });
      }
    });

    // Add any sections not in layout (excluding basics)
    if (resume.data.sections) {
      const allSectionKeys = Object.keys(resume.data.sections).filter(
        (key) => key !== 'basics'
      );
      const missingSections = allSectionKeys.filter(
        (key) => !sectionOrder.includes(key)
      );

      missingSections.forEach((sectionId) => {
        const section = resume.data.sections[sectionId];
        sections.push({
          id: sectionId,
          name: sectionNames[sectionId] || sectionId,
          visible: section?.visible !== false,
          itemCount: Array.isArray(section?.items)
            ? section.items.length
            : undefined,
          isLocked: false,
        });
      });
    }

    return sections;
  }, [resume]);

  const [sections, setSections] = useState(sectionsData);

  // Update sections when resume changes
  React.useEffect(() => {
    setSections(sectionsData);
    setHasChanges(false);
    console.log(
      '📋 Sections loaded:',
      sectionsData.map((s) => ({ id: s.id, name: s.name, locked: s.isLocked }))
    );
  }, [sectionsData]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);

    // Prevent moving items to position 0 (reserved for basics)
    if (newIndex === 0) return;

    // Prevent moving locked sections
    const draggedSection = sections.find((s) => s.id === active.id);
    if (draggedSection?.isLocked) return;

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);
      setHasChanges(true);

      // Update layout in store immediately (keeping basics in its own column)
      const reorderableSections = newSections.slice(1); // Remove basics
      const newOrder = reorderableSections.map((s) => s.id);

      // Create new layout with basics always first, then distribute other sections
      const newLayout = [
        ['basics'], // Always keep basics in first column
        newOrder.slice(0, Math.ceil(newOrder.length / 2)), // First half of other sections
        newOrder.slice(Math.ceil(newOrder.length / 2)), // Second half of other sections
      ].filter((column) => column.length > 0); // Remove empty columns

      setLayout([newLayout]);

      console.log('🔄 Sections reordered. New order:', newOrder);
      console.log('🏗️ New layout structure:', newLayout);
    }
  };

  const handleToggleVisibility = (sectionId: string) => {
    // Prevent hiding the basics section
    if (sectionId === 'basics') return;

    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      updateSectionVisibility(sectionId as SectionKey, !section.visible);
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, visible: !s.visible } : s
        )
      );
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    // Prevent deleting the basics section
    if (sectionId === 'basics') {
      console.warn('Cannot delete the basics section');
      return;
    }

    // Show confirmation dialog
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la section "${
          sections.find((s) => s.id === sectionId)?.name
        }" ? Cette action est irréversible.`
      )
    ) {
      // Delete from store (which also removes from layout)
      deleteSection(sectionId);

      // Update local sections state
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      setHasChanges(true);

      console.log(`🗑️ Section "${sectionId}" deleted from UI`);
    }
  };

  const activeSection = sections.find((section) => section.id === activeId);
  const visibleSectionsCount = sections.filter((s) => s.visible).length;

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
          className='bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Réorganiser les sections
              </h2>
              <p className='text-gray-600 mt-1'>
                Glissez-déposez pour réorganiser les sections. Les informations
                personnelles restent en première position.
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X className='w-6 h-6 text-gray-500' />
            </button>
          </div>

          {/* Stats */}
          <div className='px-6 py-4 bg-gray-50 border-b border-gray-200'>
            {hasChanges && (
              <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='flex items-center justify-center gap-2 text-blue-800'>
                  <div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse'></div>
                  <span className='text-sm font-medium'>
                    Modifications en cours...
                  </span>
                </div>
              </div>
            )}
            <div className='flex justify-center space-x-8 text-sm'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-900'>
                  {sections.length}
                </div>
                <div className='text-gray-600'>Sections totales</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {visibleSectionsCount}
                </div>
                <div className='text-gray-600'>Sections visibles</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-400'>
                  {sections.length - visibleSectionsCount}
                </div>
                <div className='text-gray-600'>Sections masquées</div>
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className='p-6 overflow-y-auto max-h-[60vh]'>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className='space-y-3'>
                  {sections.map((section) => (
                    <SectionItem
                      key={section.id}
                      section={section}
                      onToggleVisibility={handleToggleVisibility}
                      onDeleteSection={handleDeleteSection}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeSection ? (
                  <div className='flex items-center p-4 bg-white border-2 border-blue-300 rounded-lg shadow-lg'>
                    <GripVertical className='w-5 h-5 text-gray-400 mr-3' />
                    <div className='flex-1'>
                      <h4 className='font-medium text-gray-900'>
                        {activeSection.name}
                      </h4>
                      {activeSection.itemCount !== undefined && (
                        <p className='text-sm text-gray-500'>
                          {activeSection.itemCount} élément
                          {activeSection.itemCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
