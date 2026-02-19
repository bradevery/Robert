/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Resume } from '@/stores/resume-simple';

interface TemplateProps {
  resume: Resume;
  className?: string;
  isFirstPage?: boolean;
}

export const Gengar: React.FC<TemplateProps> = ({
  resume,
  className = '',
  _isFirstPage = true,
}) => {
  const { data } = resume;

  return (
    <div className={`gengar-template ${className}`}>
      <div
        className='min-h-screen p-8 text-white bg-gradient-to-br from-purple-900 to-indigo-900'
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='flex flex-col items-center'>
            <h1 className='mb-2 text-4xl font-bold text-purple-300'>
              {data.basics.name}
            </h1>
            <div className='mb-6 text-xl text-purple-200'>
              {data.basics.label}
            </div>
            <div className='flex flex-wrap justify-center gap-6 text-purple-200'>
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
          <div className='p-6 mb-8 bg-black border border-purple-400 bg-opacity-30 backdrop-blur-sm rounded-xl'>
            <h2 className='mb-4 text-xl font-bold text-center text-purple-300'>
              À Propos
            </h2>
            <p className='leading-relaxed text-center text-gray-200'>
              {data.basics.summary}
            </p>
          </div>
        )}

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* Left Column */}
          <div className='space-y-8'>
            {/* Experience */}
            {data.sections.experience?.items &&
              data.sections.experience.items.length > 0 && (
                <div>
                  <h2 className='mb-6 text-xl font-bold text-center text-purple-300'>
                    Expérience Professionnelle
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.experience.items.map(
                      (exp: any, index: number) => (
                        <div
                          key={index}
                          className='p-4 bg-black border border-purple-400 rounded-lg bg-opacity-30 backdrop-blur-sm'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <h3 className='text-lg font-bold text-white'>
                              {exp.position}
                            </h3>
                            <span className='text-sm font-medium text-purple-300'>
                              {exp.startDate} - {exp.endDate || 'Présent'}
                            </span>
                          </div>
                          <p className='mb-2 font-semibold text-purple-200'>
                            {exp.company}
                          </p>
                          {exp.summary && (
                            <p className='text-sm leading-relaxed text-gray-300'>
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
                  <h2 className='mb-6 text-xl font-bold text-center text-purple-300'>
                    Formation
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.education.items.map(
                      (edu: any, index: number) => (
                        <div
                          key={index}
                          className='p-4 bg-black border border-purple-400 rounded-lg bg-opacity-30 backdrop-blur-sm'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <h3 className='text-lg font-bold text-white'>
                              {edu.degree}
                            </h3>
                            <span className='text-sm font-medium text-purple-300'>
                              {edu.startDate} - {edu.endDate || 'Présent'}
                            </span>
                          </div>
                          <p className='mb-2 font-semibold text-purple-200'>
                            {edu.institution}
                          </p>
                          {edu.summary && (
                            <p className='text-sm leading-relaxed text-gray-300'>
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
                  <h2 className='mb-6 text-xl font-bold text-center text-purple-300'>
                    Compétences
                  </h2>
                  <div className='p-4 bg-black border border-purple-400 rounded-lg bg-opacity-30 backdrop-blur-sm'>
                    <div className='space-y-4'>
                      {data.sections.skills.items.map(
                        (skill: any, index: number) => (
                          <div key={index} className='flex items-center'>
                            <span className='w-32 font-medium text-white'>
                              {skill.name}
                            </span>
                            <div className='flex-1 h-3 ml-4 bg-gray-700 rounded-full'>
                              <div
                                className='h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600'
                                style={{ width: `${skill.level || 75}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Languages */}
            {data.sections.languages?.items &&
              data.sections.languages.items.length > 0 && (
                <div>
                  <h2 className='mb-6 text-xl font-bold text-center text-purple-300'>
                    Langues
                  </h2>
                  <div className='p-4 bg-black border border-purple-400 rounded-lg bg-opacity-30 backdrop-blur-sm'>
                    <div className='space-y-3'>
                      {data.sections.languages.items.map(
                        (lang: any, index: number) => (
                          <div
                            key={index}
                            className='flex items-center justify-between'
                          >
                            <span className='font-medium text-white'>
                              {lang.language}
                            </span>
                            <span className='font-medium text-purple-300'>
                              {lang.fluency}
                            </span>
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
                  <h2 className='mb-6 text-xl font-bold text-center text-purple-300'>
                    Certifications
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.certifications.items.map(
                      (cert: any, index: number) => (
                        <div
                          key={index}
                          className='p-3 bg-black border border-purple-400 rounded-lg bg-opacity-30 backdrop-blur-sm'
                        >
                          <h3 className='font-medium text-white'>
                            {cert.name}
                          </h3>
                          <p className='text-sm text-purple-300'>
                            {cert.issuer}
                          </p>
                          {cert.date && (
                            <p className='text-xs text-gray-400'>{cert.date}</p>
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
