'use client';

import {
  AlertCircle,
  Calendar,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import LoadingState from '@/components/ui/loading-state';

import { useCandidatesStore } from '@/stores/candidates-store';
import { useClientsStore } from '@/stores/clients-store';
import {
  type Dossier,
  useDossiersStore,
  useFilteredDossiers,
} from '@/stores/dossiers-store';

function DossierCard({
  dossier,
  onDelete,
}: {
  dossier: Dossier;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={`/mes-dossiers/${dossier.id}`}
      className='group block p-5 bg-white border border-gray-100 rounded-2xl transition-all duration-200 hover:shadow-md hover:border-blue-200'
    >
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors'>
          <FileText className='w-6 h-6' />
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={(e) => onDelete(dossier.id, e)}
            className='p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      </div>

      <h3 className='text-base font-semibold text-gray-900 mb-1 line-clamp-2'>
        {dossier.title}
      </h3>

      <div className='flex flex-col gap-1 mb-4'>
        {dossier.data?.basics?.firstName && (
          <p className='text-sm text-gray-500 flex items-center gap-1.5'>
            <User className='w-3.5 h-3.5' />
            {dossier.data.basics.firstName} {dossier.data.basics.lastName}
          </p>
        )}
      </div>

      <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
        <span className='flex items-center gap-1.5 text-xs text-gray-400'>
          <Calendar className='w-3.5 h-3.5' />
          {new Date(dossier.updatedAt).toLocaleDateString()}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
            dossier.status === 'published'
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {dossier.status === 'published' ? 'Publié' : 'Brouillon'}
        </span>
      </div>
    </Link>
  );
}

export default function MesDossiersPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [_showFilters, _setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Modal State
  const [newDossier, setNewDossier] = useState({
    title: '',
    description: '',
    candidateId: '',
    clientId: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const {
    fetchDossiers,
    createDossier,
    deleteDossier,
    setFilter,
    filter,
    loading,
    error,
  } = useDossiersStore();

  const { clients, fetchClients } = useClientsStore();
  const { candidates, fetchCandidates } = useCandidatesStore();
  const filteredDossiers = useFilteredDossiers();

  useEffect(() => {
    fetchDossiers();
    fetchClients();
    fetchCandidates();
  }, [fetchDossiers, fetchClients, fetchCandidates]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter({ search: e.target.value });
    },
    [setFilter]
  );

  const handleCreateDossier = useCallback(async () => {
    if (!newDossier.candidateId) {
      toast.error('Veuillez sélectionner un candidat');
      return;
    }

    setIsCreating(true);
    try {
      const created = await createDossier({
        title: newDossier.title, // Optional, can be auto-generated
        description: newDossier.description,
        candidateId: newDossier.candidateId,
        clientId: newDossier.clientId,
      });

      if (created) {
        toast.success('Dossier créé avec succès');
        setShowCreateModal(false);
        setNewDossier({
          title: '',
          description: '',
          candidateId: '',
          clientId: '',
        });
        router.push(`/mes-dossiers/${created.id}`);
      }
    } catch (err) {
      toast.error('Erreur lors de la création du dossier');
    } finally {
      setIsCreating(false);
    }
  }, [newDossier, createDossier, router]);

  const handleDeleteDossier = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('Voulez-vous vraiment supprimer ce dossier ?')) {
        try {
          await deleteDossier(id);
          toast.success('Dossier supprimé');
        } catch {
          toast.error('Erreur lors de la suppression');
        }
      }
    },
    [deleteDossier]
  );

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl'>
              <FileText className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                Mes Dossiers de Compétences
              </h1>
              <p className='text-sm text-gray-500'>
                {filteredDossiers.length} document
                {filteredDossiers.length !== 1 ? 's' : ''} généré
                {filteredDossiers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className='gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
          >
            <Plus className='w-4 h-4' />
            Nouveau Dossier
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className='px-8 py-4 bg-white border-b border-gray-100'>
        <div className='flex items-center justify-between gap-4'>
          {/* Search */}
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />
            <input
              type='text'
              placeholder='Rechercher un dossier...'
              value={filter.search}
              onChange={handleSearchChange}
              className='w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          <div className='flex items-center gap-2'>
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
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-8'>
        {loading ? (
          <LoadingState message='Chargement des dossiers...' />
        ) : error ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <AlertCircle className='w-12 h-12 mb-4 text-red-500' />
            <p className='mb-4 text-red-600'>{error}</p>
            <Button variant='outline' onClick={() => fetchDossiers()}>
              Réessayer
            </Button>
          </div>
        ) : filteredDossiers.length === 0 ? (
          <EmptyState
            title='Aucun Dossier'
            description={
              filter.search
                ? 'Aucun dossier ne correspond à votre recherche'
                : "Créez votre premier dossier de compétences à partir d'un candidat"
            }
            icon={FileText}
            actionLabel={!filter.search ? 'Créer un Dossier' : undefined}
            onAction={
              !filter.search ? () => setShowCreateModal(true) : undefined
            }
          />
        ) : viewMode === 'grid' ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4'>
            {filteredDossiers.map((dossier) => (
              <DossierCard
                key={dossier.id}
                dossier={dossier}
                onDelete={handleDeleteDossier}
              />
            ))}
          </div>
        ) : (
          <div className='overflow-hidden bg-white border border-gray-100 rounded-2xl'>
            <table className='w-full'>
              <thead>
                <tr className='text-sm text-gray-500 border-b border-gray-100 bg-gray-50'>
                  <th className='px-6 py-4 font-medium text-left'>Dossier</th>
                  <th className='px-6 py-4 font-medium text-left'>Candidat</th>
                  <th className='px-6 py-4 font-medium text-left'>Date</th>
                  <th className='px-6 py-4 font-medium text-left'>Statut</th>
                  <th className='px-6 py-4 font-medium text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDossiers.map((dossier) => (
                  <tr
                    key={dossier.id}
                    className='transition-colors border-b cursor-pointer border-gray-50 hover:bg-gray-50/50'
                    onClick={() => router.push(`/mes-dossiers/${dossier.id}`)}
                  >
                    <td className='px-6 py-4'>
                      <div className='font-medium text-gray-900'>
                        {dossier.title}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      {dossier.data?.basics?.firstName ? (
                        <span className='text-gray-700 flex items-center gap-2'>
                          <User className='w-4 h-4 text-gray-400' />
                          {dossier.data.basics.firstName}{' '}
                          {dossier.data.basics.lastName}
                        </span>
                      ) : (
                        <span className='text-gray-400'>—</span>
                      )}
                    </td>
                    <td className='px-6 py-4 text-gray-500 text-sm'>
                      {new Date(dossier.updatedAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                          dossier.status === 'published'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {dossier.status === 'published'
                          ? 'Publié'
                          : 'Brouillon'}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <button
                        onClick={(e) => handleDeleteDossier(dossier.id, e)}
                        className='p-2 text-gray-400 transition-colors rounded-lg hover:text-red-500 hover:bg-red-50'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-lg p-6 mx-4 bg-white shadow-xl rounded-2xl'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-gray-900'>Nouveau DC</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className='p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                  Titre du DC *
                </label>
                <Input
                  value={newDossier.title}
                  onChange={(e) =>
                    setNewDossier({ ...newDossier, title: e.target.value })
                  }
                  placeholder="Ex: Appel d'offre - Client XYZ"
                />
              </div>

              {/* Client Selection */}
              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                  Client *
                </label>
                <select
                  value={newDossier.clientId}
                  onChange={(e) =>
                    setNewDossier({ ...newDossier, clientId: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Sélectionner un client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className='mt-1 text-xs text-amber-600'>
                    Aucun client disponible. Veuillez d'abord créer un client.
                  </p>
                )}
              </div>

              {/* Candidate Selection */}
              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                  Candidat *
                </label>
                <select
                  value={newDossier.candidateId}
                  onChange={(e) =>
                    setNewDossier({
                      ...newDossier,
                      candidateId: e.target.value,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Sélectionner un candidat</option>
                  {candidates.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.firstName} {candidate.lastName} -{' '}
                      {candidate.title}
                    </option>
                  ))}
                </select>
                {candidates.length === 0 && (
                  <p className='mt-1 text-xs text-amber-600'>
                    Aucun candidat disponible.
                  </p>
                )}
              </div>

              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                  Description
                </label>
                <textarea
                  value={newDossier.description}
                  onChange={(e) =>
                    setNewDossier({
                      ...newDossier,
                      description: e.target.value,
                    })
                  }
                  placeholder='Description du projet...'
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>

            <div className='flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100'>
              <Button
                variant='outline'
                onClick={() => setShowCreateModal(false)}
                className='rounded-xl'
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateDossier}
                disabled={
                  !newDossier.title ||
                  !newDossier.clientId ||
                  !newDossier.candidateId ||
                  isCreating
                }
                className='gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
              >
                {isCreating && <Loader2 className='w-4 h-4 animate-spin' />}
                Créer le DC
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
