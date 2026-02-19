'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  FileText,
  Palette,
  Sparkles,
  Type,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { TemplateType } from '@/components/templates/TemplateSelector';

interface TemplateDesignSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
  onDesignChange?: (settings: DesignSettings) => void;
  defaultActiveSection?: 'templates' | 'design';
}

interface DesignSettings {
  fontSize: number;
  lineSpacing: number;
  margins: number;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layout: string;
  borderRadius: number;
  shadowIntensity: number;
}

// Template data with previews
const templates = [
  {
    id: 'layout1' as TemplateType,
    name: 'Double Column',
    description: 'Layout à deux colonnes avec accent coloré',
    color: '#10b981',
    icon: '📊',
  },
  {
    id: 'layout2' as TemplateType,
    name: 'Ivy League',
    description: 'Style universitaire élégant et sobre',
    color: '#6b7280',
    icon: '🎓',
  },
  {
    id: 'layout3' as TemplateType,
    name: 'Elegant',
    description: 'Design professionnel avec sidebar colorée',
    color: '#3b82f6',
    icon: '💼',
  },
  {
    id: 'layout4' as TemplateType,
    name: 'Modern',
    description: 'Photo et mise en page contemporaine',
    color: '#8b5cf6',
    icon: '✨',
  },
  {
    id: 'layout5' as TemplateType,
    name: 'Creative',
    description: 'Mise en page créative avec photo ronde',
    color: '#14b8a6',
    icon: '🎨',
  },
  {
    id: 'layout6' as TemplateType,
    name: 'Minimalist',
    description: 'Design minimaliste et épuré',
    color: '#059669',
    icon: '⚡',
  },
];

