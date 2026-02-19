'use client';
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Building2,
  Calendar,
  Diamond,
  ExternalLink,
  Facebook,
  Flag,
  Globe,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Star,
  Trash2,
  Trophy,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { CVOverlay } from '@/components/ui/CVOverlay';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { EditableSectionItem } from '@/components/ui/EditableSectionItem';

import { useResumeStore } from '@/stores/resume-simple';

interface TemplateLayout1Props {
  resume: any;
  onUpdate: (field: string, value: string) => void;
  onEditingStateChange?: (isEditing: boolean) => void;
  handleAddItem: (sectionId: string) => void;
  handleDeleteItem: (sectionId: string, itemIndex: number) => void;
  focusedElement?: 'section' | 'item' | null;
  selectedSection?: string;
  selectedSectionItem?: string;
  designSettings?: {
    fontSize: number;
    lineSpacing: number;
    margins: number;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: string;
    borderRadius: number;
    shadowIntensity: number;
  };
}

const TemplateLayout1Content: React.FC<TemplateLayout1Props> = ({
  resume,
  onUpdate,
  _onEditingStateChange,
  handleAddItem,
  handleDeleteItem,
  _focusedElement,
  _selectedSection,
  _selectedSectionItem,
  designSettings,
}) => {
  const { data } = resume;
  const { setValue, deleteSection } = useResumeStore();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);

  const formatDateRange = (
    start?: string,
    end?: string,
    placeholder = 'Date de début - Date de fin'
  ) => {
    const hasStart = Boolean(start && start.trim());
    const hasEnd = Boolean(end && end.trim());

    if (hasStart && hasEnd) {
      return `${start} - ${end}`;
    }

    if (hasStart) {
      return `${start} - Présent`;
    }

    if (hasEnd) {
      return end;
    }

    return placeholder;
  };

  const SECTION_PLACEHOLDERS: Record<string, string> = {
    summary: 'Résumé',
    experience: 'Expérience professionnelle',
    education: 'Formation',
    skills: 'Compétences',
    projects: 'Projets',
    languages: 'Langues',
    certifications: 'Certifications',
    volunteer: 'Bénévolat',
    awards: 'Récompenses',
    publications: 'Publications',
    references: 'Références',
    interests: "Centres d'intérêt",
    links: 'Liens',
    quote: 'Citation',
    portfolio: 'Portfolio',
    training: 'Formations & cours',
    achievements: 'Réalisations',
    custom: 'Section personnalisée',
    profil: 'Profil',
    technology: 'Technologies',
    passion: 'Passions',
    talent: 'Talents',
  };

  const SectionContainer: React.FC<{
    sectionKey: string;
    title?: string;
    className?: string;
    children: React.ReactNode;
  }> = ({ sectionKey, title, className = '', children }) => (
    <div className={`group relative ${className}`} data-section={sectionKey}>
      <button
        type='button'
        onClick={(event) => {
          event.stopPropagation();
          handleDeleteSection(sectionKey);
        }}
        data-section-action='true'
        className='absolute z-10 p-1 transition rounded-md shadow-sm opacity-0 pointer-events-none right-2 top-2 bg-white/90 text-muted-foreground hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-destructive/40 group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto'
        aria-label={`Supprimer la section ${
          title || SECTION_PLACEHOLDERS[sectionKey] || sectionKey
        }`}
      >
        <Trash2 className='w-4 h-4' />
      </button>
      {children}
    </div>
  );

  const handleDeleteSection = (sectionId: string) => {
    if (!sectionId) return;
    const confirmDelete = window.confirm('Supprimer cette section ?');
    if (!confirmDelete) return;
    deleteSection(sectionId);
  };

  const photoSrc =
    data.basics?.photo ||
    data.basics?.image ||
    resume?.data?.basics?.photo ||
    resume?.data?.basics?.image ||
    '';

  const handlePhotoSelection = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      console.warn("Le fichier sélectionné n'est pas une image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!result) return;
      onUpdate('basics.photo', result);
      onUpdate('basics.image', result);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    handlePhotoSelection(event.target.files);
    event.target.value = '';
  };

  const handlePhotoClick = () => {
    photoInputRef.current?.click();
  };

  // DatePicker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState({ x: 0, y: 0 });
  const [datePickerData, setDatePickerData] = useState<{
    sectionId: string;
    itemIndex: number;
    startDate: string;
    endDate: string;
  } | null>(null);

  // Load Google Font dynamically
  useEffect(() => {
    if (designSettings?.fontFamily && typeof window !== 'undefined') {
      const fontFamily = designSettings.fontFamily;
      import('webfontloader').then((WebFont) => {
        WebFont.load({
          google: {
            families: [fontFamily],
          },
          active: () => {
            console.log(`Font ${fontFamily} loaded successfully`);
          },
          inactive: () => {
            console.warn(`Font ${fontFamily} failed to load`);
          },
        });
      });
    }
  }, [designSettings?.fontFamily]);

  const getSectionsInOrder = (): string[] => {
    const existingSections = Object.keys(data.sections || {}) as string[];

    const preferredOrder: string[] = [
      'profil',
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'languages',
      'certifications',
      'volunteer',
      'awards',
      'publications',
      'references',
      'interests',
      'links',
      'quote',
      'portfolio',
      'training',
      'achievements',
      'achievement',
      'talent',
      'technology',
      'passion',
      'courses',
      'custom',
    ];

    const ordered = preferredOrder.filter((section) =>
      existingSections.includes(section)
    );
    const others = existingSections.filter(
      (section) => !preferredOrder.includes(section)
    );

    return [...ordered, ...others].filter(
      (sectionId: string) => sectionId !== 'basics'
    );
  };

  const sectionsOrder = getSectionsInOrder();
  // Force single column layout
  const layoutColumns = 1;

  const handleContentChange = (field: string, value: string) => {
    // Normalize the field path - remove 'data.' prefix if present since updateResumeField starts from data
    const normalizedField = field.startsWith('data.') ? field.slice(5) : field;
    onUpdate(normalizedField, value);
  };

  const handleItemEditingStart = (_sectionId: string, _itemId: string) => {
    // Item editing started
  };

  const handleItemEditingEnd = () => {
    // Item editing ended
  };

  // Character limits
  const CHARACTER_LIMITS = {
    name: 50,
    headline: 100,
    sectionTitle: 30,
    position: 60,
    company: 50,
    institution: 50,
    studyType: 40,
    dateRange: 25,
    summary: 2000,
    content: 300,
    skill: 40,
    language: 30,
    projectName: 60,
    certificationName: 80,
  };

  const MAX_BULLETS = 10;
  const MAX_SKILLS = 40;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  };

  const handleKeyDownDescription = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    // Allow Enter for line breaks
  };

  const handleInput = (
    e: React.FormEvent<HTMLDivElement>,
    maxLength: number
  ) => {
    const target = e.target as HTMLElement;
    const text = target.textContent || '';

    if (text.length > maxLength) {
      target.textContent = text.substring(0, maxLength);

      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(target);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  // DatePicker handlers
  const handleOpenDatePicker = (
    e: React.MouseEvent,
    sectionId: string,
    itemIndex: number,
    startDate: string,
    endDate: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDatePickerPosition({ x: rect.left, y: rect.bottom });
    setDatePickerData({ sectionId, itemIndex, startDate, endDate });
    setShowDatePicker(true);
  };

  const handleDateChange = (startDate: string, endDate: string) => {
    if (datePickerData) {
      setValue(
        `data.sections.${datePickerData.sectionId}.items.${datePickerData.itemIndex}.startDate`,
        startDate
      );
      setValue(
        `data.sections.${datePickerData.sectionId}.items.${datePickerData.itemIndex}.endDate`,
        endDate
      );
    }
  };

  // Bullet point keyboard navigation
  const handleBulletKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    expIndex: number,
    bulletIndex: number,
    currentBullets: string[]
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentBullets.length < MAX_BULLETS) {
        const target = e.target as HTMLElement;
        const currentText = target.textContent || '';

        const updatedCurrentBullets = [...currentBullets];
        updatedCurrentBullets[bulletIndex] = currentText;
        updatedCurrentBullets.splice(bulletIndex + 1, 0, '');

        setValue(
          `data.sections.experience.items.${expIndex}.highlights`,
          updatedCurrentBullets
        );

        setTimeout(() => {
          const newBulletElement = document.querySelector(
            `[data-bullet="${expIndex}-${bulletIndex + 1}"]`
          ) as HTMLElement;
          if (newBulletElement) {
            newBulletElement.focus();
          }
        }, 50);
      }
    } else if (e.key === 'Backspace') {
      const target = e.target as HTMLElement;
      const currentText = target.textContent || '';

      if (currentText === '' && currentBullets.length > 1) {
        e.preventDefault();

        const updatedBullets = currentBullets.filter(
          (_, i) => i !== bulletIndex
        );
        setValue(
          `data.sections.experience.items.${expIndex}.highlights`,
          updatedBullets
        );

        setTimeout(() => {
          const targetIdx = Math.max(0, bulletIndex - 1);
          const prevBulletElement = document.querySelector(
            `[data-bullet="${expIndex}-${targetIdx}"]`
          ) as HTMLElement;
          if (prevBulletElement) {
            prevBulletElement.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(prevBulletElement);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }, 50);
      }
    } else if (e.key === 'ArrowUp') {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const target = e.target as HTMLElement;

      if (bulletIndex > 0 && range?.startOffset === 0) {
        e.preventDefault();
        handleContentChange(
          `sections.experience.items.${expIndex}.highlights.${bulletIndex}`,
          target.textContent || ''
        );
        setTimeout(() => {
          const prevBulletElement = document.querySelector(
            `[data-bullet="${expIndex}-${bulletIndex - 1}"]`
          ) as HTMLElement;
          if (prevBulletElement) {
            prevBulletElement.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(prevBulletElement);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }, 10);
      }
    } else if (e.key === 'ArrowDown') {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const target = e.target as HTMLElement;
      const textLength = target.textContent?.length || 0;

      if (
        bulletIndex < currentBullets.length - 1 &&
        range?.endOffset === textLength
      ) {
        e.preventDefault();
        handleContentChange(
          `sections.experience.items.${expIndex}.highlights.${bulletIndex}`,
          target.textContent || ''
        );
        setTimeout(() => {
          const nextBulletElement = document.querySelector(
            `[data-bullet="${expIndex}-${bulletIndex + 1}"]`
          ) as HTMLElement;
          if (nextBulletElement) {
            nextBulletElement.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(nextBulletElement);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }, 10);
      }
    }
  };

  const renderExperienceItem = (exp: any, index: number) => (
    <EditableSectionItem
      key={exp.id || index}
      sectionId='experience'
      itemIndex={index}
      className='mb-2'
      onAddEntry={() => handleAddItem('experience')}
      onDelete={() => handleDeleteItem('experience', index)}
      onSettings={() => console.log('Settings for experience', index)}
      onItemEditingStart={handleItemEditingStart}
      onItemEditingEnd={handleItemEditingEnd}
    >
      {/* Job Title */}
      <div
        contentEditable
        suppressContentEditableWarning
        className='px-1 mb-1 text-[18px] font-semibold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
        onBlur={(e) => {
          handleContentChange(
            `sections.experience.items.${index}.position`,
            e.target.textContent || ''
          );
        }}
        onInput={(e) => handleInput(e, CHARACTER_LIMITS.position)}
        onKeyDown={handleKeyDown}
        data-placeholder='Titre du poste'
      >
        {exp.position}
      </div>

      {/* Company Name */}
      <div
        contentEditable
        suppressContentEditableWarning
        className='px-1 mb-1 text-[14px] font-bold text-blue-600 uppercase transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
        onBlur={(e) => {
          handleContentChange(
            `sections.experience.items.${index}.company`,
            e.target.textContent || ''
          );
        }}
        onInput={(e) => handleInput(e, CHARACTER_LIMITS.company)}
        onKeyDown={handleKeyDown}
        data-placeholder="NOM DE L'ENTREPRISE"
      >
        {exp.company}
      </div>

      {/* Date and Location */}
      <div className='flex items-center gap-4 mb-1.5 text-[12px] text-gray-700'>
        {/* Date */}
        <div className='flex items-center gap-1.5'>
          <Calendar size={14} className='flex-shrink-0 text-gray-600' />
          <div
            className='text-gray-700 transition-colors cursor-pointer hover:text-blue-600 hover:underline'
            onClick={(e) =>
              handleOpenDatePicker(
                e,
                'experience',
                index,
                exp.startDate || '',
                exp.endDate || ''
              )
            }
          >
            {formatDateRange(exp.startDate, exp.endDate)}
          </div>
        </div>

        {/* Location */}
        <div className='flex items-center gap-1.5'>
          <MapPin size={14} className='flex-shrink-0 text-gray-600' />
          <div
            contentEditable
            suppressContentEditableWarning
            className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
            onFocus={() => {
              handleItemEditingStart('experience', `experience-${index}`);
            }}
            onBlur={(e) => {
              handleContentChange(
                `sections.experience.items.${index}.location`,
                e.target.textContent || ''
              );
            }}
            onInput={(e) => handleInput(e, 50)}
            onKeyDown={handleKeyDown}
            data-placeholder='Ville'
          >
            {exp.location || ''}
          </div>
        </div>
      </div>

      {/* Company Logo + URL */}
      <div className='flex items-center gap-2 mb-1.5'>
        <div className='flex items-center justify-center w-10 h-10 bg-gray-100 rounded-md'>
          <Building2 size={20} className='text-gray-600' />
        </div>
        <div className='flex items-center gap-1.5 text-[12px]'>
          <ExternalLink size={12} className='flex-shrink-0 text-gray-600' />
          <div
            contentEditable
            suppressContentEditableWarning
            className='px-1 text-blue-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
            onFocus={() => {
              handleItemEditingStart('experience', `experience-${index}`);
            }}
            onBlur={(e) => {
              handleContentChange(
                `sections.experience.items.${index}.url`,
                e.target.textContent || ''
              );
            }}
            onInput={(e) => handleInput(e, 100)}
            onKeyDown={handleKeyDown}
            data-placeholder='example.com'
          >
            {exp.url || ''}
          </div>
        </div>
      </div>

      {/* Description */}
      <div
        contentEditable
        suppressContentEditableWarning
        className='px-1 mb-1.5 text-[13px] leading-relaxed text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent whitespace-pre-wrap'
        onFocus={() => {
          handleItemEditingStart('experience', `experience-${index}`);
        }}
        onBlur={(e) => {
          handleContentChange(
            `sections.experience.items.${index}.summary`,
            e.target.textContent || ''
          );
        }}
        onInput={(e) => handleInput(e, CHARACTER_LIMITS.summary)}
        onKeyDown={handleKeyDownDescription}
        data-placeholder='Description du poste et responsabilités principales'
      >
        {exp.summary || ''}
      </div>

      {/* Bullets */}
      <div className='w-full'>
        <ul className='w-full space-y-1 list-none'>
          {(Array.isArray(exp.highlights) ? exp.highlights : [''])
            .slice(0, MAX_BULLETS)
            .map((bullet: string, bulletIndex: number) => (
              <li key={bulletIndex} className='flex items-start w-full gap-3'>
                <div className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0'></div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  data-bullet={`${index}-${bulletIndex}`}
                  className='flex-1 min-w-0 px-1 text-[13px] leading-relaxed text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxWidth: '100%',
                  }}
                  data-placeholder='Réalisation ou responsabilité clé'
                  onFocus={() => {
                    handleItemEditingStart(
                      'experience',
                      `experience-${index}-bullet-${bulletIndex}`
                    );
                  }}
                  onBlur={(e) => {
                    handleContentChange(
                      `sections.experience.items.${index}.highlights.${bulletIndex}`,
                      e.target.textContent || ''
                    );
                  }}
                  onInput={(e) => handleInput(e, 1500)}
                  onKeyDown={(e) =>
                    handleBulletKeyDown(
                      e,
                      index,
                      bulletIndex,
                      Array.isArray(exp.highlights) ? exp.highlights : []
                    )
                  }
                >
                  {bullet || ''}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </EditableSectionItem>
  );

  const renderEducationItem = (edu: any, index: number) => (
    <EditableSectionItem
      key={edu.id || index}
      sectionId='education'
      itemIndex={index}
      className='mb-2'
      onAddEntry={() => handleAddItem('education')}
      onDelete={() => handleDeleteItem('education', index)}
      onSettings={() => console.log('Settings for education', index)}
      onItemEditingStart={handleItemEditingStart}
      onItemEditingEnd={handleItemEditingEnd}
    >
      <div className='flex gap-3'>
        {/* Logo Icon */}
        <div className='flex items-center justify-center flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md'>
          <GraduationCap size={24} className='text-gray-600' />
        </div>

        <div className='flex-1'>
          {/* Degree/StudyType */}
          <div
            contentEditable
            suppressContentEditableWarning
            className='px-1 mb-1 text-[18px] font-bold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
            onFocus={() =>
              handleItemEditingStart('education', `education-${index}`)
            }
            onBlur={(e) => {
              handleContentChange(
                `sections.education.items.${index}.degree`,
                e.target.textContent || ''
              );
            }}
            onInput={(e) => handleInput(e, 100)}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              e.stopPropagation();
              (e.target as HTMLElement).focus();
            }}
            data-placeholder='Diplôme / Formation'
          >
            {edu.degree || edu.studyType || ''}
          </div>

          {/* Institution */}
          <div
            contentEditable
            suppressContentEditableWarning
            className='px-1 mb-1 text-[14px] font-semibold text-blue-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
            onFocus={() =>
              handleItemEditingStart('education', `education-${index}`)
            }
            onBlur={(e) => {
              handleContentChange(
                `sections.education.items.${index}.institution`,
                e.target.textContent || ''
              );
            }}
            onInput={(e) => handleInput(e, 150)}
            onKeyDown={handleKeyDown}
            data-placeholder="Nom de l'établissement"
          >
            {edu.institution || ''}
          </div>

          {/* Date and Location */}
          <div className='flex items-center gap-3 mb-1 text-[12px] text-gray-700'>
            <div className='flex items-center gap-1'>
              <Calendar size={12} className='flex-shrink-0 text-gray-600' />
              <div
                className='text-gray-700 transition-colors cursor-pointer hover:text-blue-600 hover:underline'
                onClick={(e) =>
                  handleOpenDatePicker(
                    e,
                    'education',
                    index,
                    edu.startDate || '',
                    edu.endDate || ''
                  )
                }
              >
                {formatDateRange(edu.startDate, edu.endDate)}
              </div>
            </div>

            <div className='flex items-center gap-1'>
              <MapPin size={12} className='flex-shrink-0 text-gray-600' />
              <div
                contentEditable
                suppressContentEditableWarning
                className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                onFocus={() =>
                  handleItemEditingStart('education', `education-${index}`)
                }
                onBlur={(e) => {
                  handleContentChange(
                    `sections.education.items.${index}.location`,
                    e.target.textContent || ''
                  );
                }}
                onInput={(e) => handleInput(e, 50)}
                onKeyDown={handleKeyDown}
                data-placeholder='Ville'
              >
                {edu.location || ''}
              </div>
            </div>

            <div className='flex items-center gap-1 ml-auto'>
              <span className='text-[11px] text-gray-500'>GPA</span>
              <div className='px-2 py-0.5 text-[12px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded'>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className='inline outline-none cursor-text'
                  onFocus={() =>
                    handleItemEditingStart('education', `education-${index}`)
                  }
                  onBlur={(e) => {
                    handleContentChange(
                      `sections.education.items.${index}.gpa`,
                      e.target.textContent || ''
                    );
                  }}
                  onInput={(e) => handleInput(e, 10)}
                  onKeyDown={handleKeyDown}
                  data-placeholder='Note'
                >
                  {edu.gpa || ''}
                </div>
                <span className='text-gray-400 mx-0.5'>/</span>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className='inline outline-none cursor-text'
                  onFocus={() =>
                    handleItemEditingStart('education', `education-${index}`)
                  }
                  onBlur={(e) => {
                    handleContentChange(
                      `sections.education.items.${index}.maxGpa`,
                      e.target.textContent || ''
                    );
                  }}
                  onInput={(e) => handleInput(e, 10)}
                  onKeyDown={handleKeyDown}
                  data-placeholder='Note max'
                >
                  {edu.maxGpa || ''}
                </div>
              </div>
            </div>
          </div>

          {/* Bullets/Notes */}
          <div className='w-full mt-2'>
            <ul className='w-full space-y-1 list-none'>
              {(Array.isArray(edu.bullets) ? edu.bullets : ['']).map(
                (bullet: string, bulletIndex: number) => (
                  <li
                    key={bulletIndex}
                    className='flex items-start w-full gap-2'
                  >
                    <div className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0'></div>
                    <div
                      data-bullet={`edu-${index}-${bulletIndex}`}
                      contentEditable
                      suppressContentEditableWarning
                      className='flex-1 min-w-0 px-1 text-[13px] text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent whitespace-pre-wrap break-words overflow-wrap-anywhere'
                      style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'anywhere',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                      }}
                      data-placeholder='Point clé de la formation'
                      onFocus={() => {
                        handleItemEditingStart(
                          'education',
                          `education-${index}-bullet-${bulletIndex}`
                        );
                      }}
                      onBlur={(e) => {
                        handleContentChange(
                          `sections.education.items.${index}.bullets.${bulletIndex}`,
                          e.target.textContent || ''
                        );
                      }}
                      onInput={(e) => handleInput(e, 1500)}
                      onKeyDown={(e) => {
                        const currentBullets = Array.isArray(edu.bullets)
                          ? edu.bullets
                          : [''];
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (currentBullets.length < 10) {
                            const target = e.target as HTMLElement;
                            const currentText = target.textContent || '';

                            const updatedBullets = [...currentBullets];
                            updatedBullets[bulletIndex] = currentText;
                            updatedBullets.splice(bulletIndex + 1, 0, '');

                            setValue(
                              `data.sections.education.items.${index}.bullets`,
                              updatedBullets
                            );

                            setTimeout(() => {
                              const newBulletElement = document.querySelector(
                                `[data-bullet="edu-${index}-${
                                  bulletIndex + 1
                                }"]`
                              ) as HTMLElement;
                              if (newBulletElement) {
                                newBulletElement.focus();
                              }
                            }, 50);
                          }
                        } else if (e.key === 'Backspace') {
                          const target = e.target as HTMLElement;
                          const currentText = target.textContent || '';

                          if (currentText === '' && currentBullets.length > 1) {
                            e.preventDefault();

                            const updatedBullets = currentBullets.filter(
                              (_: string, i: number) => i !== bulletIndex
                            );
                            setValue(
                              `data.sections.education.items.${index}.bullets`,
                              updatedBullets
                            );

                            setTimeout(() => {
                              const targetIdx = Math.max(0, bulletIndex - 1);
                              const prevBulletElement = document.querySelector(
                                `[data-bullet="edu-${index}-${targetIdx}"]`
                              ) as HTMLElement;
                              if (prevBulletElement) {
                                prevBulletElement.focus();
                                const range = document.createRange();
                                const selection = window.getSelection();
                                range.selectNodeContents(prevBulletElement);
                                range.collapse(false);
                                selection?.removeAllRanges();
                                selection?.addRange(range);
                              }
                            }, 50);
                          }
                        } else if (e.key === 'ArrowUp') {
                          const selection = window.getSelection();
                          const range = selection?.getRangeAt(0);
                          const target = e.target as HTMLElement;

                          if (bulletIndex > 0 && range?.startOffset === 0) {
                            e.preventDefault();
                            handleContentChange(
                              `sections.education.items.${index}.bullets.${bulletIndex}`,
                              target.textContent || ''
                            );
                            setTimeout(() => {
                              const prevBulletElement = document.querySelector(
                                `[data-bullet="edu-${index}-${
                                  bulletIndex - 1
                                }"]`
                              ) as HTMLElement;
                              if (prevBulletElement) {
                                prevBulletElement.focus();
                                const range = document.createRange();
                                const selection = window.getSelection();
                                range.selectNodeContents(prevBulletElement);
                                range.collapse(false);
                                selection?.removeAllRanges();
                                selection?.addRange(range);
                              }
                            }, 10);
                          }
                        } else if (e.key === 'ArrowDown') {
                          const selection = window.getSelection();
                          const range = selection?.getRangeAt(0);
                          const target = e.target as HTMLElement;
                          const textLength = target.textContent?.length || 0;

                          if (
                            bulletIndex < currentBullets.length - 1 &&
                            range?.endOffset === textLength
                          ) {
                            e.preventDefault();
                            handleContentChange(
                              `sections.education.items.${index}.bullets.${bulletIndex}`,
                              target.textContent || ''
                            );
                            setTimeout(() => {
                              const nextBulletElement = document.querySelector(
                                `[data-bullet="edu-${index}-${
                                  bulletIndex + 1
                                }"]`
                              ) as HTMLElement;
                              if (nextBulletElement) {
                                nextBulletElement.focus();
                                const range = document.createRange();
                                const selection = window.getSelection();
                                range.selectNodeContents(nextBulletElement);
                                range.collapse(false);
                                selection?.removeAllRanges();
                                selection?.addRange(range);
                              }
                            }, 10);
                          }
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        (e.target as HTMLElement).focus();
                      }}
                    >
                      {bullet || ''}
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    </EditableSectionItem>
  );

  const renderSummarySection = (section: any) => (
    <EditableSectionItem
      sectionId='summary'
      className='mb-2'
      isSection={true}
      onAddEntry={() => void 0}
      onDelete={() => handleDeleteSection('summary')}
      onSettings={() => console.log('Settings for summary')}
    >
      <SectionContainer
        sectionKey='summary'
        title={section.name || SECTION_PLACEHOLDERS.summary}
        className='mb-2'
      >
        <h2
          className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 border-b-2 border-blue-600'
          onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
          onKeyDown={handleKeyDown}
          data-placeholder={SECTION_PLACEHOLDERS.summary}
        >
          {section.name || ''}
        </h2>
        <div
          contentEditable
          suppressContentEditableWarning
          className='px-1 text-[13px] leading-relaxed text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
          onFocus={() => {
            handleItemEditingStart('summary', 'content');
          }}
          onBlur={(e) => {
            handleContentChange(
              'sections.summary.content',
              e.target.textContent || ''
            );
          }}
          onInput={(e) => handleInput(e, CHARACTER_LIMITS.content)}
          onKeyDown={handleKeyDown}
          data-placeholder='Résumé professionnel'
        >
          {section.content || ''}
        </div>
      </SectionContainer>
    </EditableSectionItem>
  );

  const renderSection = (sectionId: string, section: any) => {
    switch (sectionId) {
      case 'summary':
        return renderSummarySection(section);

      case 'experience':
        return (
          <SectionContainer
            sectionKey='experience'
            title={section.name || SECTION_PLACEHOLDERS.experience}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  'sections.experience.name',
                  e.target.textContent || ''
                );
              }}
              onClick={(event) => {
                event.stopPropagation();
                (event.target as HTMLElement).focus();
              }}
              data-placeholder={SECTION_PLACEHOLDERS.experience}
            >
              {section.name || ''}
            </h2>
            <div className='space-y-2'>
              {section.items?.map((exp: any, index: number) =>
                renderExperienceItem(exp, index)
              )}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem('experience')}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter une expérience
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'education':
        return (
          <SectionContainer
            sectionKey='education'
            title={section.name || SECTION_PLACEHOLDERS.education}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  'sections.education.name',
                  e.target.textContent || ''
                );
              }}
              onClick={(event) => {
                event.stopPropagation();
                (event.target as HTMLElement).focus();
              }}
              data-placeholder={SECTION_PLACEHOLDERS.education}
            >
              {section.name || ''}
            </h2>
            <div className='space-y-2'>
              {section.items?.map((edu: any, index: number) =>
                renderEducationItem(edu, index)
              )}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem('education')}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter une formation
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'skills':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onClick={(event) => {
                event.stopPropagation();
                (event.target as HTMLElement).focus();
              }}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>
            <div className='space-y-2'>
              {(section.items || [{ name: '' }]).map(
                (item: any, index: number) => (
                  <EditableSectionItem
                    key={item.id || index}
                    sectionId={sectionId}
                    itemIndex={index}
                    className='flex items-center w-full px-3 py-2 transition-colors bg-white border border-gray-200 rounded-md hover:border-blue-300'
                    onDelete={() => handleDeleteItem(sectionId, index)}
                    onItemEditingStart={handleItemEditingStart}
                    onItemEditingEnd={handleItemEditingEnd}
                  >
                    <div
                      data-skill-index={index}
                      contentEditable
                      suppressContentEditableWarning
                      className='flex-1 text-[13px] font-medium text-gray-800 transition-colors outline-none cursor-text hover:bg-gray-50 focus:bg-transparent break-words'
                      style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'anywhere',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                      onFocus={() => {
                        handleItemEditingStart(
                          sectionId,
                          `${sectionId}-${index}`
                        );
                      }}
                      onBlur={(e) => {
                        handleContentChange(
                          `sections.${sectionId}.items.${index}.name`,
                          e.target.textContent || ''
                        );
                      }}
                      onInput={(e) => handleInput(e, 80)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const currentItems = section.items || [{ name: '' }];

                          // Check if we've reached the maximum number of skills
                          if (currentItems.length >= MAX_SKILLS) {
                            return;
                          }

                          const target = e.target as HTMLElement;
                          const currentText = target.textContent || '';

                          // Update current skill
                          const updatedItems = [...currentItems];
                          updatedItems[index] = {
                            ...updatedItems[index],
                            name: currentText,
                          };

                          // Add new skill after current one
                          updatedItems.splice(index + 1, 0, { name: '' });

                          setValue(
                            `data.sections.${sectionId}.items`,
                            updatedItems
                          );

                          setTimeout(() => {
                            const nextSkillElement = document.querySelector(
                              `[data-skill-index="${index + 1}"]`
                            ) as HTMLElement;
                            if (nextSkillElement) {
                              nextSkillElement.focus();
                            }
                          }, 50);
                        } else if (e.key === 'Backspace') {
                          const target = e.target as HTMLElement;
                          const currentText = target.textContent || '';

                          if (
                            currentText === '' &&
                            (section.items?.length || 1) > 1
                          ) {
                            e.preventDefault();

                            const currentItems = section.items || [
                              { name: '' },
                            ];
                            const updatedItems = currentItems.filter(
                              (_: any, i: number) => i !== index
                            );

                            setValue(
                              `data.sections.${sectionId}.items`,
                              updatedItems
                            );

                            setTimeout(() => {
                              const targetIdx = Math.max(0, index - 1);
                              const prevSkillElement = document.querySelector(
                                `[data-skill-index="${targetIdx}"]`
                              ) as HTMLElement;
                              if (prevSkillElement) {
                                prevSkillElement.focus();
                                const range = document.createRange();
                                const selection = window.getSelection();
                                range.selectNodeContents(prevSkillElement);
                                range.collapse(false);
                                selection?.removeAllRanges();
                                selection?.addRange(range);
                              }
                            }, 50);
                          }
                        } else if (e.key === 'ArrowRight') {
                          const target = e.target as HTMLElement;
                          const textLength = target.textContent?.length || 0;
                          const selection = window.getSelection();
                          const range = selection?.getRangeAt(0);

                          if (
                            range?.endOffset === textLength &&
                            index < (section.items?.length || 1) - 1
                          ) {
                            e.preventDefault();
                            const nextSkillElement = document.querySelector(
                              `[data-skill-index="${index + 1}"]`
                            ) as HTMLElement;
                            if (nextSkillElement) {
                              nextSkillElement.focus();
                              const range = document.createRange();
                              const selection = window.getSelection();
                              range.selectNodeContents(nextSkillElement);
                              range.collapse(true);
                              selection?.removeAllRanges();
                              selection?.addRange(range);
                            }
                          }
                        } else if (e.key === 'ArrowLeft') {
                          const selection = window.getSelection();
                          const range = selection?.getRangeAt(0);

                          if (range?.startOffset === 0 && index > 0) {
                            e.preventDefault();
                            const prevSkillElement = document.querySelector(
                              `[data-skill-index="${index - 1}"]`
                            ) as HTMLElement;
                            if (prevSkillElement) {
                              prevSkillElement.focus();
                              const range = document.createRange();
                              const selection = window.getSelection();
                              range.selectNodeContents(prevSkillElement);
                              range.collapse(false);
                              selection?.removeAllRanges();
                              selection?.addRange(range);
                            }
                          }
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          const currentItems = section.items || [{ name: '' }];
                          const nextIndex = index + 1;
                          if (nextIndex < currentItems.length) {
                            const nextSkillElement = document.querySelector(
                              `[data-skill-index="${nextIndex}"]`
                            ) as HTMLElement;
                            if (nextSkillElement) {
                              nextSkillElement.focus();
                            }
                          }
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          const prevIndex = index - 1;
                          if (prevIndex >= 0) {
                            const prevSkillElement = document.querySelector(
                              `[data-skill-index="${prevIndex}"]`
                            ) as HTMLElement;
                            if (prevSkillElement) {
                              prevSkillElement.focus();
                            }
                          }
                        }
                      }}
                    >
                      {item.name || ''}
                    </div>
                  </EditableSectionItem>
                )
              )}

              {/* Show add button if no items */}
              {(!section.items ||
                section.items.length === 0 ||
                (section.items.length === 1 && !section.items[0].name)) && (
                <button
                  onClick={() => handleAddItem(sectionId)}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter une compétence
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'profil':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              onClick={(event) => {
                event.stopPropagation();
                (event.target as HTMLElement).focus();
              }}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>
            <div className='space-y-2'>
              {section.items?.map((item: any, index: number) => (
                <div key={item.id || index}>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='px-1 text-[13px] leading-relaxed text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onFocus={() => {
                      handleItemEditingStart(
                        sectionId,
                        `${sectionId}-${index}`
                      );
                    }}
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.${sectionId}.items.${index}.content`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, CHARACTER_LIMITS.content)}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => {
                      e.stopPropagation();
                      (e.target as HTMLElement).focus();
                    }}
                  >
                    {item.content || 'Votre profil professionnel'}
                  </div>
                </div>
              ))}
            </div>
          </SectionContainer>
        );

      case 'languages':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <h2
                contentEditable
                suppressContentEditableWarning
                className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                onBlur={(e) => {
                  handleContentChange(
                    `sections.${sectionId}.name`,
                    e.target.textContent || ''
                  );
                }}
                data-placeholder={
                  SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
                }
              >
                {section.name || ''}
              </h2>
            </div>

            <div className='space-y-2'>
              {(section.items || [{ name: '', level: 0, levelText: '' }]).map(
                (lang: any, index: number) => (
                  <EditableSectionItem
                    key={lang.id || index}
                    sectionId='languages'
                    itemIndex={index}
                    className='mb-1'
                    onDelete={() => handleDeleteItem('languages', index)}
                    onItemEditingStart={handleItemEditingStart}
                    onItemEditingEnd={handleItemEditingEnd}
                  >
                    <div className='flex items-center justify-between'>
                      {/* Language Name */}
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 text-[14px] font-semibold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) => {
                          handleContentChange(
                            `sections.languages.items.${index}.name`,
                            e.target.textContent || ''
                          );
                        }}
                        onInput={(e) => handleInput(e, 50)}
                        data-placeholder='Langue'
                      >
                        {lang.name || ''}
                      </div>

                      {/* Level - Circles (5 max, clickable) */}
                      <div className='flex items-center gap-1.5'>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className='px-1 mr-1 text-[12px] font-medium text-gray-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                          onBlur={(e) => {
                            handleContentChange(
                              `sections.languages.items.${index}.levelText`,
                              e.target.textContent || ''
                            );
                          }}
                          onInput={(e) => handleInput(e, 30)}
                          data-placeholder='Niveau'
                        >
                          {lang.levelText || ''}
                        </div>
                        {[1, 2, 3, 4, 5].map((circle) => (
                          <button
                            key={circle}
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              const newLevel =
                                Number(lang.level ?? 0) === circle
                                  ? circle - 1
                                  : circle;
                              setValue(
                                `data.sections.languages.items.${index}.level`,
                                newLevel
                              );
                            }}
                            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors hover:scale-110 ${
                              Number(lang.level ?? 0) >= circle
                                ? 'bg-blue-600'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </EditableSectionItem>
                )
              )}
            </div>
          </SectionContainer>
        );

      case 'technology':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='space-y-3'>
              {(section.items || []).map((tech: any, index: number) => (
                <EditableSectionItem
                  key={tech.id || index}
                  sectionId='technology'
                  itemIndex={index}
                  className='mb-3'
                  onDelete={() => handleDeleteItem('technology', index)}
                  onItemEditingStart={handleItemEditingStart}
                  onItemEditingEnd={handleItemEditingEnd}
                >
                  {/* Category Title */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='px-1 mb-1 text-[13px] font-semibold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.technology.items.${index}.title`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 100)}
                  >
                    {tech.title || 'Catégorie'}
                  </div>

                  {/* Description */}
                  {tech.description && (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className='px-1 mb-1.5 text-[12px] text-gray-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                      onBlur={(e) => {
                        handleContentChange(
                          `sections.technology.items.${index}.description`,
                          e.target.textContent || ''
                        );
                      }}
                      onInput={(e) => handleInput(e, 200)}
                    >
                      {tech.description}
                    </div>
                  )}

                  {/* Technologies Tags */}
                  <div className='flex flex-wrap gap-1.5'>
                    {Array.isArray(tech.tags) && tech.tags.flat().length > 0 ? (
                      tech.tags.flat().map((tag: string, tagIdx: number) => (
                        <span
                          key={tagIdx}
                          className='px-2 py-0.5 text-[11px] bg-gray-100 text-gray-700 rounded-md font-medium'
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className='text-[11px] text-gray-400'>
                        Ajouter des technologies
                      </span>
                    )}
                  </div>
                </EditableSectionItem>
              ))}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem('technology')}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter une catégorie
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'projects':
      case 'activity':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='space-y-2'>
              {(section.items || []).map((proj: any, index: number) => (
                <EditableSectionItem
                  key={proj.id || index}
                  sectionId={sectionId}
                  itemIndex={index}
                  onAddEntry={() => handleAddItem(sectionId)}
                  onDelete={() => handleDeleteItem(sectionId, index)}
                  onSettings={() => console.log('Settings')}
                  onItemEditingStart={handleItemEditingStart}
                  onItemEditingEnd={handleItemEditingEnd}
                >
                  {/* Project Title */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='px-1 mb-1 text-[17px] font-bold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onFocus={() =>
                      handleItemEditingStart(sectionId, `${sectionId}-${index}`)
                    }
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.${sectionId}.items.${index}.title`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 100)}
                    onKeyDown={handleKeyDown}
                    data-placeholder='Titre du projet'
                  >
                    {proj.title || ''}
                  </div>

                  {/* Date and Location row */}
                  <div className='flex items-center gap-4 mb-1 text-[12px]'>
                    {/* Date */}
                    <div className='flex items-center gap-1.5'>
                      <Calendar size={12} className='text-gray-500' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 text-gray-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) => {
                          handleContentChange(
                            `sections.${sectionId}.items.${index}.date`,
                            e.target.textContent || ''
                          );
                        }}
                        onInput={(e) => handleInput(e, 20)}
                        data-placeholder='MM/YYYY'
                      >
                        {proj.date || ''}
                      </div>
                    </div>
                    {/* Location */}
                    <div className='flex items-center gap-1.5'>
                      <MapPin size={12} className='text-gray-500' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 text-gray-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) => {
                          handleContentChange(
                            `sections.${sectionId}.items.${index}.location`,
                            e.target.textContent || ''
                          );
                        }}
                        onInput={(e) => handleInput(e, 50)}
                        data-placeholder='Emplacement'
                      >
                        {proj.location || ''}
                      </div>
                    </div>
                  </div>

                  {/* Link */}
                  <div className='flex items-center gap-1.5 mb-1 text-[12px]'>
                    <ExternalLink size={12} className='text-gray-600' />
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className='px-1 text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                      onBlur={(e) => {
                        handleContentChange(
                          `sections.${sectionId}.items.${index}.link`,
                          e.target.textContent || ''
                        );
                      }}
                      onInput={(e) => handleInput(e, 200)}
                      data-placeholder='https://github.com/username/project'
                    >
                      {proj.link || ''}
                    </div>
                  </div>

                  {/* Description */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='px-1 mb-2 text-[13px] leading-relaxed text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent whitespace-pre-wrap'
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.${sectionId}.items.${index}.description`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 1000)}
                    data-placeholder='Description du projet'
                  >
                    {proj.description || ''}
                  </div>

                  {/* Technologies utilisées */}
                  {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                    <div className='mb-2'>
                      <div className='mb-1 text-[12px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 inline-block rounded'>
                        Technologies utilisées :
                      </div>
                      <ul className='mt-1 space-y-0.5 list-none ml-2'>
                        {proj.tags.map((tag: string, tIdx: number) => (
                          <li
                            key={tIdx}
                            className='flex items-start gap-2 text-[12px] text-gray-700'
                          >
                            <span className='mt-0.5'>•</span>
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              className='flex-1 px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                              onBlur={(e) => {
                                handleContentChange(
                                  `sections.${sectionId}.items.${index}.tags.${tIdx}`,
                                  e.target.textContent || ''
                                );
                              }}
                              onInput={(e) => handleInput(e, 50)}
                              data-placeholder='Technologie'
                            >
                              {tag || ''}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bullets with interactive component like experiences */}
                  <div className='w-full mt-2'>
                    <ul className='w-full space-y-1 list-none'>
                      {(Array.isArray(proj.bullets) ? proj.bullets : ['']).map(
                        (bullet: string, bulletIndex: number) => (
                          <li
                            key={bulletIndex}
                            className='flex items-start w-full gap-2'
                          >
                            <div className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0'></div>
                            <div
                              data-bullet={`proj-${index}-${bulletIndex}`}
                              contentEditable
                              suppressContentEditableWarning
                              className='flex-1 min-w-0 px-1 text-[13px] text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent whitespace-pre-wrap break-words overflow-wrap-anywhere'
                              style={{
                                wordWrap: 'break-word',
                                overflowWrap: 'anywhere',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                maxWidth: '100%',
                              }}
                              data-placeholder="Description d'une réalisation ou résultat"
                              onFocus={() => {
                                handleItemEditingStart(
                                  sectionId,
                                  `${sectionId}-${index}-bullet-${bulletIndex}`
                                );
                              }}
                              onBlur={(e) => {
                                handleContentChange(
                                  `sections.${sectionId}.items.${index}.bullets.${bulletIndex}`,
                                  e.target.textContent || ''
                                );
                              }}
                              onInput={(e) => handleInput(e, 1500)}
                              onKeyDown={(e) => {
                                const currentBullets = Array.isArray(
                                  proj.bullets
                                )
                                  ? proj.bullets
                                  : [''];
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (currentBullets.length < 10) {
                                    const target = e.target as HTMLElement;
                                    const currentText =
                                      target.textContent || '';

                                    const updatedBullets = [...currentBullets];
                                    updatedBullets[bulletIndex] = currentText;
                                    updatedBullets.splice(
                                      bulletIndex + 1,
                                      0,
                                      ''
                                    );

                                    setValue(
                                      `data.sections.${sectionId}.items.${index}.bullets`,
                                      updatedBullets
                                    );

                                    setTimeout(() => {
                                      const newBulletElement =
                                        document.querySelector(
                                          `[data-bullet="proj-${index}-${
                                            bulletIndex + 1
                                          }"]`
                                        ) as HTMLElement;
                                      if (newBulletElement) {
                                        newBulletElement.focus();
                                      }
                                    }, 50);
                                  }
                                } else if (e.key === 'Backspace') {
                                  const target = e.target as HTMLElement;
                                  const currentText = target.textContent || '';

                                  if (
                                    currentText === '' &&
                                    currentBullets.length > 1
                                  ) {
                                    e.preventDefault();

                                    const updatedBullets =
                                      currentBullets.filter(
                                        (_: string, i: number) =>
                                          i !== bulletIndex
                                      );
                                    setValue(
                                      `data.sections.${sectionId}.items.${index}.bullets`,
                                      updatedBullets
                                    );

                                    setTimeout(() => {
                                      const targetIdx = Math.max(
                                        0,
                                        bulletIndex - 1
                                      );
                                      const prevBulletElement =
                                        document.querySelector(
                                          `[data-bullet="proj-${index}-${targetIdx}"]`
                                        ) as HTMLElement;
                                      if (prevBulletElement) {
                                        prevBulletElement.focus();
                                        const range = document.createRange();
                                        const selection = window.getSelection();
                                        range.selectNodeContents(
                                          prevBulletElement
                                        );
                                        range.collapse(false);
                                        selection?.removeAllRanges();
                                        selection?.addRange(range);
                                      }
                                    }, 50);
                                  }
                                } else if (e.key === 'ArrowUp') {
                                  const selection = window.getSelection();
                                  const range = selection?.getRangeAt(0);
                                  const target = e.target as HTMLElement;

                                  if (
                                    bulletIndex > 0 &&
                                    range?.startOffset === 0
                                  ) {
                                    e.preventDefault();
                                    handleContentChange(
                                      `sections.${sectionId}.items.${index}.bullets.${bulletIndex}`,
                                      target.textContent || ''
                                    );
                                    setTimeout(() => {
                                      const prevBulletElement =
                                        document.querySelector(
                                          `[data-bullet="proj-${index}-${
                                            bulletIndex - 1
                                          }"]`
                                        ) as HTMLElement;
                                      if (prevBulletElement) {
                                        prevBulletElement.focus();
                                        const range = document.createRange();
                                        const selection = window.getSelection();
                                        range.selectNodeContents(
                                          prevBulletElement
                                        );
                                        range.collapse(false);
                                        selection?.removeAllRanges();
                                        selection?.addRange(range);
                                      }
                                    }, 10);
                                  }
                                } else if (e.key === 'ArrowDown') {
                                  const selection = window.getSelection();
                                  const range = selection?.getRangeAt(0);
                                  const target = e.target as HTMLElement;
                                  const textLength =
                                    target.textContent?.length || 0;

                                  if (
                                    bulletIndex < currentBullets.length - 1 &&
                                    range?.endOffset === textLength
                                  ) {
                                    e.preventDefault();
                                    handleContentChange(
                                      `sections.${sectionId}.items.${index}.bullets.${bulletIndex}`,
                                      target.textContent || ''
                                    );
                                    setTimeout(() => {
                                      const nextBulletElement =
                                        document.querySelector(
                                          `[data-bullet="proj-${index}-${
                                            bulletIndex + 1
                                          }"]`
                                        ) as HTMLElement;
                                      if (nextBulletElement) {
                                        nextBulletElement.focus();
                                        const range = document.createRange();
                                        const selection = window.getSelection();
                                        range.selectNodeContents(
                                          nextBulletElement
                                        );
                                        range.collapse(false);
                                        selection?.removeAllRanges();
                                        selection?.addRange(range);
                                      }
                                    }, 10);
                                  }
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                (e.target as HTMLElement).focus();
                              }}
                            >
                              {bullet || ''}
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Date and Location at bottom */}
                  <div className='flex items-center gap-3 mt-2 text-[11px] text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <Calendar size={10} className='text-gray-400' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) => {
                          handleContentChange(
                            `sections.${sectionId}.items.${index}.dateRange`,
                            e.target.textContent || ''
                          );
                        }}
                        onInput={(e) => handleInput(e, 50)}
                        data-placeholder='MM/YYYY - MM/YYYY'
                        style={!proj.dateRange ? { color: '#9ca3af' } : {}}
                      >
                        {proj.dateRange ||
                          (proj.dateRange === '' ? 'MM/YYYY - MM/YYYY' : '')}
                      </div>
                    </div>

                    <div className='flex items-center gap-1'>
                      <MapPin size={10} className='text-gray-400' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) => {
                          handleContentChange(
                            `sections.${sectionId}.items.${index}.location`,
                            e.target.textContent || ''
                          );
                        }}
                        onInput={(e) => handleInput(e, 50)}
                        data-placeholder='Ville'
                        style={!proj.location ? { color: '#9ca3af' } : {}}
                      >
                        {proj.location || (proj.location === '' ? 'Ville' : '')}
                      </div>
                    </div>
                  </div>
                </EditableSectionItem>
              ))}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem(sectionId)}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter un projet
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'courses':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='grid grid-cols-2 gap-3'>
              {(section.items || []).map((course: any, index: number) => (
                <EditableSectionItem
                  key={course.id || index}
                  sectionId='courses'
                  itemIndex={index}
                  className='px-3 py-2 transition-colors bg-white border border-gray-200 rounded-lg hover:border-blue-300'
                  onDelete={() => handleDeleteItem('courses', index)}
                  onItemEditingStart={handleItemEditingStart}
                  onItemEditingEnd={handleItemEditingEnd}
                >
                  {/* Course Title */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='text-[15px] font-semibold text-gray-900 transition-colors outline-none cursor-text hover:bg-gray-50 focus:bg-transparent mb-1'
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.courses.items.${index}.title`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 100)}
                    data-placeholder='Titre du cours'
                  >
                    {course.title || ''}
                  </div>
                  {/* Course Description/Institution */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='text-[13px] text-gray-600 transition-colors outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.courses.items.${index}.description`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 300)}
                    data-placeholder='Institution ou description'
                  >
                    {course.description || ''}
                  </div>
                </EditableSectionItem>
              ))}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem('courses')}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter un cours
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'volunteer':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='space-y-2'>
              {(section.items || []).map((vol: any, index: number) => (
                <EditableSectionItem
                  key={vol.id || index}
                  sectionId={sectionId}
                  itemIndex={index}
                  onAddEntry={() => handleAddItem(sectionId)}
                  onDelete={() => handleDeleteItem(sectionId, index)}
                  onSettings={() => console.log('Settings')}
                  onItemEditingStart={handleItemEditingStart}
                  onItemEditingEnd={handleItemEditingEnd}
                >
                  {/* Role */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='px-1 mb-1 text-[16px] font-bold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onFocus={() =>
                      handleItemEditingStart(sectionId, `${sectionId}-${index}`)
                    }
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.volunteer.items.${index}.role`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 100)}
                    onKeyDown={handleKeyDown}
                  >
                    {vol.role || vol.position || 'Vloontaire dans une ong'}
                  </div>

                  {/* Organization */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='px-1 mb-1 text-[14px] font-semibold text-blue-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.volunteer.items.${index}.institution`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 100)}
                  >
                    {vol.institution || vol.organization || 'Goody'}
                  </div>

                  {/* Date */}
                  <div className='flex items-center gap-1.5 mb-1 text-[12px] text-gray-600'>
                    <Calendar size={12} className='flex-shrink-0' />
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                      onBlur={(e) => {
                        handleContentChange(
                          `sections.volunteer.items.${index}.dateRange`,
                          e.target.textContent || ''
                        );
                      }}
                      onInput={(e) => handleInput(e, 20)}
                    >
                      {vol.dateRange || '2025'}
                    </div>
                  </div>

                  {/* Description */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='px-1 text-[13px] leading-relaxed text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.volunteer.items.${index}.description`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 500)}
                  >
                    {vol.description ||
                      vol.summary ||
                      'jai contribué dans une ong'}
                  </div>
                </EditableSectionItem>
              ))}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem(sectionId)}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter une activité bénévole
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'achievement':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='space-y-2'>
              {(section.items || []).map((ach: any, index: number) => (
                <div key={ach.id || index} className='flex items-start gap-2'>
                  {/* Icon */}
                  <div className='flex-shrink-0 mt-0.5'>
                    <Trophy size={16} className='text-blue-600' />
                  </div>

                  <div className='flex-1'>
                    {/* Title */}
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className='px-1 text-[14px] font-bold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                      onBlur={(e) => {
                        handleContentChange(
                          `sections.achievement.items.${index}.title`,
                          e.target.textContent || ''
                        );
                      }}
                      onInput={(e) => handleInput(e, 100)}
                    >
                      {ach.title || 'Avoit attein 19K'}
                    </div>

                    {/* Description */}
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className='px-1 mt-0.5 text-[13px] text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                      onBlur={(e) => {
                        handleContentChange(
                          `sections.achievement.items.${index}.description`,
                          e.target.textContent || ''
                        );
                      }}
                      onInput={(e) => handleInput(e, 300)}
                    >
                      {ach.description ||
                        "j'ai attein 19 k dans ka qsdqsdqsmdqksdmqlskdmqlskdsqmlk"}
                    </div>
                  </div>
                </div>
              ))}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem(sectionId)}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter une réalisation
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'talent':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='flex flex-wrap gap-2'>
              {(section.items || []).map((talent: any, index: number) => (
                <EditableSectionItem
                  key={talent.id || index}
                  sectionId='talent'
                  itemIndex={index}
                  className='flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md hover:border-blue-300 transition-colors'
                  onDelete={() => handleDeleteItem('talent', index)}
                  onItemEditingStart={handleItemEditingStart}
                  onItemEditingEnd={handleItemEditingEnd}
                >
                  <Star size={14} className='flex-shrink-0 text-yellow-500' />
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='text-[13px] font-medium text-gray-800 transition-colors outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onBlur={(e) =>
                      handleContentChange(
                        `sections.talent.items.${index}.title`,
                        e.target.textContent || ''
                      )
                    }
                    onInput={(e) => handleInput(e, 50)}
                    onKeyDown={handleKeyDown}
                  >
                    {talent.title || 'Your Strength'}
                  </div>
                </EditableSectionItem>
              ))}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem('talent')}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter un talent
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'passion':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='flex flex-wrap gap-2'>
              {(section.items || []).map((passion: any, index: number) => (
                <EditableSectionItem
                  key={passion.id || index}
                  sectionId='passion'
                  itemIndex={index}
                  className='flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-md'
                  onDelete={() => handleDeleteItem('passion', index)}
                  onItemEditingStart={handleItemEditingStart}
                  onItemEditingEnd={handleItemEditingEnd}
                >
                  <Diamond size={14} className='flex-shrink-0 text-blue-600' />
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='text-[13px] font-medium text-gray-800 transition-colors outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onBlur={(e) =>
                      handleContentChange(
                        `sections.passion.items.${index}.title`,
                        e.target.textContent || ''
                      )
                    }
                    onInput={(e) => handleInput(e, 50)}
                    onKeyDown={handleKeyDown}
                  >
                    {passion.title || 'le golf'}
                  </div>
                </EditableSectionItem>
              ))}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem('passion')}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter une passion
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'social':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='flex items-center gap-4'>
              {(section.items || []).map((social: any, index: number) => (
                <EditableSectionItem
                  key={social.id || index}
                  sectionId='social'
                  itemIndex={index}
                  className='flex items-center gap-2'
                  onDelete={() => handleDeleteItem('social', index)}
                  onItemEditingStart={handleItemEditingStart}
                  onItemEditingEnd={handleItemEditingEnd}
                >
                  <Facebook size={16} className='text-blue-600' />
                  <div className='flex flex-col'>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className='px-1 text-[13px] font-semibold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                      onBlur={(e) => {
                        handleContentChange(
                          `sections.social.items.${index}.title`,
                          e.target.textContent || ''
                        );
                      }}
                      onInput={(e) => handleInput(e, 30)}
                    >
                      {social.title || 'facebook.com'}
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className='px-1 text-[11px] text-gray-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                      onBlur={(e) => {
                        handleContentChange(
                          `sections.social.items.${index}.link`,
                          e.target.textContent || ''
                        );
                      }}
                      onInput={(e) => handleInput(e, 200)}
                    >
                      {social.link || 'facebook.com/testprofil'}
                    </div>
                  </div>
                </EditableSectionItem>
              ))}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem('social')}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter un réseau social
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'custom':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='space-y-2'>
              {(section.items || []).map((item: any, index: number) => (
                <EditableSectionItem
                  key={item.id || index}
                  sectionId={sectionId}
                  itemIndex={index}
                  onAddEntry={() => handleAddItem(sectionId)}
                  onDelete={() => handleDeleteItem(sectionId, index)}
                  onSettings={() => console.log('Settings')}
                  onItemEditingStart={handleItemEditingStart}
                  onItemEditingEnd={handleItemEditingEnd}
                >
                  <div className='flex items-start gap-2'>
                    <Diamond
                      size={16}
                      className='text-blue-600 flex-shrink-0 mt-0.5'
                    />
                    <div className='flex-1'>
                      {/* Title */}
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 mb-1 text-[15px] font-bold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onFocus={() =>
                          handleItemEditingStart(
                            sectionId,
                            `${sectionId}-${index}`
                          )
                        }
                        onBlur={(e) => {
                          handleContentChange(
                            `sections.custom.items.${index}.title`,
                            e.target.textContent || ''
                          );
                        }}
                        onInput={(e) => handleInput(e, 100)}
                        onKeyDown={handleKeyDown}
                      >
                        {item.title || 'Custom Title'}
                      </div>

                      {/* Date Range */}
                      {item.dateRange && (
                        <div className='flex items-center gap-1.5 mb-1 text-[11px] text-gray-500'>
                          <Calendar size={10} className='text-gray-400' />
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                            onBlur={(e) => {
                              handleContentChange(
                                `sections.custom.items.${index}.dateRange`,
                                e.target.textContent || ''
                              );
                            }}
                            onInput={(e) => handleInput(e, 30)}
                          >
                            {item.dateRange || 'Date period'}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 text-[13px] leading-relaxed text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) => {
                          handleContentChange(
                            `sections.custom.items.${index}.description`,
                            e.target.textContent || ''
                          );
                        }}
                        onInput={(e) => handleInput(e, 500)}
                      >
                        {item.description || 'Custom Description'}
                      </div>
                    </div>
                  </div>
                </EditableSectionItem>
              ))}
            </div>
          </SectionContainer>
        );

      case 'certifications':
      case 'awards':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='space-y-2'>
              {(section.items || [{ title: '', issuer: '', date: '' }]).map(
                (item: any, index: number) => (
                  <EditableSectionItem
                    key={item.id || index}
                    sectionId={sectionId}
                    itemIndex={index}
                    className='flex items-start gap-2'
                    onDelete={() => handleDeleteItem(sectionId, index)}
                    onItemEditingStart={handleItemEditingStart}
                    onItemEditingEnd={handleItemEditingEnd}
                  >
                    <Trophy
                      size={16}
                      className='text-blue-600 flex-shrink-0 mt-0.5'
                    />
                    <div className='flex-1'>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 text-[14px] font-bold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) => {
                          handleContentChange(
                            `sections.${sectionId}.items.${index}.title`,
                            e.target.textContent || ''
                          );
                        }}
                        onInput={(e) => handleInput(e, 100)}
                        data-placeholder={
                          sectionId === 'certifications'
                            ? 'Nom de la certification'
                            : 'Nom de la récompense'
                        }
                      >
                        {item.title || item.name || ''}
                      </div>
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 mt-0.5 text-[12px] text-blue-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) => {
                          handleContentChange(
                            `sections.${sectionId}.items.${index}.issuer`,
                            e.target.textContent || ''
                          );
                        }}
                        onInput={(e) => handleInput(e, 100)}
                        data-placeholder='Organisation'
                      >
                        {item.issuer || ''}
                      </div>
                      <div className='flex items-center gap-1 mt-0.5 text-[11px] text-gray-500'>
                        <Calendar size={10} />
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                          onBlur={(e) => {
                            handleContentChange(
                              `sections.${sectionId}.items.${index}.date`,
                              e.target.textContent || ''
                            );
                          }}
                          onInput={(e) => handleInput(e, 30)}
                          data-placeholder='Date'
                        >
                          {item.date || ''}
                        </div>
                      </div>
                    </div>
                  </EditableSectionItem>
                )
              )}
            </div>
          </SectionContainer>
        );

      case 'publications':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='space-y-2'>
              {(section.items || []).map((item: any, index: number) => (
                <div key={item.id || index}>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='px-1 mb-0.5 text-[13px] font-semibold text-gray-900 italic transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.publications.items.${index}.title`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 200)}
                  >
                    {item.title || 'Publication Title'}
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='px-1 text-[12px] text-gray-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.publications.items.${index}.publisher`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 100)}
                  >
                    {item.publisher || 'Publisher'} •{' '}
                    {item.releaseDate || 'Date'}
                  </div>
                </div>
              ))}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem(sectionId)}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter une publication
                </button>
              )}
            </div>
          </SectionContainer>
        );

      case 'references':
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>

            <div className='grid grid-cols-2 gap-3'>
              {(section.items || []).map((ref: any, index: number) => (
                <EditableSectionItem
                  key={ref.id || index}
                  sectionId='references'
                  itemIndex={index}
                  className='p-3 border border-gray-200 rounded-lg bg-gray-50'
                  onDelete={() => handleDeleteItem('references', index)}
                  onItemEditingStart={handleItemEditingStart}
                  onItemEditingEnd={handleItemEditingEnd}
                >
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='px-1 mb-0.5 text-[13px] font-bold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.references.items.${index}.name`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 100)}
                  >
                    {ref.name || 'Reference Name'}
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='px-1 mb-1 text-[11px] text-gray-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onBlur={(e) => {
                      handleContentChange(
                        `sections.references.items.${index}.position`,
                        e.target.textContent || ''
                      );
                    }}
                    onInput={(e) => handleInput(e, 100)}
                  >
                    {ref.position || 'Position'}
                  </div>
                  {ref.email && (
                    <div className='flex items-center gap-1 text-[11px] text-blue-600'>
                      <Mail size={10} />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) => {
                          handleContentChange(
                            `sections.references.items.${index}.email`,
                            e.target.textContent || ''
                          );
                        }}
                        onInput={(e) => handleInput(e, 100)}
                      >
                        {ref.email}
                      </div>
                    </div>
                  )}
                </EditableSectionItem>
              ))}

              {/* Show add button if no items */}
              {(!section.items || section.items.length === 0) && (
                <button
                  onClick={() => handleAddItem('references')}
                  className='w-full mt-2 px-3 py-3 text-sm font-medium text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Ajouter une référence
                </button>
              )}
            </div>
          </SectionContainer>
        );

      default:
        return (
          <SectionContainer
            sectionKey={sectionId}
            title={section.name || SECTION_PLACEHOLDERS[sectionId] || sectionId}
            className='mb-2'
          >
            <h2
              contentEditable
              suppressContentEditableWarning
              className='px-1 pb-1 mb-1.5 text-[22px] font-bold text-gray-900 transition-colors border-b-2 border-blue-600 rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onBlur={(e) => {
                handleContentChange(
                  `sections.${sectionId}.name`,
                  e.target.textContent || ''
                );
              }}
              onInput={(e) => handleInput(e, CHARACTER_LIMITS.sectionTitle)}
              onKeyDown={handleKeyDown}
              onClick={(event) => {
                event.stopPropagation();
                (event.target as HTMLElement).focus();
              }}
              data-placeholder={
                SECTION_PLACEHOLDERS[sectionId] || sectionId.toUpperCase()
              }
            >
              {section.name || ''}
            </h2>
            <div className='space-y-2'>
              {(section.items || [{ title: '', description: '' }]).map(
                (item: any, index: number) => (
                  <EditableSectionItem
                    key={item.id || index}
                    sectionId={sectionId}
                    itemIndex={index}
                    className='mb-2'
                    onDelete={() => handleDeleteItem(sectionId, index)}
                    onItemEditingStart={handleItemEditingStart}
                    onItemEditingEnd={handleItemEditingEnd}
                  >
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className='px-1 mb-1 text-[13px] font-medium text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                      onBlur={(e) =>
                        handleContentChange(
                          `sections.${sectionId}.items.${index}.title`,
                          e.target.textContent || ''
                        )
                      }
                      onInput={(e) => handleInput(e, CHARACTER_LIMITS.position)}
                      onKeyDown={handleKeyDown}
                      data-placeholder='Titre'
                    >
                      {item.title || item.name || ''}
                    </div>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className='px-1 text-[12px] text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                      onBlur={(e) =>
                        handleContentChange(
                          `sections.${sectionId}.items.${index}.description`,
                          e.target.textContent || ''
                        )
                      }
                      onInput={(e) => handleInput(e, CHARACTER_LIMITS.summary)}
                      onKeyDown={handleKeyDown}
                      data-placeholder='Description'
                    >
                      {item.description || item.summary || ''}
                    </div>
                  </EditableSectionItem>
                )
              )}
            </div>
          </SectionContainer>
        );
    }
  };

  return (
    <>
      <input
        ref={photoInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handlePhotoInputChange}
      />
      <CVOverlay isVisible={false} selectedItem=''>
        <div
          className='w-full h-full bg-white'
          style={{
            fontFamily: designSettings?.fontFamily
              ? `${designSettings.fontFamily}, sans-serif`
              : 'Inter, sans-serif',
            fontSize: designSettings?.fontSize
              ? `${designSettings.fontSize}pt`
              : '12pt',
            lineHeight: designSettings?.lineSpacing || 1.4,
          }}
        >
          <div className='p-8'>
            {/* Personal Information */}
            <EditableSectionItem
              sectionId='basics'
              className='mb-3'
              isSection={true}
              onAddEntry={() => void 0}
              onDelete={() => void 0}
              onSettings={() => console.log('Settings for basics')}
            >
              <div className='flex items-start justify-between gap-6'>
                {/* Name, Job Title and Contact Info - Left */}
                <div className='flex-1'>
                  {/* Full Name */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='block px-1 mb-0 text-[38px] font-bold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent leading-tight'
                    onBlur={(e) =>
                      handleContentChange(
                        'basics.name',
                        e.target.textContent || ''
                      )
                    }
                    onInput={(e) => handleInput(e, CHARACTER_LIMITS.name)}
                    onKeyDown={handleKeyDown}
                    data-placeholder='Nom complet'
                  >
                    {data.basics?.name || ''}
                  </div>

                  {/* Job Title */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className='block px-1 mb-3 text-[19px] font-medium text-blue-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                    onBlur={(e) =>
                      handleContentChange(
                        'basics.label',
                        e.target.textContent || ''
                      )
                    }
                    onInput={(e) => handleInput(e, CHARACTER_LIMITS.headline)}
                    onKeyDown={handleKeyDown}
                    data-placeholder='Titre professionnel'
                  >
                    {data.basics?.label || ''}
                  </div>

                  {/* Contact Information */}
                  <div className='flex flex-wrap items-center gap-3 text-[12px] text-gray-700'>
                    {/* Phone */}
                    <div className='flex items-center gap-1.5'>
                      <Phone size={14} className='text-blue-600' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) =>
                          handleContentChange(
                            'basics.phone',
                            e.target.textContent || ''
                          )
                        }
                        onInput={(e) => handleInput(e, 20)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                          e.stopPropagation();
                          (e.target as HTMLElement).focus();
                        }}
                        data-placeholder='Téléphone'
                      >
                        {data.basics?.phone || ''}
                      </div>
                    </div>

                    {/* Email */}
                    <div className='flex items-center gap-1.5'>
                      <Mail size={14} className='text-blue-600' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) =>
                          handleContentChange(
                            'basics.email',
                            e.target.textContent || ''
                          )
                        }
                        onInput={(e) => handleInput(e, 50)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                          e.stopPropagation();
                          (e.target as HTMLElement).focus();
                        }}
                        data-placeholder='email@exemple.com'
                      >
                        {data.basics?.email || ''}
                      </div>
                    </div>

                    {/* Website */}
                    <div className='flex items-center gap-1.5'>
                      <Globe size={14} className='text-blue-600' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) =>
                          handleContentChange(
                            'basics.url',
                            e.target.textContent || ''
                          )
                        }
                        onInput={(e) => handleInput(e, 60)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                          e.stopPropagation();
                          (e.target as HTMLElement).focus();
                        }}
                        data-placeholder='https://portfolio.com'
                      >
                        {data.basics?.url || ''}
                      </div>
                    </div>

                    {/* Location */}
                    <div className='flex items-center gap-1.5'>
                      <MapPin size={14} className='text-blue-600' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) =>
                          handleContentChange(
                            'basics.location.city',
                            e.target.textContent || ''
                          )
                        }
                        onInput={(e) => handleInput(e, 40)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                          e.stopPropagation();
                          (e.target as HTMLElement).focus();
                        }}
                        data-placeholder='Ville, Pays'
                      >
                        {data.basics?.location?.city || ''}
                      </div>
                    </div>

                    {/* LinkedIn/Portfolio */}
                    <div className='flex items-center gap-1.5'>
                      <Link2 size={14} className='text-blue-600' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) =>
                          handleContentChange(
                            'basics.link',
                            e.target.textContent || ''
                          )
                        }
                        onInput={(e) => handleInput(e, 60)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                          e.stopPropagation();
                          (e.target as HTMLElement).focus();
                        }}
                        data-placeholder='LinkedIn/Portfolio'
                      >
                        {data.basics?.link || ''}
                      </div>
                    </div>

                    {/* Lien supplementaire */}
                    <div className='flex items-center gap-1.5'>
                      <ExternalLink size={14} className='text-blue-600' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) =>
                          handleContentChange(
                            'basics.extraLink',
                            e.target.textContent || ''
                          )
                        }
                        onInput={(e) => handleInput(e, 60)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                          e.stopPropagation();
                          (e.target as HTMLElement).focus();
                        }}
                        data-placeholder='Lien supplementaire'
                      >
                        {data.basics?.extraLink || ''}
                      </div>
                    </div>

                    {/* Champ supplementaire */}
                    <div className='flex items-center gap-1.5'>
                      <Star size={14} className='text-blue-600' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) =>
                          handleContentChange(
                            'basics.extraField',
                            e.target.textContent || ''
                          )
                        }
                        onInput={(e) => handleInput(e, 50)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                          e.stopPropagation();
                          (e.target as HTMLElement).focus();
                        }}
                        data-placeholder='Champ supplementaire'
                      >
                        {data.basics?.extraField || ''}
                      </div>
                    </div>

                    {/* Date de naissance */}
                    <div className='flex items-center gap-1.5'>
                      <Calendar size={14} className='text-blue-600' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) =>
                          handleContentChange(
                            'basics.dateOfBirth',
                            e.target.textContent || ''
                          )
                        }
                        onInput={(e) => handleInput(e, 20)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                          e.stopPropagation();
                          (e.target as HTMLElement).focus();
                        }}
                        data-placeholder='Date de naissance'
                      >
                        {data.basics?.dateOfBirth || ''}
                      </div>
                    </div>

                    {/* Nationalite */}
                    <div className='flex items-center gap-1.5'>
                      <Flag size={14} className='text-blue-600' />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                        onBlur={(e) =>
                          handleContentChange(
                            'basics.nationality',
                            e.target.textContent || ''
                          )
                        }
                        onInput={(e) => handleInput(e, 30)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                          e.stopPropagation();
                          (e.target as HTMLElement).focus();
                        }}
                        data-placeholder='Nationalite'
                      >
                        {data.basics?.nationality || ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo - Right */}
                <div className='flex-shrink-0'>
                  <div
                    role='button'
                    tabIndex={0}
                    data-section-action='true'
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePhotoClick();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        handlePhotoClick();
                      }
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsPhotoDragging(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsPhotoDragging(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsPhotoDragging(false);
                      handlePhotoSelection(event.dataTransfer?.files || null);
                    }}
                    className={`relative flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-full cursor-pointer transition-colors ${
                      photoSrc
                        ? 'border-transparent bg-transparent'
                        : isPhotoDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-200 hover:bg-gray-100'
                    }`}
                    aria-label={
                      photoSrc
                        ? 'Mettre à jour la photo de profil'
                        : 'Ajouter une photo de profil'
                    }
                  >
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt='Photo de profil'
                        className='object-cover w-full h-full rounded-full'
                        draggable={false}
                      />
                    ) : (
                      <div className='text-center pointer-events-none'>
                        <svg
                          className='w-6 h-6 mx-auto mb-1 text-gray-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                          />
                        </svg>
                        <span className='text-[12px] text-gray-500'>
                          Cliquez ou déposez
                        </span>
                      </div>
                    )}
                    {isPhotoDragging && (
                      <div className='absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-600 bg-blue-50/80 rounded-full pointer-events-none'>
                        Déposez votre image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </EditableSectionItem>

            {/* Other Sections */}
            <div
              className={`grid gap-2 ${
                layoutColumns === 1
                  ? 'grid-cols-1'
                  : 'grid-cols-1 lg:grid-cols-2'
              }`}
            >
              {sectionsOrder.map((sectionId: string) => {
                const section = data.sections?.[sectionId];
                if (!section) return null;
                return (
                  <div key={sectionId} className='break-inside-avoid'>
                    {renderSection(sectionId, section)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DatePicker Modal */}
        {showDatePicker && datePickerData && (
          <DateRangePicker
            startDate={datePickerData.startDate}
            endDate={datePickerData.endDate}
            onDateChange={handleDateChange}
            onClose={() => setShowDatePicker(false)}
            position={datePickerPosition}
          />
        )}
      </CVOverlay>
    </>
  );
};

export const TemplateLayout1: React.FC<TemplateLayout1Props> = (props) => {
  return <TemplateLayout1Content {...props} />;
};
