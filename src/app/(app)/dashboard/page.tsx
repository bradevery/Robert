'use client';

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  FileText,
  FileUp,
  Filter,
  LayoutTemplate,
  Library,
  Loader2,
  Mail,
  PieChart,
  Plus,
  Search,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDashboard } from '@/hooks/useDashboard';

// Types
type DCStatus =
  | 'draft'
  | 'pending_candidate'
  | 'in_progress'
  | 'completed'
  | 'sent';
type InvitationStatus = 'pending' | 'opened' | 'completed' | 'expired';

interface DossierCompetence {
  id: string;
  candidateName: string;
  candidateEmail: string;
  title: string;
  client?: string;
  template: string;
  status: DCStatus;
  completionRate: number;
  lastModified: string;
  createdAt: string;
}

interface CandidateInvitation {
  id: string;
  candidateName: string;
  candidateEmail: string;
  status: InvitationStatus;
  sentAt: string;
  expiresAt: string;
  dcId?: string;
}

interface DCTemplate {
  id: string;
  name: string;
  client?: string;
  usageCount: number;
  lastUsed: string;
  thumbnail?: string;
}

interface DashboardStats {
  totalDCs: number;
  dossiersThisMonth: number;
  pendingInvitations: number;
  completedThisMonth: number;
  templatesCount: number;
  totalCandidates: number;
  newCandidatesThisMonth: number;
  totalClients: number;
  activeClients: number;
  inProgressDossiers: number;
  avgCreationTimeMinutes: number;
  avgCompletionRate: number;
}

interface PipelineItem {
  id: string;
  title: string;
  client: string | null;
  updatedAt: string;
}

interface PipelineColumnData {
  count: number;
  items: PipelineItem[];
}

interface DashboardPipeline {
  draft: PipelineColumnData;
  in_progress: PipelineColumnData;
  completed: PipelineColumnData;
  sent: PipelineColumnData;
}

interface DashboardAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'danger';
  ctaLabel?: string;
  ctaHref?: string;
}

interface RecentDossier {
  id: string;
  title: string;
  client: string | null;
  status: DCStatus;
  score: number;
  updatedAt: string;
}

interface RecentCandidate {
  id: string;
  name: string;
  status: string;
  availability: string;
  lastActivity: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

// State and Actions
interface DashboardState {
  searchQuery: string;
  isSidebarCollapsed: boolean;
  showCreateModal: boolean;
  showInviteModal: boolean;
}

type DashboardAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'TOGGLE_CREATE_MODAL' }
  | { type: 'TOGGLE_INVITE_MODAL' };

const initialState: DashboardState = {
  searchQuery: '',
  isSidebarCollapsed: false,
  showCreateModal: false,
  showInviteModal: false,
};

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, isSidebarCollapsed: action.payload };
    case 'TOGGLE_CREATE_MODAL':
      return { ...state, showCreateModal: !state.showCreateModal };
    case 'TOGGLE_INVITE_MODAL':
      return { ...state, showInviteModal: !state.showInviteModal };
    default:
      return state;
  }
}

