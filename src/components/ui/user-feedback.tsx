'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  X,
} from 'lucide-react';
import React, { createContext, useCallback, useContext, useState } from 'react';

// Types pour le feedback
export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface FeedbackContextType {
  showFeedback: (message: Omit<FeedbackMessage, 'id'>) => void;
  hideFeedback: (id: string) => void;
  clearAll: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

// Provider pour le feedback
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const showFeedback = useCallback((message: Omit<FeedbackMessage, 'id'>) => {
    const id = `feedback_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newMessage: FeedbackMessage = {
      id,
      duration: 5000, // 5 secondes par défaut
      ...message,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Auto-hide après la durée spécifiée
    if (newMessage.duration && newMessage.duration > 0) {
      setTimeout(() => {
        hideFeedback(id);
      }, newMessage.duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hideFeedback = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback, clearAll }}>
      {children}
      <FeedbackContainer messages={messages} onHide={hideFeedback} />
    </FeedbackContext.Provider>
  );
}

// Hook pour utiliser le feedback
export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}

// Composant de conteneur pour les messages
function FeedbackContainer({
  messages,
  onHide,
}: {
  messages: FeedbackMessage[];
  onHide: (id: string) => void;
}) {
  return (
    <div className='fixed z-50 space-y-2 top-4 right-4'>
      <AnimatePresence>
        {messages.map((message) => (
          <FeedbackToast
            key={message.id}
            message={message}
            onHide={() => onHide(message.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Composant toast individuel
function FeedbackToast({
  message,
  onHide,
}: {
  message: FeedbackMessage;
  onHide: () => void;
}) {
  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className='w-5 h-5 text-green-600' />;
      case 'error':
        return <AlertCircle className='w-5 h-5 text-red-600' />;
      case 'warning':
        return <AlertTriangle className='w-5 h-5 text-yellow-600' />;
      case 'info':
        return <Info className='w-5 h-5 text-blue-600' />;
      case 'loading':
        return <Loader2 className='w-5 h-5 text-blue-600 animate-spin' />;
      default:
        return <Info className='w-5 h-5 text-gray-600' />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-blue-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className={`max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg p-4`}
    >
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0 mt-0.5'>{getIcon()}</div>

        <div className='flex-1 min-w-0'>
          <h4 className='text-sm font-medium text-gray-900'>{message.title}</h4>
          {message.message && (
            <p className='mt-1 text-sm text-gray-600'>{message.message}</p>
          )}

          {message.action && (
            <button
              onClick={message.action.onClick}
              className='mt-2 text-sm font-medium text-blue-600 hover:text-blue-700'
            >
              {message.action.label}
            </button>
          )}
        </div>

        <button
          onClick={onHide}
          className='flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600'
        >
          <X className='w-4 h-4' />
        </button>
      </div>
    </motion.div>
  );
}

// Composant de barre de progression
export function ProgressBar({
  progress,
  message,
  className = '',
}: {
  progress: number;
  message?: string;
  className?: string;
}) {
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <div
        className='h-1 transition-all duration-300 ease-out bg-blue-600'
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
      {message && (
        <div className='px-4 py-2 border-b border-blue-200 bg-blue-50'>
          <p className='text-sm text-blue-800'>{message}</p>
        </div>
      )}
    </div>
  );
}

// Hook pour la sauvegarde avec feedback
export function useSaveWithFeedback() {
  const { showFeedback } = useFeedback();
  const [isSaving, setIsSaving] = useState(false);

  const saveWithFeedback = useCallback(
    async (saveFunction: () => Promise<void>, customMessage?: string) => {
      setIsSaving(true);

      showFeedback({
        type: 'loading',
        title: 'Sauvegarde en cours...',
        message: 'Veuillez patienter',
        duration: 0, // Pas d'auto-hide pour le loading
      });

      try {
        await saveFunction();

        showFeedback({
          type: 'success',
          title: 'Sauvegardé avec succès',
          message: customMessage || 'Vos modifications ont été enregistrées',
          duration: 3000,
        });
      } catch (error) {
        showFeedback({
          type: 'error',
          title: 'Erreur de sauvegarde',
          message:
            error instanceof Error ? error.message : 'Une erreur est survenue',
          duration: 5000,
        });
      } finally {
        setIsSaving(false);
      }
    },
    [showFeedback]
  );

  return { saveWithFeedback, isSaving };
}

// Composant d'indicateur de statut
export function StatusIndicator({
  status,
  message,
}: {
  status: 'saved' | 'saving' | 'error' | 'dirty';
  message?: string;
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saved':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          defaultMessage: 'Sauvegardé',
        };
      case 'saving':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: Loader2,
          defaultMessage: 'Sauvegarde...',
        };
      case 'error':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertCircle,
          defaultMessage: 'Erreur de sauvegarde',
        };
      case 'dirty':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: AlertTriangle,
          defaultMessage: 'Modifications non sauvegardées',
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Info,
          defaultMessage: 'Statut inconnu',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}
    >
      <Icon
        className={`w-4 h-4 ${config.color} ${
          status === 'saving' ? 'animate-spin' : ''
        }`}
      />
      <span className={`text-sm font-medium ${config.color}`}>
        {message || config.defaultMessage}
      </span>
    </div>
  );
}
