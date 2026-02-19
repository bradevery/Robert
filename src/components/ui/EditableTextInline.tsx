'use client';

import React, { useEffect, useRef, useState } from 'react';

interface EditableTextInlineProps {
  value: string;
  field: string;
  className?: string;
  title: string;
  multiline?: boolean;
  placeholder?: string;
  onUpdate: (field: string, value: string) => void;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  itemId?: string;
  onItemEditStart?: (itemId: string) => void;
  onItemEditEnd?: (itemId: string) => void;
}

export const EditableTextInline: React.FC<EditableTextInlineProps> = ({
  value,
  field,
  className = '',
  title,
  multiline = false,
  placeholder = 'Cliquez pour ajouter',
  onUpdate,
  onEditStart,
  onEditEnd,
  itemId,
  onItemEditStart,
  onItemEditEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      } else {
        inputRef.current.setSelectionRange(0, inputRef.current.value.length);
      }
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(value);
    onEditStart?.();
    if (itemId && onItemEditStart) {
      onItemEditStart(itemId);
    }
  };

  const handleSave = () => {
    onUpdate(field, editValue);
    setIsEditing(false);
    onEditEnd?.();
    if (itemId && onItemEditEnd) {
      onItemEditEnd(itemId);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    onEditEnd?.();
    if (itemId && onItemEditEnd) {
      onItemEditEnd(itemId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Small delay to allow clicking save button
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 100);
  };

  if (isEditing) {
    return (
      <div className='relative z-50'>
        {/* Input */}
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`${className} !bg-transparent !border-0 !outline-0 !shadow-none !ring-0 !p-0 !m-0 resize-none w-full`}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              padding: '0',
              margin: '0',
            }}
            rows={3}
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type='text'
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`${className} !bg-transparent !border-0 !outline-0 !shadow-none !ring-0 !p-0 !m-0 w-full`}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              padding: '0',
              margin: '0',
            }}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  }

  return (
    <div className='relative' style={{ zIndex: isEditing ? 100 : 'auto' }}>
      <div
        className={`${className} cursor-pointer relative min-h-[1.5rem] ${
          !value ? 'text-gray-400' : ''
        }`}
        onClick={handleEdit}
        title={`Cliquer pour modifier: ${title}`}
      >
        {value || placeholder}
      </div>
    </div>
  );
};
