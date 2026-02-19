'use client';

import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  Edit2,
  Euro,
  FileText,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Target,
  Trash2,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import type { Availability, CandidateStatus } from '@/lib/design-tokens';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScoreBadge, ScoreProgress } from '@/components/ui/score-badge';
import {
  AvailabilityBadge,
  CandidateStatusBadge,
} from '@/components/ui/status-indicator';

import { type Candidate, useCandidatesStore } from '@/stores/candidates-store';
import { useWorkspaceStore } from '@/stores/workspace-store';

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

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const { candidates, updateCandidate, removeCandidate } = useCandidatesStore();
  const { dossiers } = useWorkspaceStore();

  const candidate = useMemo(
    () => candidates.find((c) => c.id === candidateId),
    [candidates, candidateId]
  );

  // Get dossiers where this candidate is matched
  const matchedDossiers = useMemo(() => {
    if (!candidate) return [];
    return dossiers.filter((d) => d.candidateIds.includes(candidateId));
  }, [dossiers, candidate, candidateId]);

  // Form state
  const [formData, setFormData] = useState<Partial<Candidate>>({});

  useEffect(() => {
    if (candidate) {
      setFormData({
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        title: candidate.title,
        location: candidate.location,
        tjm: candidate.tjm,
        yearsOfExperience: candidate.yearsOfExperience,
        availability: candidate.availability,
        remotePolicy: candidate.remotePolicy,
        status: candidate.status,
        linkedinUrl: candidate.linkedinUrl,
        notes: candidate.notes,
        skills: [...candidate.skills],
        tags: [...candidate.tags],
      });
    }
  }, [candidate]);

  if (!candidate) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <User className='w-16 h-16 text-gray-300 mb-4' />
        <h2 className='text-xl font-semibold text-gray-900'>
          Candidat non trouvé
        </h2>
        <p className='text-gray-500 mt-2'>
          Ce candidat n'existe pas ou a été supprimé.
        </p>
        <Link href='/mes-candidats'>
          <Button className='mt-6'>Retour aux candidats</Button>
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    updateCandidate(candidateId, formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      removeCandidate(candidateId);
      router.push('/mes-candidats');
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...(formData.skills || []), newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills?.filter((s) => s !== skill) || [],
    });
  };

  const handleStatusChange = (newStatus: CandidateStatus) => {
    updateCandidate(candidateId, { status: newStatus });
    setFormData({ ...formData, status: newStatus });
  };

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/mes-candidats'
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <ArrowLeft className='w-5 h-5 text-gray-600' />
            </Link>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-14 h-14 bg-teal-50 rounded-full'>
                <span className='text-lg font-semibold text-teal-600'>
                  {candidate.firstName[0]}
                  {candidate.lastName[0]}
                </span>
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-900'>
                  {candidate.firstName} {candidate.lastName}
                </h1>
                <p className='text-sm text-gray-500'>{candidate.title}</p>
              </div>
            </div>
            <CandidateStatusBadge status={candidate.status} />
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
                  className='gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl'
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
                        Prénom
                      </label>
                      <Input
                        value={formData.firstName || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Nom
                      </label>
                      <Input
                        value={formData.lastName || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Titre / Poste
                    </label>
                    <Input
                      value={formData.title || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Email
                      </label>
                      <Input
                        type='email'
                        value={formData.email || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Téléphone
                      </label>
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Localisation
                      </label>
                      <Input
                        value={formData.location || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        LinkedIn
                      </label>
                      <Input
                        value={formData.linkedinUrl || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            linkedinUrl: e.target.value,
                          })
                        }
                        placeholder='https://linkedin.com/in/...'
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        TJM (€)
                      </label>
                      <Input
                        type='number'
                        value={formData.tjm || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tjm: parseInt(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Expérience (années)
                      </label>
                      <Input
                        type='number'
                        value={formData.yearsOfExperience || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            yearsOfExperience:
                              parseInt(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Disponibilité
                      </label>
                      <select
                        value={formData.availability || 'immediate'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            availability: e.target.value as Availability,
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
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Télétravail
                    </label>
                    <select
                      value={formData.remotePolicy || 'hybrid'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          remotePolicy: e.target.value as
                            | 'onsite'
                            | 'hybrid'
                            | 'full-remote',
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
              ) : (
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-6'>
                    <div className='flex items-center gap-3 text-gray-600'>
                      <Mail className='w-5 h-5 text-gray-400' />
                      <a
                        href={`mailto:${candidate.email}`}
                        className='text-teal-600 hover:underline'
                      >
                        {candidate.email}
                      </a>
                    </div>
                    {candidate.phone && (
                      <div className='flex items-center gap-3 text-gray-600'>
                        <Phone className='w-5 h-5 text-gray-400' />
                        <a
                          href={`tel:${candidate.phone}`}
                          className='hover:text-teal-600'
                        >
                          {candidate.phone}
                        </a>
                      </div>
                    )}
                    {candidate.location && (
                      <div className='flex items-center gap-3 text-gray-600'>
                        <MapPin className='w-5 h-5 text-gray-400' />
                        <span>{candidate.location}</span>
                      </div>
                    )}
                    {candidate.linkedinUrl && (
                      <div className='flex items-center gap-3 text-gray-600'>
                        <Linkedin className='w-5 h-5 text-gray-400' />
                        <a
                          href={candidate.linkedinUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-teal-600 hover:underline'
                        >
                          Profil LinkedIn
                        </a>
                      </div>
                    )}
                  </div>

                  <div className='grid grid-cols-4 gap-4 pt-4 border-t border-gray-100'>
                    <div className='text-center p-3 bg-gray-50 rounded-xl'>
                      <Euro className='w-5 h-5 text-gray-400 mx-auto mb-1' />
                      <p className='text-lg font-bold text-gray-900'>
                        {candidate.tjm || '—'}
                      </p>
                      <p className='text-xs text-gray-500'>TJM (€/j)</p>
                    </div>
                    <div className='text-center p-3 bg-gray-50 rounded-xl'>
                      <Briefcase className='w-5 h-5 text-gray-400 mx-auto mb-1' />
                      <p className='text-lg font-bold text-gray-900'>
                        {candidate.yearsOfExperience || '—'}
                      </p>
                      <p className='text-xs text-gray-500'>Années d'exp.</p>
                    </div>
                    <div className='text-center p-3 bg-gray-50 rounded-xl'>
                      <Calendar className='w-5 h-5 text-gray-400 mx-auto mb-1' />
                      <AvailabilityBadge
                        availability={candidate.availability}
                        className='mt-1'
                      />
                    </div>
                    <div className='text-center p-3 bg-gray-50 rounded-xl'>
                      <Globe className='w-5 h-5 text-gray-400 mx-auto mb-1' />
                      <p className='text-sm font-medium text-gray-900'>
                        {candidate.remotePolicy === 'full-remote'
                          ? 'Full remote'
                          : candidate.remotePolicy === 'hybrid'
                          ? 'Hybride'
                          : 'Sur site'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compétences */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-6'>
                Compétences
              </h2>

              {isEditing && (
                <div className='flex gap-2 mb-4'>
                  <Input
                    placeholder='Ajouter une compétence...'
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                  <Button
                    onClick={handleAddSkill}
                    className='bg-teal-600 hover:bg-teal-700 text-white'
                  >
                    <Plus className='w-4 h-4' />
                  </Button>
                </div>
              )}

              <div className='flex flex-wrap gap-2'>
                {(isEditing ? formData.skills : candidate.skills)?.map(
                  (skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        isEditing
                          ? 'bg-teal-50 text-teal-700 border border-teal-200 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => isEditing && handleRemoveSkill(skill)}
                    >
                      {skill}
                      {isEditing && (
                        <span className='ml-2 text-xs'>&times;</span>
                      )}
                    </span>
                  )
                )}
                {(isEditing ? formData.skills : candidate.skills)?.length ===
                  0 && (
                  <p className='text-gray-500'>Aucune compétence ajoutée</p>
                )}
              </div>
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
                  rows={4}
                  placeholder='Ajouter des notes sur ce candidat...'
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm'
                />
              ) : (
                <p className='text-gray-600 text-sm whitespace-pre-wrap'>
                  {candidate.notes || 'Aucune note'}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Statut Pipeline */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Pipeline
              </h2>
              <div className='space-y-2'>
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      candidate.status === option.value
                        ? 'bg-teal-50 border-2 border-teal-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <CheckCircle
                      className={`w-5 h-5 ${
                        candidate.status === option.value
                          ? 'text-teal-500'
                          : 'text-gray-300'
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        candidate.status === option.value
                          ? 'text-teal-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Matching Scores */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Scores de matching
              </h2>
              {Object.keys(candidate.matchScores).length === 0 ? (
                <div className='text-center py-6'>
                  <Target className='w-10 h-10 text-gray-300 mx-auto mb-2' />
                  <p className='text-sm text-gray-500'>
                    Aucun matching effectué
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {Object.entries(candidate.matchScores).map(
                    ([dossierId, score]) => {
                      const dossier = dossiers.find((d) => d.id === dossierId);
                      return (
                        <div
                          key={dossierId}
                          className='p-3 bg-gray-50 rounded-xl'
                        >
                          <div className='flex items-center justify-between mb-2'>
                            <p className='text-sm font-medium text-gray-900 truncate'>
                              {dossier?.title || dossierId}
                            </p>
                            <ScoreBadge score={score} size='sm' />
                          </div>
                          <ScoreProgress
                            score={score}
                            showLabel={false}
                            size='sm'
                          />
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* Projets associés */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Projets associés
              </h2>
              {matchedDossiers.length === 0 ? (
                <div className='text-center py-6'>
                  <FileText className='w-10 h-10 text-gray-300 mx-auto mb-2' />
                  <p className='text-sm text-gray-500'>
                    Non affecté à un projet
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {matchedDossiers.map((dossier) => (
                    <div
                      key={dossier.id}
                      className='p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer'
                    >
                      <p className='font-medium text-gray-900 text-sm'>
                        {dossier.title}
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {dossier.matchedProfiles}/{dossier.requiredProfiles}{' '}
                        profils
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className='bg-white rounded-2xl border border-gray-100 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Actions rapides
              </h2>
              <div className='space-y-2'>
                <Link href='/cv-builder'>
                  <Button
                    variant='outline'
                    className='w-full justify-start gap-2 rounded-xl'
                  >
                    <FileText className='w-4 h-4' /> Générer un CV
                  </Button>
                </Link>
                <Link href='/modules/pre-qualif'>
                  <Button
                    variant='outline'
                    className='w-full justify-start gap-2 rounded-xl'
                  >
                    <Phone className='w-4 h-4' /> Planifier un entretien
                  </Button>
                </Link>
                <Link href='/modules/score'>
                  <Button
                    variant='outline'
                    className='w-full justify-start gap-2 rounded-xl'
                  >
                    <Target className='w-4 h-4' /> Lancer un matching
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
