/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  Code,
  Heart,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Shield,
  Star,
  Trophy,
} from 'lucide-react';
import React from 'react';

import { CV } from '@/stores/cv-store-unified';

interface DossierTemplateProps {
  cv: CV;
}

// Helper pour formater le niveau de séniorité
const formatSeniority = (level?: string): string => {
  const map: Record<string, string> = {
    junior: 'Junior',
    confirme: 'Confirmé',
    senior: 'Senior',
    expert: 'Expert',
    architect: 'Architecte',
  };
  return level ? map[level] || level : '';
};

// Helper pour formater le type de contrat
const formatContract = (type?: string): string => {
  const map: Record<string, string> = {
    cdi: 'CDI',
    freelance: 'Freelance',
    portage: 'Portage',
    cdd: 'CDD',
  };
  return type ? map[type] || type : '';
};

// Helper pour formater la politique remote
const formatRemote = (policy?: string): string => {
  const map: Record<string, string> = {
    onsite: 'Sur site',
    hybrid: 'Hybride',
    'full-remote': 'Full Remote',
  };
  return policy ? map[policy] || policy : '';
};

export const DossierTemplate: React.FC<DossierTemplateProps> = ({ cv }) => {
  const basics = cv.data?.basics || {};
  const sections = cv.data?.sections || {};
  const { company } = cv;
  const defaultTheme = {
    primary: '#2563eb',
    text: '#1f2937',
    background: '#ffffff',
  };
  const defaultTypography = {
    font: { family: 'Inter', url: '' },
    size: { body: 10, heading: 24 },
  };

  const theme = cv.metadata.theme || defaultTheme;
  const typography = cv.metadata.typography || defaultTypography;
  const companyColor = company?.color || theme.primary;

  // Helper pour les icônes
  const IconWrapper = ({ children }: { children: React.ReactNode }) => (
    <span style={{ color: theme.primary }} className='inline-flex mr-2'>
      {children}
    </span>
  );

  return (
    <div
      className='bg-white min-h-[29.7cm] shadow-lg mx-auto relative'
      style={{
        width: '21cm',
        padding: '1.5cm 2cm',
        color: theme.text,
        fontFamily: typography.font.family,
        fontSize: '10pt',
      }}
    >
      {/* EN-TÊTE ENTREPRISE (ESN) */}
      {company?.showInHeader && company?.name && (
        <div
          className='mb-6 -mt-2 -mx-4 px-4 py-3 flex items-center justify-between'
          style={{
            borderBottom: `3px solid ${companyColor}`,
            backgroundColor: companyColor + '08',
          }}
        >
          <div className='flex items-center gap-4'>
            {company.logo && (
              <img
                src={company.logo}
                alt={company.name}
                className='h-12 w-auto object-contain'
                style={{ maxWidth: '120px' }}
              />
            )}
            <div>
              <h1
                className='text-lg font-bold tracking-tight'
                style={{ color: companyColor }}
              >
                {company.name}
              </h1>
              {company.tagline && (
                <p className='text-[9pt] text-gray-500 italic'>
                  {company.tagline}
                </p>
              )}
            </div>
          </div>
          <div className='text-right text-[8pt] text-gray-500 space-y-0.5'>
            {company.website && (
              <div>{company.website.replace(/^https?:\/\//, '')}</div>
            )}
            {company.email && <div>{company.email}</div>}
            {company.phone && <div>{company.phone}</div>}
          </div>
        </div>
      )}

      {/* TITRE DOSSIER DE COMPÉTENCES */}
      <div className='text-center mb-4'>
        <h2 className='text-xs font-bold uppercase tracking-[0.3em] text-gray-400'>
          Dossier de Compétences
        </h2>
      </div>

      {/* HEADER CANDIDAT */}
      <header
        className='border-b-2 pb-5 mb-6'
        style={{ borderColor: theme.primary }}
      >
        <div className='flex justify-between items-start gap-6'>
          <div className='flex-1'>
            <h1
              className='text-3xl font-bold uppercase tracking-tight mb-1'
              style={{ color: theme.primary }}
            >
              {basics.firstName} {basics.lastName}
            </h1>
            <h2 className='text-xl font-medium text-gray-700 mb-3'>
              {basics.title || 'Consultant'}
              {basics.seniorityLevel && (
                <span
                  className='ml-2 text-sm font-normal px-2 py-0.5 rounded'
                  style={{
                    backgroundColor: theme.primary + '15',
                    color: theme.primary,
                  }}
                >
                  {formatSeniority(basics.seniorityLevel)}
                </span>
              )}
            </h2>

            {/* Résumé Exécutif */}
            {basics.summary && (
              <p
                className='text-gray-600 text-[9pt] leading-relaxed max-w-xl italic border-l-3 pl-3 py-1'
                style={{ borderColor: theme.primary + '40' }}
              >
                {basics.summary}
              </p>
            )}
          </div>

          {/* Info Box - B2B Focus Enhanced */}
          <div className='text-[9pt] space-y-1.5 text-gray-600 bg-gray-50 p-3 rounded-lg min-w-[220px]'>
            {basics.yearsOfExperience && (
              <div className='flex items-center font-semibold'>
                <span className='w-20 text-gray-500'>Expérience:</span>
                <span className='text-gray-900'>
                  {basics.yearsOfExperience}
                </span>
              </div>
            )}
            {basics.availability && (
              <div className='flex items-center'>
                <span className='w-20 text-gray-500'>Dispo:</span>
                <span className='text-green-600 font-semibold'>
                  {basics.availability}
                </span>
              </div>
            )}
            {basics.contractType && (
              <div className='flex items-center'>
                <span className='w-20 text-gray-500'>Contrat:</span>
                <span>{formatContract(basics.contractType)}</span>
              </div>
            )}
            {basics.remotePolicy && (
              <div className='flex items-center'>
                <span className='w-20 text-gray-500'>Télétravail:</span>
                <span>{formatRemote(basics.remotePolicy)}</span>
              </div>
            )}
            {basics.mobility && (
              <div className='flex items-center'>
                <span className='w-20 text-gray-500'>Mobilité:</span>
                <span>{basics.mobility}</span>
              </div>
            )}
            {basics.tjm && (
              <div className='flex items-center font-medium'>
                <span className='w-20 text-gray-500'>TJM:</span>
                <span style={{ color: theme.primary }}>{basics.tjm}</span>
              </div>
            )}
            {basics.habilitations && (
              <div className='flex items-center'>
                <span className='w-20 text-gray-500'>Habilitation:</span>
                <span className='text-orange-600 font-medium'>
                  {basics.habilitations}
                </span>
              </div>
            )}
            {basics.nationality && (
              <div className='flex items-center'>
                <span className='w-20 text-gray-500'>Nationalité:</span>
                <span>{basics.nationality}</span>
              </div>
            )}
            <div className='h-px bg-gray-200 my-1.5'></div>
            {basics.email && (
              <div className='flex items-center truncate text-[8pt]'>
                <IconWrapper>
                  <Mail size={12} />
                </IconWrapper>
                {basics.email}
              </div>
            )}
            {basics.phone && (
              <div className='flex items-center text-[8pt]'>
                <IconWrapper>
                  <Phone size={12} />
                </IconWrapper>
                {basics.phone}
              </div>
            )}
            {basics.location && (
              <div className='flex items-center text-[8pt]'>
                <IconWrapper>
                  <MapPin size={12} />
                </IconWrapper>
                {typeof basics.location === 'object'
                  ? (basics.location as any).address ||
                    (basics.location as any).city ||
                    'Localisation'
                  : basics.location}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MATRICE DE COMPÉTENCES (Technology Section) - Au dessus pour l'impact */}
      {sections.technology?.visible && sections.technology.items.length > 0 && (
        <section className='mb-6'>
          <h3
            className='text-base font-bold uppercase border-b mb-3 pb-1 flex items-center'
            style={{ color: theme.primary, borderColor: '#eee' }}
          >
            <Code size={16} className='mr-2' />
            Compétences Techniques
          </h3>
          <div className='grid grid-cols-2 gap-x-6 gap-y-3'>
            {sections.technology.items.map((group: any) => (
              <div key={group.id} className='break-inside-avoid'>
                <h4 className='font-bold text-xs text-gray-700 mb-1 uppercase tracking-wide'>
                  {group.title}
                </h4>
                <div className='flex flex-wrap gap-1'>
                  {group.tags?.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className='px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[9pt] rounded border border-gray-200'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CERTIFICATIONS - Crucial en B2B */}
      {sections.certifications?.visible &&
        sections.certifications.items.length > 0 && (
          <section className='mb-6'>
            <h3
              className='text-base font-bold uppercase border-b mb-3 pb-1 flex items-center'
              style={{ color: theme.primary, borderColor: '#eee' }}
            >
              <Shield size={16} className='mr-2' />
              Certifications
            </h3>
            <div className='flex flex-wrap gap-2'>
              {sections.certifications.items.map((cert: any) => (
                <div
                  key={cert.id}
                  className='flex items-center gap-1.5 bg-green-50 px-2 py-1.5 rounded-md border border-green-100 text-green-800 text-xs'
                >
                  <div className='w-1.5 h-1.5 rounded-full bg-green-500'></div>
                  <span className='font-semibold'>{cert.name}</span>
                  {cert.issuer && (
                    <span className='text-green-600 opacity-75'>
                      - {cert.issuer}
                    </span>
                  )}
                  {cert.date && (
                    <span className='text-[8pt] text-green-400'>
                      ({cert.date})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      {/* EXPÉRIENCES / MISSIONS - Le coeur du dossier */}
      {sections.experience?.visible && sections.experience.items.length > 0 && (
        <section className='mb-6'>
          <h3
            className='text-base font-bold uppercase border-b mb-4 pb-1 flex items-center'
            style={{ color: theme.primary, borderColor: '#eee' }}
          >
            <Briefcase size={16} className='mr-2' />
            Parcours Professionnel
          </h3>
          <div className='space-y-5'>
            {sections.experience.items.map((mission: any) => (
              <div
                key={mission.id}
                className='relative pl-3 border-l-2'
                style={{ borderColor: '#e5e7eb' }}
              >
                <div
                  className='absolute -left-[7px] top-0 w-3 h-3 rounded-full border-2 bg-white'
                  style={{ borderColor: theme.primary }}
                ></div>

                {/* Header Mission */}
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <h4 className='text-base font-bold text-gray-900'>
                      {mission.role}
                    </h4>
                    <div
                      className='flex items-center gap-1.5 text-sm font-medium'
                      style={{ color: theme.primary }}
                    >
                      <Building size={14} />
                      {mission.client}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1'>
                      <Calendar size={12} />
                      {mission.startDate} - {mission.endDate || 'Présent'}
                    </div>
                    {mission.location && (
                      <div className='text-[8pt] text-gray-500 mt-0.5 flex items-center justify-end gap-0.5'>
                        <MapPin size={10} /> {mission.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Environnement Technique - Highlight */}
                {mission.environment && (
                  <div className='mb-2 p-2 bg-purple-50 rounded border border-purple-100 flex items-start gap-2'>
                    <Code
                      className='text-purple-600 mt-0.5 flex-shrink-0'
                      size={14}
                    />
                    <div>
                      <span className='text-[8pt] font-bold uppercase text-purple-500 tracking-wider'>
                        Stack Technique
                      </span>
                      <p className='text-xs font-medium text-purple-800 font-mono leading-tight'>
                        {mission.environment}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description & Tâches */}
                <div className='text-xs text-gray-700 space-y-1'>
                  {mission.description && (
                    <p className='whitespace-pre-wrap leading-relaxed'>
                      {mission.description}
                    </p>
                  )}

                  {mission.tasks && mission.tasks.length > 0 && (
                    <ul className='list-disc list-inside space-y-0.5 mt-1 marker:text-gray-400'>
                      {mission.tasks.map((task: string, idx: number) => (
                        <li key={idx} className='pl-0.5'>
                          {task}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FORMATION */}
      {sections.education?.visible && sections.education.items.length > 0 && (
        <section className='mb-6 break-inside-avoid'>
          <h3
            className='text-base font-bold uppercase border-b mb-3 pb-1 flex items-center'
            style={{ color: theme.primary, borderColor: '#eee' }}
          >
            Formation Académique
          </h3>
          <div className='space-y-2'>
            {sections.education.items.map((edu: any) => (
              <div key={edu.id} className='flex justify-between items-center'>
                <div>
                  <h4 className='font-bold text-gray-900 text-sm'>
                    {edu.degree}
                    {edu.field && (
                      <span className='font-normal text-gray-600'>
                        {' '}
                        - {edu.field}
                      </span>
                    )}
                  </h4>
                  <div className='text-xs text-gray-600'>{edu.institution}</div>
                </div>
                <div className='text-xs font-medium text-gray-500 text-right'>
                  <div>{edu.endDate || edu.startDate}</div>
                  {edu.location && (
                    <div className='text-[8pt] font-normal'>{edu.location}</div>
                  )}
                  {edu.grade && (
                    <div className='text-purple-600 font-medium'>
                      {edu.grade}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LANGUES */}
      {sections.languages?.visible && sections.languages.items.length > 0 && (
        <section className='mb-6 break-inside-avoid'>
          <h3
            className='text-base font-bold uppercase border-b mb-3 pb-1 flex items-center'
            style={{ color: theme.primary, borderColor: '#eee' }}
          >
            Langues
          </h3>
          <div className='flex flex-wrap gap-6'>
            {sections.languages.items.map((lang: any) => (
              <div key={lang.id} className='flex items-center gap-2'>
                <span className='font-bold text-gray-900'>{lang.language}</span>
                <span className='text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded'>
                  {lang.fluency === 'native'
                    ? 'Langue maternelle'
                    : lang.fluency === 'professional'
                    ? 'Courant'
                    : lang.fluency === 'limited'
                    ? 'Intermédiaire'
                    : 'Débutant'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SOFT SKILLS / TALENTS */}
      {sections.talent?.visible && sections.talent.items.length > 0 && (
        <section className='mb-6 break-inside-avoid'>
          <h3
            className='text-base font-bold uppercase border-b mb-3 pb-1 flex items-center'
            style={{ color: theme.primary, borderColor: '#eee' }}
          >
            <Star size={16} className='mr-2' />
            Soft Skills
          </h3>
          <div className='flex flex-wrap gap-2'>
            {sections.talent.items.map((skill: any) => (
              <div
                key={skill.id}
                className='px-3 py-1.5 rounded-full text-xs font-medium border'
                style={{
                  borderColor: theme.primary + '40',
                  color: theme.primary,
                  backgroundColor: theme.primary + '08',
                }}
              >
                {skill.title}
                {skill.description && (
                  <span className='text-gray-500 ml-1 font-normal'>
                    - {skill.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RÉALISATIONS / ACHIEVEMENTS */}
      {sections.achievement?.visible &&
        sections.achievement.items.length > 0 && (
          <section className='mb-6 break-inside-avoid'>
            <h3
              className='text-base font-bold uppercase border-b mb-3 pb-1 flex items-center'
              style={{ color: theme.primary, borderColor: '#eee' }}
            >
              <Trophy size={16} className='mr-2' />
              Réalisations Clés
            </h3>
            <div className='space-y-2'>
              {sections.achievement.items.map((achievement: any) => (
                <div key={achievement.id} className='flex items-start gap-2'>
                  <div
                    className='w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0'
                    style={{ backgroundColor: theme.primary }}
                  ></div>
                  <div>
                    <span className='font-semibold text-gray-900'>
                      {achievement.title}
                    </span>
                    {achievement.description && (
                      <span className='text-gray-600 ml-1'>
                        - {achievement.description}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* PROJETS PERSONNELS */}
      {sections.projects?.visible && sections.projects.items.length > 0 && (
        <section className='mb-6 break-inside-avoid'>
          <h3
            className='text-base font-bold uppercase border-b mb-3 pb-1 flex items-center'
            style={{ color: theme.primary, borderColor: '#eee' }}
          >
            <Rocket size={16} className='mr-2' />
            Projets Personnels
          </h3>
          <div className='space-y-3'>
            {sections.projects.items.map((project: any) => (
              <div
                key={project.id}
                className='border-l-2 pl-3'
                style={{ borderColor: '#e5e7eb' }}
              >
                <div className='flex items-center justify-between'>
                  <h4 className='font-bold text-gray-900'>{project.name}</h4>
                  {(project.startDate || project.endDate) && (
                    <span className='text-xs text-gray-500'>
                      {project.startDate}{' '}
                      {project.endDate && `- ${project.endDate}`}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className='text-sm text-gray-600 mt-1'>
                    {project.description}
                  </p>
                )}
                {project.bullets && project.bullets.length > 0 && (
                  <ul className='list-disc list-inside text-xs text-gray-600 mt-1 space-y-0.5'>
                    {project.bullets.map((bullet: string, idx: number) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FORMATIONS & COURS */}
      {sections.courses?.visible && sections.courses.items.length > 0 && (
        <section className='mb-6 break-inside-avoid'>
          <h3
            className='text-base font-bold uppercase border-b mb-3 pb-1 flex items-center'
            style={{ color: theme.primary, borderColor: '#eee' }}
          >
            <BookOpen size={16} className='mr-2' />
            Formations Complémentaires
          </h3>
          <div className='flex flex-wrap gap-2'>
            {sections.courses.items.map((course: any) => (
              <div
                key={course.id}
                className='px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs'
              >
                <span className='font-medium text-gray-800'>
                  {course.title}
                </span>
                {course.description && (
                  <span className='text-gray-500 ml-1'>
                    ({course.description})
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CENTRES D'INTÉRÊT / PASSIONS */}
      {((sections.interests?.visible && sections.interests.items.length > 0) ||
        (sections.passion?.visible && sections.passion.items.length > 0)) && (
        <section className='mb-6 break-inside-avoid'>
          <h3
            className='text-base font-bold uppercase border-b mb-3 pb-1 flex items-center'
            style={{ color: theme.primary, borderColor: '#eee' }}
          >
            <Heart size={16} className='mr-2' />
            Centres d'Intérêt
          </h3>
          <div className='flex flex-wrap gap-3 text-sm text-gray-700'>
            {sections.interests?.items.map((interest: any) => (
              <span key={interest.id}>{interest.name || interest.title}</span>
            ))}
            {sections.passion?.items.map((passion: any) => (
              <span key={passion.id}>{passion.title}</span>
            ))}
          </div>
        </section>
      )}

      {/* Footer - Branding */}
      <footer
        className='mt-auto pt-4 border-t text-[8pt] text-gray-400'
        style={{
          borderColor: company?.showInFooter ? companyColor + '30' : '#f3f4f6',
        }}
      >
        {company?.showInFooter && company?.name ? (
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {company.logo && (
                <img
                  src={company.logo}
                  alt={company.name}
                  className='h-6 w-auto object-contain opacity-70'
                />
              )}
              <span style={{ color: companyColor }}>{company.name}</span>
            </div>
            <div className='flex items-center gap-4'>
              {company.website && (
                <span>{company.website.replace(/^https?:\/\//, '')}</span>
              )}
              {company.phone && <span>{company.phone}</span>}
            </div>
          </div>
        ) : (
          <div className='text-center'>
            Dossier de Compétences généré le{' '}
            {new Date().toLocaleDateString('fr-FR')}
          </div>
        )}
      </footer>
    </div>
  );
};
