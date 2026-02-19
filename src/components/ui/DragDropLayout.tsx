'use client';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useCallback, useState } from 'react';

import { SectionKey } from '@/lib/reactive-resume-schema';

interface DragDropLayoutProps {
  layout: SectionKey[][];
  onLayoutChange: (newLayout: SectionKey[][]) => void;
  availableSections: { id: SectionKey; name: string; visible: boolean }[];
  onToggleVisibility?: (sectionId: SectionKey) => void;
  className?: string;
}

interface SectionItemProps {
  section: { id: SectionKey; name: string; visible: boolean };
  isDragging?: boolean;
  onToggleVisibility?: (sectionId: SectionKey) => void;
}

// Composant pour un élément de section draggable
const SectionItem: React.FC<SectionItemProps> = ({
  section,
  isDragging = false,
  onToggleVisibility,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative bg-white border border-gray-200 rounded-lg p-3 cursor-grab
        hover:shadow-md transition-all duration-200
        ${isSortableDragging ? 'opacity-50 rotate-2 shadow-lg' : ''}
        ${isDragging ? 'opacity-0' : ''}
        ${!section.visible ? 'opacity-50 bg-gray-50' : ''}
      `}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <div className='w-3 h-3 bg-primary rounded-full opacity-60' />
          <span
            className={`text-sm font-medium ${
              !section.visible ? 'text-gray-400' : 'text-gray-700'
            }`}
          >
            {section.name}
          </span>
        </div>

        <div className='flex items-center space-x-1'>
          {/* Toggle visibility button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility?.(section.id);
            }}
            className={`
              w-5 h-5 rounded flex items-center justify-center transition-colors
              ${
                section.visible
                  ? 'text-green-600 hover:bg-green-50'
                  : 'text-gray-400 hover:bg-gray-50'
              }
            `}
            title={
              section.visible
                ? 'Masquer cette section'
                : 'Afficher cette section'
            }
          >
            {section.visible ? (
              <i className='ph ph-bold ph-eye text-xs' />
            ) : (
              <i className='ph ph-bold ph-eye-slash text-xs' />
            )}
          </button>

          {/* Drag handle */}
          <div className='text-gray-400 hover:text-gray-600 cursor-grab'>
            <i className='ph ph-bold ph-dots-six text-xs' />
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour une colonne de layout
interface ColumnProps {
  columnIndex: number;
  sections: SectionKey[];
  allSections: { id: SectionKey; name: string; visible: boolean }[];
  onToggleVisibility?: (sectionId: SectionKey) => void;
}

const Column: React.FC<ColumnProps> = ({
  columnIndex,
  sections,
  allSections,
  onToggleVisibility,
}) => {
  const columnId = `column-${columnIndex}`;

  const sectionItems = sections
    .map((sectionId) => allSections.find((s) => s.id === sectionId))
    .filter(Boolean) as { id: SectionKey; name: string; visible: boolean }[];

  return (
    <div className='bg-gray-50 rounded-xl p-4 min-h-[200px] border-2 border-dashed border-gray-200'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-medium text-gray-700'>Colonne {columnIndex + 1}</h3>
        <span className='text-xs text-gray-500 bg-white px-2 py-1 rounded'>
          {sections.length} section{sections.length !== 1 ? 's' : ''}
        </span>
      </div>

      <SortableContext
        items={sections}
        strategy={verticalListSortingStrategy}
        id={columnId}
      >
        <div className='space-y-2'>
          {sectionItems.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              onToggleVisibility={onToggleVisibility}
            />
          ))}

          {sections.length === 0 && (
            <div className='text-center py-8 text-gray-400'>
              <i className='ph ph-bold ph-plus-circle text-2xl mb-2 block' />
              <p className='text-sm'>Glissez des sections ici</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

// Composant principal DragDropLayout
export const DragDropLayout: React.FC<DragDropLayoutProps> = ({
  layout,
  onLayoutChange,
  availableSections,
  onToggleVisibility,
  className = '',
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedSection, setDraggedSection] = useState<{
    id: SectionKey;
    name: string;
    visible: boolean;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveId(event.active.id as string);
      const section = availableSections.find((s) => s.id === event.active.id);
      if (section) {
        setDraggedSection(section);
      }
    },
    [availableSections]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const _activeId = active.id as string;
    const overId = over.id as string;

    // Si on drag par-dessus une colonne
    if (overId.startsWith('column-')) {
      // Logique pour déplacer entre colonnes sera implémentée ici
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      setDraggedSection(null);

      if (!over) return;

      const _activeId = active.id as string;
      const overId = over.id as string;

      // Trouver dans quelle colonne est l'élément actif
      let sourceColumnIndex = -1;
      let sourceItemIndex = -1;

      layout.forEach((column, columnIndex) => {
        const itemIndex = column.indexOf(activeId as SectionKey);
        if (itemIndex !== -1) {
          sourceColumnIndex = columnIndex;
          sourceItemIndex = itemIndex;
        }
      });

      // Si on drag vers une colonne différente
      if (overId.startsWith('column-')) {
        const targetColumnIndex = parseInt(overId.split('-')[1]);

        if (
          sourceColumnIndex !== -1 &&
          sourceColumnIndex !== targetColumnIndex
        ) {
          const newLayout = [...layout];
          const [movedItem] = newLayout[sourceColumnIndex].splice(
            sourceItemIndex,
            1
          );
          newLayout[targetColumnIndex].push(movedItem);
          onLayoutChange(newLayout);
        }
      } else {
        // Réorganisation dans la même colonne
        if (sourceColumnIndex !== -1) {
          let targetColumnIndex = -1;
          let targetItemIndex = -1;

          layout.forEach((column, columnIndex) => {
            const itemIndex = column.indexOf(overId as SectionKey);
            if (itemIndex !== -1) {
              targetColumnIndex = columnIndex;
              targetItemIndex = itemIndex;
            }
          });

          if (
            targetColumnIndex !== -1 &&
            sourceColumnIndex === targetColumnIndex
          ) {
            const newLayout = [...layout];
            const reorderedColumn = arrayMove(
              newLayout[sourceColumnIndex],
              sourceItemIndex,
              targetItemIndex
            );
            newLayout[sourceColumnIndex] = reorderedColumn;
            onLayoutChange(newLayout);
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout, onLayoutChange]
  );

  const handleToggleVisibility = useCallback(
    (sectionId: SectionKey) => {
      onToggleVisibility?.(sectionId);
    },
    [onToggleVisibility]
  );

  return (
    <div className={`drag-drop-layout ${className}`}>
      <div className='mb-6'>
        <h2 className='text-lg font-semibold text-gray-800 mb-2'>
          Configuration du Layout
        </h2>
        <p className='text-sm text-gray-600'>
          Glissez et déposez les sections pour organiser votre CV. Utilisez
          l'œil pour afficher/masquer les sections.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {layout.map((column, columnIndex) => (
            <Column
              key={columnIndex}
              columnIndex={columnIndex}
              sections={column}
              allSections={availableSections}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId && draggedSection ? (
            <SectionItem section={draggedSection} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Actions */}
      <div className='mt-6 flex justify-between items-center'>
        <div className='flex space-x-2'>
          <button
            onClick={() => {
              // Ajouter une nouvelle colonne
              const newLayout = [...layout, []];
              onLayoutChange(newLayout);
            }}
            className='px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
          >
            <i className='ph ph-bold ph-plus mr-1' />
            Ajouter colonne
          </button>

          {layout.length > 1 && (
            <button
              onClick={() => {
                // Supprimer la dernière colonne (et redistribuer ses sections)
                const newLayout = [...layout];
                const lastColumn = newLayout.pop() || [];
                if (newLayout.length > 0) {
                  newLayout[0].push(...lastColumn);
                }
                onLayoutChange(newLayout);
              }}
              className='px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              <i className='ph ph-bold ph-minus mr-1' />
              Supprimer colonne
            </button>
          )}
        </div>

        <div className='text-xs text-gray-500'>
          {layout.reduce((total, column) => total + column.length, 0)} sections
          au total
        </div>
      </div>
    </div>
  );
};
