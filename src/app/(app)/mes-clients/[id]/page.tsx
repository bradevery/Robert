'use client';

import {
  ArrowLeft,
  Building2,
  Edit2,
  FolderOpen,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import type { ClientStatus } from '@/lib/design-tokens';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ClientStatusBadge,
  DossierStatusBadge,
} from '@/components/ui/status-indicator';

import {
  type Client,
  type Contact,
  useClientsStore,
} from '@/stores/clients-store';
import { useWorkspaceStore } from '@/stores/workspace-store';

const statusOptions: { value: ClientStatus; label: string }[] = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  const { clients, updateClient, removeClient, addContact, removeContact } =
    useClientsStore();
  const { dossiers } = useWorkspaceStore();

  const client = useMemo(
    () => clients.find((c) => c.id === clientId),
    [clients, clientId]
  );
  const clientDossiers = useMemo(
    () => dossiers.filter((d) => client?.projects.includes(d.id)),
    [dossiers, client]
  );

  // Form state
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [newContact, setNewContact] = useState<Omit<Contact, 'id'>>({
    name: '',
    role: '',
    email: '',
    phone: '',
    isPrimary: false,
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        sector: client.sector,
        website: client.website,
        address: client.address,
        description: client.description,
        status: client.status,
        notes: client.notes,
      });
    }
  }, [client]);

  if (!client) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <Building2 className='w-16 h-16 text-gray-300 mb-4' />
        <h2 className='text-xl font-semibold text-gray-900'>
          Client non trouvé
        </h2>
        <p className='text-gray-500 mt-2'>
          Ce client n'existe pas ou a été supprimé.
        </p>
        <Link href='/mes-clients'>
          <Button className='mt-6'>Retour aux clients</Button>
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    updateClient(clientId, formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      removeClient(clientId);
      router.push('/mes-clients');
    }
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.role) {
      addContact(clientId, newContact);
      setNewContact({
        name: '',
        role: '',
        email: '',
        phone: '',
        isPrimary: false,
      });
      setShowAddContact(false);
    }
  };

  const handleRemoveContact = (contactId: string) => {
    if (confirm('Supprimer ce contact ?')) {
      removeContact(clientId, contactId);
    }
  };

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/mes-clients'
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <ArrowLeft className='w-5 h-5 text-gray-600' />
            </Link>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl'>
                <Building2 className='w-6 h-6 text-indigo-500' />
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-900'>
                  {client.name}
                </h1>
                <p className='text-sm text-gray-500'>{client.sector}</p>
              </div>
            </div>
            <ClientStatusBadge status={client.status} />
          </div>
          <div className='flex items-center gap-2'>
            {isEditing ? (
              <>
                <Button
                  variant='outline'
                  onClick={() => setIsEditing(false)}
                  className='gap-2 rounded-xl'
                >
                  <X className='w-4 h-4' /> Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  className='gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl'
                >
                  <Save className='w-4 h-4' /> Sauvegarder
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant='outline'
                  onClick={() => setIsEditing(true)}
                  className='gap-2 rounded-xl'
                >
                  <Edit2 className='w-4 h-4' /> Modifier
                </Button>
                <Button
                  variant='outline'
                  onClick={handleDelete}
                  className='gap-2 text-red-600 hover:bg-red-50 rounded-xl'
                >
                  <Trash2 className='w-4 h-4' /> Supprimer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Info */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Informations générales */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-6'>
                Informations générales
              </h2>

              {isEditing ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Nom
                      </label>
                      <Input
                        value={formData.name || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Secteur
                      </label>
                      <Input
                        value={formData.sector || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, sector: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Site web
                    </label>
                    <Input
                      value={formData.website || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder='https://...'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Adresse
                    </label>
                    <Input
                      value={formData.address || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Statut
                    </label>
                    <select
                      value={formData.status || 'prospect'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as ClientStatus,
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
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                    />
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {client.website && (
                    <div className='flex items-center gap-3 text-gray-600'>
                      <Globe className='w-5 h-5 text-gray-400' />
                      <a
                        href={client.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-indigo-600 hover:underline'
                      >
                        {client.website}
                      </a>
                    </div>
                  )}
                  {client.address && (
                    <div className='flex items-center gap-3 text-gray-600'>
                      <MapPin className='w-5 h-5 text-gray-400' />
                      <span>{client.address}</span>
                    </div>
                  )}
                  {client.description && (
                    <p className='text-gray-600 mt-4'>{client.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Contacts */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Contacts
                </h2>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowAddContact(true)}
                  className='gap-2 rounded-xl'
                >
                  <UserPlus className='w-4 h-4' /> Ajouter
                </Button>
              </div>

              {showAddContact && (
                <div className='mb-6 p-4 bg-gray-50 rounded-xl'>
                  <div className='grid grid-cols-2 gap-4 mb-4'>
                    <Input
                      placeholder='Nom'
                      value={newContact.name}
                      onChange={(e) =>
                        setNewContact({ ...newContact, name: e.target.value })
                      }
                    />
                    <Input
                      placeholder='Fonction'
                      value={newContact.role}
                      onChange={(e) =>
                        setNewContact({ ...newContact, role: e.target.value })
                      }
                    />
                    <Input
                      placeholder='Email'
                      type='email'
                      value={newContact.email}
                      onChange={(e) =>
                        setNewContact({ ...newContact, email: e.target.value })
                      }
                    />
                    <Input
                      placeholder='Téléphone'
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact({ ...newContact, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className='flex items-center gap-4'>
                    <label className='flex items-center gap-2 text-sm text-gray-600'>
                      <input
                        type='checkbox'
                        checked={newContact.isPrimary}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            isPrimary: e.target.checked,
                          })
                        }
                        className='rounded border-gray-300'
                      />
                      Contact principal
                    </label>
                    <div className='flex-1' />
                    <Button
                      variant='ghost'
                      onClick={() => setShowAddContact(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleAddContact}
                      className='bg-indigo-600 hover:bg-indigo-700 text-white'
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              )}

              <div className='space-y-3'>
                {client.contacts.length === 0 ? (
                  <p className='text-gray-500 text-center py-8'>
                    Aucun contact ajouté
                  </p>
                ) : (
                  client.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className='flex items-center justify-between p-4 bg-gray-50 rounded-xl group'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm'>
                          {contact.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className='flex items-center gap-2'>
                            <p className='font-medium text-gray-900'>
                              {contact.name}
                            </p>
                            {contact.isPrimary && (
                              <span className='px-2 py-0.5 text-xs font-medium text-indigo-600 bg-indigo-100 rounded'>
                                Principal
                              </span>
                            )}
                          </div>
                          <p className='text-sm text-gray-500'>
                            {contact.role}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className='text-gray-400 hover:text-gray-600'
                          >
                            <Mail className='w-4 h-4' />
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className='text-gray-400 hover:text-gray-600'
                          >
                            <Phone className='w-4 h-4' />
                          </a>
                        )}
                        <button
                          onClick={() => handleRemoveContact(contact.id)}
                          className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Projects & Notes */}
          <div className='space-y-6'>
            {/* Projects */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold text-gray-900'>Projets</h2>
                <span className='px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg'>
                  {client.projects.length}
                </span>
              </div>

              {clientDossiers.length === 0 ? (
                <div className='text-center py-8'>
                  <FolderOpen className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                  <p className='text-gray-500 text-sm'>Aucun projet lié</p>
                  <Link href='/mes-dossiers'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='mt-2 text-indigo-600'
                    >
                      <Plus className='w-4 h-4 mr-1' /> Créer un projet
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className='space-y-2'>
                  {clientDossiers.map((dossier) => (
                    <div
                      key={dossier.id}
                      className='p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer'
                    >
                      <div className='flex items-center justify-between'>
                        <p className='font-medium text-gray-900 text-sm'>
                          {dossier.title}
                        </p>
                        <DossierStatusBadge status={dossier.status} />
                      </div>
                      <p className='text-xs text-gray-500 mt-1'>
                        {dossier.matchedProfiles}/{dossier.requiredProfiles}{' '}
                        profils
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Notes
              </h2>
              {isEditing ? (
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={6}
                  placeholder='Ajouter des notes...'
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                />
              ) : (
                <p className='text-gray-600 text-sm whitespace-pre-wrap'>
                  {client.notes || 'Aucune note'}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>Tags</h2>
              <div className='flex flex-wrap gap-2'>
                {client.tags.map((tag) => (
                  <span
                    key={tag}
                    className='px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg'
                  >
                    {tag}
                  </span>
                ))}
                {client.tags.length === 0 && (
                  <p className='text-gray-500 text-sm'>Aucun tag</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
