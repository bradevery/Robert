/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Resume } from '@/stores/resume-simple';

interface TemplateProps {
  resume: Resume;
  className?: string;
  isFirstPage?: boolean;
}

export const Bronzor: React.FC<TemplateProps> = ({
  resume,
  className = '',
  _isFirstPage = true,
}) => {
  const { data } = resume;

  return (
    <div className={`bronzor-template ${className}`}>
      <div
        className='min-h-screen p-8 text-gray-900 bg-gray-50'
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {/* Header */}
        <div className='p-8 mb-8 bg-white rounded-lg shadow-lg'>
          <div className='flex items-center space-x-8'>
            {data.basics.image && (
              <div className='flex-shrink-0'>
                <img
                  src={data.basics.image}
                  alt='Profile'
                  className='object-cover w-32 h-32 border-4 border-gray-300 rounded-full'
                />
              </div>
            )}
            <div className='flex-1'>
              <h1 className='mb-4 text-5xl font-bold text-gray-900'>
                {data.basics.firstName} {data.basics.lastName}
              </h1>
              <div className='grid grid-cols-1 gap-4 text-gray-600 md:grid-cols-3'>
                {data.basics.email && (
                  <div className='flex items-center'>
                    <svg
                      className='w-5 h-5 mr-3'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                      <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                    </svg>
                    {data.basics.email}
                  </div>
                )}
                {data.basics.phone && (
                  <div className='flex items-center'>
                    <svg
                      className='w-5 h-5 mr-3'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                    </svg>
                    {data.basics.phone}
                  </div>
                )}
                {data.basics.location && (
                  <div className='flex items-center'>
                    <svg
                      className='w-5 h-5 mr-3'
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {data.basics.summary && (
          <div className='p-8 mb-8 bg-white rounded-lg shadow-lg'>
            <h2 className='pb-2 mb-6 text-3xl font-bold text-gray-900 border-b-2 border-gray-300'>
              À Propos
            </h2>
            <p className='text-lg leading-relaxed text-gray-700'>
              {data.basics.summary}
            </p>
          </div>
        )}

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Main Content */}
          <div className='space-y-8 lg:col-span-2'>
            {/* Experience */}
            {data.sections.experience?.items &&
              data.sections.experience.items.length > 0 && (
                <div className='p-8 bg-white rounded-lg shadow-lg'>
                  <h2 className='pb-2 mb-6 text-3xl font-bold text-gray-900 border-b-2 border-gray-300'>
                    Expérience Professionnelle
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.experience.items.map(
                      (exp: any, index: number) => (
                        <div
                          key={index}
                          className='pl-6 border-l-4 border-gray-400'
                        >
                          <div className='flex items-start justify-between mb-3'>
                            <div>
                              <h3 className='text-xl font-bold text-gray-900'>
                                {exp.position}
                              </h3>
                              <p className='text-lg font-semibold text-gray-600'>
                                {exp.company}
                              </p>
                            </div>
                            <span className='font-medium text-gray-500'>
                              {exp.startDate} - {exp.endDate || 'Présent'}
                            </span>
                          </div>
                          {exp.summary && (
                            <p className='leading-relaxed text-gray-700'>
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
                <div className='p-8 bg-white rounded-lg shadow-lg'>
                  <h2 className='pb-2 mb-6 text-3xl font-bold text-gray-900 border-b-2 border-gray-300'>
                    Formation
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.education.items.map(
                      (edu: any, index: number) => (
                        <div
                          key={index}
                          className='pl-6 border-l-4 border-gray-400'
                        >
                          <div className='flex items-start justify-between mb-3'>
                            <div>
                              <h3 className='text-xl font-bold text-gray-900'>
                                {edu.degree}
                              </h3>
                              <p className='text-lg font-semibold text-gray-600'>
                                {edu.institution}
                              </p>
                            </div>
                            <span className='font-medium text-gray-500'>
                              {edu.startDate} - {edu.endDate || 'Présent'}
                            </span>
                          </div>
                          {edu.summary && (
                            <p className='leading-relaxed text-gray-700'>
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

          {/* Sidebar */}
          <div className='space-y-8'>
            {/* Skills */}
            {data.sections.skills?.items &&
              data.sections.skills.items.length > 0 && (
                <div className='p-8 bg-white rounded-lg shadow-lg'>
                  <h2 className='pb-2 mb-6 text-2xl font-bold text-gray-900 border-b-2 border-gray-300'>
                    Compétences
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.skills.items.map(
                      (skill: any, index: number) => (
                        <div key={index}>
                          <div className='flex justify-between mb-2'>
                            <span className='font-medium text-gray-700'>
                              {skill.name}
                            </span>
                            <span className='text-sm text-gray-500'>
                              {skill.level || 'Expert'}
                            </span>
                          </div>
                          <div className='w-full h-2 bg-gray-200 rounded-full'>
                            <div
                              className='h-2 bg-gray-600 rounded-full'
                              style={{ width: `${skill.level || 75}%` }}
                            ></div>
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
                <div className='p-8 bg-white rounded-lg shadow-lg'>
                  <h2 className='pb-2 mb-6 text-2xl font-bold text-gray-900 border-b-2 border-gray-300'>
                    Langues
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.languages.items.map(
                      (lang: any, index: number) => (
                        <div
                          key={index}
                          className='flex items-center justify-between py-2'
                        >
                          <span className='font-medium text-gray-700'>
                            {lang.language}
                          </span>
                          <span className='text-gray-600'>{lang.fluency}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Certifications */}
            {data.sections.certifications?.items &&
              data.sections.certifications.items.length > 0 && (
                <div className='p-8 bg-white rounded-lg shadow-lg'>
                  <h2 className='pb-2 mb-6 text-2xl font-bold text-gray-900 border-b-2 border-gray-300'>
                    Certifications
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.certifications.items.map(
                      (cert: any, index: number) => (
                        <div
                          key={index}
                          className='pl-4 border-l-4 border-gray-300'
                        >
                          <h3 className='font-medium text-gray-900'>
                            {cert.name}
                          </h3>
                          <p className='text-gray-600'>{cert.issuer}</p>
                          {cert.date && (
                            <p className='text-sm text-gray-500'>{cert.date}</p>
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