export const TemplateDesignSidebar: React.FC<TemplateDesignSidebarProps> = ({
  isOpen,
  onClose,
  selectedTemplate,
  onTemplateChange,
  onDesignChange,
  defaultActiveSection = 'templates',
}) => {
  const [activeSection, setActiveSection] = useState<'templates' | 'design'>(
    defaultActiveSection
  );

  // Design settings state
  const [designSettings, setDesignSettings] = useState<DesignSettings>({
    fontSize: 12,
    lineSpacing: 1.4,
    margins: 20,
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Inter',
    layout: 'single-column',
    borderRadius: 6,
    shadowIntensity: 20,
  });

  // Update activeSection when props change
  useEffect(() => {
    if (isOpen) {
      setActiveSection(defaultActiveSection);
    }
  }, [defaultActiveSection, isOpen]);

  // Preload Google Fonts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fontFamilies = [
      'Inter',
      'Roboto',
      'Open Sans',
      'Lato',
      'Source Sans Pro',
      'Montserrat',
      'Raleway',
      'Poppins',
      'Work Sans',
      'PT Sans',
      'Playfair Display',
      'Merriweather',
      'Crimson Text',
      'PT Serif',
      'Libre Baskerville',
      'Lora',
    ];

    import('webfontloader').then((WebFont) => {
      WebFont.load({
        google: {
          families: fontFamilies,
        },
        active: () => {
          console.log('All fonts loaded successfully');
        },
        inactive: () => {
          console.warn('Some fonts failed to load');
        },
      });
    });
  }, []);

  const handleDesignSettingChange = useCallback(
    (key: keyof DesignSettings, value: any) => {
      const newSettings = { ...designSettings, [key]: value };
      setDesignSettings(newSettings);
      onDesignChange?.(newSettings);
    },
    [designSettings, onDesignChange]
  );

  const fonts = [
    // Sans-Serif
    { id: 'inter', name: 'Inter', family: 'Inter, sans-serif', type: 'sans' },
    {
      id: 'roboto',
      name: 'Roboto',
      family: 'Roboto, sans-serif',
      type: 'sans',
    },
    {
      id: 'open-sans',
      name: 'Open Sans',
      family: 'Open Sans, sans-serif',
      type: 'sans',
    },
    { id: 'lato', name: 'Lato', family: 'Lato, sans-serif', type: 'sans' },
    {
      id: 'source-sans',
      name: 'Source Sans Pro',
      family: 'Source Sans Pro, sans-serif',
      type: 'sans',
    },
    {
      id: 'montserrat',
      name: 'Montserrat',
      family: 'Montserrat, sans-serif',
      type: 'sans',
    },
    {
      id: 'raleway',
      name: 'Raleway',
      family: 'Raleway, sans-serif',
      type: 'sans',
    },
    {
      id: 'poppins',
      name: 'Poppins',
      family: 'Poppins, sans-serif',
      type: 'sans',
    },
    {
      id: 'work-sans',
      name: 'Work Sans',
      family: 'Work Sans, sans-serif',
      type: 'sans',
    },
    {
      id: 'pt-sans',
      name: 'PT Sans',
      family: 'PT Sans, sans-serif',
      type: 'sans',
    },
    // Serif
    {
      id: 'playfair',
      name: 'Playfair Display',
      family: 'Playfair Display, serif',
      type: 'serif',
    },
    {
      id: 'merriweather',
      name: 'Merriweather',
      family: 'Merriweather, serif',
      type: 'serif',
    },
    {
      id: 'crimson-text',
      name: 'Crimson Text',
      family: 'Crimson Text, serif',
      type: 'serif',
    },
    {
      id: 'pt-serif',
      name: 'PT Serif',
      family: 'PT Serif, serif',
      type: 'serif',
    },
    {
      id: 'libre-baskerville',
      name: 'Libre Baskerville',
      family: 'Libre Baskerville, serif',
      type: 'serif',
    },
    { id: 'lora', name: 'Lora', family: 'Lora, serif', type: 'serif' },
  ];

  const colorPresets = [
    { name: 'Bleu Pro', primary: '#2563eb', secondary: '#64748b' },
    { name: 'Noir Élégant', primary: '#1f2937', secondary: '#6b7280' },
    { name: 'Vert Moderne', primary: '#059669', secondary: '#64748b' },
    { name: 'Violet Créatif', primary: '#7c3aed', secondary: '#64748b' },
    { name: 'Orange Dynamique', primary: '#ea580c', secondary: '#64748b' },
    { name: 'Rouge Corporate', primary: '#dc2626', secondary: '#64748b' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className='fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Sparkles className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-900'>
                Personnalisation
              </h2>
              <p className='text-xs text-gray-500'>Modèles & Design</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-gray-200 bg-gray-50'>
          <button
            onClick={() => setActiveSection('templates')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
              activeSection === 'templates'
                ? 'text-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className='w-4 h-4' />
            Modèles
            {activeSection === 'templates' && (
              <motion.div
                layoutId='activeTab'
                className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600'
              />
            )}
          </button>
          <button
            onClick={() => setActiveSection('design')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
              activeSection === 'design'
                ? 'text-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Palette className='w-4 h-4' />
            Design
            {activeSection === 'design' && (
              <motion.div
                layoutId='activeTab'
                className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600'
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          <AnimatePresence mode='wait'>
            {activeSection === 'templates' ? (
              <motion.div
                key='templates'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className='p-6'
              >
                {/* Templates Grid - 2 Columns */}
                <div className='grid grid-cols-2 gap-4'>
                  {templates.map((template) => (
                    <motion.button
                      key={template.id}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTemplateChange(template.id)}
                      className='relative group cursor-pointer text-center transition-all'
                    >
                      {/* Template Image Preview */}
                      <div
                        className={`aspect-[3/4] relative overflow-hidden rounded-lg shadow-md transition-all ${
                          selectedTemplate === template.id
                            ? 'ring-4 ring-blue-500 shadow-xl'
                            : 'ring-1 ring-gray-200 group-hover:ring-2 group-hover:ring-gray-300 group-hover:shadow-lg'
                        }`}
                      >
                        {/* Template Preview Image */}
                        <div
                          className='absolute inset-0 bg-white'
                          style={{
                            background: `linear-gradient(135deg, ${template.color}08 0%, #ffffff 100%)`,
                          }}
                        >
                          {/* Simulated CV Content */}
                          <div className='p-4 space-y-3'>
                            {/* Header */}
                            <div className='space-y-1.5'>
                              <div
                                className='h-3 rounded'
                                style={{
                                  backgroundColor: template.color,
                                  width: '60%',
                                }}
                              ></div>
                              <div className='h-2 bg-gray-300 rounded w-2/5'></div>
                            </div>

                            {/* Section 1 */}
                            <div className='space-y-1 pt-2'>
                              <div
                                className='h-1.5 rounded'
                                style={{
                                  backgroundColor: template.color,
                                  width: '40%',
                                }}
                              ></div>
                              <div className='h-1 bg-gray-200 rounded w-full'></div>
                              <div className='h-1 bg-gray-200 rounded w-11/12'></div>
                              <div className='h-1 bg-gray-200 rounded w-10/12'></div>
                            </div>

                            {/* Section 2 */}
                            <div className='space-y-1'>
                              <div
                                className='h-1.5 rounded'
                                style={{
                                  backgroundColor: template.color,
                                  width: '35%',
                                }}
                              ></div>
                              <div className='h-1 bg-gray-200 rounded w-full'></div>
                              <div className='h-1 bg-gray-200 rounded w-10/12'></div>
                              <div className='h-1 bg-gray-200 rounded w-9/12'></div>
                            </div>

                            {/* Section 3 */}
                            <div className='space-y-1'>
                              <div
                                className='h-1.5 rounded'
                                style={{
                                  backgroundColor: template.color,
                                  width: '30%',
                                }}
                              ></div>
                              <div className='flex gap-1.5'>
                                <div className='h-1 bg-gray-200 rounded flex-1'></div>
                                <div className='h-1 bg-gray-200 rounded flex-1'></div>
                              </div>
                              <div className='flex gap-1.5'>
                                <div className='h-1 bg-gray-200 rounded flex-1'></div>
                                <div className='h-1 bg-gray-200 rounded flex-1'></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Selected Checkmark */}
                        {selectedTemplate === template.id && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className='absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1.5 shadow-lg'
                          >
                            <Check className='w-4 h-4' />
                          </motion.div>
                        )}

                        {/* Hover Overlay */}
                        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors' />
                      </div>

                      {/* Template Name */}
                      <p className='mt-2.5 text-sm font-semibold text-gray-900'>
                        {template.name}
                      </p>
                    </motion.button>
                  ))}
                </div>

                {/* Coming Soon Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className='mt-4 p-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg border border-blue-100/50'
                >
                  <div className='flex items-start gap-2.5'>
                    <div className='p-1.5 bg-white rounded-lg shadow-sm'>
                      <Sparkles className='w-3.5 h-3.5 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-semibold text-xs text-gray-900 mb-0.5'>
                        Plus de modèles bientôt !
                      </h4>
                      <p className='text-[10px] text-gray-600 leading-relaxed'>
                        De nouveaux templates professionnels seront ajoutés
                        régulièrement.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key='design'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='p-6 space-y-6'
              >
                {/* Typography Section */}
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='p-1.5 bg-purple-100 rounded-lg'>
                      <Type className='w-4 h-4 text-purple-600' />
                    </div>
                    <h3 className='font-semibold text-sm text-gray-900'>
                      Typographie
                    </h3>
                  </div>

                  {/* Font Family */}
                  <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
                    <label className='block text-xs font-medium text-gray-700 mb-2'>
                      Police de caractères
                    </label>
                    <select
                      value={designSettings.fontFamily}
                      onChange={(e) =>
                        handleDesignSettingChange('fontFamily', e.target.value)
                      }
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all'
                    >
                      <optgroup label='Sans-Serif (Modernes)'>
                        {fonts
                          .filter((f) => f.type === 'sans')
                          .map((font) => (
                            <option key={font.id} value={font.name}>
                              {font.name}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label='Serif (Élégantes)'>
                        {fonts
                          .filter((f) => f.type === 'serif')
                          .map((font) => (
                            <option key={font.id} value={font.name}>
                              {font.name}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                    <div
                      className='mt-3 p-3 bg-white rounded-lg border border-gray-200 text-sm'
                      style={{ fontFamily: designSettings.fontFamily }}
                    >
                      AaBbCc 123 — Aperçu de la police
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
                    <label className='flex items-center justify-between text-xs font-medium text-gray-700 mb-2'>
                      <span>Taille de police</span>
                      <span className='text-blue-600 font-semibold'>
                        {designSettings.fontSize}pt
                      </span>
                    </label>
                    <input
                      type='range'
                      min='8'
                      max='16'
                      step='0.5'
                      value={designSettings.fontSize}
                      onChange={(e) =>
                        handleDesignSettingChange(
                          'fontSize',
                          parseFloat(e.target.value)
                        )
                      }
                      className='w-full h-2 bg-gradient-to-r from-blue-200 to-blue-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-lg'
                    />
                    <div className='flex justify-between text-[10px] text-gray-500 mt-1'>
                      <span>Petit</span>
                      <span>Moyen</span>
                      <span>Grand</span>
                    </div>
                  </div>

                  {/* Line Spacing */}
                  <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
                    <label className='flex items-center justify-between text-xs font-medium text-gray-700 mb-2'>
                      <span>Espacement des lignes</span>
                      <span className='text-blue-600 font-semibold'>
                        {designSettings.lineSpacing}
                      </span>
                    </label>
                    <input
                      type='range'
                      min='1'
                      max='2'
                      step='0.1'
                      value={designSettings.lineSpacing}
                      onChange={(e) =>
                        handleDesignSettingChange(
                          'lineSpacing',
                          parseFloat(e.target.value)
                        )
                      }
                      className='w-full h-2 bg-gradient-to-r from-green-200 to-green-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-green-500 [&::-webkit-slider-thumb]:shadow-lg'
                    />
                  </div>
                </div>

                {/* Colors Section */}
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='p-1.5 bg-pink-100 rounded-lg'>
                      <Palette className='w-4 h-4 text-pink-600' />
                    </div>
                    <h3 className='font-semibold text-sm text-gray-900'>
                      Couleurs
                    </h3>
                  </div>

                  {/* Color Presets */}
                  <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
                    <label className='block text-xs font-medium text-gray-700 mb-3'>
                      Palettes prédéfinies
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            handleDesignSettingChange(
                              'primaryColor',
                              preset.primary
                            );
                            handleDesignSettingChange(
                              'secondaryColor',
                              preset.secondary
                            );
                          }}
                          className={`group relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                            designSettings.primaryColor === preset.primary
                              ? 'border-blue-500 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className='flex gap-1.5 mb-1.5'>
                            <div
                              className='flex-1 h-6 rounded'
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className='flex-1 h-6 rounded'
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                          <p className='text-[10px] font-medium text-gray-700 text-center'>
                            {preset.name}
                          </p>
                          {designSettings.primaryColor === preset.primary && (
                            <div className='absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5'>
                              <Check className='w-2.5 h-2.5' />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
                    <label className='block text-xs font-medium text-gray-700 mb-3'>
                      Couleurs personnalisées
                    </label>
                    <div className='space-y-3'>
                      {/* Primary Color */}
                      <div>
                        <label className='text-[11px] text-gray-600 mb-1 block'>
                          Couleur principale
                        </label>
                        <div className='flex items-center gap-2'>
                          <input
                            type='color'
                            value={designSettings.primaryColor}
                            onChange={(e) =>
                              handleDesignSettingChange(
                                'primaryColor',
                                e.target.value
                              )
                            }
                            className='w-12 h-10 rounded-lg border border-gray-300 cursor-pointer'
                          />
                          <input
                            type='text'
                            value={designSettings.primaryColor}
                            onChange={(e) =>
                              handleDesignSettingChange(
                                'primaryColor',
                                e.target.value
                              )
                            }
                            className='flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono'
                          />
                        </div>
                      </div>

                      {/* Secondary Color */}
                      <div>
                        <label className='text-[11px] text-gray-600 mb-1 block'>
                          Couleur secondaire
                        </label>
                        <div className='flex items-center gap-2'>
                          <input
                            type='color'
                            value={designSettings.secondaryColor}
                            onChange={(e) =>
                              handleDesignSettingChange(
                                'secondaryColor',
                                e.target.value
                              )
                            }
                            className='w-12 h-10 rounded-lg border border-gray-300 cursor-pointer'
                          />
                          <input
                            type='text'
                            value={designSettings.secondaryColor}
                            onChange={(e) =>
                              handleDesignSettingChange(
                                'secondaryColor',
                                e.target.value
                              )
                            }
                            className='flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spacing */}
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='p-1.5 bg-orange-100 rounded-lg'>
                      <ChevronDown className='w-4 h-4 text-orange-600' />
                    </div>
                    <h3 className='font-semibold text-sm text-gray-900'>
                      Espacement
                    </h3>
                  </div>

                  {/* Margins */}
                  <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
                    <label className='flex items-center justify-between text-xs font-medium text-gray-700 mb-2'>
                      <span>Marges</span>
                      <span className='text-orange-600 font-semibold'>
                        {designSettings.margins}px
                      </span>
                    </label>
                    <input
                      type='range'
                      min='10'
                      max='40'
                      step='2'
                      value={designSettings.margins}
                      onChange={(e) =>
                        handleDesignSettingChange(
                          'margins',
                          parseInt(e.target.value)
                        )
                      }
                      className='w-full h-2 bg-gradient-to-r from-orange-200 to-orange-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:shadow-lg'
                    />
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    const defaultSettings: DesignSettings = {
                      fontSize: 12,
                      lineSpacing: 1.4,
                      margins: 20,
                      primaryColor: '#2563eb',
                      secondaryColor: '#64748b',
                      fontFamily: 'Inter',
                      layout: 'single-column',
                      borderRadius: 6,
                      shadowIntensity: 20,
                    };
                    setDesignSettings(defaultSettings);
                    onDesignChange?.(defaultSettings);
                  }}
                  className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium rounded-xl transition-all border border-gray-300'
                >
                  <ChevronDown className='w-4 h-4 rotate-180' />
                  Réinitialiser le design
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
