'use client';

import { Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface EditableSectionItemProps {
  children: React.ReactNode;
  sectionId: string;
  itemIndex?: number;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  onEditingStateChange?: (isEditing: boolean) => void;
  onAddEntry?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  isSection?: boolean; // True for section-level editing
  onItemEditingStart?: (sectionId: string, itemId: string) => void;
  onItemEditingEnd?: () => void;
}

export const EditableSectionItem: React.FC<EditableSectionItemProps> = ({
  children,
  sectionId,
  itemIndex,
  className = '',
  onClick,
  onEditingStateChange,
  onAddEntry,
  onDelete,
  _onSettings,
  isSection = false,
  onItemEditingStart,
  onItemEditingEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const nextEditableRef = useRef<HTMLElement | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    const composedPath = (e.nativeEvent as MouseEvent).composedPath?.() ?? [];
    const isToolbarAction = composedPath.some((node) => {
      return (
        node instanceof HTMLElement && node.dataset?.sectionAction === 'true'
      );
    });
    if (isToolbarAction) {
      return;
    }

    onClick?.(e);
  };

  // Handle editing state changes
  useEffect(() => {
    if (!itemRef.current) return;

    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.contentEditable === 'true' &&
        itemRef.current?.contains(target)
      ) {
        nextEditableRef.current = null;
        setIsEditing(true);
        onEditingStateChange?.(true);

        // Notify parent about item editing start (only for item-level editing, not sections)
        if (!isSection && onItemEditingStart) {
          const itemId = itemIndex !== undefined ? `${itemIndex}` : 'default';
          onItemEditingStart(sectionId, itemId);
        }
      }
    };

    const handleFocusOut = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.contentEditable === 'true' &&
        itemRef.current?.contains(target)
      ) {
        const _relatedTarget = (e as FocusEvent)
          .relatedTarget as HTMLElement | null;
        setTimeout(() => {
          const activeElement = document.activeElement as HTMLElement;
          const pending = nextEditableRef.current;
          if (pending) {
            nextEditableRef.current = null;
            if (pending.isConnected) {
              pending.focus();
            }
          }

          const isStillEditingThisItem =
            itemRef.current?.contains(activeElement) &&
            activeElement.contentEditable === 'true';

          const isEditingAnotherField =
            activeElement?.contentEditable === 'true' &&
            !itemRef.current?.contains(activeElement);

          const isEditingInput =
            activeElement?.tagName === 'INPUT' ||
            activeElement?.tagName === 'TEXTAREA';

          if (
            !isStillEditingThisItem &&
            !isEditingAnotherField &&
            !isEditingInput
          ) {
            setIsEditing(false);
            onEditingStateChange?.(false);

            if (!isSection && onItemEditingEnd) {
              onItemEditingEnd();
            }
          }
        }, 50);
      }
    };

    const item = itemRef.current;
    item.addEventListener('focusin', handleFocusIn);
    item.addEventListener('focusout', handleFocusOut);

    return () => {
      item.removeEventListener('focusin', handleFocusIn);
      item.removeEventListener('focusout', handleFocusOut);
    };
  }, [
    onEditingStateChange,
    onItemEditingStart,
    onItemEditingEnd,
    isSection,
    sectionId,
    itemIndex,
  ]);

  return (
    <div
      ref={itemRef}
      className={`
        group relative transition-all duration-200
        ${!isEditing ? 'hover:bg-gray-50' : ''}
        ${isEditing ? 'bg-blue-50 border border-blue-200 rounded-lg p-2' : ''}
        ${className}
      `}
      onClick={handleClick}
      data-section-item={`${sectionId}-${itemIndex}`}
    >
      {/* Action Buttons - Only show for items (not sections) */}
      {!isSection && (
        <div className='absolute z-20 flex gap-1 transition-all opacity-0 pointer-events-none -right-2 -top-2 group-hover:opacity-100 group-hover:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto'>
          {/* Add Button */}
          {onAddEntry && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onAddEntry();
              }}
              data-section-action='true'
              className='p-1.5 transition-all rounded-md shadow-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400'
              aria-label='Ajouter un élément'
              title='Ajouter'
            >
              <Plus className='w-3.5 h-3.5' />
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              data-section-action='true'
              className='p-1.5 transition-all rounded-md shadow-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400'
              aria-label='Supprimer cet élément'
              title='Supprimer'
            >
              <Trash2 className='w-3.5 h-3.5' />
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
