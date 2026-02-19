'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { Fragment } from 'react';

import type {
  Education,
  Experience,
  Language,
  Project,
  SectionKey,
  SectionWithItem,
  Skill,
} from '@/lib/reactive-resume-schema';
import { cn, get, isEmptyString, sanitize } from '@/lib/reactive-resume-utils';

import { useArtboardStore } from '@/stores/artboard';

interface TemplateProps {
  columns: SectionKey[][];
  isFirstPage?: boolean;
}

const Header = () => {
  const basics = useArtboardStore((state) => state.resume.basics);
  const _profiles = useArtboardStore((state) => state.resume.sections.profiles);

  return (
    <div className='space-y-3'>
      <div className='text-center'>
        <h1 className='text-3xl font-light text-primary'>{basics.name}</h1>
        <h2 className='text-lg text-gray-600'>{basics.headline}</h2>
      </div>

      <div className='flex justify-center space-x-6 text-sm'>
        {basics.location && (
          <div className='flex items-center gap-x-1'>
            <i className='ph ph-bold ph-map-pin text-primary' />
            <span>{basics.location}</span>
          </div>
        )}
        {basics.phone && (
          <div className='flex items-center gap-x-1'>
            <i className='ph ph-bold ph-phone text-primary' />
            <a href={`tel:${basics.phone}`}>{basics.phone}</a>
          </div>
        )}
        {basics.email && (
          <div className='flex items-center gap-x-1'>
            <i className='ph ph-bold ph-at text-primary' />
            <a href={`mailto:${basics.email}`}>{basics.email}</a>
          </div>
        )}
      </div>
    </div>
  );
};

const Summary = () => {
  const section = useArtboardStore((state) => state.resume.sections.summary);

  if (!section.visible || isEmptyString(section.content)) return null;

  return (
    <section className='space-y-2'>
      <h3 className='text-lg font-medium text-primary border-b border-primary pb-1'>
        {section.name}
      </h3>
      <div
        dangerouslySetInnerHTML={{ __html: sanitize(section.content) }}
        className='text-sm leading-relaxed'
      />
    </section>
  );
};

// Composant générique pour les sections
type SectionProps<T> = {
  section: SectionWithItem<T>;
  children?: (item: T) => React.ReactNode;
  className?: string;
  summaryKey?: keyof T;
  keywordsKey?: keyof T;
};

const Section = <T,>({
  section,
  children,
  className,
  summaryKey,
  keywordsKey,
}: SectionProps<T>) => {
  if (!section.visible || section.items.length === 0) return null;

  return (
    <section className='space-y-3'>
      <h3 className='text-lg font-medium text-primary border-b border-primary pb-1'>
        {section.name}
      </h3>
      <div className='space-y-3'>
        {section.items
          .filter((item: any) => item.visible)
          .map((item: any) => {
            const summary = (summaryKey &&
              get(item, summaryKey as string, '')) as string | undefined;
            const keywords = (keywordsKey &&
              get(item, keywordsKey as string, [])) as string[] | undefined;

            return (
              <div key={item.id} className={cn('space-y-1', className)}>
                <div>{children?.(item as T)}</div>

                {summary !== undefined && !isEmptyString(summary) && (
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitize(summary) }}
                    className='text-sm text-gray-600 leading-relaxed'
                  />
                )}

                {keywords !== undefined && keywords.length > 0 && (
                  <p className='text-xs text-gray-500'>{keywords.join(', ')}</p>
                )}
              </div>
            );
          })}
      </div>
    </section>
  );
};

const ExperienceSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.experience);

  return (
    <Section<Experience> section={section} summaryKey='summary'>
      {(item) => (
        <div className='space-y-1'>
          <div className='flex justify-between items-start'>
            <div>
              <h4 className='font-medium'>{item.position}</h4>
              <p className='text-primary font-medium'>{item.company}</p>
            </div>
            <div className='text-right text-sm text-gray-600'>
              <div>{item.date}</div>
              <div>{item.location}</div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

const EducationSection = () => {
  const section = useArtboardStore((state) => state.resume.sections.education);

  return (
    <Section<Education> section={section} summaryKey='summary'>
      {(item) => (
        <div className='space-y-1'>
          <div className='flex justify-between items-start'>
            <div>
              <h4 className='font-medium'>{item.area}</h4>
              <p className='text-primary font-medium'>{item.institution}</p>
              {item.score && (
                <p className='text-sm text-gray-600'>{item.score}</p>
              )}
            </div>
            <div className='text-right text-sm text-gray-600'>
              <div>{item.date}</div>
              <div>{item.studyType}</div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Skills = () => {
  const section = useArtboardStore((state) => state.resume.sections.skills);

  return (
    <Section<Skill> section={section} keywordsKey='keywords'>
      {(item) => (
        <div className='space-y-1'>
          <h4 className='font-medium'>{item.name}</h4>
          {item.description && (
            <p className='text-sm text-gray-600'>{item.description}</p>
          )}
        </div>
      )}
    </Section>
  );
};

const Projects = () => {
  const section = useArtboardStore((state) => state.resume.sections.projects);

  return (
    <Section<Project>
      section={section}
      summaryKey='summary'
      keywordsKey='keywords'
    >
      {(item) => (
        <div className='space-y-1'>
          <div className='flex justify-between items-start'>
            <div>
              <h4 className='font-medium'>{item.name}</h4>
              {item.description && (
                <p className='text-sm text-gray-600'>{item.description}</p>
              )}
            </div>
            <div className='text-sm text-gray-600'>{item.date}</div>
          </div>
        </div>
      )}
    </Section>
  );
};

const Languages = () => {
  const section = useArtboardStore((state) => state.resume.sections.languages);

  return (
    <Section<Language> section={section}>
      {(item) => (
        <div className='flex justify-between items-center'>
          <span className='font-medium'>{item.name}</span>
          <span className='text-sm text-gray-600'>{item.description}</span>
        </div>
      )}
    </Section>
  );
};

const mapSectionToComponent = (section: SectionKey) => {
  switch (section) {
    case 'summary':
      return <Summary />;
    case 'experience':
      return <ExperienceSection />;
    case 'education':
      return <EducationSection />;
    case 'skills':
      return <Skills />;
    case 'projects':
      return <Projects />;
    case 'languages':
      return <Languages />;
    default:
      return null;
  }
};

export const Azurill = ({ columns, isFirstPage = false }: TemplateProps) => {
  if (!columns || !Array.isArray(columns) || columns.length < 2) {
    return (
      <div className='p-custom space-y-4'>
        <div className='text-center text-red-500'>
          Erreur de configuration du template
        </div>
      </div>
    );
  }

  const [main, sidebar] = columns;

  return (
    <div className='p-custom space-y-6 max-w-4xl mx-auto'>
      {isFirstPage && <Header />}

      <div className='grid grid-cols-3 gap-8'>
        <div className='col-span-2 space-y-6'>
          {main.map((section) => (
            <Fragment key={section}>{mapSectionToComponent(section)}</Fragment>
          ))}
        </div>

        <div className='space-y-6'>
          {sidebar.map((section) => (
            <Fragment key={section}>{mapSectionToComponent(section)}</Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
