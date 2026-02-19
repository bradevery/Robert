import { Quote, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'Lachezar T.',
      role: 'Chef de Projet',
      company: 'Digital Solutions',
      image: '/images/people/2.jpg',
      rating: 5,
      text: "Après avoir testé pas mal d'outils gratuit, je trouve que celui la est le meilleur pour adapter son cv à chaque offre.",
      result: 'CV personnalisé par offre',
      beforeAfter: { before: 'CV unique', after: 'CV adapté' },
    },
    {
      id: 2,
      name: 'Romy T.',
      role: 'Consultante RH',
      company: 'PeopleFirst',
      image: '/images/people/4.jpg',
      rating: 5,
      text: 'Super pratique pour adapter mon CV rapidement. Ça me fait gagner un temps fou',
      result: 'Gain de temps énorme',
      beforeAfter: { before: '2h par candidature', after: '10 min chrono' },
    },
    {
      id: 3,
      name: 'Thomas B.',
      role: 'Développeur',
      company: 'StartupLab',
      image: '/images/people/6.jpeg',
      rating: 5,
      text: "J'ai adoré l'extension, et mon CV rend super bien ! Le design des modéles est super jolie.",
      result: 'Plus de contacts recruteurs',
      beforeAfter: { before: 'CV basique', after: 'Look pro' },
    },
  ];

  const stats = [
    { value: '95%', label: 'Taux de réussite ATS' },
    { value: '3x', label: 'Plus de réponses en moyenne' },
    { value: '1600+', label: 'Candidats satisfaits' },
    { value: '4.9/5', label: 'Note utilisateurs' },
  ];

  return (
    <>
      <section className='px-6 py-12 lg:py-20 text-white bg-[#146fc6] cv-shadow-background'>
        <div className='max-w-6xl mx-auto '>
          <div className='grid grid-cols-1 gap-8 text-center sm:grid-cols-2 md:grid-cols-4'>
            {stats.map((stat, index) => (
              <div key={index} className='flex flex-col items-center'>
                <div className='mb-2 text-4xl font-bold md:text-5xl'>
                  {stat.value}
                </div>
                <p className='text-lg opacity-90'>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className='px-6 py-12 lg:py-20  bg-[#f8f8f8] cv-shadow-background'>
        <div className='max-w-6xl mx-auto'>
          {/* Stats Section */}

          {/* Testimonials */}
          <div className='relative mb-6 text-center lg:mb-12'>
            {/* Background image */}
            <div className='absolute inset-0 flex items-center justify-center opacity-10'>
              <div className='relative'>
                <div className='w-32 h-32 bg-gray-200 rounded-2xl'></div>
                <div className='absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'>
                  <svg
                    className='w-12 h-12 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className='relative z-10'>
              <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
                Ce que disent nos utilisateurs
              </h2>
              <p className='max-w-2xl mx-auto mb-20 text-xl opacity-90'>
                Découvrez comment CVmatchr a transformé leurs recherches
                d'emploi
              </p>
            </div>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className='relative p-6 text-gray-900 transition-transform duration-300 bg-white shadow-lg rounded-xl hover:scale-105'
              >
                {/* User Info - Top Center */}
                <div
                  className='flex flex-col items-center mb-6'
                  style={{
                    marginTop: '-60px',
                  }}
                >
                  <div className='relative w-16 h-16 mb-3'>
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className='object-cover rounded-full shadow-m'
                      style={{
                        boxShadow: 'rgb(203 203 203) 1px 2px 3px',
                      }}
                    />
                  </div>
                  <div className='text-center'>
                    <div className='mb-1 text-lg font-bold text-gray-900'>
                      {testimonial.name}
                    </div>
                    <div className='mb-1 text-sm text-gray-600'>
                      {testimonial.role}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {testimonial.company}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className='flex items-center justify-center gap-1 mb-4'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className='w-4 h-4 text-yellow-400 fill-yellow-400'
                    />
                  ))}
                </div>

                <div className='relative mb-6'>
                  <Quote className='absolute w-6 h-6 text-blue-200 -top-2 -left-2' />
                  <p className='px-4 italic leading-relaxed text-center text-gray-700'>
                    "{testimonial.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className='mt-12 text-center'>
            <Link
              href='#'
              className='inline-flex items-center gap-3 px-8 py-4 text-blue-800 transition-all duration-300 bg-white border border-blue-100 rounded-full shadow-lg hover:shadow-xl hover:scale-105 hover:border-blue-200'
            >
              <div className='flex gap-1 items-centxer'>
                <Star className='w-5 h-5 text-yellow-400 fill-yellow-400' />
              </div>
              <span className='text-lg font-bold'>
                Rejoignez plus de 1600 candidats satisfaits
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
