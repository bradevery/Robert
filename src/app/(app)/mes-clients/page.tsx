'use client';

import {
  Building2,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useReducer, useState } from 'react';
import toast from 'react-hot-toast';

import type { ClientStatus } from '@/lib/design-tokens';

import { ClientList } from '@/components/clients/ClientCard';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import LoadingState from '@/components/ui/loading-state';

import {
  useClientSectors,
  useClientsStore,
  useFilteredClients,
} from '@/stores/clients-store';

// Modal state reducer
interface ModalState {
  isOpen: boolean;
  isSubmitting: boolean;
  name: string;
  sector: string;
  website: string;
  address: string;
  description: string;
  status: ClientStatus;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
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
  name: '',
  sector: '',
  website: '',
  address: '',
  description: '',
  status: 'prospect',
  contactName: '',
  contactRole: '',
  contactEmail: '',
  contactPhone: '',
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

const statusOptions: { value: ClientStatus; label: string }[] = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

export default function MesClientsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [modalState, dispatchModal] = useReducer(
    modalReducer,
    initialModalState
  );

  const {
    filter,
    setFilter,
    resetFilter,
    createClientAPI,
    fetchClients,
    loading,
  } = useClientsStore();
  const filteredClients = useFilteredClients();
  const sectors = useClientSectors();

  useEffect(() => {
    fetchClients().catch(() => {
      toast.error('Impossible de charger les clients');
    });
  }, [fetchClients]);

