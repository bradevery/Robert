/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Resume } from '@/stores/resume-simple';

interface TemplateProps {
  resume: Resume;
  className?: string;
  isFirstPage?: boolean;
}

export const Ditto: React.FC<TemplateProps> = ({
  resume,
  className = '',
  _isFirstPage = true,
}) => {
  const { data } = resume;

  return (
    <div className={`ditto-template ${className}`}>
      <div
        className='min-h-screen p-8 text-gray-900 bg-white'
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='flex flex-col items-center'>
            <h1 className='mb-4 text-4xl font-bold text-gray-900'>
              {data.basics.name}
            </h1>
            <div className='mb-6 text-xl text-gray-600'>
              {data.basics.label}
            </div>
            <div className='flex flex-wrap justify-center gap-6 text-gray-600'>
              {data.basics.email && (
                <span className='flex items-center'>
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                    <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                  </svg>
                  {data.basics.email}
                </span>
              )}
              {data.basics.phone && (
                <span className='flex items-center'>
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                  </svg>
                  {data.basics.phone}
                </span>
              )}
              {data.basics.location && (
                <span className='flex items-center'>
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                      clipRule='evenodd'
                    />
                  </svg>
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
            <div className='max-w-3xl mx-auto'>
              <p className='text-lg leading-relaxed text-gray-700'>
                {data.basics.summary}
              </p>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 gap-12 lg:grid-cols-2'>
          {/* Left Column */}
          <div className='space-y-8'>
            {/* Experience */}
            {data.sections.experience?.items &&
              data.sections.experience.items.length > 0 && (
                <div>
                  <h2 className='pb-2 mb-6 text-2xl font-bold text-gray-900 border-b-2 border-gray-300'>
                    EXPÉRIENCE PROFESSIONNELLE
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.experience.items.map(
                      (exp: any, index: number) => (
                        <div key={index}>
                          <div className='flex items-start justify-between mb-2'>
                            <h3 className='text-lg font-bold text-gray-900'>
                              {exp.position}
                            </h3>
                            <span className='text-sm font-medium text-gray-600'>
                              {exp.startDate} - {exp.endDate || 'Présent'}
                            </span>
                          </div>
                          <p className='mb-3 font-semibold text-gray-700'>
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
                  <h2 className='pb-2 mb-6 text-2xl font-bold text-gray-900 border-b-2 border-gray-300'>
                    FORMATION
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.education.items.map(
                      (edu: any, index: number) => (
                        <div key={index}>
                          <div className='flex items-start justify-between mb-2'>
                            <h3 className='text-lg font-bold text-gray-900'>
                              {edu.degree}
                            </h3>
                            <span className='text-sm font-medium text-gray-600'>
                              {edu.startDate} - {edu.endDate || 'Présent'}
                            </span>
                          </div>
                          <p className='mb-3 font-semibold text-gray-700'>
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
          </div>

          {/* Right Column */}
          <div className='space-y-8'>
            {/* Skills */}
            {data.sections.skills?.items &&
              data.sections.skills.items.length > 0 && (
                <div>
                  <h2 className='pb-2 mb-6 text-2xl font-bold text-gray-900 border-b-2 border-gray-300'>
                    COMPÉTENCES
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.skills.items.map(
                      (skill: any, index: number) => (
                        <div
                          key={index}
                          className='flex items-center justify-between'
                        >
                          <span className='font-medium text-gray-700'>
                            {skill.name}
                          </span>
                          <div className='flex space-x-1'>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <=
                                  (skill.level === 'beginner'
                                    ? 2
                                    : skill.level === 'intermediate'
                                    ? 3
                                    : skill.level === 'advanced'
                                    ? 4
                                    : 5)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill='currentColor'
                                viewBox='0 0 20 20'
                              >
                                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                              </svg>
                            ))}
                          </div>
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
                  <h2 className='pb-2 mb-6 text-2xl font-bold text-gray-900 border-b-2 border-gray-300'>
                    LANGUES
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.languages.items.map(
                      (lang: any, index: number) => (
                        <div
                          key={index}
                          className='flex items-center justify-between'
                        >
                          <span className='font-medium text-gray-700'>
                            {lang.language}
                          </span>
                          <span className='font-medium text-gray-600'>
                            {lang.fluency}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Certifications */}
            {data.sections.certifications?.items &&
              data.sections.certifications.items.length > 0 && (
                <div>
                  <h2 className='pb-2 mb-6 text-2xl font-bold text-gray-900 border-b-2 border-gray-300'>
                    CERTIFICATIONS
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.certifications.items.map(
                      (cert: any, index: number) => (
                        <div key={index}>
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
    </div>
  );
};
