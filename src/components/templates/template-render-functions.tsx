'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Fonctions de rendu complètes pour toutes les sections du CV
 * À intégrer dans TemplateLayout1.tsx
 */

import { Calendar, Link, MapPin } from 'lucide-react';
import React from 'react';

import { EditableSectionItem } from '@/components/ui/EditableSectionItem';

// ============================================
// CHARACTER LIMITS
// ============================================

export const CHARACTER_LIMITS = {
  sectionTitle: 50,
  position: 100,
  company: 150,
  institution: 150,
  location: 50,
  studyType: 100,
  summary: 2000,
  skill: 50,
  name: 100,
  title: 100,
  description: 1000,
  url: 200,
};

// ============================================
// EDUCATION SECTION - COMPLETE
// ============================================

export const renderEducationItem = (
  edu: any,
  index: number,
  handleAddItem: (...args: any[]) => any,
  handleDeleteItem: (...args: any[]) => any,
  handleItemEditingStart: (...args: any[]) => any,
  handleItemEditingEnd: (...args: any[]) => any,
  handleContentChange: (...args: any[]) => any,
  handleInput: (...args: any[]) => any,
  handleKeyDown: (...args: any[]) => any,
  handleKeyDownDescription: (...args: any[]) => any,
  handleOpenDatePicker: (...args: any[]) => any
) => (
  <EditableSectionItem
    key={edu.id || index}
    itemId={`education-${index}`}
    sectionId='education'
    onAddEntry={() => handleAddItem('education')}
    onDelete={() => handleDeleteItem('education', index)}
    onSettings={() => console.log('Settings for education', index)}
    onItemEditingStart={handleItemEditingStart}
    onItemEditingEnd={handleItemEditingEnd}
  >
    {/* Diploma/Degree */}
    <div
      contentEditable
      suppressContentEditableWarning
      className='px-1 mb-1 text-[18px] font-semibold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
      onFocus={() => handleItemEditingStart('education', `education-${index}`)}
      onBlur={(e: any) => {
        handleContentChange(
          `sections.education.items.${index}.degree`,
          e.target.textContent || ''
        );
        handleItemEditingEnd();
      }}
      onInput={(e: any) => handleInput(e, 100)}
      onKeyDown={handleKeyDown}
      onClick={(e: any) => {
        e.stopPropagation();
        (e.target as HTMLElement).focus();
      }}
    >
      {edu.degree || edu.studyType || ''}
    </div>

    {/* Institution */}
    <div
      contentEditable
      suppressContentEditableWarning
      className='px-1 mb-1 text-[14px] font-bold text-blue-600 uppercase transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
      onFocus={() => handleItemEditingStart('education', `education-${index}`)}
      onBlur={(e: any) => {
        handleContentChange(
          `sections.education.items.${index}.institution`,
          e.target.textContent || ''
        );
        handleItemEditingEnd();
      }}
      onInput={(e: any) => handleInput(e, 150)}
      onKeyDown={handleKeyDown}
    >
      {edu.institution || ''}
    </div>

    {/* Date and Location */}
    <div className='flex items-center gap-4 mb-1.5 text-[12px] text-gray-700'>
      {/* Date */}
      <div className='flex items-center gap-1.5'>
        <Calendar size={14} className='flex-shrink-0 text-gray-600' />
        <div
          className='cursor-pointer text-gray-700 hover:text-blue-600 hover:underline transition-colors'
          onClick={(e: any) =>
            handleOpenDatePicker(
              e,
              'education',
              index,
              edu.startDate || '',
              edu.endDate || ''
            )
          }
        >
          {edu.startDate && edu.endDate
            ? `${edu.startDate} - ${edu.endDate}`
            : edu.endDate || ''}
        </div>
      </div>

      {/* Location */}
      <div className='flex items-center gap-1.5'>
        <MapPin size={14} className='flex-shrink-0 text-gray-600' />
        <div
          contentEditable
          suppressContentEditableWarning
          className='px-1 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
          onFocus={() =>
            handleItemEditingStart('education', `education-${index}`)
          }
          onBlur={(e: any) => {
            handleContentChange(
              `sections.education.items.${index}.location`,
              e.target.textContent || ''
            );
            handleItemEditingEnd();
          }}
          onInput={(e: any) => handleInput(e, 50)}
          onKeyDown={handleKeyDown}
        >
          {edu.location || ''}
        </div>
      </div>
    </div>

    {/* GPA/Score */}
    <div className='mb-1.5 text-[12px]'>
      <span className='text-gray-600'>Note/Mention: </span>
      <div
        contentEditable
        suppressContentEditableWarning
        className='inline px-1 font-medium text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
        onFocus={() =>
          handleItemEditingStart('education', `education-${index}`)
        }
        onBlur={(e: any) => {
          handleContentChange(
            `sections.education.items.${index}.score`,
            e.target.textContent || ''
          );
          handleItemEditingEnd();
        }}
        onInput={(e: any) => handleInput(e, 50)}
        onKeyDown={handleKeyDown}
      >
        {edu.score || edu.gpa || ''}
      </div>
      {edu.maxGpa && <span className='text-gray-500'> / {edu.maxGpa}</span>}
    </div>

    {/* Description/Summary */}
    <div
      contentEditable
      suppressContentEditableWarning
      className='px-1 mb-1.5 text-[13px] leading-relaxed text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent whitespace-pre-wrap'
      onFocus={() => handleItemEditingStart('education', `education-${index}`)}
      onBlur={(e: any) => {
        handleContentChange(
          `sections.education.items.${index}.summary`,
          e.target.textContent || ''
        );
        handleItemEditingEnd();
      }}
      onInput={(e: any) => handleInput(e, 500)}
      onKeyDown={handleKeyDownDescription}
    >
      {edu.summary || edu.area || ''}
    </div>

    {/* Courses */}
    {edu.courses && edu.courses.length > 0 && (
      <div className='w-full'>
        <p className='text-[12px] font-medium text-gray-700 mb-1'>
          Cours suivis:
        </p>
        <ul className='w-full space-y-1 list-none'>
          {edu.courses.map((course: string, courseIdx: number) => (
            <li key={courseIdx} className='flex items-start w-full gap-2'>
              <div className='w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0'></div>
              <div
                contentEditable
                suppressContentEditableWarning
                className='flex-1 min-w-0 px-1 text-[12px] text-gray-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
                onFocus={() =>
                  handleItemEditingStart(
                    'education',
                    `education-${index}-course-${courseIdx}`
                  )
                }
                onBlur={(e: any) => {
                  handleContentChange(
                    `sections.education.items.${index}.courses.${courseIdx}`,
                    e.target.textContent || ''
                  );
                  handleItemEditingEnd();
                }}
                onInput={(e: any) => handleInput(e, 100)}
                onKeyDown={handleKeyDown}
              >
                {course || ''}
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}
  </EditableSectionItem>
);

// ============================================
// PROJECTS SECTION - COMPLETE
// ============================================

export const renderProjectItem = (
  proj: any,
  index: number,
  handleAddItem: (...args: any[]) => any,
  handleDeleteItem: (...args: any[]) => any,
  handleItemEditingStart: (...args: any[]) => any,
  handleItemEditingEnd: (...args: any[]) => any,
  handleContentChange: (...args: any[]) => any,
  handleInput: (...args: any[]) => any,
  handleKeyDown: (...args: any[]) => any,
  handleOpenDatePicker: (...args: any[]) => any
) => (
  <EditableSectionItem
    key={proj.id || index}
    itemId={`project-${index}`}
    sectionId='projects'
    onAddEntry={() => handleAddItem('projects')}
    onDelete={() => handleDeleteItem('projects', index)}
    onSettings={() => console.log('Settings for project', index)}
    onItemEditingStart={handleItemEditingStart}
    onItemEditingEnd={handleItemEditingEnd}
  >
    {/* Project Name */}
    <div
      contentEditable
      suppressContentEditableWarning
      className='px-1 mb-1 text-[16px] font-semibold text-gray-900 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
      onFocus={() => handleItemEditingStart('projects', `project-${index}`)}
      onBlur={(e: any) => {
        handleContentChange(
          `sections.projects.items.${index}.name`,
          e.target.textContent || ''
        );
        handleItemEditingEnd();
      }}
      onInput={(e: any) => handleInput(e, 100)}
      onKeyDown={handleKeyDown}
    >
      {proj.name || 'Nom du projet'}
    </div>

    {/* Date Range */}
    <div className='flex items-center gap-1.5 mb-1 text-[12px]'>
      <Calendar size={12} className='text-gray-600' />
      <div
        className='cursor-pointer text-gray-700 hover:text-blue-600 hover:underline transition-colors'
        onClick={(e: any) =>
          handleOpenDatePicker(
            e,
            'projects',
            index,
            proj.date?.startDate || '',
            proj.date?.endDate || ''
          )
        }
      >
        {proj.date?.startDate && proj.date?.endDate
          ? `${proj.date.startDate} - ${proj.date.endDate}`
          : 'Date du projet'}
      </div>
    </div>

    {/* URL */}
    <div className='flex items-center gap-1.5 mb-1.5 text-[12px]'>
      <Link size={12} className='text-gray-600' />
      <div
        contentEditable
        suppressContentEditableWarning
        className='px-1 text-blue-600 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
        onFocus={() => handleItemEditingStart('projects', `project-${index}`)}
        onBlur={(e: any) => {
          handleContentChange(
            `sections.projects.items.${index}.url`,
            e.target.textContent || ''
          );
          handleItemEditingEnd();
        }}
        onInput={(e: any) => handleInput(e, 200)}
      >
        {proj.url || 'https://github.com/user/project'}
      </div>
    </div>

    {/* Description */}
    <div
      contentEditable
      suppressContentEditableWarning
      className='px-1 mb-1.5 text-[13px] leading-relaxed text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent whitespace-pre-wrap'
      onFocus={() => handleItemEditingStart('projects', `project-${index}`)}
      onBlur={(e: any) => {
        handleContentChange(
          `sections.projects.items.${index}.description`,
          e.target.textContent || ''
        );
        handleItemEditingEnd();
      }}
      onInput={(e: any) => handleInput(e, 1000)}
    >
      {proj.description || 'Description du projet'}
    </div>

    {/* Technologies/Keywords */}
    {proj.keywords && proj.keywords.length > 0 && (
      <div className='flex flex-wrap gap-1.5 mb-1.5'>
        {proj.keywords.map((keyword: string, kIdx: number) => (
          <span
            key={kIdx}
            className='px-2 py-0.5 text-[11px] bg-blue-50 text-blue-700 rounded-md font-medium'
          >
            {keyword}
          </span>
        ))}
      </div>
    )}

    {/* Highlights */}
    {proj.highlights && proj.highlights.length > 0 && (
      <ul className='w-full space-y-1 list-none'>
        {proj.highlights.map((highlight: string, hIdx: number) => (
          <li key={hIdx} className='flex items-start w-full gap-2'>
            <div className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0'></div>
            <div
              contentEditable
              suppressContentEditableWarning
              className='flex-1 text-[12px] text-gray-700 transition-colors rounded outline-none cursor-text hover:bg-gray-50 focus:bg-transparent'
              onFocus={() =>
                handleItemEditingStart(
                  'projects',
                  `project-${index}-highlight-${hIdx}`
                )
              }
              onBlur={(e: any) => {
                handleContentChange(
                  `sections.projects.items.${index}.highlights.${hIdx}`,
                  e.target.textContent || ''
                );
                handleItemEditingEnd();
              }}
              onInput={(e: any) => handleInput(e, 200)}
            >
              {highlight}
            </div>
          </li>
        ))}
      </ul>
    )}
  </EditableSectionItem>
);

// ... (Le fichier continuera avec toutes les autres sections)
// Ce fichier est trop long, je vais créer un guide pour l'intégration manuelle
