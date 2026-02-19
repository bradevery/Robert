'use client';

import {
  ArrowRight,
  CheckCheck,
  CheckCircle,
  Star,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import YoutubeModal from '@/components/ui/YoutubeModal';

export default function HeroSection() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section className='relative py-16 overflow-hidden hero-background hero-section-offset'>
      <div className='container mt-5 mt-lg-0 wrapper'>
        <div className='container px-4 mx-auto sm:px-6 lg:px-8'>
          <div className='grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24'>
            {/* Content */}
            <div className='text-center lg:text-left'>
              <h1 className='mb-4 font-black leading-tight md:mb-6 hero-title'>
                Un CV optimisé pour chaque offre
                <span className='block bg-gradient-to-r from-[#157fbe] to-[#1b5cc6] bg-clip-text text-transparent'>
                  en un clic avec l'IA
                </span>
              </h1>

              <p className='max-w-2xl mx-auto mb-6 text-sm leading-relaxed text-gray-600 md:mb-8 sm:text-base md:text-lg lg:text-xl lg:mx-0'>
                Chaque offre est unique, votre CV doit l'être aussi. Faites-le
                matcher en un clic.
              </p>

              <div className='flex flex-col items-center justify-center gap-4 mb-8 sm:flex-row lg:justify-start md:mb-12'>
                <Button
                  size='lg'
                  className='w-full text-sm font-bold sm:w-auto sm:text-base md:text-lg'
                  asChild
                  variant='default'
                >
                  <Link href='/#ameliorer-cv'>
                    <span className='hidden sm:inline'>Matcher mon CV</span>
                    <span className='sm:hidden'>Améliorer CV</span>{' '}
                    <ArrowRight className='w-4 h-4 ml-2 md:w-5 md:h-5' />
                  </Link>
                </Button>
                <Button
                  variant='outline'
                  size='lg'
                  className='w-full text-sm font-bold sm:w-auto sm:text-base md:text-lg'
                  onClick={() => setIsVideoModalOpen(true)}
                >
                  <span className='hidden sm:inline'>Voir la démo</span>
                  <span className='sm:hidden'>Démo</span>
                </Button>
              </div>

              {/* Browser availability */}
              <div className='mb-8'>
                <div className='flex flex-wrap items-center justify-center gap-4 text-center lg:justify-start'>
                  <p className='text-sm font-medium text-gray-600'>
                    Extention disponible sur :
                  </p>
                  <div className='flex items-center gap-3'>
                    <div
                      className='transition-all hover:scale-110'
                      title='Chrome'
                    >
                      <Image
                        src='/images/chrome.svg'
                        alt='Chrome'
                        width={24}
                        height={24}
                        className='object-contain'
                        unoptimized
                      />
                    </div>
                    <div
                      className='transition-all hover:scale-110'
                      title='Firefox'
                    >
                      <Image
                        src='/images/firefox.svg'
                        alt='Firefox'
                        width={24}
                        height={24}
                        className='object-contain'
                        unoptimized
                      />
                    </div>
                    <div
                      className='transition-all hover:scale-110'
                      title='Edge'
                    >
                      <Image
                        src='/images/edge.svg'
                        alt='Edge'
                        width={24}
                        height={24}
                        className='object-contain'
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* User Reviews */}
              <div className='space-y-4'>
                <div className='flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start sm:gap-6'>
                  <div className='flex items-center space-x-2'>
                    <div className='flex -space-x-2'>
                      <div
                        className='flex items-center justify-center w-8 h-8 text-sm font-semibold text-white border-2 border-white rounded-full'
                        style={{
                          backgroundImage: 'url("/images/people/2.jpg")',
                          backgroundSize: 'cover',
                        }}
                      />
                      <div className='flex items-center justify-center w-8 h-8 text-sm font-semibold text-white bg-green-500 border-2 border-white rounded-full'>
                        J
                      </div>
                      <div
                        className='flex items-center justify-center w-8 h-8 text-sm font-semibold text-white border-2 border-white rounded-full'
                        style={{
                          backgroundImage: 'url("/images/people/4.jpg")',
                          backgroundSize: 'cover',
                        }}
                      />
                      <div
                        className='flex items-center justify-center w-8 h-8 text-sm font-semibold text-white border-2 border-white rounded-full'
                        style={{
                          backgroundImage: 'url("/images/people/6.jpeg")',
                          backgroundSize: 'cover',
                        }}
                      />
                    </div>
                    <div className='flex items-center space-x-1'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className='w-4 h-4 text-yellow-400 fill-yellow-400'
                        />
                      ))}
                    </div>
                  </div>
                  <div className='text-xs text-gray-600 sm:text-sm'>
                    <span className='font-semibold'>4.9/5</span> sur{' '}
                    <span className='hidden sm:inline'>1600+ avis</span>
                    <span className='sm:hidden'>1600+</span>
                  </div>
                </div>

                <div className='max-w-xl mx-auto text-xs italic text-center text-gray-500 sm:text-sm lg:mx-0 lg:text-left'>
                  <span className='hidden sm:inline'>
                    "J'utilisais toujours le même CV et je n'avais aucun retour.
                    Après avoir testé cet outil, j'ai décroché un entretien en
                    une semaine. Franchement, pas mal !"
                  </span>
                  <span className='sm:hidden'>
                    "Outil parfait, entretien décroché en une semaine !"
                  </span>
                  <span className='block mt-1 font-medium text-gray-700'>
                    - Marie L., Ingénieur Simulation R&T
                  </span>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className='relative mt-8 lg:mt-8 flex items-center justify-center lg:justify-start min-h-[400px]'>
              <div className='max-w-lg mx-auto lg:max-w-none'>
                <div className='cv-flip-container'>
                  <div className='cv-flip-inner'>
                    <div className='cv-flip-front'>
                      <div className='relative'>
                        <Image
                          src='/images/cv1.png'
                          width={600}
                          height={600}
                          alt='CV Builder Interface - Before'
                          className='object-contain w-full h-auto'
                          priority
                          style={{
                            boxShadow:
                              '0 20px 40px rgba(0, 0, 0, 0.1), 0 10px 25px rgba(0, 0, 0, 0.08)',
                            borderRadius: '12px',
                          }}
                        />
                        <div className='badge-wrapper'>
                          <div className='flex items-center gap-2 cv-badge cv-badge-before'>
                            <XCircle className='w-4 h-4' />
                            Sans CVmatchr
                          </div>
                          <div className='cv-arrow-wrapper'>
                            <div className='cv-dotted-arrow'>
                              <svg
                                className='cv-arrow-line'
                                viewBox='0 0 100 60'
                                fill='none'
                              >
                                <path
                                  d='M10 10 Q 50 40 90 50'
                                  stroke='#ef4444'
                                  strokeWidth='2'
                                  strokeDasharray='5,3'
                                  fill='none'
                                />
                              </svg>
                              <div className='cv-arrow-head'></div>
                            </div>
                            <div className='cv-arrow-text'>CV générique</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='cv-flip-back'>
                      <div className='relative'>
                        <Image
                          src='/images/cv2.png'
                          width={600}
                          height={600}
                          alt='CV Builder Interface - After'
                          className='object-contain w-full h-auto'
                          priority
                          style={{
                            boxShadow:
                              '0 20px 40px rgba(0, 0, 0, 0.1), 0 10px 25px rgba(0, 0, 0, 0.08)',
                            borderRadius: '12px',
                          }}
                        />
                        <div className='badge-wrapper'>
                          <div className='flex items-center gap-2 cv-badge cv-badge-after'>
                            <CheckCircle className='w-4 h-4' />
                            Avec CVmatchr
                          </div>
                          <div className='flex items-center gap-2 cv-floating-badge cv-floating-badge-accepted'>
                            <CheckCheck />
                            ACCEPTÉ
                          </div>
                          <div className='cv-arrow-wrapper-after'>
                            <div className='cv-dotted-arrow'>
                              <svg
                                className='cv-arrow-line-after'
                                viewBox='0 0 100 60'
                                fill='none'
                              >
                                <path
                                  d='M10 10 Q 50 40 90 50'
                                  stroke='#10b981'
                                  strokeWidth='2'
                                  strokeDasharray='5,3'
                                  fill='none'
                                />
                              </svg>
                              <div className='cv-arrow-head-after'></div>
                            </div>
                            <div className='cv-arrow-text-after'>
                              CV adapté à l'offre
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Video Modal */}
      <YoutubeModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId='dQw4w9WgXcQ'
      />
    </section>
  );
}
