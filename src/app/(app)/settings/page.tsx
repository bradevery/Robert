'use client';
/* eslint-disable @next/next/no-img-element */

import {
  AlertTriangle,
  Bell,
  Building2,
  Camera,
  Check,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Globe,
  Key,
  Lock,
  Palette,
  Settings,
  Shield,
  Smartphone,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import toast from 'react-hot-toast';

import { useSettings } from '@/hooks/useSettings';
import { useOrganization } from '@/hooks/useOrganization';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

type SettingsTab =
  | 'profile'
  | 'entreprise'
  | 'notifications'
  | 'security'
  | 'billing'
  | 'language';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  company: string;
  avatar: string;
}

interface NotificationSettings {
  emailNewMatch: boolean;
  emailWeeklyDigest: boolean;
  emailCandidateUpdate: boolean;
  pushNewMatch: boolean;
  pushMessages: boolean;
  pushReminders: boolean;
  marketingEmails: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
}

interface BillingInfo {
  plan: 'free' | 'pro' | 'enterprise';
  cardLast4: string;
  cardBrand: string;
  nextBillingDate: string;
  monthlyPrice: number;
}

interface ESNProfile {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  pitch: string;
  siret: string;
  website: string;
  tonCommunication: string;
}

interface SettingsState {
  profile: UserProfile;
  esn: ESNProfile;
  notifications: NotificationSettings;
  security: SecuritySettings;
  billing: BillingInfo;
  language: string;
}

type SettingsAction =
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_ESN'; payload: Partial<ESNProfile> }
  | { type: 'UPDATE_NOTIFICATIONS'; payload: Partial<NotificationSettings> }
  | { type: 'UPDATE_SECURITY'; payload: Partial<SecuritySettings> }
  | { type: 'UPDATE_LANGUAGE'; payload: string };

const fontOptions = [
  { value: 'Inter', label: 'Inter (Moderne)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Montserrat', label: 'Montserrat (Élégant)' },
  { value: 'Open Sans', label: 'Open Sans (Lisible)' },
  { value: 'Lato', label: 'Lato (Pro)' },
  { value: 'Poppins', label: 'Poppins (Moderne)' },
];

const tonOptions = [
  { value: 'professionnel', label: 'Professionnel' },
  { value: 'dynamique', label: 'Dynamique' },
  { value: 'formel', label: 'Formel' },
];

const initialState: SettingsState = {
  profile: {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@company.com',
    phone: '+33 6 12 34 56 78',
    position: 'Recruteur Senior',
    company: 'Tech Solutions',
    avatar: 'JD',
  },
  esn: {
    name: '',
    logoUrl: '',
    primaryColor: '#2563EB',
    secondaryColor: '#1E40AF',
    fontFamily: 'Inter',
    pitch: '',
    siret: '',
    website: '',
    tonCommunication: 'professionnel',
  },
  notifications: {
    emailNewMatch: true,
    emailWeeklyDigest: true,
    emailCandidateUpdate: false,
    pushNewMatch: true,
    pushMessages: true,
    pushReminders: false,
    marketingEmails: false,
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
  },
  billing: {
    plan: 'pro',
    cardLast4: '4242',
    cardBrand: 'Visa',
    nextBillingDate: '2026-02-15',
    monthlyPrice: 49,
  },
  language: 'fr',
};

