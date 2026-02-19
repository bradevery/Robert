/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Resume } from '@/stores/resume-simple';

interface TemplateProps {
  resume: Resume;
  className?: string;
  isFirstPage?: boolean;
}

export const Chikorita: React.FC<TemplateProps> = ({
  resume,
  className = '',
  _isFirstPage = true,
}) => {
  const { data } = resume;

  return (
    <div className={`chikorita-template ${className}`}>
      <div
        className='min-h-screen p-8 text-gray-900 bg-gradient-to-br from-green-50 to-green-100'
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {/* Header */}
        <div className='p-8 mb-8 bg-white border-l-8 border-green-500 shadow-xl rounded-2xl'>
          <div className='flex items-center space-x-8'>
            {data.basics.image && (
              <div className='flex-shrink-0'>
                <img
                  src={data.basics.image}
                  alt='Profile'
                  className='object-cover border-4 border-green-500 rounded-full shadow-lg w-28 h-28'
                />
              </div>
            )}
            <div className='flex-1'>
              <h1 className='mb-4 text-4xl font-bold text-green-800'>
                {data.basics.firstName} {data.basics.lastName}
              </h1>
              <div className='grid grid-cols-1 gap-4 text-green-600 md:grid-cols-3'>
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
          <div className='p-8 mb-8 bg-white border-l-8 border-green-500 shadow-xl rounded-2xl'>
            <h2 className='flex items-center mb-4 text-2xl font-bold text-green-800'>
              <svg
                className='w-6 h-6 mr-3'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z'
                  clipRule='evenodd'
                />
              </svg>
              Profil Professionnel
            </h2>
            <p className='leading-relaxed text-gray-700'>
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
                <div className='p-8 bg-white border-l-8 border-green-500 shadow-xl rounded-2xl'>
                  <h2 className='flex items-center mb-6 text-2xl font-bold text-green-800'>
                    <svg
                      className='w-6 h-6 mr-3'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z'
                        clipRule='evenodd'
                      />
                      <path d='M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z' />
                    </svg>
                    Expérience
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.experience.items.map(
                      (exp: any, index: number) => (
                        <div key={index} className='relative'>
                          <div className='absolute top-0 left-0 w-4 h-4 mt-1 -ml-6 bg-green-500 rounded-full'></div>
                          <div className='pl-4 ml-4 border-l-2 border-green-200'>
                            <div className='flex items-start justify-between mb-2'>
                              <h3 className='text-lg font-bold text-gray-900'>
                                {exp.position}
                              </h3>
                              <span className='px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full'>
                                {exp.startDate} - {exp.endDate || 'Présent'}
                              </span>
                            </div>
                            <p className='mb-2 font-semibold text-green-700'>
                              {exp.company}
                            </p>
                            {exp.summary && (
                              <p className='leading-relaxed text-gray-600'>
                                {exp.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Education */}
            {data.sections.education?.items &&
              data.sections.education.items.length > 0 && (
                <div className='p-8 bg-white border-l-8 border-green-500 shadow-xl rounded-2xl'>
                  <h2 className='flex items-center mb-6 text-2xl font-bold text-green-800'>
                    <svg
                      className='w-6 h-6 mr-3'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.429 3.058L9.3 16.573z' />
                    </svg>
                    Formation
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.education.items.map(
                      (edu: any, index: number) => (
                        <div key={index} className='relative'>
                          <div className='absolute top-0 left-0 w-4 h-4 mt-1 -ml-6 bg-green-500 rounded-full'></div>
                          <div className='pl-4 ml-4 border-l-2 border-green-200'>
                            <div className='flex items-start justify-between mb-2'>
                              <h3 className='text-lg font-bold text-gray-900'>
                                {edu.degree}
                              </h3>
                              <span className='px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full'>
                                {edu.startDate} - {edu.endDate || 'Présent'}
                              </span>
                            </div>
                            <p className='mb-2 font-semibold text-green-700'>
                              {edu.institution}
                            </p>
                            {edu.summary && (
                              <p className='leading-relaxed text-gray-600'>
                                {edu.summary}
                              </p>
                            )}
                          </div>
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
                <div className='p-8 bg-white border-l-8 border-green-500 shadow-xl rounded-2xl'>
                  <h2 className='flex items-center mb-6 text-2xl font-bold text-green-800'>
                    <svg
                      className='w-6 h-6 mr-3'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Compétences
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.skills.items.map(
                      (skill: any, index: number) => (
                        <div key={index} className='flex items-center'>
                          <span className='w-32 font-medium text-gray-700'>
                            {skill.name}
                          </span>
                          <div className='flex-1 h-3 ml-4 bg-gray-200 rounded-full'>
                            <div
                              className='h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600'
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
                <div className='p-8 bg-white border-l-8 border-green-500 shadow-xl rounded-2xl'>
                  <h2 className='flex items-center mb-6 text-2xl font-bold text-green-800'>
                    <svg
                      className='w-6 h-6 mr-3'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Langues
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.languages.items.map(
                      (lang: any, index: number) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-3 rounded-lg bg-green-50'
                        >
                          <span className='font-medium text-gray-700'>
                            {lang.language}
                          </span>
                          <span className='px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full'>
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
                <div className='p-8 bg-white border-l-8 border-green-500 shadow-xl rounded-2xl'>
                  <h2 className='flex items-center mb-6 text-2xl font-bold text-green-800'>
                    <svg
                      className='w-6 h-6 mr-3'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    Certifications
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.certifications.items.map(
                      (cert: any, index: number) => (
                        <div
                          key={index}
                          className='p-4 border-l-4 border-green-500 rounded-lg bg-green-50'
                        >
                          <h3 className='font-bold text-gray-900'>
                            {cert.name}
                          </h3>
                          <p className='font-medium text-green-600'>
                            {cert.issuer}
                          </p>
                          {cert.date && (
                            <p className='mt-1 text-sm text-gray-500'>
                              {cert.date}
                            </p>
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
