'use client';

import {
  Filter,
  Kanban,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useReducer, useState } from 'react';
import toast from 'react-hot-toast';

import type { Availability, CandidateStatus } from '@/lib/design-tokens';

import {
  CandidateCard,
  CandidateList,
} from '@/components/candidates/CandidateCard';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import LoadingState from '@/components/ui/loading-state';

import {
  type Candidate,
  useCandidatesStore,
  useFilteredCandidates,
} from '@/stores/candidates-store';

// Modal state reducer
interface ModalState {
  isOpen: boolean;
  isSubmitting: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  location: string;
  tjm: string;
  yearsExperience: string;
  availability: Availability;
  skills: string;
  remotePreference: 'onsite' | 'hybrid' | 'full-remote';
}

type ModalAction =
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_FIELD'; field: keyof ModalState; value: string | boolean }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'RESET' };

const initialModalState: ModalState = {
  isOpen: false,
  isSubmitting: false,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  title: '',
  location: '',
  tjm: '',
  yearsExperience: '',
  availability: 'immediate',
  skills: '',
  remotePreference: 'hybrid',
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { ...state, isOpen: true };
    case 'CLOSE_MODAL':
      return initialModalState;
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.value };
    case 'RESET':
      return initialModalState;
    default:
      return state;
  }
}

type ViewMode = 'grid' | 'list' | 'kanban';

const statusOptions: { value: CandidateStatus; label: string }[] = [
  { value: 'new', label: 'Nouveau' },
  { value: 'contacted', label: 'Contacté' },
  { value: 'qualified', label: 'Qualifié' },
  { value: 'proposed', label: 'Proposé' },
  { value: 'placed', label: 'Placé' },
];

const availabilityOptions: { value: Availability; label: string }[] = [
  { value: 'immediate', label: 'Immédiate' },
  { value: '1month', label: '1 mois' },
  { value: '3months', label: '3 mois' },
];

