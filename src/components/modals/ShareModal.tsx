'use client';

import {
  Calendar,
  Check,
  Copy,
  Eye,
  Link2,
  Loader2,
  Lock,
  X,
} from 'lucide-react';
import { useCallback, useReducer } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossierId: string;
  dossierTitle: string;
}

interface ShareState {
  isGenerating: boolean;
  shareUrl: string | null;
  copied: boolean;
  enablePassword: boolean;
  password: string;
  enableExpiration: boolean;
  expirationDays: number;
  enableViewLimit: boolean;
  viewLimit: number;
}

type ShareAction =
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_SHARE_URL'; payload: string | null }
  | { type: 'SET_COPIED'; payload: boolean }
  | { type: 'TOGGLE_PASSWORD' }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'TOGGLE_EXPIRATION' }
  | { type: 'SET_EXPIRATION_DAYS'; payload: number }
  | { type: 'TOGGLE_VIEW_LIMIT' }
  | { type: 'SET_VIEW_LIMIT'; payload: number }
  | { type: 'RESET' };

const initialState: ShareState = {
  isGenerating: false,
  shareUrl: null,
  copied: false,
  enablePassword: false,
  password: '',
  enableExpiration: true,
  expirationDays: 7,
  enableViewLimit: false,
  viewLimit: 10,
};

function shareReducer(state: ShareState, action: ShareAction): ShareState {
  switch (action.type) {
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_SHARE_URL':
      return { ...state, shareUrl: action.payload };
    case 'SET_COPIED':
      return { ...state, copied: action.payload };
    case 'TOGGLE_PASSWORD':
      return { ...state, enablePassword: !state.enablePassword, password: '' };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'TOGGLE_EXPIRATION':
      return { ...state, enableExpiration: !state.enableExpiration };
    case 'SET_EXPIRATION_DAYS':
      return { ...state, expirationDays: action.payload };
    case 'TOGGLE_VIEW_LIMIT':
      return { ...state, enableViewLimit: !state.enableViewLimit };
    case 'SET_VIEW_LIMIT':
      return { ...state, viewLimit: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const EXPIRATION_OPTIONS = [
  { value: 1, label: '1 jour' },
  { value: 3, label: '3 jours' },
  { value: 7, label: '7 jours' },
  { value: 14, label: '14 jours' },
  { value: 30, label: '30 jours' },
];

export default function ShareModal({
  isOpen,
  onClose,
  dossierId,
  dossierTitle,
}: ShareModalProps) {
  const [state, dispatch] = useReducer(shareReducer, initialState);

  const handleClose = useCallback(() => {
    dispatch({ type: 'RESET' });
    onClose();
  }, [onClose]);

  const handleGenerateLink = async () => {
    dispatch({ type: 'SET_GENERATING', payload: true });
    try {
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dossierId,
          password: state.enablePassword ? state.password : null,
          expiresInDays: state.enableExpiration ? state.expirationDays : null,
          viewLimit: state.enableViewLimit ? state.viewLimit : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }

      const data = await response.json();
      dispatch({ type: 'SET_SHARE_URL', payload: data.shareUrl });
      toast.success('Lien de partage créé !');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Erreur lors de la création du lien');
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  };

  const handleCopyLink = async () => {
    if (!state.shareUrl) return;

    try {
      await navigator.clipboard.writeText(state.shareUrl);
      dispatch({ type: 'SET_COPIED', payload: true });
      toast.success('Lien copié !');
      setTimeout(() => dispatch({ type: 'SET_COPIED', payload: false }), 2000);
    } catch {
      toast.error('Erreur lors de la copie');
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-md p-6 mx-4 bg-white shadow-xl rounded-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl'>
              <Link2 className='w-5 h-5 text-indigo-600' />
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-900'>Partager</h2>
              <p className='text-sm text-gray-500 truncate max-w-[200px]'>
                {dossierTitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className='p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Share URL Display */}
        {state.shareUrl && (
          <div className='p-4 mb-6 border border-green-200 bg-green-50 rounded-xl'>
            <div className='flex items-center gap-2 mb-2'>
              <Check className='w-4 h-4 text-green-600' />
              <span className='text-sm font-medium text-green-800'>
                Lien créé avec succès
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='text'
                value={state.shareUrl}
                readOnly
                className='flex-1 px-3 py-2 text-sm bg-white border border-green-200 rounded-lg'
              />
              <Button
                onClick={handleCopyLink}
                size='sm'
                className='gap-1 text-white bg-green-600 hover:bg-green-700'
              >
                {state.copied ? (
                  <Check className='w-4 h-4' />
                ) : (
                  <Copy className='w-4 h-4' />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Options */}
        <div className='mb-6 space-y-4'>
          <label className='block text-sm font-medium text-gray-700'>
            Options de partage
          </label>

          {/* Password Protection */}
          <div className='p-4 bg-gray-50 rounded-xl'>
            <label className='flex items-center gap-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={state.enablePassword}
                onChange={() => dispatch({ type: 'TOGGLE_PASSWORD' })}
                className='w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500'
              />
              <div className='flex items-center gap-2'>
                <Lock className='w-4 h-4 text-gray-500' />
                <span className='text-sm font-medium text-gray-900'>
                  Protéger par mot de passe
                </span>
              </div>
            </label>
            {state.enablePassword && (
              <input
                type='text'
                value={state.password}
                onChange={(e) =>
                  dispatch({ type: 'SET_PASSWORD', payload: e.target.value })
                }
                placeholder='Entrer un mot de passe'
                className='w-full px-3 py-2 mt-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              />
            )}
          </div>

          {/* Expiration */}
          <div className='p-4 bg-gray-50 rounded-xl'>
            <label className='flex items-center gap-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={state.enableExpiration}
                onChange={() => dispatch({ type: 'TOGGLE_EXPIRATION' })}
                className='w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500'
              />
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-gray-500' />
                <span className='text-sm font-medium text-gray-900'>
                  Date d'expiration
                </span>
              </div>
            </label>
            {state.enableExpiration && (
              <select
                value={state.expirationDays}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_EXPIRATION_DAYS',
                    payload: Number(e.target.value),
                  })
                }
                className='w-full px-3 py-2 mt-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              >
                {EXPIRATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* View Limit */}
          <div className='p-4 bg-gray-50 rounded-xl'>
            <label className='flex items-center gap-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={state.enableViewLimit}
                onChange={() => dispatch({ type: 'TOGGLE_VIEW_LIMIT' })}
                className='w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500'
              />
              <div className='flex items-center gap-2'>
                <Eye className='w-4 h-4 text-gray-500' />
                <span className='text-sm font-medium text-gray-900'>
                  Limiter les vues
                </span>
              </div>
            </label>
            {state.enableViewLimit && (
              <div className='flex items-center gap-2 mt-3'>
                <input
                  type='number'
                  value={state.viewLimit}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_VIEW_LIMIT',
                      payload: Number(e.target.value),
                    })
                  }
                  min={1}
                  max={100}
                  className='w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
                <span className='text-sm text-gray-500'>vues maximum</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
          <Button
            variant='outline'
            onClick={handleClose}
            className='rounded-xl'
            disabled={state.isGenerating}
          >
            Fermer
          </Button>
          <Button
            onClick={handleGenerateLink}
            disabled={
              state.isGenerating || (state.enablePassword && !state.password)
            }
            className='gap-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl'
          >
            {state.isGenerating ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Link2 className='w-4 h-4' />
            )}
            {state.shareUrl ? 'Régénérer le lien' : 'Générer le lien'}
          </Button>
        </div>
      </div>
    </div>
  );
}
