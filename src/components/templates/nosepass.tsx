/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Resume } from '@/stores/resume-simple';

interface TemplateProps {
  resume: Resume;
  className?: string;
  isFirstPage?: boolean;
}

export const Nosepass: React.FC<TemplateProps> = ({
  resume,
  className = '',
  _isFirstPage = true,
}) => {
  const { data } = resume;

  return (
    <div className={`nosepass-template ${className}`}>
      <div
        className='min-h-screen p-8 text-gray-900 bg-white'
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        {/* Header */}
        <div className='pb-6 mb-8 text-center border-b-2 border-gray-300'>
          <div className='flex flex-col items-center'>
            {data.basics.image && (
              <img
                src={data.basics.image}
                alt='Profile'
                className='object-cover mb-4 border-4 border-gray-400 rounded-full w-28 h-28'
              />
            )}
            <h1 className='mb-2 text-3xl font-bold text-gray-900'>
              {data.basics.firstName} {data.basics.lastName}
            </h1>
            <div className='flex flex-wrap justify-center gap-4 text-sm text-gray-600'>
              {data.basics.email && <span>{data.basics.email}</span>}
              {data.basics.phone && <span>{data.basics.phone}</span>}
              {data.basics.location && (
                <span>
                  {typeof data.basics.location === 'string'
                    ? data.basics.location
                    : `${data.basics.location.city}${
                        data.basics.location.country
                          ? ', ' + data.basics.location.country
                          : ''
                      }`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        {data.basics.summary && (
          <div className='mb-8 text-center'>
            <div className='max-w-2xl mx-auto'>
              <p className='italic leading-relaxed text-gray-700'>
                {data.basics.summary}
              </p>
            </div>
          </div>
        )}

        {/* Single Column Layout */}
        <div className='max-w-4xl mx-auto space-y-8'>
          {/* Experience */}
          {data.sections.experience?.items &&
            data.sections.experience.items.length > 0 && (
              <div>
                <h2 className='mb-4 text-xl font-bold tracking-wide text-center text-gray-900 uppercase'>
                  Expérience Professionnelle
                </h2>
                <div className='space-y-6'>
                  {data.sections.experience.items.map(
                    (exp: any, index: number) => (
                      <div
                        key={index}
                        className='pl-4 border-l-4 border-gray-400'
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <h3 className='text-lg font-bold text-gray-900'>
                            {exp.position}
                          </h3>
                          <span className='text-sm text-gray-600'>
                            {exp.startDate} - {exp.endDate || 'Présent'}
                          </span>
                        </div>
                        <p className='mb-2 font-semibold text-gray-700'>
                          {exp.company}
                        </p>
                        {exp.summary && (
                          <p className='leading-relaxed text-gray-600'>
                            {exp.summary}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Education */}
          {data.sections.education?.items &&
            data.sections.education.items.length > 0 && (
              <div>
                <h2 className='mb-4 text-xl font-bold tracking-wide text-center text-gray-900 uppercase'>
                  Formation
                </h2>
                <div className='space-y-6'>
                  {data.sections.education.items.map(
                    (edu: any, index: number) => (
                      <div
                        key={index}
                        className='pl-4 border-l-4 border-gray-400'
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <h3 className='text-lg font-bold text-gray-900'>
                            {edu.degree}
                          </h3>
                          <span className='text-sm text-gray-600'>
                            {edu.startDate} - {edu.endDate || 'Présent'}
                          </span>
                        </div>
                        <p className='mb-2 font-semibold text-gray-700'>
                          {edu.institution}
                        </p>
                        {edu.summary && (
                          <p className='leading-relaxed text-gray-600'>
                            {edu.summary}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Skills */}
          {data.sections.skills?.items &&
            data.sections.skills.items.length > 0 && (
              <div>
                <h2 className='mb-4 text-xl font-bold tracking-wide text-center text-gray-900 uppercase'>
                  Compétences
                </h2>
                <div className='flex flex-wrap justify-center gap-4'>
                  {data.sections.skills.items.map(
                    (skill: any, index: number) => (
                      <div
                        key={index}
                        className='px-4 py-2 bg-gray-100 border rounded'
                      >
                        <span className='font-medium text-gray-800'>
                          {skill.name}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Languages */}
          {data.sections.languages?.items &&
            data.sections.languages.items.length > 0 && (
              <div>
                <h2 className='mb-4 text-xl font-bold tracking-wide text-center text-gray-900 uppercase'>
                  Langues
                </h2>
                <div className='flex justify-center'>
                  <div className='space-y-2'>
                    {data.sections.languages.items.map(
                      (lang: any, index: number) => (
                        <div
                          key={index}
                          className='flex items-center justify-between w-64'
                        >
                          <span className='font-medium text-gray-800'>
                            {lang.language}
                          </span>
                          <span className='text-gray-600'>{lang.fluency}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Certifications */}
          {data.sections.certifications?.items &&
            data.sections.certifications.items.length > 0 && (
              <div>
                <h2 className='mb-4 text-xl font-bold tracking-wide text-center text-gray-900 uppercase'>
                  Certifications
                </h2>
                <div className='space-y-4'>
                  {data.sections.certifications.items.map(
                    (cert: any, index: number) => (
                      <div key={index} className='text-center'>
                        <h3 className='font-medium text-gray-900'>
                          {cert.name}
                        </h3>
                        <p className='text-sm text-gray-600'>{cert.issuer}</p>
                        {cert.date && (
                          <p className='text-xs text-gray-500'>{cert.date}</p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
