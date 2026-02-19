'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import {
  Award,
  BookOpen,
  Briefcase,
  Camera,
  Code,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  Link,
  MessageSquare,
  Trophy,
  User,
  Users,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';

interface SectionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection?: (sectionType: string) => void;
  existingSections?: string[]; // Sections déjà ajoutées
}

export const SectionSelectorModal: React.FC<SectionSelectorModalProps> = ({
  isOpen,
  onClose,
  onAddSection,
  existingSections = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const sectionTypes = [
    {
      id: 'profil',
      name: 'Profil',
      description: 'Votre profil professionnel et présentation personnelle',
      icon: User,
      category: 'professional',
      popular: true,
    },
    {
      id: 'experience',
      name: 'Expérience professionnelle',
      description: 'Vos emplois précédents et actuels',
      icon: Briefcase,
      category: 'professional',
      popular: true,
    },
    {
      id: 'education',
      name: 'Formation',
      description: 'Vos diplômes et certifications',
      icon: GraduationCap,
      category: 'professional',
      popular: true,
    },
    {
      id: 'skills',
      name: 'Compétences',
      description: 'Vos compétences techniques et personnelles',
      icon: Zap,
      category: 'professional',
      popular: true,
    },
    {
      id: 'projects',
      name: 'Projets',
      description: 'Projets personnels ou professionnels',
      icon: Code,
      category: 'professional',
      popular: true,
    },
    {
      id: 'languages',
      name: 'Langues',
      description: 'Langues que vous parlez',
      icon: Globe,
      category: 'professional',
    },
    {
      id: 'certifications',
      name: 'Certifications',
      description: 'Certifications professionnelles',
      icon: Award,
      category: 'professional',
    },
    {
      id: 'volunteer',
      name: 'Bénévolat',
      description: 'Expériences de bénévolat',
      icon: Users,
      category: 'personal',
    },
    {
      id: 'awards',
      name: 'Récompenses',
      description: 'Prix et distinctions',
      icon: Trophy,
      category: 'personal',
    },
    {
      id: 'publications',
      name: 'Publications',
      description: 'Articles, livres, recherches',
      icon: BookOpen,
      category: 'academic',
    },
    {
      id: 'references',
      name: 'Références',
      description: 'Personnes de référence',
      icon: MessageSquare,
      category: 'professional',
    },
    {
      id: 'interests',
      name: "Centres d'intérêt",
      description: 'Vos hobbies et passions',
      icon: Heart,
      category: 'personal',
    },
    {
      id: 'links',
      name: 'Liens',
      description: 'Portfolio, LinkedIn, site web',
      icon: Link,
      category: 'professional',
    },
    {
      id: 'quote',
      name: 'Citation',
      description: 'Une citation inspirante',
      icon: MessageSquare,
      category: 'creative',
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      description: 'Galerie de vos œuvres',
      icon: Camera,
      category: 'creative',
    },
    {
      id: 'courses',
      name: 'Cours & Formations',
      description: 'Cours suivis et formations complémentaires',
      icon: BookOpen,
      category: 'academic',
    },
    {
      id: 'technology',
      name: 'Technologies',
      description: 'Stack technique et outils maîtrisés',
      icon: Code,
      category: 'professional',
    },
    {
      id: 'passion',
      name: 'Passions',
      description: 'Vos passions et activités favorites',
      icon: Heart,
      category: 'personal',
    },
    {
      id: 'achievement',
      name: 'Réalisations',
      description: 'Accomplissements et succès majeurs',
      icon: Trophy,
      category: 'professional',
    },
    {
      id: 'talent',
      name: 'Talents',
      description: 'Compétences et aptitudes particulières',
      icon: Zap,
      category: 'professional',
    },
  ];

  // Filtrer les sections disponibles (non encore ajoutées)
  const availableSections = useMemo(
    () =>
      sectionTypes.filter((section) => !existingSections.includes(section.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingSections]
  );

  // Calculer les catégories avec le nombre de sections disponibles
  const categories = useMemo(
    () => [
      { id: 'all', name: 'Toutes', count: availableSections.length },
      {
        id: 'professional',
        name: 'Professionnel',
        count: availableSections.filter((s) => s.category === 'professional')
          .length,
      },
      {
        id: 'personal',
        name: 'Personnel',
        count: availableSections.filter((s) => s.category === 'personal')
          .length,
      },
      {
        id: 'creative',
        name: 'Créatif',
        count: availableSections.filter((s) => s.category === 'creative')
          .length,
      },
      {
        id: 'academic',
        name: 'Académique',
        count: availableSections.filter((s) => s.category === 'academic')
          .length,
      },
    ],
    [availableSections]
  );

  // Filtrer selon la catégorie sélectionnée
  const filteredSections = useMemo(
    () =>
      availableSections.filter(
        (section) =>
          selectedCategory === 'all' || section.category === selectedCategory
      ),
    [availableSections, selectedCategory]
  );

  // Sections populaires disponibles (non encore ajoutées)
  const popularSections = useMemo(
    () =>
      sectionTypes.filter(
        (section) => section.popular && !existingSections.includes(section.id)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [existingSections]
  );

  const handleAddSection = (sectionType: string) => {
    onAddSection?.(sectionType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className='bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Ajouter une section
              </h2>
              <p className='mt-1 text-gray-600'>
                Choisissez une section pour enrichir votre CV
              </p>
            </div>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='w-5 h-5' />
            </Button>
          </div>

          {/* Filters */}
          <div className='p-6 bg-white border-b border-gray-100'>
            <div className='flex flex-col gap-3'>
              <h3 className='text-sm font-medium text-gray-700'>
                Filtrer par catégorie
              </h3>
              <div className='flex flex-wrap gap-2'>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${
                      category.count === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={category.count === 0}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className='flex-1 p-6 overflow-y-auto'>
            {/* Popular Sections */}
            {selectedCategory === 'all' && popularSections.length > 0 && (
              <div className='mb-8'>
                <h3 className='flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900'>
                  <Trophy className='w-5 h-5 text-yellow-500' />
                  Sections populaires
                </h3>
                <div className='grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {popularSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <motion.div
                        key={section.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className='p-4 transition-all duration-200 border border-blue-200 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-md'
                        onClick={() => handleAddSection(section.id)}
                      >
                        <div className='flex items-center gap-3 mb-3'>
                          <div className='flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg'>
                            <Icon className='w-5 h-5 text-white' />
                          </div>
                          <div className='flex-1'>
                            <h4 className='font-semibold text-gray-900'>
                              {section.name}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              {section.description}
                            </p>
                          </div>
                        </div>
                        <Button size='sm' className='w-full'>
                          <Plus className='w-4 h-4 mr-2' />
                          Ajouter
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Sections */}
            <div>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                {selectedCategory !== 'all'
                  ? `Sections ${
                      categories.find((c) => c.id === selectedCategory)?.name ||
                      ''
                    }`
                  : 'Toutes les sections'}
                <span className='ml-2 text-sm font-normal text-gray-500'>
                  ({filteredSections.length})
                </span>
              </h3>

              {filteredSections.length === 0 ? (
                <div className='py-12 text-center'>
                  <FileText className='w-12 h-12 mx-auto mb-4 text-gray-400' />
                  <p className='mb-2 text-lg text-gray-500'>
                    Aucune section disponible
                  </p>
                  <p className='text-sm text-gray-400'>
                    {selectedCategory !== 'all'
                      ? 'Toutes les sections de cette catégorie ont déjà été ajoutées'
                      : 'Vous avez ajouté toutes les sections disponibles'}
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {filteredSections.map((section) => {
                    const Icon = section.icon;
                    const isPopular = section.popular;
                    return (
                      <motion.div
                        key={section.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`bg-white border-2 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                          isPopular
                            ? 'border-blue-200 hover:border-blue-300'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAddSection(section.id)}
                      >
                        <div className='flex items-center gap-3 mb-3'>
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isPopular
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Icon className='w-5 h-5' />
                          </div>
                          <div className='flex-1'>
                            <h4 className='flex items-center gap-2 font-semibold text-gray-900'>
                              {section.name}
                              {isPopular && (
                                <span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full'>
                                  Populaire
                                </span>
                              )}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              {section.description}
                            </p>
                          </div>
                        </div>
                        <Button variant='outline' size='sm' className='w-full'>
                          <Plus className='w-4 h-4 mr-2' />
                          Ajouter
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className='p-4 border-t border-gray-100 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-gray-500'>
                {existingSections.length > 0 && (
                  <>
                    {existingSections.length} section
                    {existingSections.length > 1 ? 's' : ''} déjà ajoutée
                    {existingSections.length > 1 ? 's' : ''}
                  </>
                )}
              </p>
              <Button variant='outline' onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
