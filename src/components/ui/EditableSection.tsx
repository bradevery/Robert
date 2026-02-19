'use client';

import React, { useRef, useState } from 'react';

import { OptionsMenu } from './OptionsMenu';
import { SectionFieldsPopup } from './SectionFieldsPopup';
import { SectionFloatingToolbar } from './SectionFloatingToolbar';

interface FieldOption {
  id: string;
  label: string;
  visible: boolean;
}

interface EditableSectionProps {
  sectionId: string;
  sectionType: string;
  sectionTitle: string;
  children: React.ReactNode;
  fields?: FieldOption[];
  onAddItem?: () => void;
  onToggleCollapse?: () => void;
  onDeleteSection?: () => void;
  onFieldToggle?: (fieldId: string, visible: boolean) => void;
  className?: string;
}

export const EditableSection: React.FC<EditableSectionProps> = ({
  sectionId,
  sectionType,
  sectionTitle,
  children,
  fields = [],
  onAddItem,
  onToggleCollapse,
  onDeleteSection,
  onFieldToggle,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFieldsPopup, setShowFieldsPopup] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, right: 0 });
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [optionsPosition, setOptionsPosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    updateToolbarPosition();
  };

  const handleMouseLeave = () => {
    // Small delay to allow toolbar interaction
    setTimeout(() => {
      if (!showFieldsPopup) {
        setIsHovered(false);
      }
    }, 100);
  };

  const updateToolbarPosition = () => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top + window.scrollY - 10,
        right: window.innerWidth - rect.right + 10,
      });
    }
  };

  const handleSectionSettings = () => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.top + window.scrollY + 40,
        left: rect.left + window.scrollX,
      });
    }
    setShowFieldsPopup(true);
  };

  const handleTextOptions = () => {
    handleSectionSettings(); // For now, both open the same popup
  };

  const handleDateOptions = () => {
    console.log('Date options clicked for section:', sectionId);
    // Implement date-specific options later
  };

  const handleFieldToggle = (fieldId: string, visible: boolean) => {
    onFieldToggle?.(fieldId, visible);
  };

  const handlePopupClose = () => {
    setShowFieldsPopup(false);
    setIsHovered(false);
  };

  const handleSectionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setOptionsPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setShowOptionsMenu(true);
  };

  const handleOptionsMenuClose = () => {
    setShowOptionsMenu(false);
  };

  const handleAddEntry = () => {
    onAddItem?.();
  };

  const handleAddDate = () => {
    handleDateOptions();
  };

  const handleDuplicate = () => {
    console.log('Duplicate section:', sectionId);
    // Implement duplicate logic
  };

  const handleMoveUp = () => {
    console.log('Move up section:', sectionId);
    // Implement move up logic
  };

  const handleMoveDown = () => {
    console.log('Move down section:', sectionId);
    // Implement move down logic
  };

  return (
    <>
      <div
        ref={sectionRef}
        className={`relative group ${className} cursor-pointer`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleSectionClick}
      >
        {children}

        <SectionFloatingToolbar
          isVisible={isHovered}
          sectionId={sectionId}
          sectionType={sectionType}
          onAddItem={onAddItem || (() => console.log('Add item:', sectionId))}
          onToggleCollapse={
            onToggleCollapse ||
            (() => console.log('Toggle collapse:', sectionId))
          }
          onTextOptions={handleTextOptions}
          onDateOptions={handleDateOptions}
          onDeleteSection={
            onDeleteSection || (() => console.log('Delete section:', sectionId))
          }
          onSectionSettings={handleSectionSettings}
          position={toolbarPosition}
        />
      </div>

      <SectionFieldsPopup
        isOpen={showFieldsPopup}
        onClose={handlePopupClose}
        sectionType={sectionType}
        sectionTitle={sectionTitle}
        fields={fields}
        onFieldToggle={handleFieldToggle}
        position={popupPosition}
      />

      <OptionsMenu
        isOpen={showOptionsMenu}
        onClose={handleOptionsMenuClose}
        onAddEntry={handleAddEntry}
        onAddDate={handleAddDate}
        onDelete={
          onDeleteSection || (() => console.log('Delete section:', sectionId))
        }
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onDuplicate={handleDuplicate}
        position={optionsPosition}
        sectionType={sectionType}
      />
    </>
  );
};
