'use client';

import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Switch } from '@/components/ui/switch';

interface FieldOption {
  id: string;
  label: string;
  visible: boolean;
}

interface EditableItemProps {
  itemId: string;
  sectionType: string;
  children: React.ReactNode;
  fields?: FieldOption[];
  onAddItem?: () => void;
  onDeleteItem?: () => void;
  onFieldToggle?: (fieldId: string, visible: boolean) => void;
  onContextMenu?: (event: React.MouseEvent, itemId: string) => void;
  className?: string;
  isEditing?: boolean;
}

export const EditableItem: React.FC<EditableItemProps> = ({
  itemId,
  _sectionType,
  children,
  fields = [],
  _onAddItem,
  _onDeleteItem,
  onFieldToggle,
  onContextMenu,
  className = '',
  _isEditing = false,
}) => {
  const [showFieldsDropdown, setShowFieldsDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const _handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (itemRef.current) {
      const _rect = itemRef.current.getBoundingClientRect();
      const buttonRect = (e.target as HTMLElement)
        .closest('button')
        ?.getBoundingClientRect();
      if (buttonRect) {
        setDropdownPosition({
          top: buttonRect.bottom + window.scrollY + 5,
          left: buttonRect.left + window.scrollX,
        });
      }
    }
    setShowFieldsDropdown(!showFieldsDropdown);
  };

  const handleFieldToggle = (fieldId: string, visible: boolean) => {
    onFieldToggle?.(fieldId, visible);
  };

  const _handleDropdownClose = () => {
    setShowFieldsDropdown(false);
  };

  const handleItemClick = (event: React.MouseEvent) => {
    // Show context menu on left-click
    console.log('Left-click on item:', itemId);

    // Only handle left mouse button clicks
    if (event.button !== 0) return;

    const target = event.target as HTMLElement;
    const isInteractiveElement =
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[contenteditable]') ||
      target.closest('.fixed'); // Avoid clicking on dropdowns

    // Only trigger on actual click events on the section itself
    if (!isInteractiveElement && event.type === 'click' && onContextMenu) {
      event.stopPropagation();
      console.log('Showing context menu for item:', itemId);
      onContextMenu(event, itemId);
    }
  };

  const handleItemContextMenu = (event: React.MouseEvent) => {
    // Prevent default right-click menu but don't show our menu
    event.preventDefault();
    event.stopPropagation();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowFieldsDropdown(false);
      }
    };

    if (showFieldsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFieldsDropdown]);

  return (
    <>
      <div
        ref={itemRef}
        className={`relative group ${className}`}
        onClick={handleItemClick}
        onContextMenu={handleItemContextMenu}
      >
        {children}
      </div>

      {/* Fields Dropdown */}
      {showFieldsDropdown && (
        <div
          ref={dropdownRef}
          className='fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200'
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            minWidth: '280px',
            maxWidth: '320px',
          }}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-100'>
            <h3 className='text-sm font-semibold text-gray-900'>
              Options d'affichage
            </h3>
            <ChevronDown className='w-4 h-4 text-gray-500' />
          </div>

          {/* Content */}
          <div className='p-4 max-h-80 overflow-y-auto'>
            <div className='space-y-3'>
              {fields.map((field) => (
                <div
                  key={field.id}
                  className='flex items-center justify-between py-1'
                >
                  <label
                    htmlFor={`field-${itemId}-${field.id}`}
                    className='text-sm text-gray-700 cursor-pointer flex-1'
                  >
                    {field.label}
                  </label>
                  <Switch
                    id={`field-${itemId}-${field.id}`}
                    checked={field.visible}
                    onCheckedChange={(checked) =>
                      handleFieldToggle(field.id, checked)
                    }
                  />
                </div>
              ))}
            </div>

            {/* Footer info */}
            <div className='mt-4 pt-3 border-t border-gray-100'>
              <p className='text-xs text-gray-500'>
                💡 Masquez les champs non pertinents pour ce poste
              </p>
            </div>
          </div>

          {/* Pointer triangle */}
          <div
            className='absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45'
            style={{
              top: '-6px',
              left: '24px',
            }}
          />
        </div>
      )}
    </>
  );
};