  const handleCreateClient = useCallback(async () => {
    if (!modalState.name || !modalState.sector) {
      toast.error('Veuillez remplir le nom et le secteur du client');
      return;
    }

    dispatchModal({ type: 'SET_SUBMITTING', value: true });

    try {
      const contacts = modalState.contactName
        ? [
            {
              id: `contact_${Date.now()}`,
              name: modalState.contactName,
              role: modalState.contactRole || 'Non spécifié',
              email: modalState.contactEmail || undefined,
              phone: modalState.contactPhone || undefined,
              isPrimary: true,
            },
          ]
        : [];

      const clientData = {
        name: modalState.name,
        sector: modalState.sector,
        website: modalState.website || undefined,
        address: modalState.address || undefined,
        description: modalState.description || undefined,
        status: modalState.status,
        contacts,
        projects: [],
        tags: [],
        notes: '',
      };

      const created = await createClientAPI(clientData);
      if (!created) {
        throw new Error('Echec de creation');
      }
      toast.success('Client créé avec succès');
      dispatchModal({ type: 'CLOSE_MODAL' });
    } catch {
      toast.error('Erreur lors de la création du client');
    } finally {
      dispatchModal({ type: 'SET_SUBMITTING', value: false });
    }
  }, [modalState, createClientAPI]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter({ search: e.target.value });
    },
    [setFilter]
  );

  const handleStatusToggle = useCallback(
    (status: ClientStatus) => {
      const currentStatuses = filter.status;
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter((s) => s !== status)
        : [...currentStatuses, status];
      setFilter({ status: newStatuses });
    },
    [filter.status, setFilter]
  );

  const handleSectorToggle = useCallback(
    (sector: string) => {
      const currentSectors = filter.sectors;
      const newSectors = currentSectors.includes(sector)
        ? currentSectors.filter((s) => s !== sector)
        : [...currentSectors, sector];
      setFilter({ sectors: newSectors });
    },
    [filter.sectors, setFilter]
  );

  const activeFiltersCount = filter.status.length + filter.sectors.length;

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-xl'>
              <Building2 className='w-5 h-5 text-indigo-500' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>Mes Clients</h1>
              <p className='text-sm text-gray-500'>
                {filteredClients.length} client
                {filteredClients.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={() => dispatchModal({ type: 'OPEN_MODAL' })}
            className='gap-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl'
          >
            <Plus className='w-4 h-4' />
            Nouveau client
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
              placeholder='Rechercher un client...'
              value={filter.search}
              onChange={handleSearchChange}
              className='w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
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
                <span className='flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-indigo-600 rounded-full'>
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
              >
                <List className='w-4 h-4' />
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
                  className='text-sm text-indigo-600 hover:text-indigo-700'
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
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sector filters */}
              {sectors.length > 0 && (
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-2'>
                    Secteur
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {sectors.map((sector) => (
                      <button
                        key={sector}
                        onClick={() => handleSectorToggle(sector)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          filter.sectors.includes(sector)
                            ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-8'>
        {loading ? (
          <LoadingState message='Chargement des clients...' />
        ) : filteredClients.length === 0 ? (
          <EmptyState
            title='Aucun client'
            description='Ajoutez votre premier client pour commencer.'
            icon={Building2}
            actionLabel='Nouveau client'
            onAction={() => dispatchModal({ type: 'OPEN_MODAL' })}
          />
        ) : (
          <ClientList clients={filteredClients} />
        )}
      </div>

      {/* Create Client Modal */}
      {modalState.isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='absolute inset-0 bg-black/50'
            onClick={() => dispatchModal({ type: 'CLOSE_MODAL' })}
          />
          <div className='relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl m-4'>
            <div className='sticky top-0 flex items-center justify-between p-6 bg-white border-b border-gray-100 rounded-t-2xl'>
              <h2 className='text-xl font-bold text-gray-900'>
                Nouveau client
              </h2>
              <button
                onClick={() => dispatchModal({ type: 'CLOSE_MODAL' })}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='w-5 h-5 text-gray-500' />
              </button>
            </div>

            <div className='p-6 space-y-6'>
              {/* Informations entreprise */}
              <div>
                <h3 className='text-sm font-semibold text-gray-900 mb-4'>
                  Informations entreprise
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Nom de l'entreprise{' '}
                      <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      value={modalState.name}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'name',
                          value: e.target.value,
                        })
                      }
                      placeholder='BNP Paribas'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Secteur d'activité <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      value={modalState.sector}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'sector',
                          value: e.target.value,
                        })
                      }
                      placeholder='Banque'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Statut
                    </label>
                    <select
                      value={modalState.status}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'status',
                          value: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Site web
                    </label>
                    <Input
                      value={modalState.website}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'website',
                          value: e.target.value,
                        })
                      }
                      placeholder='https://exemple.com'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Adresse
                    </label>
                    <Input
                      value={modalState.address}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'address',
                          value: e.target.value,
                        })
                      }
                      placeholder='Paris, France'
                    />
                  </div>
                  <div className='col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Description
                    </label>
                    <textarea
                      value={modalState.description}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'description',
                          value: e.target.value,
                        })
                      }
                      placeholder="Description de l'entreprise..."
                      rows={3}
                      className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                    />
                  </div>
                </div>
              </div>

              {/* Contact principal */}
              <div>
                <h3 className='text-sm font-semibold text-gray-900 mb-4'>
                  Contact principal (optionnel)
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Nom
                    </label>
                    <Input
                      value={modalState.contactName}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'contactName',
                          value: e.target.value,
                        })
                      }
                      placeholder='Jean Dupont'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Fonction
                    </label>
                    <Input
                      value={modalState.contactRole}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'contactRole',
                          value: e.target.value,
                        })
                      }
                      placeholder='Responsable SI'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Email
                    </label>
                    <Input
                      type='email'
                      value={modalState.contactEmail}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'contactEmail',
                          value: e.target.value,
                        })
                      }
                      placeholder='jean.dupont@exemple.com'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Téléphone
                    </label>
                    <Input
                      value={modalState.contactPhone}
                      onChange={(e) =>
                        dispatchModal({
                          type: 'SET_FIELD',
                          field: 'contactPhone',
                          value: e.target.value,
                        })
                      }
                      placeholder='01 23 45 67 89'
                    />
                  </div>
                </div>
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
                onClick={handleCreateClient}
                disabled={modalState.isSubmitting}
                className='gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl'
              >
                {modalState.isSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className='w-4 h-4' />
                    Créer le client
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