function settingsReducer(
  state: SettingsState,
  action: SettingsAction
): SettingsState {
  switch (action.type) {
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'UPDATE_ESN':
      return { ...state, esn: { ...state.esn, ...action.payload } };
    case 'UPDATE_NOTIFICATIONS':
      return {
        ...state,
        notifications: { ...state.notifications, ...action.payload },
      };
    case 'UPDATE_SECURITY':
      return { ...state, security: { ...state.security, ...action.payload } };
    case 'UPDATE_LANGUAGE':
      return { ...state, language: action.payload };
    default:
      return state;
  }
}

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const plans = {
  free: {
    name: 'Free',
    price: 0,
    features: ['5 CV/mois', 'Matching basique', 'Support email'],
  },
  pro: {
    name: 'Pro',
    price: 49,
    features: [
      'CV illimités',
      'Matching IA avancé',
      'Support prioritaire',
      'Exports PDF',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    features: ['Tout Pro +', 'API access', 'SSO', 'Account manager dédié'],
  },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Hooks
  const { 
    settings: settingsQuery, 
    profile: profileQuery, 
    updateSettings, 
    updateProfile, 
    updateOrganization 
  } = useSettings();
  const organizationQuery = useOrganization();

  const isSaving = updateSettings.isPending || updateProfile.isPending || updateOrganization.isPending;

  useEffect(() => {
    if (settingsQuery.data?.settings) {
      const s = settingsQuery.data.settings;
      dispatch({ type: 'UPDATE_LANGUAGE', payload: s.language || 'fr' });
      dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: s.notifications || {} });
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    if (profileQuery.data?.user) {
      const u = profileQuery.data.user;
      const [firstName = '', ...rest] = (u.name || '').split(' ');
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: {
          firstName,
          lastName: rest.join(' '),
          email: u.email || '',
          avatar: (u.name || 'U')[0]?.toUpperCase() || 'U',
        },
      });
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (organizationQuery.data) {
      const o = organizationQuery.data;
      dispatch({
        type: 'UPDATE_ESN',
        payload: {
          name: o.name || '',
          logoUrl: o.logoUrl || '',
          primaryColor: o.primaryColor || '#2563EB',
          secondaryColor: o.secondaryColor || '#1E40AF',
          fontFamily: o.fontFamily || 'Inter',
          pitch: o.pitch || '',
          siret: o.siret || '',
          website: o.website || '',
          tonCommunication: o.tonCommunication || 'professionnel',
        },
      });
    }
  }, [organizationQuery.data]);

  const handleSave = useCallback(async () => {
    try {
      if (activeTab === 'profile') {
        await updateProfile.mutateAsync({
          name: `${state.profile.firstName} ${state.profile.lastName}`,
          email: state.profile.email,
        });
      }

      if (activeTab === 'entreprise') {
        await updateOrganization.mutateAsync(state.esn);
      }

      // Save general settings
      await updateSettings.mutateAsync({
        language: state.language,
        notifications: state.notifications,
      });

      toast.success('Parametres enregistres');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Erreur lors de l'enregistrement");
    }
  }, [state, activeTab, updateProfile, updateOrganization, updateSettings]);

  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: User },
    { id: 'entreprise' as const, label: 'Entreprise', icon: Building2 },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Sécurité', icon: Lock },
    { id: 'billing' as const, label: 'Facturation', icon: CreditCard },
    { id: 'language' as const, label: 'Langue', icon: Globe },
  ];

  return (
    <div className='min-h-screen bg-gray-50/50'>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-gray-100 rounded-lg text-gray-600'>
            <Settings className='w-5 h-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Paramètres</h1>
            <p className='text-sm text-gray-500'>
              Gérez vos préférences et votre compte
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-8 max-w-5xl'>
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
          <div className='grid grid-cols-1 md:grid-cols-4 min-h-[700px]'>
            {/* Settings Sidebar */}
            <div className='bg-gray-50 p-4 border-r border-gray-100 space-y-1'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <tab.icon className='w-4 h-4' />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Settings Content */}
            <div className='md:col-span-3 p-8'>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className='text-lg font-bold text-gray-900 mb-6'>
                    Informations du profil
                  </h2>

                  <div className='flex items-center gap-6 mb-8'>
                    <div className='w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold relative'>
                      {state.profile.avatar}
                      <button className='absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50'>
                        <Camera className='w-4 h-4 text-gray-600' />
                      </button>
                    </div>
                    <div>
                      <Button variant='outline' className='mr-3'>
                        Changer la photo
                      </Button>
                      <Button
                        variant='ghost'
                        className='text-red-500 hover:text-red-600 hover:bg-red-50'
                      >
                        <Trash2 className='w-4 h-4 mr-2' />
                        Supprimer
                      </Button>
                    </div>
                  </div>

                  <div className='space-y-6 max-w-lg'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Prénom
                        </label>
                        <Input
                          value={state.profile.firstName}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_PROFILE',
                              payload: { firstName: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Nom
                        </label>
                        <Input
                          value={state.profile.lastName}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_PROFILE',
                              payload: { lastName: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Email
                      </label>
                      <Input
                        type='email'
                        value={state.profile.email}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_PROFILE',
                            payload: { email: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Téléphone
                      </label>
                      <Input
                        type='tel'
                        value={state.profile.phone}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_PROFILE',
                            payload: { phone: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Poste
                        </label>
                        <Input
                          value={state.profile.position}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_PROFILE',
                              payload: { position: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Entreprise
                        </label>
                        <Input
                          value={state.profile.company}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_PROFILE',
                              payload: { company: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className='pt-6 border-t border-gray-100'>
                      <Button
                        className='bg-blue-600 hover:bg-blue-700 text-white'
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving
                          ? 'Enregistrement...'
                          : 'Sauvegarder les modifications'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Entreprise / ESN Profile Tab */}
              {activeTab === 'entreprise' && (
                <div>
                  <h2 className='text-lg font-bold text-gray-900 mb-2'>
                    Profil ESN
                  </h2>
                  <p className='text-sm text-gray-500 mb-6'>
                    Ces informations seront automatiquement injectées dans vos
                    CV, propales et livrables.
                  </p>

                  <div className='space-y-8'>
                    {/* Logo & Identity */}
                    <div className='p-6 bg-gray-50 rounded-xl'>
                      <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                        <Building2 className='w-5 h-5' />
                        Identité de l'entreprise
                      </h3>
                      <div className='space-y-4 max-w-lg'>
                        {/* Logo Preview */}
                        <div className='flex items-center gap-6'>
                          <div className='w-20 h-20 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden'>
                            {state.esn.logoUrl ? (
                              <img
                                src={state.esn.logoUrl}
                                alt='Logo ESN'
                                className='w-full h-full object-contain'
                              />
                            ) : (
                              <Upload className='w-6 h-6 text-gray-400' />
                            )}
                          </div>
                          <div>
                            <div className='flex gap-2'>
                              <label className='cursor-pointer'>
                                <input
                                  type='file'
                                  accept='image/png,image/svg+xml,image/jpeg'
                                  className='hidden'
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    // For now, create a local URL - in production, upload to storage
                                    const url = URL.createObjectURL(file);
                                    dispatch({
                                      type: 'UPDATE_ESN',
                                      payload: { logoUrl: url },
                                    });
                                    toast.success('Logo chargé (aperçu local)');
                                  }}
                                />
                                <span className='inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors'>
                                  <Upload className='w-4 h-4' />
                                  Charger un logo
                                </span>
                              </label>
                            </div>
                            <p className='text-xs text-gray-400 mt-1'>
                              PNG, SVG ou JPG. Min 300px.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Nom de l'entreprise
                          </label>
                          <Input
                            value={state.esn.name}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_ESN',
                                payload: { name: e.target.value },
                              })
                            }
                            placeholder='Ma Société de Conseil'
                          />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              SIRET
                            </label>
                            <Input
                              value={state.esn.siret}
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_ESN',
                                  payload: { siret: e.target.value },
                                })
                              }
                              placeholder='123 456 789 00012'
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Site web
                            </label>
                            <Input
                              value={state.esn.website}
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_ESN',
                                  payload: { website: e.target.value },
                                })
                              }
                              placeholder='https://www.mon-esn.fr'
                            />
                          </div>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Pitch / Description
                          </label>
                          <textarea
                            className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-sm'
                            rows={3}
                            value={state.esn.pitch}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_ESN',
                                payload: { pitch: e.target.value },
                              })
                            }
                            placeholder='Décrivez votre ESN en quelques phrases. Ce texte sera utilisé dans les propales et présentations.'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Charte Graphique */}
                    <div className='p-6 border border-gray-200 rounded-xl'>
                      <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                        <Palette className='w-5 h-5' />
                        Charte graphique
                      </h3>
                      <div className='space-y-4 max-w-lg'>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Couleur principale
                            </label>
                            <div className='flex items-center gap-3'>
                              <input
                                type='color'
                                value={state.esn.primaryColor}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_ESN',
                                    payload: { primaryColor: e.target.value },
                                  })
                                }
                                className='w-10 h-10 rounded-lg border border-gray-200 cursor-pointer'
                              />
                              <Input
                                value={state.esn.primaryColor}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_ESN',
                                    payload: { primaryColor: e.target.value },
                                  })
                                }
                                className='flex-1'
                                placeholder='#2563EB'
                              />
                            </div>
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                              Couleur secondaire
                            </label>
                            <div className='flex items-center gap-3'>
                              <input
                                type='color'
                                value={state.esn.secondaryColor}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_ESN',
                                    payload: { secondaryColor: e.target.value },
                                  })
                                }
                                className='w-10 h-10 rounded-lg border border-gray-200 cursor-pointer'
                              />
                              <Input
                                value={state.esn.secondaryColor}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_ESN',
                                    payload: { secondaryColor: e.target.value },
                                  })
                                }
                                className='flex-1'
                                placeholder='#1E40AF'
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Police de caractères
                          </label>
                          <select
                            className='w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                            value={state.esn.fontFamily}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_ESN',
                                payload: { fontFamily: e.target.value },
                              })
                            }
                          >
                            {fontOptions.map((font) => (
                              <option key={font.value} value={font.value}>
                                {font.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Ton de communication
                          </label>
                          <div className='flex gap-2'>
                            {tonOptions.map((ton) => (
                              <button
                                key={ton.value}
                                onClick={() =>
                                  dispatch({
                                    type: 'UPDATE_ESN',
                                    payload: { tonCommunication: ton.value },
                                  })
                                }
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                                  state.esn.tonCommunication === ton.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                              >
                                {ton.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Preview */}
                        <div className='mt-6 p-4 bg-white rounded-lg border border-gray-200'>
                          <p className='text-xs text-gray-400 mb-3'>
                            Aperçu de votre charte
                          </p>
                          <div className='flex items-center gap-4'>
                            <div
                              className='w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg'
                              style={{
                                backgroundColor: state.esn.primaryColor,
                              }}
                            >
                              {state.esn.name
                                ? state.esn.name[0]?.toUpperCase()
                                : 'E'}
                            </div>
                            <div>
                              <div
                                className='font-semibold'
                                style={{
                                  color: state.esn.primaryColor,
                                  fontFamily: state.esn.fontFamily,
                                }}
                              >
                                {state.esn.name || 'Nom de votre ESN'}
                              </div>
                              <div
                                className='text-xs'
                                style={{ color: state.esn.secondaryColor }}
                              >
                                {state.esn.pitch
                                  ? state.esn.pitch.substring(0, 60) + '...'
                                  : 'Votre pitch apparaîtra ici'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='pt-6 border-t border-gray-100'>
                      <Button
                        className='bg-blue-600 hover:bg-blue-700 text-white'
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving
                          ? 'Enregistrement...'
                          : 'Sauvegarder le profil ESN'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className='text-lg font-bold text-gray-900 mb-6'>
                    Préférences de notifications
                  </h2>

                  <div className='space-y-8'>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-4'>
                        Notifications par email
                      </h3>
                      <div className='space-y-4'>
                        <NotificationToggle
                          label='Nouveaux matchs'
                          description='Recevez un email quand un nouveau candidat correspond à vos critères'
                          checked={state.notifications.emailNewMatch}
                          onChange={(checked) =>
                            dispatch({
                              type: 'UPDATE_NOTIFICATIONS',
                              payload: { emailNewMatch: checked },
                            })
                          }
                        />
                        <NotificationToggle
                          label='Résumé hebdomadaire'
                          description='Recevez un récapitulatif de votre activité chaque semaine'
                          checked={state.notifications.emailWeeklyDigest}
                          onChange={(checked) =>
                            dispatch({
                              type: 'UPDATE_NOTIFICATIONS',
                              payload: { emailWeeklyDigest: checked },
                            })
                          }
                        />
                        <NotificationToggle
                          label='Mises à jour candidats'
                          description='Soyez informé quand un candidat met à jour son profil'
                          checked={state.notifications.emailCandidateUpdate}
                          onChange={(checked) =>
                            dispatch({
                              type: 'UPDATE_NOTIFICATIONS',
                              payload: { emailCandidateUpdate: checked },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className='font-semibold text-gray-900 mb-4'>
                        Notifications push
                      </h3>
                      <div className='space-y-4'>
                        <NotificationToggle
                          label='Nouveaux matchs'
                          description='Notifications push pour les nouveaux matchs'
                          checked={state.notifications.pushNewMatch}
                          onChange={(checked) =>
                            dispatch({
                              type: 'UPDATE_NOTIFICATIONS',
                              payload: { pushNewMatch: checked },
                            })
                          }
                        />
                        <NotificationToggle
                          label='Messages'
                          description='Notifications push pour les nouveaux messages'
                          checked={state.notifications.pushMessages}
                          onChange={(checked) =>
                            dispatch({
                              type: 'UPDATE_NOTIFICATIONS',
                              payload: { pushMessages: checked },
                            })
                          }
                        />
                        <NotificationToggle
                          label='Rappels'
                          description='Rappels pour les entretiens et deadlines'
                          checked={state.notifications.pushReminders}
                          onChange={(checked) =>
                            dispatch({
                              type: 'UPDATE_NOTIFICATIONS',
                              payload: { pushReminders: checked },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className='font-semibold text-gray-900 mb-4'>
                        Marketing
                      </h3>
                      <NotificationToggle
                        label='Emails marketing'
                        description='Recevez des informations sur les nouvelles fonctionnalités et offres'
                        checked={state.notifications.marketingEmails}
                        onChange={(checked) =>
                          dispatch({
                            type: 'UPDATE_NOTIFICATIONS',
                            payload: { marketingEmails: checked },
                          })
                        }
                      />
                    </div>

                    <div className='pt-6 border-t border-gray-100'>
                      <Button
                        className='bg-blue-600 hover:bg-blue-700 text-white'
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving
                          ? 'Enregistrement...'
                          : 'Sauvegarder les préférences'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className='text-lg font-bold text-gray-900 mb-6'>
                    Sécurité du compte
                  </h2>

                  <div className='space-y-8'>
                    {/* Password Change */}
                    <div className='p-6 bg-gray-50 rounded-xl'>
                      <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                        <Key className='w-5 h-5' />
                        Changer le mot de passe
                      </h3>
                      <div className='space-y-4 max-w-md'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Mot de passe actuel
                          </label>
                          <div className='relative'>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                            />
                            <button
                              type='button'
                              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className='w-4 h-4' />
                              ) : (
                                <Eye className='w-4 h-4' />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Nouveau mot de passe
                          </label>
                          <Input
                            type='password'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Confirmer le mot de passe
                          </label>
                          <Input
                            type='password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                        <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
                          Mettre à jour le mot de passe
                        </Button>
                      </div>
                    </div>

                    {/* Two-Factor Auth */}
                    <div className='p-6 border border-gray-200 rounded-xl'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start gap-4'>
                          <div className='p-2 bg-green-50 rounded-lg text-green-600'>
                            <Shield className='w-6 h-6' />
                          </div>
                          <div>
                            <h3 className='font-semibold text-gray-900'>
                              Authentification à deux facteurs
                            </h3>
                            <p className='text-sm text-gray-500 mt-1'>
                              Ajoutez une couche de sécurité supplémentaire à
                              votre compte
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={state.security.twoFactorEnabled}
                          onCheckedChange={(checked) =>
                            dispatch({
                              type: 'UPDATE_SECURITY',
                              payload: { twoFactorEnabled: checked },
                            })
                          }
                        />
                      </div>
                      {state.security.twoFactorEnabled && (
                        <div className='mt-4 pt-4 border-t border-gray-100'>
                          <Button variant='outline' className='gap-2'>
                            <Smartphone className='w-4 h-4' />
                            Configurer l'application
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Session Timeout */}
                    <div className='p-6 border border-gray-200 rounded-xl'>
                      <h3 className='font-semibold text-gray-900 mb-4'>
                        Délai d'expiration de session
                      </h3>
                      <select
                        className='w-full max-w-xs px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                        value={state.security.sessionTimeout}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_SECURITY',
                            payload: {
                              sessionTimeout: parseInt(e.target.value),
                            },
                          })
                        }
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 heure</option>
                        <option value={120}>2 heures</option>
                      </select>
                    </div>

                    {/* Login Notifications */}
                    <NotificationToggle
                      label='Notifications de connexion'
                      description='Recevez un email lors de chaque nouvelle connexion à votre compte'
                      checked={state.security.loginNotifications}
                      onChange={(checked) =>
                        dispatch({
                          type: 'UPDATE_SECURITY',
                          payload: { loginNotifications: checked },
                        })
                      }
                    />

                    {/* Danger Zone */}
                    <div className='p-6 border border-red-200 rounded-xl bg-red-50'>
                      <h3 className='font-semibold text-red-900 mb-2 flex items-center gap-2'>
                        <AlertTriangle className='w-5 h-5' />
                        Zone de danger
                      </h3>
                      <p className='text-sm text-red-700 mb-4'>
                        Ces actions sont irréversibles. Procédez avec prudence.
                      </p>
                      <div className='flex gap-3'>
                        <Button
                          variant='outline'
                          className='border-red-200 text-red-600 hover:bg-red-100'
                        >
                          <Download className='w-4 h-4 mr-2' />
                          Exporter mes données
                        </Button>
                        <Button
                          variant='outline'
                          className='border-red-200 text-red-600 hover:bg-red-100'
                        >
                          <Trash2 className='w-4 h-4 mr-2' />
                          Supprimer mon compte
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div>
                  <h2 className='text-lg font-bold text-gray-900 mb-6'>
                    Facturation et abonnement
                  </h2>

                  <div className='space-y-8'>
                    {/* Current Plan */}
                    <div className='p-6 bg-blue-50 rounded-xl border border-blue-100'>
                      <div className='flex items-center justify-between mb-4'>
                        <div>
                          <span className='text-sm text-blue-600 font-medium'>
                            Plan actuel
                          </span>
                          <h3 className='text-2xl font-bold text-blue-900'>
                            {plans[state.billing.plan].name}
                          </h3>
                        </div>
                        <div className='text-right'>
                          <span className='text-3xl font-bold text-blue-900'>
                            {plans[state.billing.plan].price}€
                          </span>
                          <span className='text-blue-600'>/mois</span>
                        </div>
                      </div>
                      <ul className='space-y-2'>
                        {plans[state.billing.plan].features.map(
                          (feature, i) => (
                            <li
                              key={i}
                              className='flex items-center gap-2 text-sm text-blue-800'
                            >
                              <Check className='w-4 h-4 text-blue-600' />
                              {feature}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Other Plans */}
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-4'>
                        Changer de plan
                      </h3>
                      <div className='grid grid-cols-3 gap-4'>
                        {(
                          Object.entries(plans) as [
                            keyof typeof plans,
                            typeof plans.free
                          ][]
                        ).map(([key, plan]) => (
                          <div
                            key={key}
                            className={`p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                              state.billing.plan === key
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <h4 className='font-semibold text-gray-900'>
                              {plan.name}
                            </h4>
                            <div className='mt-2'>
                              <span className='text-2xl font-bold'>
                                {plan.price}€
                              </span>
                              <span className='text-gray-500'>/mois</span>
                            </div>
                            {state.billing.plan === key ? (
                              <span className='inline-block mt-3 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded'>
                                Plan actuel
                              </span>
                            ) : (
                              <Button
                                size='sm'
                                variant='outline'
                                className='mt-3 w-full'
                              >
                                Sélectionner
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className='p-6 border border-gray-200 rounded-xl'>
                      <h3 className='font-semibold text-gray-900 mb-4'>
                        Moyen de paiement
                      </h3>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                          <div className='w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-medium'>
                            {state.billing.cardBrand}
                          </div>
                          <div>
                            <div className='font-medium'>
                              •••• •••• •••• {state.billing.cardLast4}
                            </div>
                            <div className='text-sm text-gray-500'>
                              Expire 12/27
                            </div>
                          </div>
                        </div>
                        <Button variant='outline'>Modifier</Button>
                      </div>
                    </div>

                    {/* Billing History */}
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-4'>
                        Historique de facturation
                      </h3>
                      <div className='border border-gray-200 rounded-xl overflow-hidden'>
                        <table className='w-full'>
                          <thead className='bg-gray-50'>
                            <tr>
                              <th className='text-left px-4 py-3 text-sm font-medium text-gray-600'>
                                Date
                              </th>
                              <th className='text-left px-4 py-3 text-sm font-medium text-gray-600'>
                                Description
                              </th>
                              <th className='text-left px-4 py-3 text-sm font-medium text-gray-600'>
                                Montant
                              </th>
                              <th className='text-left px-4 py-3 text-sm font-medium text-gray-600'>
                                Statut
                              </th>
                              <th className='px-4 py-3'></th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-gray-100'>
                            {[
                              {
                                date: '15/01/2026',
                                desc: 'Abonnement Pro - Janvier',
                                amount: '49,00€',
                                status: 'Payé',
                              },
                              {
                                date: '15/12/2025',
                                desc: 'Abonnement Pro - Décembre',
                                amount: '49,00€',
                                status: 'Payé',
                              },
                              {
                                date: '15/11/2025',
                                desc: 'Abonnement Pro - Novembre',
                                amount: '49,00€',
                                status: 'Payé',
                              },
                            ].map((invoice, i) => (
                              <tr key={i}>
                                <td className='px-4 py-3 text-sm'>
                                  {invoice.date}
                                </td>
                                <td className='px-4 py-3 text-sm'>
                                  {invoice.desc}
                                </td>
                                <td className='px-4 py-3 text-sm font-medium'>
                                  {invoice.amount}
                                </td>
                                <td className='px-4 py-3'>
                                  <span className='inline-block px-2 py-1 text-xs bg-green-50 text-green-700 rounded'>
                                    {invoice.status}
                                  </span>
                                </td>
                                <td className='px-4 py-3'>
                                  <Button variant='ghost' size='sm'>
                                    <Download className='w-4 h-4' />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Language Tab */}
              {activeTab === 'language' && (
                <div>
                  <h2 className='text-lg font-bold text-gray-900 mb-6'>
                    Langue et région
                  </h2>

                  <div className='space-y-6 max-w-md'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-3'>
                        Langue de l'interface
                      </label>
                      <div className='space-y-2'>
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() =>
                              dispatch({
                                type: 'UPDATE_LANGUAGE',
                                payload: lang.code,
                              })
                            }
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                              state.language === lang.code
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className='flex items-center gap-3'>
                              <span className='text-2xl'>{lang.flag}</span>
                              <span className='font-medium'>{lang.label}</span>
                            </div>
                            {state.language === lang.code && (
                              <Check className='w-5 h-5 text-blue-600' />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className='pt-6 border-t border-gray-100'>
                      <Button
                        className='bg-blue-600 hover:bg-blue-700 text-white'
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: NotificationToggleProps) {
  return (
    <div className='flex items-start justify-between p-4 rounded-xl border border-gray-200'>
      <div>
        <div className='font-medium text-gray-900'>{label}</div>
        <div className='text-sm text-gray-500'>{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
