'use client';

import {
  Bookmark,
  BookMarked,
  BookOpen,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  LayoutGrid,
  List,
  Search,
  Tag,
  X,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ResourceCategory =
  | 'all'
  | 'guide'
  | 'template'
  | 'letter'
  | 'checklist'
  | 'video';
type ResourceColor =
  | 'blue'
  | 'pink'
  | 'purple'
  | 'green'
  | 'orange'
  | 'cyan'
  | 'red';

interface Resource {
  id: string;
  category: ResourceCategory;
  title: string;
  description: string;
  readTime: string;
  color: ResourceColor;
  tags: string[];
  downloadable: boolean;
  url?: string;
  views: number;
  bookmarked: boolean;
  createdAt: string;
}

const initialResources: Resource[] = [
  {
    id: '1',
    category: 'guide',
    title: 'Réussir son entretien technique',
    description:
      "Guide complet pour préparer et exceller lors d'un entretien technique en développement.",
    readTime: '10 min',
    color: 'blue',
    tags: ['entretien', 'technique', 'développeur'],
    downloadable: true,
    views: 1250,
    bookmarked: false,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    category: 'template',
    title: 'Template CV "Modern Tech"',
    description:
      'Un template de CV moderne et ATS-friendly pour les profils techniques.',
    readTime: 'Téléchargement',
    color: 'pink',
    tags: ['cv', 'template', 'ats'],
    downloadable: true,
    views: 3420,
    bookmarked: true,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    category: 'letter',
    title: 'Lettre de motivation spontanée',
    description:
      'Modèle de lettre de motivation pour candidature spontanée dans le secteur tech.',
    readTime: 'Copier/Coller',
    color: 'purple',
    tags: ['lettre', 'candidature', 'modèle'],
    downloadable: false,
    views: 890,
    bookmarked: false,
    createdAt: '2024-01-08',
  },
  {
    id: '4',
    category: 'guide',
    title: 'Négocier son salaire en 2026',
    description:
      'Stratégies et tactiques pour négocier efficacement votre rémunération.',
    readTime: '15 min',
    color: 'green',
    tags: ['salaire', 'négociation', 'carrière'],
    downloadable: true,
    views: 2100,
    bookmarked: true,
    createdAt: '2024-01-05',
  },
  {
    id: '5',
    category: 'checklist',
    title: "Avant d'envoyer votre candidature",
    description:
      "Liste de vérification pour s'assurer que votre dossier est complet et professionnel.",
    readTime: '5 min',
    color: 'orange',
    tags: ['checklist', 'candidature', 'vérification'],
    downloadable: true,
    views: 1560,
    bookmarked: false,
    createdAt: '2024-01-03',
  },
  {
    id: '6',
    category: 'template',
    title: 'Template CV "Minimalist"',
    description: 'Design épuré et élégant pour les profils créatifs et design.',
    readTime: 'Téléchargement',
    color: 'cyan',
    tags: ['cv', 'template', 'design'],
    downloadable: true,
    views: 2800,
    bookmarked: false,
    createdAt: '2024-01-02',
  },
  {
    id: '7',
    category: 'guide',
    title: 'Construire son personal branding',
    description:
      'Comment développer votre marque personnelle sur LinkedIn et au-delà.',
    readTime: '20 min',
    color: 'blue',
    tags: ['linkedin', 'branding', 'réseau'],
    downloadable: true,
    views: 980,
    bookmarked: false,
    createdAt: '2024-01-01',
  },
  {
    id: '8',
    category: 'letter',
    title: 'Email de relance après entretien',
    description:
      "Modèles d'emails de suivi professionnels après un entretien d'embauche.",
    readTime: 'Copier/Coller',
    color: 'purple',
    tags: ['email', 'relance', 'entretien'],
    downloadable: false,
    views: 1200,
    bookmarked: false,
    createdAt: '2023-12-28',
  },
  {
    id: '9',
    category: 'checklist',
    title: 'Onboarding réussi - 30 premiers jours',
    description:
      'Guide pour réussir vos 30 premiers jours dans un nouveau poste.',
    readTime: '8 min',
    color: 'green',
    tags: ['onboarding', 'nouveau poste', 'intégration'],
    downloadable: true,
    views: 750,
    bookmarked: false,
    createdAt: '2023-12-25',
  },
  {
    id: '10',
    category: 'video',
    title: 'Maîtriser le storytelling en entretien',
    description:
      "Vidéo tutoriel sur l'art de raconter votre parcours de manière captivante.",
    readTime: '25 min',
    color: 'red',
    tags: ['vidéo', 'storytelling', 'entretien'],
    downloadable: false,
    url: '#',
    views: 4200,
    bookmarked: true,
    createdAt: '2023-12-20',
  },
];

const categoryLabels: Record<ResourceCategory, string> = {
  all: 'Tous',
  guide: 'Guides',
  template: 'Modèles CV',
  letter: 'Lettres',
  checklist: 'Checklists',
  video: 'Vidéos',
};

const bgColors: Record<ResourceColor, string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  red: 'bg-red-50 text-red-600 border-red-100',
};

