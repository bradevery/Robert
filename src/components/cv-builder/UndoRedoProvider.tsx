'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Redo, Undo } from 'lucide-react';
import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from 'react';

import { Button } from '@/components/ui/button';

// Types pour l'historique
interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

type HistoryAction<T> =
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_STATE'; payload: T }
  | { type: 'CLEAR_HISTORY' };

// Reducer pour gérer l'historique
function historyReducer<T>(
  state: HistoryState<T>,
  action: HistoryAction<T>
): HistoryState<T> {
  switch (action.type) {
    case 'UNDO': {
      if (state.past.length === 0) return state;

      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;

      const next = state.future[0];
      const newFuture = state.future.slice(1);

      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    }

    case 'SET_STATE':
      return {
        past: [...state.past, state.present],
        present: action.payload,
        future: [],
      };

    case 'CLEAR_HISTORY':
      return {
        past: [],
        present: action.payload,
        future: [],
      };

    default:
      return state;
  }
}

// Context pour l'historique
interface UndoRedoContextType<T> {
  state: T;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  setState: (newState: T) => void;
  clearHistory: () => void;
}

const UndoRedoContext = createContext<UndoRedoContextType<any> | null>(null);

// Provider pour l'historique
interface UndoRedoProviderProps<T> {
  children: React.ReactNode;
  initialState: T;
  maxHistorySize?: number;
}

export function UndoRedoProvider<T>({
  children,
  initialState,
  maxHistorySize = 50,
}: UndoRedoProviderProps<T>) {
  const [historyState, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialState,
    future: [],
  });

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const setState = useCallback(
    (newState: T) => {
      // Limiter la taille de l'historique
      const currentPast = historyState.past;
      if (currentPast.length >= maxHistorySize) {
        // Supprimer le plus ancien élément
        const trimmedPast = currentPast.slice(1);
        dispatch({ type: 'CLEAR_HISTORY' });
        // Reconstruire l'historique avec la taille limitée
        trimmedPast.forEach((state) => {
          dispatch({ type: 'SET_STATE', payload: state });
        });
      }
      dispatch({ type: 'SET_STATE', payload: newState });
    },
    [historyState.past, maxHistorySize]
  );

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const contextValue: UndoRedoContextType<T> = {
    state: historyState.present,
    canUndo: historyState.past.length > 0,
    canRedo: historyState.future.length > 0,
    undo,
    redo,
    setState,
    clearHistory,
  };

  return (
    <UndoRedoContext.Provider value={contextValue}>
      {children}
    </UndoRedoContext.Provider>
  );
}

// Hook pour utiliser l'historique
export function useUndoRedo<T>(): UndoRedoContextType<T> {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedo must be used within an UndoRedoProvider');
  }
  return context;
}

// Composant pour les boutons Undo/Redo
interface UndoRedoButtonsProps {
  className?: string;
}

export function UndoRedoButtons({ className = '' }: UndoRedoButtonsProps) {
  const { canUndo, canRedo, undo, redo } = useUndoRedo();

  return (
    <div className={`undo-redo-buttons flex gap-1 ${className}`}>
      <Button
        variant='outline'
        size='sm'
        onClick={undo}
        disabled={!canUndo}
        title='Annuler (Ctrl+Z)'
      >
        <Undo className='w-4 h-4' />
      </Button>

      <Button
        variant='outline'
        size='sm'
        onClick={redo}
        disabled={!canRedo}
        title='Refaire (Ctrl+Y)'
      >
        <Redo className='w-4 h-4' />
      </Button>
    </div>
  );
}

// Hook pour gérer les raccourcis clavier
export function useUndoRedoKeyboard() {
  const { undo, redo } = useUndoRedo();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            event.preventDefault();
            redo();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
}
