'use client';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Section {
  id: string;
  title: string;
  visible: boolean;
  type: string;
}

interface SortableSectionProps {
  section: Section;
  onToggleVisibility: (sectionId: string) => void;
}

function SortableSection({
  section,
  onToggleVisibility,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 mb-2 bg-white shadow-sm ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='sm'
            {...attributes}
            {...listeners}
            className='cursor-grab active:cursor-grabbing'
          >
            <GripVertical className='w-4 h-4 text-gray-400' />
          </Button>

          <div>
            <h3 className='font-medium text-gray-900'>{section.title}</h3>
            <p className='text-sm text-gray-500 capitalize'>{section.type}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onToggleVisibility(section.id)}
            className={section.visible ? 'text-green-600' : 'text-gray-400'}
          >
            {section.visible ? (
              <Eye className='w-4 h-4' />
            ) : (
              <EyeOff className='w-4 h-4' />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SectionDragDropProps {
  sections: Section[];
  onReorder: (sections: Section[]) => void;
  onToggleVisibility: (sectionId: string) => void;
  className?: string;
}

export const SectionDragDrop: React.FC<SectionDragDropProps> = ({
  sections,
  onReorder,
  onToggleVisibility,
  className = '',
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(
        (section) => section.id === active.id
      );
      const newIndex = sections.findIndex((section) => section.id === over?.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      onReorder(newSections);
    }
  }

  return (
    <div className={`section-drag-drop ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Organiser les sections</CardTitle>
          <p className='text-sm text-gray-600'>
            Glissez-déposez pour réorganiser l'ordre des sections de votre CV
          </p>
        </CardHeader>

        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((section) => section.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-2'>
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    onToggleVisibility={onToggleVisibility}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {sections.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <p>Aucune section à organiser</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
