import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer className='px-6 py-12 text-white bg-gray-900'>
      <div className='container max-w-6xl mx-auto'>
        <div className='grid gap-8 md:grid-cols-4'>
          <div>
            <div className='flex items-center mb-4 space-x-2'>
              <div className='w-8 h-8 bg-gradient-to-r from-[#157fbe] to-[#1b5cc6] rounded-lg flex items-center justify-center'>
                <span className='font-bold text-white'>CV</span>
              </div>
              <span
                className='ml-0 text-xl font-bold text-white text-gray-900'
                style={{ marginLeft: '5px' }}
              >
                matchr
              </span>
            </div>
            <p className='mb-4 text-gray-400'>
              Faites matcher chaque candidature avec un CV unique et
              démarquez-vous des autres
            </p>
          </div>
          <div>
            <h3 className='mb-4 font-semibold'>Produit</h3>
            <ul className='space-y-2 text-gray-400'>
              <li>
                <Link href='/extension' className='transition hover:text-white'>
                  Télécharger l'extension
                </Link>
              </li>
              <li>
                <Link href='/login' className='transition hover:text-white'>
                  Améliorer ma candidature
                </Link>
              </li>
              <li>
                <Link href='/#features' className='transition hover:text-white'>
                  Fonctionnalités
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='mb-4 font-semibold'>Compte</h3>
            <ul className='space-y-2 text-gray-400'>
              <li>
                <Link href='/login' className='transition hover:text-white'>
                  Se connecter
                </Link>
              </li>
              <li>
                <Link href='/login' className='transition hover:text-white'>
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href='/help' className='transition hover:text-white'>
                  Centre d'aide
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='mb-4 font-semibold'>Légal</h3>
            <ul className='space-y-2 text-gray-400'>
              <li>
                <Link href='/privacy' className='transition hover:text-white'>
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href='/terms' className='transition hover:text-white'>
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link
                  href='mailto:support@cvmatchr.com'
                  className='transition hover:text-white'
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className='pt-8 mt-12 text-center text-gray-400 border-t border-gray-800'>
          <p>&copy; 2024 Créateur de CV. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