const statusConfig: Record<
  DCStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: 'Brouillon', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  pending_candidate: {
    label: 'En attente',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  in_progress: {
    label: 'En cours',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  completed: {
    label: 'Complété',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  sent: { label: 'Envoyé', color: 'text-purple-600', bgColor: 'bg-purple-50' },
};

export default function DashboardPage() {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const [showNotifications, setShowNotifications] = useState(false);

  // Hooks
  const { stats: statsQuery } = useDashboard();
  const { data, isLoading, error } = statsQuery;

  const stats = data?.stats;
  const invitations = data?.invitations || [];
  const templates = data?.templates || [];
  const pipeline = data?.pipeline || {
    draft: { count: 0, items: [] },
    in_progress: { count: 0, items: [] },
    completed: { count: 0, items: [] },
    sent: { count: 0, items: [] },
  };
  const alerts = data?.alerts || [];
  const recentDossiers = data?.recentDossiers || [];
  const recentCandidates = data?.recentCandidates || [];
  const notifications = data?.notifications || [];
  const unreadNotifications = data?.unreadNotifications || 0;

  // Filtered DCs
  const filteredRecentDossiers = useMemo(() => {
    if (!state.searchQuery) return recentDossiers;
    const query = state.searchQuery.toLowerCase();
    return recentDossiers.filter(
      (dc: any) =>
        dc.title.toLowerCase().includes(query) ||
        dc.client?.toLowerCase().includes(query)
    );
  }, [state.searchQuery, recentDossiers]);

  const handleCreateDC = useCallback(() => {
    dispatch({ type: 'TOGGLE_CREATE_MODAL' });
  }, []);

  const handleInviteCandidate = useCallback(() => {
    dispatch({ type: 'TOGGLE_INVITE_MODAL' });
  }, []);

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Tableau de bord
            </h1>
            <p className='text-sm text-gray-500'>
              Vue d&apos;ensemble de votre activite
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='relative'>
              <button
                type='button'
                className='relative flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-xl hover:bg-gray-50'
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                <Bell className='w-4 h-4 text-gray-500' />
                {unreadNotifications > 0 && (
                  <span className='absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5'>
                    {unreadNotifications}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className='absolute right-0 z-20 mt-2 bg-white border border-gray-100 shadow-lg w-72 rounded-xl'>
                  <div className='px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100'>
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div className='px-4 py-6 text-sm text-center text-gray-500'>
                      Aucune notification recente.
                    </div>
                  ) : (
                    <div className='overflow-y-auto max-h-64'>
                      {notifications.map((item: any) => (
                        <div
                          key={item.id}
                          className='px-4 py-3 border-b border-gray-50'
                        >
                          <div className='text-sm font-medium text-gray-900'>
                            {item.title}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {item.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className='px-4 py-2 text-xs text-gray-400'>
                    Derniere mise a jour: maintenant
                  </div>
                </div>
              )}
            </div>
            <div className='flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl'>
              <Filter className='w-4 h-4 text-gray-400' />
              <select className='text-sm text-gray-600 bg-transparent focus:outline-none'>
                <option>Ce mois</option>
                <option>30 derniers jours</option>
                <option>Ce trimestre</option>
              </select>
            </div>
            <Button asChild variant='outline' className='gap-2 rounded-xl'>
              <Link href='/modules/ao-reader'>
                <Upload className='w-4 h-4' />
                Importer AO
              </Link>
            </Button>
            <Button
              variant='outline'
              className='gap-2 rounded-xl'
              onClick={handleInviteCandidate}
            >
              <UserPlus className='w-4 h-4' />
              Inviter candidat
            </Button>
            <Button
              className='gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
              onClick={handleCreateDC}
            >
              <Plus className='w-4 h-4' />
              Nouveau dossier
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-8'>
        {isLoading ? (
          <div className='flex items-center justify-center h-64'>
            <Loader2 className='w-8 h-8 text-blue-600 animate-spin' />
          </div>
        ) : error ? (
          <div className='p-6 text-center border border-red-200 bg-red-50 rounded-xl'>
            <AlertCircle className='w-8 h-8 mx-auto mb-2 text-red-500' />
            <p className='text-red-700'>{(error as Error).message || 'Une erreur est survenue'}</p>
            <Button
              variant='outline'
              className='mt-4'
              onClick={() => statsQuery.refetch()}
            >
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className='grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-5'>
              <KpiCard
                icon={FileText}
                label='Dossiers ce mois'
                value={stats.dossiersThisMonth}
                sublabel={`${stats.totalDCs} au total`}
                tone='blue'
              />
              <KpiCard
                icon={TrendingUp}
                label='En cours'
                value={stats.inProgressDossiers}
                sublabel='dossiers actifs'
                tone='orange'
              />
              <KpiCard
                icon={Mail}
                label='Invitations en attente'
                value={stats.pendingInvitations}
                sublabel='candidats a relancer'
                tone='purple'
              />
              <KpiCard
                icon={Clock}
                label='Temps moyen creation'
                value={`${stats.avgCreationTimeMinutes} min`}
                sublabel='dossiers termines'
                tone='green'
              />
              <KpiCard
                icon={Target}
                label='Completion moyenne'
                value={`${stats.avgCompletionRate}%`}
                sublabel='sur dossiers actifs'
                tone='blue'
              />
            </div>

            {/* Quick Actions + Alerts */}
            <div className='grid grid-cols-1 gap-6 mb-8 lg:grid-cols-12'>
              <div className='p-6 bg-white border border-gray-100 lg:col-span-7 rounded-2xl'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Actions rapides
                  </h2>
                  <Link href='/mes-dossiers'>
                    <Button variant='ghost' size='sm' className='text-blue-600'>
                      Voir tous <ArrowRight className='w-4 h-4 ml-1' />
                    </Button>
                  </Link>
                </div>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <QuickActionTile
                    icon={Sparkles}
                    title="Creer a partir d'un CV"
                    description='Extraction auto + template'
                    color='blue'
                    onClick={handleCreateDC}
                  />
                  <QuickActionTile
                    icon={Send}
                    title='Inviter un candidat'
                    description='Formulaire 3 minutes'
                    color='green'
                    onClick={handleInviteCandidate}
                  />
                  <QuickActionTile
                    icon={Library}
                    title='Dupliquer un dossier'
                    description='Depuis la DCTheque'
                    color='purple'
                    href='/mes-dossiers'
                  />
                  <QuickActionTile
                    icon={LayoutTemplate}
                    title='Templates'
                    description='Dupliquer / modifier'
                    color='pink'
                    href='/settings'
                  />
                  <QuickActionTile
                    icon={Upload}
                    title='Importer une AO'
                    description="Parser l'offre client"
                    color='orange'
                    href='/modules/ao-reader'
                  />
                </div>
              </div>

              <div className='p-6 bg-white border border-gray-100 lg:col-span-5 rounded-2xl'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Alertes & revues
                  </h2>
                  <span className='px-2 py-1 text-xs text-orange-600 rounded-full bg-orange-50'>
                    {alerts.length} alertes
                  </span>
                </div>
                {alerts.length === 0 ? (
                  <div className='py-6 text-sm text-center text-gray-500'>
                    Aucun point critique aujourd&apos;hui.
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {alerts.slice(0, 5).map((alert: any) => (
                      <AlertRow key={alert.id} alert={alert} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline */}
            <div className='p-6 mb-8 bg-white border border-gray-100 rounded-2xl'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Pipeline dossiers
                </h2>
                <Link href='/mes-dossiers'>
                  <Button variant='ghost' size='sm' className='text-blue-600'>
                    Voir pipeline <ArrowRight className='w-4 h-4 ml-1' />
                  </Button>
                </Link>
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <PipelineColumn
                  title='Brouillon'
                  tone='gray'
                  data={pipeline.draft}
                />
                <PipelineColumn
                  title='En cours'
                  tone='blue'
                  data={pipeline.in_progress}
                />
                <PipelineColumn
                  title='Termine'
                  tone='green'
                  data={pipeline.completed}
                />
                <PipelineColumn
                  title='Envoye'
                  tone='purple'
                  data={pipeline.sent}
                />
              </div>
            </div>

            {/* Recent Dossiers + Candidates */}
            <div className='grid grid-cols-1 gap-6 mb-8 lg:grid-cols-12'>
              <div className='p-6 bg-white border border-gray-100 lg:col-span-7 rounded-2xl'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Dossiers recents
                  </h2>
                  <div className='flex items-center gap-3'>
                    <div className='relative mr-3'>
                      <Search className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />
                      <Input
                        placeholder='Rechercher...'
                        className='w-56 pl-10 rounded-xl'
                        value={state.searchQuery}
                        onChange={(e) =>
                          dispatch({
                            type: 'SET_SEARCH',
                            payload: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Link href='/mes-dossiers'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-blue-600'
                      >
                        Voir tous <ArrowRight className='w-4 h-4 ml-1' />
                      </Button>
                    </Link>
                  </div>
                </div>

                {filteredRecentDossiers.length === 0 ? (
                  <div className='p-8 text-center text-gray-500'>
                    <FileText className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p className='font-medium'>Aucun dossier trouve</p>
                    <p className='text-sm'>
                      Creez votre premier dossier de competences
                    </p>
                    <Button className='gap-2 mt-4' onClick={handleCreateDC}>
                      <Plus className='w-4 h-4' />
                      Creer un dossier
                    </Button>
                  </div>
                ) : (
                  <div className='overflow-hidden border border-gray-100 rounded-xl'>
                    <div className='grid grid-cols-[2fr_1.2fr_1fr_1fr] gap-4 px-4 py-3 text-xs font-semibold text-gray-500 bg-gray-50'>
                      <span>Dossier</span>
                      <span>Client</span>
                      <span>Statut</span>
                      <span>Score</span>
                    </div>
                    <div className='divide-y divide-gray-100'>
                      {filteredRecentDossiers.map((dc: any) => (
                        <RecentDossierRow key={dc.id} dossier={dc} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='p-6 bg-white border border-gray-100 lg:col-span-5 rounded-2xl'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Candidats recents
                  </h2>
                  <span className='px-2 py-1 text-xs text-green-600 rounded-full bg-green-50'>
                    {stats.newCandidatesThisMonth} ce mois
                  </span>
                </div>
                {recentCandidates.length === 0 ? (
                  <div className='py-6 text-sm text-center text-gray-500'>
                    Aucun candidat recent.
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {recentCandidates.map((candidate: any) => (
                      <RecentCandidateRow
                        key={candidate.id}
                        candidate={candidate}
                      />
                    ))}
                  </div>
                )}
                <Link href='/mes-candidats'>
                  <Button
                    variant='ghost'
                    className='w-full mt-4 text-sm text-gray-500'
                  >
                    Voir tous les candidats
                  </Button>
                </Link>
              </div>
            </div>

            {/* Templates + Compliance */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
              <div className='p-6 bg-white border border-gray-100 lg:col-span-8 rounded-2xl'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Templates les plus utilises
                  </h2>
                  <Link href='/settings'>
                    <Button variant='ghost' size='sm' className='text-blue-600'>
                      Gerer <ArrowRight className='w-4 h-4 ml-1' />
                    </Button>
                  </Link>
                </div>
                <div className='space-y-2'>
                  {templates.slice(0, 6).map((template: any) => (
                    <TemplateUsageRow key={template.id} template={template} />
                  ))}
                </div>
              </div>

              <div className='p-6 border border-blue-100 lg:col-span-4 bg-blue-50 rounded-2xl'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-2 bg-blue-100 rounded-lg'>
                    <PieChart className='w-5 h-5 text-blue-600' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-blue-900'>
                      Résumé du Pipeline
                    </h3>
                    <p className='text-xs text-blue-700'>
                      Répartition par statut
                    </p>
                  </div>
                </div>
                <div className='space-y-3'>
                  {[
                    {
                      label: 'Brouillons',
                      count: pipeline.draft.count,
                      color: 'bg-gray-400',
                    },
                    {
                      label: 'En cours',
                      count: pipeline.in_progress.count,
                      color: 'bg-orange-400',
                    },
                    {
                      label: 'Terminés',
                      count: pipeline.completed.count,
                      color: 'bg-green-400',
                    },
                    {
                      label: 'Envoyés',
                      count: pipeline.sent.count,
                      color: 'bg-blue-400',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className='flex items-center justify-between'
                    >
                      <div className='flex items-center gap-2'>
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className='text-sm text-blue-800'>
                          {item.label}
                        </span>
                      </div>
                      <span className='font-semibold text-blue-900'>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create DC Modal */}
      {state.showCreateModal && (
        <CreateDCModal
          onClose={() => dispatch({ type: 'TOGGLE_CREATE_MODAL' })}
        />
      )}

      {/* Invite Candidate Modal */}
      {state.showInviteModal && (
        <InviteCandidateModal
          onClose={() => dispatch({ type: 'TOGGLE_INVITE_MODAL' })}
        />
      )}
    </>
  );
}

// Components

interface KpiCardProps {
  icon: typeof FileText;
  label: string;
  value: string | number;
  sublabel: string;
  tone: 'blue' | 'green' | 'orange' | 'purple';
}

function KpiCard({ icon: Icon, label, value, sublabel, tone }: KpiCardProps) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className='p-5 bg-white border border-gray-100 rounded-2xl'>
      <div className='flex items-center gap-3 mb-3'>
        <div className={`p-2 rounded-lg ${tones[tone]}`}>
          <Icon className='w-5 h-5' />
        </div>
        <span className='text-sm text-gray-500'>{label}</span>
      </div>
      <div className='text-3xl font-bold text-gray-900'>{value}</div>
      <div className='mt-1 text-xs text-gray-400'>{sublabel}</div>
    </div>
  );
}

interface QuickActionTileProps {
  icon: typeof FileText;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'pink' | 'orange';
  onClick?: () => void;
  href?: string;
}

function QuickActionTile({
  icon: Icon,
  title,
  description,
  color,
  onClick,
  href,
}: QuickActionTileProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100',
    purple:
      'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100',
    orange:
      'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100',
  };

  const content = (
    <div
      className={`p-4 rounded-xl border cursor-pointer transition-colors ${colors[color]}`}
    >
      <div className='flex items-center gap-3'>
        <Icon className='w-6 h-6' />
        <div>
          <div className='font-semibold'>{title}</div>
          <div className='text-xs opacity-80'>{description}</div>
        </div>
        <ChevronRight className='w-5 h-5 ml-auto opacity-50' />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
}

function PipelineColumn({
  title,
  tone,
  data,
}: {
  title: string;
  tone: 'gray' | 'blue' | 'green' | 'purple';
  data: PipelineColumnData;
}) {
  const tones = {
    gray: 'bg-gray-50 text-gray-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className='p-4 bg-white border border-gray-100 rounded-xl'>
      <div className='flex items-center justify-between mb-3'>
        <span className='font-semibold text-gray-900'>{title}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${tones[tone]}`}>
          {data.count}
        </span>
      </div>
      <div className='space-y-2'>
        {data.items.length === 0 ? (
          <div className='text-xs text-gray-400'>Aucun dossier</div>
        ) : (
          data.items.map((item) => (
            <div key={item.id} className='p-3 rounded-lg bg-gray-50'>
              <div className='text-sm font-medium text-gray-900 truncate'>
                {item.title}
              </div>
              <div className='text-xs text-gray-500 truncate'>
                {item.client ?? 'Client non renseigne'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AlertRow({ alert }: { alert: DashboardAlert }) {
  const severity = {
    info: 'bg-blue-50 text-blue-600',
    warning: 'bg-orange-50 text-orange-700',
    danger: 'bg-red-50 text-red-600',
  };
  const icon = alert.severity === 'danger' ? AlertTriangle : Clock;
  const Icon = icon;

  return (
    <div className='flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl'>
      <div className={`p-2 rounded-lg ${severity[alert.severity]}`}>
        <Icon className='w-4 h-4' />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='text-sm font-semibold text-gray-900 truncate'>
          {alert.title}
        </div>
        <div className='text-xs text-gray-500'>{alert.description}</div>
      </div>
      {alert.ctaLabel && (
        <Link href={alert.ctaHref ?? '/mes-dossiers'}>
          <Button variant='ghost' size='sm' className='text-blue-600'>
            {alert.ctaLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}

function RecentDossierRow({ dossier }: { dossier: RecentDossier }) {
  const status = statusConfig[dossier.status];

  return (
    <div className='grid grid-cols-[2fr_1.2fr_1fr_1fr] gap-4 px-4 py-3 text-sm items-center'>
      <div className='font-medium text-gray-900 truncate'>{dossier.title}</div>
      <div className='text-gray-500 truncate'>
        {dossier.client ?? 'Client non renseigne'}
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full w-fit ${status.bgColor} ${status.color}`}
      >
        {status.label}
      </span>
      <div className='font-medium text-gray-700'>{dossier.score}%</div>
    </div>
  );
}

function RecentCandidateRow({ candidate }: { candidate: RecentCandidate }) {
  return (
    <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'>
      <div className='flex items-center justify-center w-10 h-10 bg-white border border-gray-100 rounded-lg'>
        <Users className='w-5 h-5 text-gray-400' />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='text-sm font-medium text-gray-900 truncate'>
          {candidate.name}
        </div>
        <div className='text-xs text-gray-500 truncate'>
          {candidate.status} · {candidate.availability}
        </div>
      </div>
      <div className='text-xs text-gray-400'>{candidate.lastActivity}</div>
    </div>
  );
}

function TemplateUsageRow({ template }: { template: DCTemplate }) {
  return (
    <button className='flex items-center w-full gap-3 p-3 text-left transition-colors hover:bg-gray-50 rounded-xl'>
      <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200'>
        <LayoutTemplate className='w-5 h-5 text-gray-500' />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='text-sm font-medium text-gray-900 truncate'>
          {template.name}
        </div>
        <div className='text-xs text-gray-500'>
          {template.usageCount} utilisations
        </div>
      </div>
      <ChevronRight className='w-4 h-4 text-gray-400' />
    </button>
  );
}

function CreateDCModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useReducer(
    (_: string, action: string) => action,
    'method'
  );

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'
      onClick={onClose}
    >
      <div
        className='w-full max-w-lg bg-white rounded-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-bold text-gray-900'>
            Créer un Dossier de Compétences
          </h2>
          <p className='mt-1 text-sm text-gray-500'>
            Choisissez la méthode de création
          </p>
        </div>

        <div className='p-6'>
          {step === 'method' && (
            <div className='space-y-3'>
              <button
                className='w-full p-4 text-left transition-colors border-2 border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100'
                onClick={() => setStep('upload')}
              >
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-blue-100 rounded-xl'>
                    <FileUp className='w-6 h-6 text-blue-600' />
                  </div>
                  <div>
                    <div className='font-semibold text-blue-900'>
                      À partir d&apos;un CV
                    </div>
                    <div className='text-sm text-blue-700'>
                      Import automatique des informations
                    </div>
                  </div>
                  <Sparkles className='w-5 h-5 ml-auto text-blue-500' />
                </div>
              </button>

              <button
                className='w-full p-4 text-left transition-colors border-2 border-gray-200 rounded-xl hover:bg-gray-50'
                onClick={() => setStep('form')}
              >
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-gray-100 rounded-xl'>
                    <Edit3 className='w-6 h-6 text-gray-600' />
                  </div>
                  <div>
                    <div className='font-semibold text-gray-900'>
                      Saisie manuelle
                    </div>
                    <div className='text-sm text-gray-500'>
                      Remplir le formulaire étape par étape
                    </div>
                  </div>
                </div>
              </button>

              <Link href='/mes-dossiers'>
                <button className='w-full p-4 text-left transition-colors border-2 border-gray-200 rounded-xl hover:bg-gray-50'>
                  <div className='flex items-center gap-4'>
                    <div className='p-3 bg-gray-100 rounded-xl'>
                      <Copy className='w-6 h-6 text-gray-600' />
                    </div>
                    <div>
                      <div className='font-semibold text-gray-900'>
                        Dupliquer un DC existant
                      </div>
                      <div className='text-sm text-gray-500'>
                        Partir d&apos;un dossier de la DCThèque
                      </div>
                    </div>
                  </div>
                </button>
              </Link>
            </div>
          )}

          {step === 'upload' && (
            <div className='space-y-4'>
              <div className='p-8 text-center transition-colors border-2 border-gray-200 border-dashed cursor-pointer rounded-xl hover:border-blue-300'>
                <FileUp className='w-12 h-12 mx-auto mb-4 text-gray-400' />
                <p className='font-medium text-gray-700'>Glissez un CV ici</p>
                <p className='mt-1 text-sm text-gray-500'>
                  ou cliquez pour sélectionner (PDF, Word)
                </p>
              </div>

              <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                  Template
                </label>
                <select className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20'>
                  <option>Template Standard</option>
                  <option>Template BNP Paribas</option>
                  <option>Template Société Générale</option>
                </select>
              </div>

              <div className='flex gap-3 pt-4'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={() => setStep('method')}
                >
                  Retour
                </Button>
                <Button
                  className='flex-1 text-white bg-blue-600 hover:bg-blue-700'
                  onClick={() => router.push('/cv-builder?modal=import')}
                >
                  Générer le DC
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InviteCandidateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  
  const { sendInvitation } = useDashboard();
  const isSubmitting = sendInvitation.isPending;

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Nom et email requis.');
      return;
    }

    try {
      await sendInvitation.mutateAsync({ name, email, title });
      toast.success('Invitation envoyee.');
      onClose();
      onCreated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur inconnue.');
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'
      onClick={onClose}
    >
      <div
        className='w-full max-w-lg bg-white rounded-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='p-6 border-b border-gray-100'>
          <h2 className='text-xl font-bold text-gray-900'>
            Inviter un candidat
          </h2>
          <p className='mt-1 text-sm text-gray-500'>
            Le candidat remplira son DC en 3 minutes
          </p>
        </div>

        <div className='p-6 space-y-4'>
          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Nom du candidat
            </label>
            <Input
              placeholder='Jean Dupont'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Email
            </label>
            <Input
              type='email'
              placeholder='jean.dupont@email.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Poste
            </label>
            <Input
              placeholder='Developpeur Full Stack'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>
              Template
            </label>
            <select className='w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20'>
              <option>Template Standard</option>
              <option>Template BNP Paribas</option>
              <option>Template Société Générale</option>
            </select>
          </div>

          <div className='p-4 bg-blue-50 rounded-xl'>
            <div className='flex items-start gap-3'>
              <Sparkles className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
              <div>
                <p className='text-sm font-medium text-blue-900'>
                  Expérience candidat optimisée
                </p>
                <p className='mt-1 text-xs text-blue-700'>
                  Le candidat recevra un lien unique pour remplir son DC
                  directement en ligne, sans téléchargement. Temps moyen : 3
                  minutes.
                </p>
              </div>
            </div>
          </div>

          <div className='flex gap-3 pt-2'>
            <Button variant='outline' className='flex-1' onClick={onClose}>
              Annuler
            </Button>
            <Button
              className='flex-1 gap-2 text-white bg-green-600 hover:bg-green-700'
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send className='w-4 h-4' />
              {isSubmitting ? 'Envoi...' : "Envoyer l'invitation"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
