/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Resume } from '@/stores/resume-simple';

interface TemplateProps {
  resume: Resume;
  className?: string;
  isFirstPage?: boolean;
}

export const Pikachu: React.FC<TemplateProps> = ({
  resume,
  className = '',
  _isFirstPage = true,
}) => {
  const { data } = resume;

  return (
    <div className={`pikachu-template ${className}`}>
      <div
        className='min-h-screen p-8 text-gray-900 bg-gradient-to-br from-yellow-50 to-orange-100'
        style={{ fontFamily: 'Comic Sans MS, cursive' }}
      >
        {/* Header */}
        <div className='p-8 mb-8 bg-white border-4 border-yellow-400 shadow-2xl rounded-3xl'>
          <div className='flex items-center space-x-8'>
            {data.basics.image && (
              <div className='flex-shrink-0'>
                <img
                  src={data.basics.image}
                  alt='Profile'
                  className='object-cover w-32 h-32 border-4 border-yellow-400 rounded-full shadow-lg'
                />
              </div>
            )}
            <div className='flex-1'>
              <h1 className='mb-4 text-4xl font-bold text-yellow-600 transform -rotate-1'>
                ⚡ {data.basics.firstName} {data.basics.lastName} ⚡
              </h1>
              <div className='grid grid-cols-1 gap-4 text-yellow-700 md:grid-cols-3'>
                {data.basics.email && (
                  <div className='flex items-center'>
                    <span className='mr-3 text-2xl'>📧</span>
                    {data.basics.email}
                  </div>
                )}
                {data.basics.phone && (
                  <div className='flex items-center'>
                    <span className='mr-3 text-2xl'>📞</span>
                    {data.basics.phone}
                  </div>
                )}
                {data.basics.location && (
                  <div className='flex items-center'>
                    <span className='mr-3 text-2xl'>📍</span>
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
          <div className='p-6 mb-8 bg-white border-4 border-yellow-400 shadow-xl rounded-2xl'>
            <h2 className='flex items-center mb-4 text-2xl font-bold text-yellow-600'>
              <span className='mr-3 text-3xl'>🌟</span>À propos de moi
            </h2>
            <p className='text-lg leading-relaxed text-gray-700'>
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
                <div className='p-6 bg-white border-4 border-yellow-400 shadow-xl rounded-2xl'>
                  <h2 className='flex items-center mb-6 text-2xl font-bold text-yellow-600'>
                    <span className='mr-3 text-3xl'>💼</span>
                    Expérience
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.experience.items.map(
                      (exp: any, index: number) => (
                        <div
                          key={index}
                          className='p-4 border-2 border-blue-200 bg-blue-50 rounded-xl'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <h3 className='text-lg font-bold text-gray-900'>
                              {exp.position}
                            </h3>
                            <span className='px-3 py-1 text-sm font-medium text-yellow-600 bg-yellow-200 rounded-full'>
                              {exp.startDate} - {exp.endDate || 'Présent'}
                            </span>
                          </div>
                          <p className='mb-2 font-semibold text-yellow-700'>
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
                <div className='p-6 bg-white border-4 border-yellow-400 shadow-xl rounded-2xl'>
                  <h2 className='flex items-center mb-6 text-2xl font-bold text-yellow-600'>
                    <span className='mr-3 text-3xl'>🎓</span>
                    Formation
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.education.items.map(
                      (edu: any, index: number) => (
                        <div
                          key={index}
                          className='p-4 border-2 border-blue-200 bg-blue-50 rounded-xl'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <h3 className='text-lg font-bold text-gray-900'>
                              {edu.degree}
                            </h3>
                            <span className='px-3 py-1 text-sm font-medium text-yellow-600 bg-yellow-200 rounded-full'>
                              {edu.startDate} - {edu.endDate || 'Présent'}
                            </span>
                          </div>
                          <p className='mb-2 font-semibold text-yellow-700'>
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
                <div className='p-6 bg-white border-4 border-yellow-400 shadow-xl rounded-2xl'>
                  <h2 className='flex items-center mb-6 text-2xl font-bold text-yellow-600'>
                    <span className='mr-3 text-3xl'>⚡</span>
                    Compétences
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.skills.items.map(
                      (skill: any, index: number) => (
                        <div key={index} className='flex items-center'>
                          <span className='w-32 font-medium text-gray-700'>
                            {skill.name}
                          </span>
                          <div className='flex-1 h-4 ml-4 bg-yellow-200 rounded-full'>
                            <div
                              className='h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500'
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
                <div className='p-6 bg-white border-4 border-yellow-400 shadow-xl rounded-2xl'>
                  <h2 className='flex items-center mb-6 text-2xl font-bold text-yellow-600'>
                    <span className='mr-3 text-3xl'>🌍</span>
                    Langues
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.languages.items.map(
                      (lang: any, index: number) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-3 border-2 rounded-lg border-blue-200 bg-blue-50'
                        >
                          <span className='font-medium text-gray-700'>
                            {lang.language}
                          </span>
                          <span className='px-3 py-1 text-sm font-medium text-yellow-600 bg-yellow-200 rounded-full'>
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
                <div className='p-6 bg-white border-4 border-yellow-400 shadow-xl rounded-2xl'>
                  <h2 className='flex items-center mb-6 text-2xl font-bold text-yellow-600'>
                    <span className='mr-3 text-3xl'>🏆</span>
                    Certifications
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.certifications.items.map(
                      (cert: any, index: number) => (
                        <div
                          key={index}
                          className='p-4 border-2 rounded-lg border-blue-200 bg-blue-50'
                        >
                          <h3 className='font-bold text-gray-900'>
                            {cert.name}
                          </h3>
                          <p className='font-medium text-yellow-600'>
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
