'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Grid, Maximize, Palette, RotateCcw, Type, X } from 'lucide-react';
import React, { useState } from 'react';

interface DesignSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: DesignSettings) => void;
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

export const DesignSettingsModal: React.FC<DesignSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
}) => {
  const [activeTab, setActiveTab] = useState<
    'typography' | 'colors' | 'layout' | 'spacing'
  >('typography');

  const [settings, setSettings] = useState<DesignSettings>({
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

  const fonts = [
    {
      id: 'inter',
      name: 'Inter',
      family: 'Inter, sans-serif',
      category: 'Modern',
    },
    {
      id: 'roboto',
      name: 'Roboto',
      family: 'Roboto, sans-serif',
      category: 'Clean',
    },
    {
      id: 'playfair',
      name: 'Playfair Display',
      family: 'Playfair Display, serif',
      category: 'Elegant',
    },
    {
      id: 'source-sans',
      name: 'Source Sans Pro',
      family: 'Source Sans Pro, sans-serif',
      category: 'Professional',
    },
    {
      id: 'lato',
      name: 'Lato',
      family: 'Lato, sans-serif',
      category: 'Friendly',
    },
    {
      id: 'montserrat',
      name: 'Montserrat',
      family: 'Montserrat, sans-serif',
      category: 'Bold',
    },
    {
      id: 'merriweather',
      name: 'Merriweather',
      family: 'Merriweather, serif',
      category: 'Traditional',
    },
    {
      id: 'open-sans',
      name: 'Open Sans',
      family: 'Open Sans, sans-serif',
      category: 'Readable',
    },
  ];

  const colorPresets = [
    { name: 'Bleu Professionnel', primary: '#2563eb', secondary: '#64748b' },
    { name: 'Vert Corporate', primary: '#059669', secondary: '#6b7280' },
    { name: 'Rouge Moderne', primary: '#dc2626', secondary: '#64748b' },
    { name: 'Violet Créatif', primary: '#7c3aed', secondary: '#6b7280' },
    { name: 'Orange Dynamique', primary: '#ea580c', secondary: '#64748b' },
    { name: 'Gris Élégant', primary: '#374151', secondary: '#9ca3af' },
    { name: 'Teal Sophistiqué', primary: '#0d9488', secondary: '#64748b' },
    { name: 'Rose Moderne', primary: '#e11d48', secondary: '#6b7280' },
  ];

  const layouts = [
    {
      id: 'single-column',
      name: 'Une colonne',
      description: 'Layout traditionnel',
    },
    {
      id: 'two-column',
      name: 'Deux colonnes',
      description: 'Moderne et compact',
    },
    {
      id: 'sidebar-left',
      name: 'Sidebar gauche',
      description: 'Information principale à droite',
    },
    {
      id: 'sidebar-right',
      name: 'Sidebar droite',
      description: 'Information principale à gauche',
    },
  ];

  const updateSetting = <K extends keyof DesignSettings>(
    key: K,
    value: DesignSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const resetToDefaults = () => {
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
    setSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
  };

  const tabs = [
    { id: 'typography' as const, name: 'Typographie', icon: Type },
    { id: 'colors' as const, name: 'Couleurs', icon: Palette },
    { id: 'layout' as const, name: 'Mise en page', icon: Grid },
    { id: 'spacing' as const, name: 'Espacement', icon: Maximize },
  ];

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
          className='bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-100'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Design & Police
              </h2>
              <p className='text-gray-600 mt-1'>
                Personnalisez l'apparence de votre CV
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={resetToDefaults}
                className='flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <RotateCcw className='w-4 h-4 mr-2' />
                Réinitialiser
              </button>
              <button
                onClick={onClose}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='w-6 h-6 text-gray-500' />
              </button>
            </div>
          </div>

          <div className='flex h-[600px]'>
            {/* Sidebar with tabs */}
            <div className='w-64 border-r border-gray-100 bg-gray-50 p-4'>
              <div className='space-y-2'>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors
                        ${
                          activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                            : 'text-gray-600 hover:bg-white hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className='w-5 h-5 mr-3' />
                      <span className='font-medium'>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content area */}
            <div className='flex-1 p-6 overflow-y-auto'>
              {activeTab === 'typography' && (
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Police de caractères
                    </h3>
                    <div className='grid grid-cols-2 gap-4'>
                      {fonts.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => updateSetting('fontFamily', font.id)}
                          className={`
                            p-4 border rounded-lg text-left transition-all hover:shadow-md
                            ${
                              settings.fontFamily === font.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <div
                            className='font-semibold mb-1'
                            style={{ fontFamily: font.family }}
                          >
                            {font.name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {font.category}
                          </div>
                          <div
                            className='text-sm mt-2'
                            style={{ fontFamily: font.family }}
                          >
                            AaBbCc 123
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Taille de la police
                    </h3>
                    <div className='space-y-4'>
                      <div>
                        <div className='flex justify-between items-center mb-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Taille
                          </label>
                          <span className='text-sm text-gray-500'>
                            {settings.fontSize}pt
                          </span>
                        </div>
                        <input
                          type='range'
                          min='8'
                          max='16'
                          step='0.5'
                          value={settings.fontSize}
                          onChange={(e) =>
                            updateSetting(
                              'fontSize',
                              parseFloat(e.target.value)
                            )
                          }
                          className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                        />
                        <div className='flex justify-between text-xs text-gray-400 mt-1'>
                          <span>8pt</span>
                          <span>16pt</span>
                        </div>
                      </div>

                      <div>
                        <div className='flex justify-between items-center mb-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Interligne
                          </label>
                          <span className='text-sm text-gray-500'>
                            {settings.lineSpacing}x
                          </span>
                        </div>
                        <input
                          type='range'
                          min='1'
                          max='2'
                          step='0.1'
                          value={settings.lineSpacing}
                          onChange={(e) =>
                            updateSetting(
                              'lineSpacing',
                              parseFloat(e.target.value)
                            )
                          }
                          className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                        />
                        <div className='flex justify-between text-xs text-gray-400 mt-1'>
                          <span>1x</span>
                          <span>2x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'colors' && (
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Palettes prédéfinies
                    </h3>
                    <div className='grid grid-cols-2 gap-3'>
                      {colorPresets.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            updateSetting('primaryColor', preset.primary);
                            updateSetting('secondaryColor', preset.secondary);
                          }}
                          className={`
                            p-4 border rounded-lg text-left transition-all hover:shadow-md
                            ${
                              settings.primaryColor === preset.primary
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <div className='flex items-center mb-2'>
                            <div
                              className='w-6 h-6 rounded-full mr-2'
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className='w-4 h-4 rounded-full border border-gray-200'
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                          <div className='font-medium text-sm'>
                            {preset.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Couleurs personnalisées
                    </h3>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Couleur principale
                        </label>
                        <div className='flex items-center space-x-3'>
                          <input
                            type='color'
                            value={settings.primaryColor}
                            onChange={(e) =>
                              updateSetting('primaryColor', e.target.value)
                            }
                            className='w-12 h-10 border border-gray-300 rounded-md cursor-pointer'
                          />
                          <input
                            type='text'
                            value={settings.primaryColor}
                            onChange={(e) =>
                              updateSetting('primaryColor', e.target.value)
                            }
                            className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Couleur secondaire
                        </label>
                        <div className='flex items-center space-x-3'>
                          <input
                            type='color'
                            value={settings.secondaryColor}
                            onChange={(e) =>
                              updateSetting('secondaryColor', e.target.value)
                            }
                            className='w-12 h-10 border border-gray-300 rounded-md cursor-pointer'
                          />
                          <input
                            type='text'
                            value={settings.secondaryColor}
                            onChange={(e) =>
                              updateSetting('secondaryColor', e.target.value)
                            }
                            className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'layout' && (
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Disposition
                    </h3>
                    <div className='space-y-3'>
                      {layouts.map((layout) => (
                        <button
                          key={layout.id}
                          onClick={() => updateSetting('layout', layout.id)}
                          className={`
                            w-full p-4 border rounded-lg text-left transition-all hover:shadow-md
                            ${
                              settings.layout === layout.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <div className='font-semibold text-gray-900'>
                            {layout.name}
                          </div>
                          <div className='text-sm text-gray-600 mt-1'>
                            {layout.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Style
                    </h3>
                    <div className='space-y-4'>
                      <div>
                        <div className='flex justify-between items-center mb-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Bordures arrondies
                          </label>
                          <span className='text-sm text-gray-500'>
                            {settings.borderRadius}px
                          </span>
                        </div>
                        <input
                          type='range'
                          min='0'
                          max='20'
                          step='1'
                          value={settings.borderRadius}
                          onChange={(e) =>
                            updateSetting(
                              'borderRadius',
                              parseInt(e.target.value)
                            )
                          }
                          className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                        />
                      </div>

                      <div>
                        <div className='flex justify-between items-center mb-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Intensité de l'ombre
                          </label>
                          <span className='text-sm text-gray-500'>
                            {settings.shadowIntensity}%
                          </span>
                        </div>
                        <input
                          type='range'
                          min='0'
                          max='100'
                          step='5'
                          value={settings.shadowIntensity}
                          onChange={(e) =>
                            updateSetting(
                              'shadowIntensity',
                              parseInt(e.target.value)
                            )
                          }
                          className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'spacing' && (
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Espacement et marges
                    </h3>
                    <div className='space-y-4'>
                      <div>
                        <div className='flex justify-between items-center mb-2'>
                          <label className='text-sm font-medium text-gray-700'>
                            Marges du document
                          </label>
                          <span className='text-sm text-gray-500'>
                            {settings.margins}mm
                          </span>
                        </div>
                        <input
                          type='range'
                          min='10'
                          max='40'
                          step='2'
                          value={settings.margins}
                          onChange={(e) =>
                            updateSetting('margins', parseInt(e.target.value))
                          }
                          className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                        />
                        <div className='flex justify-between text-xs text-gray-400 mt-1'>
                          <span>10mm</span>
                          <span>40mm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4'>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Aperçu des espacements
                    </h4>
                    <div className='text-sm text-gray-600 space-y-1'>
                      <div>• Marges: {settings.margins}mm</div>
                      <div>• Interligne: {settings.lineSpacing}x</div>
                      <div>• Taille police: {settings.fontSize}pt</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className='w-80 border-l border-gray-100 bg-gray-50 p-4'>
              <div className='flex items-center mb-4'>
                <Eye className='w-5 h-5 text-gray-600 mr-2' />
                <h4 className='font-semibold text-gray-900'>Aperçu</h4>
              </div>

              <div
                className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm'
                style={{
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: settings.lineSpacing,
                  fontFamily:
                    fonts.find((f) => f.id === settings.fontFamily)?.family ||
                    'Inter, sans-serif',
                  borderRadius: `${settings.borderRadius}px`,
                  boxShadow: `0 4px 6px rgba(0, 0, 0, ${
                    (settings.shadowIntensity / 100) * 0.1
                  })`,
                }}
              >
                <div
                  className='text-lg font-bold mb-2'
                  style={{ color: settings.primaryColor }}
                >
                  Jean Dupont
                </div>
                <div
                  className='text-sm mb-3'
                  style={{ color: settings.secondaryColor }}
                >
                  Développeur Full Stack
                </div>
                <div className='space-y-2 text-xs'>
                  <div>
                    <div
                      className='font-semibold mb-1'
                      style={{ color: settings.primaryColor }}
                    >
                      EXPÉRIENCE
                    </div>
                    <div className='text-gray-700'>
                      <div className='font-medium'>Senior Developer</div>
                      <div style={{ color: settings.secondaryColor }}>
                        TechCorp • 2021-2023
                      </div>
                    </div>
                  </div>

                  <div>
                    <div
                      className='font-semibold mb-1'
                      style={{ color: settings.primaryColor }}
                    >
                      COMPÉTENCES
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      <span className='px-2 py-1 bg-gray-100 rounded text-xs'>
                        React
                      </span>
                      <span className='px-2 py-1 bg-gray-100 rounded text-xs'>
                        Node.js
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='p-6 border-t border-gray-100 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                💡 <strong>Conseil :</strong> Les changements sont appliqués en
                temps réel
              </div>
              <div className='flex space-x-3'>
                <button
                  onClick={onClose}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
                >
                  Fermer
                </button>
                <button
                  onClick={onClose}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
