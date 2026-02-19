/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Resume } from '@/stores/resume-simple';

interface TemplateProps {
  resume: Resume;
  className?: string;
  isFirstPage?: boolean;
}

export const Kakuna: React.FC<TemplateProps> = ({
  resume,
  className = '',
  _isFirstPage = true,
}) => {
  const { data } = resume;

  return (
    <div className={`kakuna-template ${className}`}>
      <div
        className='min-h-screen p-8 text-white bg-gray-900'
        style={{ fontFamily: 'Courier New, monospace' }}
      >
        {/* Header */}
        <div className='pb-6 mb-8 border-b border-gray-600'>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <h1 className='mb-2 font-mono text-4xl font-bold text-green-400'>
                {data.basics.name.toUpperCase()}
              </h1>
              <div className='flex flex-wrap gap-6 text-gray-300'>
                {data.basics.email && (
                  <span className='flex items-center font-mono'>
                    <span className='mr-2 text-green-400'>[EMAIL]</span>
                    {data.basics.email}
                  </span>
                )}
                {data.basics.phone && (
                  <span className='flex items-center font-mono'>
                    <span className='mr-2 text-green-400'>[PHONE]</span>
                    {data.basics.phone}
                  </span>
                )}
                {data.basics.location && (
                  <span className='flex items-center font-mono'>
                    <span className='mr-2 text-green-400'>[LOCATION]</span>
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
        </div>

        {/* Summary */}
        {data.basics.summary && (
          <div className='p-6 mb-8 bg-gray-800 border border-gray-600 rounded'>
            <h2 className='mb-4 font-mono text-xl font-bold text-green-400'>
              {'>'} ABOUT_ME
            </h2>
            <p className='font-mono leading-relaxed text-gray-300'>
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
                  <h2 className='pb-2 mb-6 font-mono text-xl font-bold text-green-400 border-b border-gray-600'>
                    {'>'} WORK_EXPERIENCE
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.experience.items.map(
                      (exp: any, index: number) => (
                        <div
                          key={index}
                          className='p-4 bg-gray-800 border border-gray-600 rounded'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <h3 className='font-mono text-lg font-bold text-white'>
                              {exp.position}
                            </h3>
                            <span className='font-mono text-sm text-green-400'>
                              {exp.startDate} - {exp.endDate || 'PRESENT'}
                            </span>
                          </div>
                          <p className='mb-2 font-mono text-green-300'>
                            {exp.company}
                          </p>
                          {exp.summary && (
                            <p className='font-mono text-sm leading-relaxed text-gray-300'>
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
                  <h2 className='pb-2 mb-6 font-mono text-xl font-bold text-green-400 border-b border-gray-600'>
                    {'>'} EDUCATION
                  </h2>
                  <div className='space-y-6'>
                    {data.sections.education.items.map(
                      (edu: any, index: number) => (
                        <div
                          key={index}
                          className='p-4 bg-gray-800 border border-gray-600 rounded'
                        >
                          <div className='flex items-start justify-between mb-2'>
                            <h3 className='font-mono text-lg font-bold text-white'>
                              {edu.degree}
                            </h3>
                            <span className='font-mono text-sm text-green-400'>
                              {edu.startDate} - {edu.endDate || 'PRESENT'}
                            </span>
                          </div>
                          <p className='mb-2 font-mono text-green-300'>
                            {edu.institution}
                          </p>
                          {edu.summary && (
                            <p className='font-mono text-sm leading-relaxed text-gray-300'>
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
                  <h2 className='pb-2 mb-6 font-mono text-xl font-bold text-green-400 border-b border-gray-600'>
                    {'>'} SKILLS
                  </h2>
                  <div className='p-4 bg-gray-800 border border-gray-600 rounded'>
                    <div className='grid grid-cols-1 gap-3'>
                      {data.sections.skills.items.map(
                        (skill: any, index: number) => (
                          <div
                            key={index}
                            className='flex items-center justify-between'
                          >
                            <span className='font-mono text-white'>
                              {skill.name}
                            </span>
                            <div className='flex space-x-1'>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <span
                                  key={level}
                                  className={`w-2 h-2 rounded-full ${
                                    level <=
                                    (skill.level === 'beginner'
                                      ? 2
                                      : skill.level === 'intermediate'
                                      ? 3
                                      : skill.level === 'advanced'
                                      ? 4
                                      : 5)
                                      ? 'bg-green-400'
                                      : 'bg-gray-600'
                                  }`}
                                />
                              ))}
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
                  <h2 className='pb-2 mb-6 font-mono text-xl font-bold text-green-400 border-b border-gray-600'>
                    {'>'} LANGUAGES
                  </h2>
                  <div className='p-4 bg-gray-800 border border-gray-600 rounded'>
                    <div className='space-y-3'>
                      {data.sections.languages.items.map(
                        (lang: any, index: number) => (
                          <div
                            key={index}
                            className='flex items-center justify-between'
                          >
                            <span className='font-mono text-white'>
                              {lang.language}
                            </span>
                            <span className='font-mono text-green-400'>
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
                  <h2 className='pb-2 mb-6 font-mono text-xl font-bold text-green-400 border-b border-gray-600'>
                    {'>'} CERTIFICATIONS
                  </h2>
                  <div className='space-y-4'>
                    {data.sections.certifications.items.map(
                      (cert: any, index: number) => (
                        <div
                          key={index}
                          className='p-3 bg-gray-800 border border-gray-600 rounded'
                        >
                          <h3 className='font-mono font-medium text-white'>
                            {cert.name}
                          </h3>
                          <p className='font-mono text-sm text-green-300'>
                            {cert.issuer}
                          </p>
                          {cert.date && (
                            <p className='font-mono text-xs text-gray-400'>
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
