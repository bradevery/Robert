'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';

interface EditingState {
  selectedSection?: string;
  selectedItem?: number;
  isEditing: boolean;
  showOverlay: boolean;
}

interface EditingContextType {
  editingState: EditingState;
  selectItem: (sectionId: string, itemIndex?: number) => void;
  deselectItem: () => void;
  isItemSelected: (sectionId: string, itemIndex?: number) => boolean;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

interface EditingProviderProps {
  children: ReactNode;
}

export const EditingProvider: React.FC<EditingProviderProps> = ({
  children,
}) => {
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    showOverlay: false,
  });

  const selectItem = (sectionId: string, itemIndex?: number) => {
    setEditingState({
      selectedSection: sectionId,
      selectedItem: itemIndex,
      isEditing: true,
      showOverlay: true,
    });
  };

  const deselectItem = () => {
    setEditingState({
      isEditing: false,
      showOverlay: false,
    });
  };

  const isItemSelected = (sectionId: string, itemIndex?: number) => {
    return (
      editingState.selectedSection === sectionId &&
      editingState.selectedItem === itemIndex
    );
  };

  return (
    <EditingContext.Provider
      value={{
        editingState,
        selectItem,
        deselectItem,
        isItemSelected,
      }}
    >
      {children}
    </EditingContext.Provider>
  );
};

export const useEditing = () => {
  const context = useContext(EditingContext);
  if (context === undefined) {
    throw new Error('useEditing must be used within an EditingProvider');
  }
  return context;
};