export default function LibraryPage() {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const toggleBookmark = useCallback((resourceId: string) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId ? { ...r, bookmarked: !r.bookmarked } : r
      )
    );
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Category filter
      if (activeCategory !== 'all' && resource.category !== activeCategory) {
        return false;
      }

      // Bookmarks filter
      if (showBookmarksOnly && !resource.bookmarked) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          resource.title.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [resources, activeCategory, showBookmarksOnly, searchQuery]);

  const bookmarkedCount = useMemo(
    () => resources.filter((r) => r.bookmarked).length,
    [resources]
  );

  const handleCopyContent = useCallback(async () => {
    if (!selectedResource) return;
    await navigator.clipboard.writeText(
      `${selectedResource.title}\n\n${selectedResource.description}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [selectedResource]);

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-cyan-50 rounded-lg text-cyan-600'>
              <BookOpen className='w-5 h-5' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                Ressources & Bibliothèque
              </h1>
              <p className='text-sm text-gray-500'>
                {filteredResources.length} ressources disponibles
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant={showBookmarksOnly ? 'default' : 'outline'}
              className={`gap-2 ${
                showBookmarksOnly ? 'bg-cyan-600 hover:bg-cyan-700' : ''
              }`}
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            >
              <BookMarked className='w-4 h-4' />
              Favoris ({bookmarkedCount})
            </Button>
            <div className='flex border border-gray-200 rounded-lg overflow-hidden'>
              <button
                className={`p-2 ${
                  viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className='w-4 h-4' />
              </button>
              <button
                className={`p-2 ${
                  viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-8'>
        {/* Filters Bar */}
        <div className='flex items-center justify-between mb-8 flex-wrap gap-4'>
          <div className='flex gap-2 flex-wrap'>
            {(Object.keys(categoryLabels) as ResourceCategory[]).map(
              (category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'default' : 'outline'}
                  className={`rounded-xl ${
                    activeCategory === category
                      ? 'bg-cyan-600 hover:bg-cyan-700'
                      : 'bg-white'
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {categoryLabels[category]}
                </Button>
              )
            )}
          </div>
          <div className='relative'>
            <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Rechercher...'
              className='w-64 pl-10 rounded-xl border-gray-200 bg-white'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                onClick={() => setSearchQuery('')}
              >
                <X className='w-4 h-4' />
              </button>
            )}
          </div>
        </div>

        {/* Resources Grid/List */}
        {filteredResources.length === 0 ? (
          <div className='text-center py-20'>
            <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <BookOpen className='w-10 h-10 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-600 mb-2'>
              Aucune ressource trouvée
            </h3>
            <p className='text-sm text-gray-400'>
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onToggleBookmark={toggleBookmark}
                onSelect={setSelectedResource}
              />
            ))}
          </div>
        ) : (
          <div className='space-y-3'>
            {filteredResources.map((resource) => (
              <ResourceListItem
                key={resource.id}
                resource={resource}
                onToggleBookmark={toggleBookmark}
                onSelect={setSelectedResource}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resource Preview Modal */}
      {selectedResource && (
        <div
          className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8'
          onClick={() => setSelectedResource(null)}
        >
          <div
            className='bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='p-6 border-b border-gray-100'>
              <div className='flex items-start justify-between'>
                <div>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      bgColors[selectedResource.color]
                    } mb-3`}
                  >
                    {categoryLabels[selectedResource.category]}
                  </span>
                  <h2 className='text-xl font-bold text-gray-900'>
                    {selectedResource.title}
                  </h2>
                </div>
                <button
                  className='p-2 hover:bg-gray-100 rounded-lg'
                  onClick={() => setSelectedResource(null)}
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
            </div>

            <div className='p-6'>
              <p className='text-gray-600 mb-6'>
                {selectedResource.description}
              </p>

              <div className='flex flex-wrap gap-2 mb-6'>
                {selectedResource.tags.map((tag) => (
                  <span
                    key={tag}
                    className='px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm'
                  >
                    <Tag className='w-3 h-3 inline mr-1' />
                    {tag}
                  </span>
                ))}
              </div>

              <div className='flex items-center gap-6 text-sm text-gray-500 mb-6'>
                <span className='flex items-center gap-1'>
                  <Clock className='w-4 h-4' />
                  {selectedResource.readTime}
                </span>
                <span className='flex items-center gap-1'>
                  <Eye className='w-4 h-4' />
                  {selectedResource.views.toLocaleString()} vues
                </span>
              </div>

              <div className='flex gap-3'>
                {selectedResource.downloadable && (
                  <Button className='gap-2 bg-cyan-600 hover:bg-cyan-700 text-white'>
                    <Download className='w-4 h-4' />
                    Télécharger
                  </Button>
                )}
                {selectedResource.url && (
                  <Button variant='outline' className='gap-2'>
                    <ExternalLink className='w-4 h-4' />
                    Ouvrir
                  </Button>
                )}
                <Button
                  variant='outline'
                  className='gap-2'
                  onClick={handleCopyContent}
                >
                  {copied ? (
                    <Check className='w-4 h-4' />
                  ) : (
                    <Copy className='w-4 h-4' />
                  )}
                  {copied ? 'Copié !' : 'Copier'}
                </Button>
                <Button
                  variant='outline'
                  className={`gap-2 ${
                    selectedResource.bookmarked
                      ? 'text-cyan-600 border-cyan-200'
                      : ''
                  }`}
                  onClick={() => toggleBookmark(selectedResource.id)}
                >
                  {selectedResource.bookmarked ? (
                    <BookMarked className='w-4 h-4' />
                  ) : (
                    <Bookmark className='w-4 h-4' />
                  )}
                  {selectedResource.bookmarked ? 'Retirer' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface ResourceCardProps {
  resource: Resource;
  onToggleBookmark: (id: string) => void;
  onSelect: (resource: Resource) => void;
}

function ResourceCard({
  resource,
  onToggleBookmark,
  onSelect,
}: ResourceCardProps) {
  return (
    <div
      className='group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer'
      onClick={() => onSelect(resource)}
    >
      <div className='flex justify-between items-start mb-4'>
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
            bgColors[resource.color]
          }`}
        >
          {categoryLabels[resource.category]}
        </span>
        <button
          className={`${
            resource.bookmarked
              ? 'text-cyan-500'
              : 'text-gray-300 hover:text-gray-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(resource.id);
          }}
        >
          {resource.bookmarked ? (
            <BookMarked className='w-5 h-5' />
          ) : (
            <Bookmark className='w-5 h-5' />
          )}
        </button>
      </div>
      <h3 className='font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors'>
        {resource.title}
      </h3>
      <p className='text-sm text-gray-500 line-clamp-2 mb-4'>
        {resource.description}
      </p>
      <div className='flex items-center justify-between text-xs text-gray-400'>
        <div className='flex items-center gap-2'>
          <Clock className='w-4 h-4' />
          <span>{resource.readTime}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Eye className='w-4 h-4' />
          <span>{resource.views}</span>
        </div>
      </div>
    </div>
  );
}

interface ResourceListItemProps {
  resource: Resource;
  onToggleBookmark: (id: string) => void;
  onSelect: (resource: Resource) => void;
}

function ResourceListItem({
  resource,
  onToggleBookmark,
  onSelect,
}: ResourceListItemProps) {
  return (
    <div
      className='group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all cursor-pointer flex items-center gap-4'
      onClick={() => onSelect(resource)}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          bgColors[resource.color].split(' ')[0]
        }`}
      >
        <FileText
          className={`w-6 h-6 ${bgColors[resource.color].split(' ')[1]}`}
        />
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-1'>
          <h3 className='font-semibold text-gray-900 truncate group-hover:text-cyan-600 transition-colors'>
            {resource.title}
          </h3>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              bgColors[resource.color]
            }`}
          >
            {categoryLabels[resource.category]}
          </span>
        </div>
        <p className='text-sm text-gray-500 truncate'>{resource.description}</p>
      </div>

      <div className='flex items-center gap-4 flex-shrink-0'>
        <div className='text-xs text-gray-400 text-right'>
          <div className='flex items-center gap-1'>
            <Clock className='w-3 h-3' />
            {resource.readTime}
          </div>
          <div className='flex items-center gap-1 mt-1'>
            <Eye className='w-3 h-3' />
            {resource.views}
          </div>
        </div>
        <button
          className={`p-2 rounded-lg ${
            resource.bookmarked
              ? 'text-cyan-500 bg-cyan-50'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(resource.id);
          }}
        >
          {resource.bookmarked ? (
            <BookMarked className='w-5 h-5' />
          ) : (
            <Bookmark className='w-5 h-5' />
          )}
        </button>
      </div>
    </div>
  );
}