function KanbanBoard({ candidates }: { candidates: Candidate[] }) {
  const columns: { status: CandidateStatus; label: string; color: string }[] = [
    { status: 'new', label: 'Nouveau', color: 'border-blue-200 bg-blue-50/50' },
    {
      status: 'contacted',
      label: 'Contacté',
      color: 'border-purple-200 bg-purple-50/50',
    },
    {
      status: 'qualified',
      label: 'Qualifié',
      color: 'border-green-200 bg-green-50/50',
    },
    {
      status: 'proposed',
      label: 'Proposé',
      color: 'border-orange-200 bg-orange-50/50',
    },
    {
      status: 'placed',
      label: 'Placé',
      color: 'border-emerald-200 bg-emerald-50/50',
    },
  ];

  return (
    <div className='flex gap-4 overflow-x-auto pb-4'>
      {columns.map((column) => {
        const columnCandidates = candidates.filter(
          (c) => c.status === column.status
        );
        return (
          <div
            key={column.status}
            className={`flex-shrink-0 w-80 rounded-xl border-2 ${column.color}`}
          >
            <div className='p-3 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-gray-900'>{column.label}</h3>
                <span className='px-2 py-0.5 text-xs font-medium text-gray-600 bg-white rounded-full'>
                  {columnCandidates.length}
                </span>
              </div>
            </div>
            <div className='p-2 space-y-2 min-h-[400px]'>
              {columnCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  className='!rounded-xl'
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MesCandidatsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [modalState, dispatchModal] = useReducer(
    modalReducer,
    initialModalState
  );

  const {
    filter,
    setFilter,
    resetFilter,
    createCandidateAPI,
    fetchCandidates,
    loading,
  } = useCandidatesStore();
  const filteredCandidates = useFilteredCandidates();

  useEffect(() => {
    fetchCandidates().catch(() => {
      toast.error('Impossible de charger les candidats');
    });
  }, [fetchCandidates]);

  const handleCreateCandidate = useCallback(async () => {
    if (!modalState.firstName || !modalState.lastName || !modalState.email) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    dispatchModal({ type: 'SET_SUBMITTING', value: true });

    try {
      const skillsArray = modalState.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const candidateData = {
        firstName: modalState.firstName,
        lastName: modalState.lastName,
        email: modalState.email,
        phone: modalState.phone || undefined,
        title: modalState.title || 'Non spécifié',
        location: modalState.location || undefined,
        tjm: modalState.tjm ? parseInt(modalState.tjm) : undefined,
        yearsOfExperience: modalState.yearsExperience
          ? parseInt(modalState.yearsExperience)
          : undefined,
        availability: modalState.availability,
        skills: skillsArray,
        remotePolicy: modalState.remotePreference,
        status: 'new' as CandidateStatus,
        tags: [],
        matchScores: {},
      };

      await createCandidateAPI(candidateData);
      toast.success('Candidat créé avec succès');
      dispatchModal({ type: 'CLOSE_MODAL' });
    } catch {
      toast.error('Erreur lors de la création du candidat');
    } finally {
      dispatchModal({ type: 'SET_SUBMITTING', value: false });
    }
  }, [modalState, createCandidateAPI]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter({ search: e.target.value });
    },
    [setFilter]
  );

  const handleStatusToggle = useCallback(
    (status: CandidateStatus) => {
      const currentStatuses = filter.status;
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter((s) => s !== status)
        : [...currentStatuses, status];
      setFilter({ status: newStatuses });
    },
    [filter.status, setFilter]
  );

  const handleAvailabilityToggle = useCallback(
    (availability: Availability) => {
      const currentAvailability = filter.availability;
      const newAvailability = currentAvailability.includes(availability)
        ? currentAvailability.filter((a) => a !== availability)
        : [...currentAvailability, availability];
      setFilter({ availability: newAvailability });
    },
    [filter.availability, setFilter]
  );

  const activeFiltersCount =
    filter.status.length + filter.availability.length + filter.skills.length;

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center justify-center w-10 h-10 bg-teal-50 rounded-xl'>
              <Users className='w-5 h-5 text-teal-500' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>Mes Candidats</h1>
              <p className='text-sm text-gray-500'>
                {filteredCandidates.length} candidat
                {filteredCandidates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={() => dispatchModal({ type: 'OPEN_MODAL' })}
            className='gap-2 text-white bg-teal-600 hover:bg-teal-700 rounded-xl'
          >
            <Plus className='w-4 h-4' />
            Nouveau candidat
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className='px-8 py-4 border-b border-gray-100 bg-white'>
        <div className='flex items-center justify-between gap-4'>
          {/* Search */}
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Rechercher un candidat ou une compétence...'
              value={filter.search}
              onChange={handleSearchChange}
              className='w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
            />
          </div>

          <div className='flex items-center gap-2'>
            {/* Filter toggle */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 rounded-xl ${showFilters ? 'bg-gray-100' : ''}`}
            >
              <Filter className='w-4 h-4' />
              Filtres
              {activeFiltersCount > 0 && (
                <span className='flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-teal-600 rounded-full'>
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* View mode toggle */}
            <div className='flex p-1 bg-gray-100 rounded-lg'>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title='Vue grille'
              >
                <LayoutGrid className='w-4 h-4' />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title='Vue liste'
              >
                <List className='w-4 h-4' />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title='Vue Kanban'
              >
                <Kanban className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className='mt-4 p-4 bg-gray-50 rounded-xl'>
            <div className='flex items-center justify-between mb-4'>
              <span className='text-sm font-medium text-gray-700'>
                Filtres actifs
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilter}
                  className='text-sm text-teal-600 hover:text-teal-700'
                >
                  Réinitialiser
                </button>
              )}
            </div>

            <div className='space-y-4'>
              {/* Status filters */}
              <div>
                <p className='text-xs font-medium text-gray-500 mb-2'>Statut</p>
                <div className='flex flex-wrap gap-2'>
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusToggle(option.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        filter.status.includes(option.value)
                          ? 'bg-teal-100 border-teal-300 text-teal-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability filters */}
              <div>
                <p className='text-xs font-medium text-gray-500 mb-2'>
                  Disponibilité
                </p>
                <div className='flex flex-wrap gap-2'>
                  {availabilityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAvailabilityToggle(option.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        filter.availability.includes(option.value)
                          ? 'bg-teal-100 border-teal-300 text-teal-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-8'>
        {loading ? (
          <LoadingState message='Chargement des candidats...' />
        ) : filteredCandidates.length === 0 ? (
          <EmptyState
            title='Aucun candidat'
            description='Ajoutez votre premier candidat pour commencer.'
            icon={Users}
            actionLabel='Nouveau candidat'
            onAction={() => dispatchModal({ type: 'OPEN_MODAL' })}
          />
        ) : viewMode === 'kanban' ? (
          <KanbanBoard candidates={filteredCandidates} />
        ) : (
          <CandidateList candidates={filteredCandidates} />
        )}
      </div>

      {/* Create Candidate Modal */}
      {modalState.isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='absolute inset-0 bg-black/50'
            onClick={() => dispatchModal({ type: 'CLOSE_MODAL' })}
          />
          <div className='relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl m-4'>
            <div className='sticky top-0 flex items-center justify-between p-6 bg-white border-b border-gray-100 rounded-t-2xl'>
              <h2 className='text-xl font-bold text-gray-900'>
                Nouveau candidat
              </h2>
              <button
                onClick={() => dispatchModal({ type: 'CLOSE_MODAL' })}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='w-5 h-5 text-gray-500' />
              </button>
            </div>

            <div className='p-6 space-y-6'>
              {/* Informations personnelles */}
              <div>
                <h3 className='text-sm font-semibold text-gray-900 mb-4'>
                  Informations personnelles
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Prénom <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      value={modalState.firstName}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'firstName',
                          value: e.target.value,
                        })
                      }
                      placeholder='Jean'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Nom <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      value={modalState.lastName}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'lastName',
                          value: e.target.value,
                        })
                      }
                      placeholder='Dupont'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Email <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      type='email'
                      value={modalState.email}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'email',
                          value: e.target.value,
                        })
                      }
                      placeholder='jean.dupont@email.com'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Téléphone
                    </label>
                    <Input
                      value={modalState.phone}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'phone',
                          value: e.target.value,
                        })
                      }
                      placeholder='06 12 34 56 78'
                    />
                  </div>
                </div>
              </div>

              {/* Informations professionnelles */}
              <div>
                <h3 className='text-sm font-semibold text-gray-900 mb-4'>
                  Informations professionnelles
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Titre / Poste
                    </label>
                    <Input
                      value={modalState.title}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'title',
                          value: e.target.value,
                        })
                      }
                      placeholder='Lead Developer Fullstack'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Localisation
                    </label>
                    <Input
                      value={modalState.location}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'location',
                          value: e.target.value,
                        })
                      }
                      placeholder='Paris'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      TJM (€/jour)
                    </label>
                    <Input
                      type='number'
                      value={modalState.tjm}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'tjm',
                          value: e.target.value,
                        })
                      }
                      placeholder='550'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Années d'expérience
                    </label>
                    <Input
                      type='number'
                      value={modalState.yearsExperience}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'yearsExperience',
                          value: e.target.value,
                        })
                      }
                      placeholder='5'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Disponibilité
                    </label>
                    <select
                      value={modalState.availability}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'availability',
                          value: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
                    >
                      {availabilityOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Télétravail
                    </label>
                    <select
                      value={modalState.remotePreference}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'remotePreference',
                          value: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
                    >
                      <option value='onsite'>Sur site</option>
                      <option value='hybrid'>Hybride</option>
                      <option value='full-remote'>Full remote</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Compétences */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Compétences (séparées par des virgules)
                </label>
                <Input
                  value={modalState.skills}
                  onChange={(e) =>
                    dispatchModal({
                      type: 'SET_FIELD',
                      field: 'skills',
                      value: e.target.value,
                    })
                  }
                  placeholder='React, Node.js, TypeScript, AWS'
                />
              </div>
            </div>

            <div className='sticky bottom-0 flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-100 rounded-b-2xl'>
              <Button
                variant='outline'
                onClick={() => dispatchModal({ type: 'CLOSE_MODAL' })}
                className='rounded-xl'
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateCandidate}
                disabled={modalState.isSubmitting}
                className='gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl'
              >
                {modalState.isSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className='w-4 h-4' />
                    Créer le candidat
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
