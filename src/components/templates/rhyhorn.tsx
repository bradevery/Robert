/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Resume } from '@/stores/resume-simple';

interface TemplateProps {
  resume: Resume;
  className?: string;
  isFirstPage?: boolean;
}

export const Rhyhorn: React.FC<TemplateProps> = ({
  resume,
  className = '',
  _isFirstPage = true,
}) => {
  const { data } = resume;

  return (
    <div className={`rhyhorn-template ${className}`}>
      <div
        className='min-h-screen p-8 text-white bg-gradient-to-br from-gray-800 to-gray-900'
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className='pb-6 mb-8 border-b-2 border-red-500'>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <h1 className='mb-2 text-4xl font-bold tracking-wider text-red-400 uppercase'>
                {data.basics.firstName} {data.basics.lastName}
              </h1>
              <div className='flex items-center space-x-6 text-gray-300'>
                {data.basics.email && (
                  <span className='flex items-center'>
                    <div className='w-4 h-4 mr-2 bg-red-500 rounded'></div>
                    {data.basics.email}
                  </span>
                )}
                {data.basics.phone && (
                  <span className='flex items-center'>
                    <div className='w-4 h-4 mr-2 bg-red-500 rounded'></div>
                    {data.basics.phone}
                  </span>
                )}
                {data.basics.location && (
                  <span className='flex items-center'>
                    <div className='w-4 h-4 mr-2 bg-red-500 rounded'></div>
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
            {data.basics.image && (
              <div className='ml-6'>
                <img
                  src={data.basics.image}
                  alt='Profile'
                  className='object-cover w-24 h-24 border-4 border-red-500 rounded-full'
                />
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.basics.summary && (
          <div className='p-6 mb-8 bg-gray-700 border-l-4 border-red-500 rounded-lg'>
            <h2 className='mb-4 text-xl font-bold tracking-wide text-red-400 uppercase'>
              Profil Professionnel
            </h2>
            <p className='leading-relaxed text-gray-300'>
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
                  <h2 className='pb-2 mb-6 text-xl font-bold tracking-wide text-red-400 uppercase border-b border-red-500'>
                    Expérience Professionnelle
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.experience.items.map(
                      (exp: any, index: number) => (
                        <div
                          key={index}
                          className='p-4 bg-gray-700 border-l-4 border-red-500 rounded-lg'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <h3 className='text-lg font-bold text-white'>
                              {exp.position}
                            </h3>
                            <span className='text-sm font-medium text-red-400'>
                              {exp.startDate} - {exp.endDate || 'Présent'}
                            </span>
                          </div>
                          <p className='mb-2 font-semibold text-red-300'>
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
                  <h2 className='pb-2 mb-6 text-xl font-bold tracking-wide text-red-400 uppercase border-b border-red-500'>
                    Formation
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.education.items.map(
                      (edu: any, index: number) => (
                        <div
                          key={index}
                          className='p-4 bg-gray-700 border-l-4 border-red-500 rounded-lg'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <h3 className='text-lg font-bold text-white'>
                              {edu.degree}
                            </h3>
                            <span className='text-sm font-medium text-red-400'>
                              {edu.startDate} - {edu.endDate || 'Présent'}
                            </span>
                          </div>
                          <p className='mb-2 font-semibold text-red-300'>
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
                  <h2 className='pb-2 mb-6 text-xl font-bold tracking-wide text-red-400 uppercase border-b border-red-500'>
                    Compétences
                  </h2>
                  <div className='p-4 bg-gray-700 rounded-lg'>
                    <div className='space-y-4'>
                      {data.sections.skills.items.map(
                        (skill: any, index: number) => (
                          <div key={index} className='flex items-center'>
                            <span className='w-32 font-medium text-white'>
                              {skill.name}
                            </span>
                            <div className='flex-1 h-3 ml-4 bg-gray-600 rounded-full'>
                              <div
                                className='h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600'
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
                  <h2 className='pb-2 mb-6 text-xl font-bold tracking-wide text-red-400 uppercase border-b border-red-500'>
                    Langues
                  </h2>
                  <div className='p-4 bg-gray-700 rounded-lg'>
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
                            <span className='font-medium text-red-400'>
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
                  <h2 className='pb-2 mb-6 text-xl font-bold tracking-wide text-red-400 uppercase border-b border-red-500'>
                    Certifications
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.certifications.items.map(
                      (cert: any, index: number) => (
                        <div
                          key={index}
                          className='p-3 bg-gray-700 border-l-4 border-red-500 rounded-lg'
                        >
                          <h3 className='font-medium text-white'>
                            {cert.name}
                          </h3>
                          <p className='text-sm text-red-300'>{cert.issuer}</p>
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
