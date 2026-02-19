'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Grid, List, Search, Star, X } from 'lucide-react';
import React, { useState } from 'react';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (templateId: string) => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const templates = [
    // Compact Templates
    {
      id: 'compact',
      name: 'Compact',
      category: 'modern',
      isPremium: false,
      isPopular: true,
      preview: '/templates/compact.png',
      description: 'Design compact et professionnel',
    },
    {
      id: 'performance',
      name: 'Performance',
      category: 'modern',
      isPremium: false,
      isPopular: true,
      preview: '/templates/performance.png',
      description: 'Template optimisé pour la performance',
    },
    {
      id: 'multicolone',
      name: 'Multicolone',
      category: 'creative',
      isPremium: false,
      isPopular: false,
      preview: '/templates/multicolone.png',
      description: 'Mise en page multi-colonnes',
    },
    {
      id: 'classique',
      name: 'Classique',
      category: 'classic',
      isPremium: false,
      isPopular: true,
      preview: '/templates/classique.png',
      description: 'Design classique et intemporel',
    },
    // Modern Templates
    {
      id: 'moderna',
      name: 'Moderna',
      category: 'modern',
      isPremium: true,
      isPopular: false,
      preview: '/templates/moderna.png',
      description: 'Design moderne et élégant',
    },
    {
      id: 'minimal',
      name: 'Minimal',
      category: 'modern',
      isPremium: false,
      isPopular: true,
      preview: '/templates/minimal.png',
      description: 'Approche minimaliste',
    },
    {
      id: 'professional',
      name: 'Professional',
      category: 'business',
      isPremium: true,
      isPopular: false,
      preview: '/templates/professional.png',
      description: 'Template professionnel',
    },
    {
      id: 'creative',
      name: 'Creative',
      category: 'creative',
      isPremium: true,
      isPopular: false,
      preview: '/templates/creative.png',
      description: 'Design créatif et artistique',
    },
    // Academic Templates
    {
      id: 'academic',
      name: 'Academic',
      category: 'academic',
      isPremium: false,
      isPopular: false,
      preview: '/templates/academic.png',
      description: 'Template académique',
    },
    {
      id: 'research',
      name: 'Research',
      category: 'academic',
      isPremium: true,
      isPopular: false,
      preview: '/templates/research.png',
      description: 'Orienté recherche',
    },
    // Creative Templates
    {
      id: 'artistic',
      name: 'Artistic',
      category: 'creative',
      isPremium: true,
      isPopular: false,
      preview: '/templates/artistic.png',
      description: 'Design artistique',
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      category: 'creative',
      isPremium: true,
      isPopular: false,
      preview: '/templates/portfolio.png',
      description: 'Idéal pour portfolios',
    },
    // Business Templates
    {
      id: 'executive',
      name: 'Executive',
      category: 'business',
      isPremium: true,
      isPopular: false,
      preview: '/templates/executive.png',
      description: 'Template exécutif',
    },
    {
      id: 'corporate',
      name: 'Corporate',
      category: 'business',
      isPremium: true,
      isPopular: false,
      preview: '/templates/corporate.png',
      description: 'Style corporate',
    },
    {
      id: 'finance',
      name: 'Finance',
      category: 'business',
      isPremium: true,
      isPopular: false,
      preview: '/templates/finance.png',
      description: 'Spécialisé finance',
    },
  ];

  const categories = [
    { id: 'all', name: 'Tous les templates', count: templates.length },
    {
      id: 'modern',
      name: 'Moderne',
      count: templates.filter((t) => t.category === 'modern').length,
    },
    {
      id: 'classic',
      name: 'Classique',
      count: templates.filter((t) => t.category === 'classic').length,
    },
    {
      id: 'creative',
      name: 'Créatif',
      count: templates.filter((t) => t.category === 'creative').length,
    },
    {
      id: 'business',
      name: 'Business',
      count: templates.filter((t) => t.category === 'business').length,
    },
    {
      id: 'academic',
      name: 'Académique',
      count: templates.filter((t) => t.category === 'academic').length,
    },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularTemplates = templates.filter((template) => template.isPopular);

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate?.(templateId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className='bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-100'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Choisir un template
              </h2>
              <p className='text-gray-600 mt-1'>
                Sélectionnez un template qui correspond à votre style
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              {/* View Mode Toggle */}
              <div className='flex bg-gray-100 rounded-lg p-1'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid className='w-4 h-4' />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className='w-4 h-4' />
                </button>
              </div>

              <button
                onClick={onClose}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='w-6 h-6 text-gray-500' />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className='p-6 border-b border-gray-100 bg-gray-50'>
            <div className='flex flex-col lg:flex-row gap-4'>
              {/* Search */}
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Rechercher un template...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              {/* Category Filter */}
              <div className='flex gap-2 overflow-x-auto'>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors
                      ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }
                    `}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Templates Section */}
          {selectedCategory === 'all' && !searchTerm && (
            <div className='p-6 bg-blue-50 border-b border-gray-100'>
              <div className='flex items-center mb-4'>
                <Star className='w-5 h-5 text-blue-600 mr-2' />
                <h3 className='text-lg font-semibold text-gray-900'>
                  Templates populaires
                </h3>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {popularTemplates.slice(0, 4).map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className='group cursor-pointer'
                  >
                    <div className='relative bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all p-3'>
                      {template.isPremium && (
                        <div className='absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full'>
                          <Crown className='w-3 h-3' />
                        </div>
                      )}
                      <div className='aspect-[3/4] bg-gray-100 rounded-md mb-2 flex items-center justify-center'>
                        <span className='text-gray-500 text-xs'>
                          {template.name}
                        </span>
                      </div>
                      <h4 className='font-medium text-sm text-gray-900'>
                        {template.name}
                      </h4>
                      <p className='text-xs text-gray-500 mt-1'>
                        {template.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Templates Grid/List */}
          <div className='p-6 overflow-y-auto max-h-[60vh]'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {searchTerm
                  ? `Résultats de recherche (${filteredTemplates.length})`
                  : selectedCategory === 'all'
                  ? `Tous les templates (${filteredTemplates.length})`
                  : `${
                      categories.find((c) => c.id === selectedCategory)?.name
                    } (${filteredTemplates.length})`}
              </h3>
            </div>

            <div
              className={`
              ${
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            `}
            >
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`
                    group cursor-pointer
                    ${
                      viewMode === 'grid'
                        ? ''
                        : 'flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100'
                    }
                  `}
                >
                  {viewMode === 'grid' ? (
                    <div className='relative bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all p-4'>
                      {template.isPremium && (
                        <div className='absolute top-3 right-3 bg-yellow-500 text-white p-1.5 rounded-full'>
                          <Crown className='w-4 h-4' />
                        </div>
                      )}
                      {template.isPopular && (
                        <div className='absolute top-3 left-3 bg-blue-500 text-white p-1.5 rounded-full'>
                          <Star className='w-4 h-4' />
                        </div>
                      )}

                      <div className='aspect-[3/4] bg-gray-100 rounded-md mb-3 flex items-center justify-center'>
                        <span className='text-gray-500 text-sm'>
                          {template.name}
                        </span>
                      </div>

                      <h4 className='font-semibold text-gray-900 mb-1'>
                        {template.name}
                      </h4>
                      <p className='text-sm text-gray-600 mb-3'>
                        {template.description}
                      </p>

                      <button className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium'>
                        Sélectionner
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className='relative'>
                        <div className='w-24 h-32 bg-gray-100 rounded-md flex items-center justify-center'>
                          <span className='text-gray-500 text-xs'>
                            {template.name}
                          </span>
                        </div>
                        {template.isPremium && (
                          <Crown className='w-4 h-4 text-yellow-500 absolute -top-1 -right-1' />
                        )}
                      </div>

                      <div className='flex-1'>
                        <div className='flex items-center mb-1'>
                          <h4 className='font-semibold text-gray-900'>
                            {template.name}
                          </h4>
                          {template.isPopular && (
                            <Star className='w-4 h-4 text-blue-500 ml-2' />
                          )}
                        </div>
                        <p className='text-gray-600 mb-2'>
                          {template.description}
                        </p>
                        <span className='inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs'>
                          {
                            categories.find((c) => c.id === template.category)
                              ?.name
                          }
                        </span>
                      </div>

                      <button className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium'>
                        Sélectionner
                      </button>
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className='text-center py-12'>
                <div className='text-gray-400 text-6xl mb-4'>📄</div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Aucun template trouvé
                </h3>
                <p className='text-gray-600'>
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='p-6 border-t border-gray-100 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                💡 <strong>Conseil :</strong> Vous pourrez personnaliser votre
                template après l'avoir sélectionné
              </div>
              <button
                onClick={onClose}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Annuler
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
