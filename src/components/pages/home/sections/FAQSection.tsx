'use client';

import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  DollarSign,
  Lightbulb,
  Lock,
  MessageSquare,
  Puzzle,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

interface FaqItemProps {
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  icon: Icon,
}: FaqItemProps) {
  return (
    <div className='overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-xl hover:shadow-md'>
      <button
        className='flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-gray-50'
        onClick={onToggle}
      >
        <div className='flex items-center gap-3 pr-4'>
          <div className='items-center justify-center hidden w-8 h-8 bg-blue-100 rounded-lg md:flex'>
            <Icon className='w-4 h-4 text-blue-600 ' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900'>{question}</h3>
        </div>
        <div className='flex-shrink-0'>
          {isOpen ? (
            <ChevronUp className='w-5 h-5 text-blue-600' />
          ) : (
            <ChevronDown className='w-5 h-5 text-gray-400' />
          )}
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='px-6 pb-6'>
          <div className='pt-2 border-t border-gray-100'>
            <div className='mt-4 text-lg font-medium leading-relaxed text-gray-800'>
              {answer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Que fait CVmatchr exactement pour ma candidature ?',
      icon: Lightbulb,
      answer: (
        <div>
          <p className='mb-4'>
            CVmatchr est un assistant intelligent qui optimise votre CV pour
            chaque offre d'emploi. Notre IA analyse l'offre, identifie les
            attentes du recruteur et adapte votre CV pour maximiser vos chances.
          </p>
          <p>
            Vous gagnez un temps précieux et vous vous démarquez des autres
            candidats qui envoient des CV génériques.
          </p>
        </div>
      ),
    },
    {
      question:
        'Pourquoi dois-je personnaliser ou optimiser mon CV pour chaque emploi ?',
      icon: Target,
      answer: (
        <div>
          <p className='mb-4'>
            Les candidatures d'emploi sont extrêmement compétitives. Seulement{' '}
            <strong>3%</strong> des candidatures arrivent à l'étape d'entretien.
          </p>
          <p className='mb-4'>
            Les recruteurs passent <strong>quelques secondes</strong> par CV et
            privilégient les candidats qui correspondent étroitement aux
            exigences du poste.
          </p>
          <p>
            Résultat : Même avec les bonnes compétences, un CV générique
            affaiblit votre dossier en ne vous présentant pas sous votre
            meilleur jour.
          </p>
        </div>
      ),
    },
    {
      question: 'Qui devrait utiliser notre optimiseur de CV ?',
      icon: Users,
      answer: (
        <div>
          <p className='mb-4'>
            <strong>Toute personne cherchant un emploi !</strong>
          </p>
          <p className='mb-4'>
            Que vous soyez jeune diplômé, en reconversion professionnelle, ou
            professionnel expérimenté, notre <strong>IA s'adapte</strong> à
            votre profil.
          </p>
          <p>
            Elle optimise votre CV selon votre niveau d'expérience et le secteur
            visé, en mettant en valeur vos atouts spécifiques pour chaque
            candidature.
          </p>
        </div>
      ),
    },
    {
      question: "Comment notre outil peut-il m'aider ?",
      icon: Settings,
      answer: (
        <div>
          <p className='mb-4'>
            Notre outil vous aide de 3 façons principales :
          </p>
          <ul className='my-4 space-y-2 list-disc list-inside'>
            <li>
              <strong>Analyse intelligente</strong> : Identifie les exigences
              manquantes dans votre CV actuel
            </li>
            <li>
              <strong>Adaptation automatique</strong> : Priorise votre contenu
              le plus pertinent
            </li>
            <li>
              <strong>Résumé personnalisé</strong> : Génère un profil qui
              accroche le recruteur
            </li>
          </ul>
          <p>Résultat : Un CV parfaitement adapté pour chaque emploi !</p>
        </div>
      ),
    },
    {
      question: 'Vos CV sont-ils compatibles ATS (Applicant Tracking System) ?',
      icon: CheckCircle,
      answer: (
        <div>
          <p className='mb-4'>
            Oui, <strong>95% compatibles ATS</strong> et optimisés pour l'examen
            humain.
          </p>
          <p className='mb-4'>
            Notre objectif principal est d'impressionner le recruteur et le
            responsable des embauches qui décideront finalement du sort de votre
            candidature.
          </p>
          <p>
            Nous ne limitons pas notre valeur à simplement battre les systèmes{' '}
            <strong>ATS</strong> - nous visons l'excellence humaine.
          </p>
        </div>
      ),
    },
    {
      question:
        'En quoi êtes-vous différent des autres outils IA sur le marché ?',
      icon: Shield,
      answer: (
        <div>
          <p className='mb-4'>
            La plupart des outils <strong>IA</strong> créent des résultats
            génériques qui seront :
          </p>
          <ul className='my-4 space-y-2 list-disc list-inside'>
            <li>Facilement identifiés comme générés par IA (malhonnête)</li>
            <li>
              Très similaires aux autres candidats utilisant{' '}
              <strong>ChatGPT</strong>
            </li>
            <li>De qualité médiocre et impersonnels</li>
          </ul>
          <p>
            Notre différence : Des contrôles stricts pour ne jamais déformer
            votre historique de carrière tout en vous présentant sous votre
            meilleur jour.
          </p>
        </div>
      ),
    },
    {
      question: "Extension : Comment fonctionne l'extension navigateur ?",
      icon: Puzzle,
      answer: (
        <div>
          <p className='mb-4'>
            Notre extension navigateur vous permet de{' '}
            <strong>récupérer automatiquement</strong> les descriptions d'offres
            d'emploi depuis les sites de recrutement populaires (LinkedIn,
            Indeed, etc.).
          </p>
          <p className='mb-4'>
            En un clic, l'extension extrait le contenu de l'offre et l'envoie
            directement à CVmatchr pour optimiser votre CV. Plus besoin de
            copier-coller !
          </p>
          <p>Gain de temps énorme et processus de candidature simplifié.</p>
        </div>
      ),
    },
    {
      question:
        'Abonnement & Crédits : Comment fonctionne le système de crédits ?',
      icon: CreditCard,
      answer: (
        <div>
          <p className='mb-4'>
            C'est simple : <strong>1 crédit = 1 optimisation</strong>. La
            génération d'un CV optimisé pour une offre coûte 1 crédit.
          </p>
          <p>
            Si vous avez un abonnement, vous pouvez optimiser des CV de manière
            illimitée pendant toute la période de votre abonnement.
          </p>
        </div>
      ),
    },
    {
      question:
        "Résultats : À quel point une candidature optimisée améliore mes chances d'entretien ?",
      icon: TrendingUp,
      answer: (
        <div>
          <p className='mb-4'>
            Nos données montrent une <strong>augmentation significative</strong>{' '}
            du taux de réponses positives. En adaptant précisément votre CV à
            l'offre, vous passez les filtres automatiques (ATS) et captez
            l'attention des recruteurs.
          </p>
          <p>
            Vous démontrez un intérêt réel pour le poste, ce qui vous
            différencie de la majorité des candidats.
          </p>
        </div>
      ),
    },
    {
      question: 'Authenticité : Mon CV paraîtra-t-il artificiel ?',
      icon: CheckCircle,
      answer: (
        <div>
          <p className='mb-4'>
            Non. CVmatchr préserve l'authenticité de votre parcours. L'IA ne
            fait que reformuler et restructurer vos informations existantes avec
            un langage professionnel et percutant.
          </p>
          <p>
            Vous gardez toujours le contrôle total pour modifier et valider le
            résultat final. Le recruteur verra simplement une candidature
            professionnelle et très bien préparée.
          </p>
        </div>
      ),
    },
    {
      question:
        'Que faites-vous avec mes données de carrière et personnelles ?',
      icon: Lock,
      answer: (
        <div>
          <p className='mb-4'>
            Nous prenons très au sérieux la <strong>confidentialité</strong> de
            vos informations.
          </p>
          <p className='mb-4'>
            Vos données sont uniquement utilisées pour vous aider dans votre
            carrière et <strong>jamais partagées</strong> avec quiconque.
          </p>
          <p>
            Vous pouvez supprimer en toute sécurité toutes vos informations de
            nos systèmes à tout moment.
          </p>
        </div>
      ),
    },
    {
      question: 'Mes données sont-elles sécurisées ?',
      icon: Shield,
      answer: (
        <div>
          <p className='mb-4'>
            Absolument sécurisées ! Protection de niveau bancaire.
          </p>
          <ul className='my-4 space-y-2 list-disc list-inside'>
            <li>
              <strong>Chiffrement SSL 256-bit</strong> pour protéger vos données
            </li>
            <li>Aucun stockage permanent : votre CV n'est jamais conservé</li>
            <li>
              <strong>Conformité RGPD</strong> strictement respectée
            </li>
          </ul>
          <p>
            Vos informations personnelles restent{' '}
            <strong>100% confidentielles</strong>.
          </p>
        </div>
      ),
    },
    {
      question: "Combien coûte l'optimisation de CV ?",
      icon: DollarSign,
      answer: (
        <div>
          <p className='mb-4'>
            Service de base <strong>GRATUIT !</strong> Optimisez votre CV sans
            frais cachés.
          </p>
          <p className='mb-4'>
            Fonctionnalités avancées disponibles à partir de{' '}
            <strong>9€/mois</strong> :
          </p>
          <ul className='my-4 space-y-2 list-disc list-inside'>
            <li>Optimisation multiple pour plusieurs offres</li>
            <li>Templates premium professionnels</li>
            <li>Support prioritaire</li>
          </ul>
          <p>Aucun engagement - résiliez quand vous voulez !</p>
        </div>
      ),
    },
    {
      question:
        'Puis-je soumettre des idées et des demandes de fonctionnalités ?',
      icon: MessageSquare,
      answer: (
        <div>
          <p className='mb-4'>Absolument ! Votre feedback est précieux.</p>
          <p className='mb-4'>
            Écrivez-nous à <strong>support@cvmatchr.com</strong> - nous
            garantissons une réponse rapide et une écoute attentive.
          </p>
          <p>
            Vos suggestions nous aident à améliorer continuellement notre
            service pour mieux répondre à vos besoins.
          </p>
        </div>
      ),
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className='px-6 py-12 lg:py-20 bg-gradient-to-r from-gray-50 to-blue-50'>
      <div className='max-w-4xl mx-auto '>
        <div className='mb-8 text-center lg:mb-16'>
          <h2 className='mb-4 text-3xl font-bold text-gray-900 md:text-4xl'>
            Questions fréquentes
          </h2>
          <p className='max-w-2xl mx-auto text-xl text-gray-600'>
            Toutes les réponses à vos questions sur l'optimisation de CV par IA
          </p>
        </div>

        <div className='space-y-4'>
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
              icon={faq.icon}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className='mt-12 text-center'>
          <div className='p-6 bg-white border border-blue-200 shadow-sm rounded-xl'>
            <h3 className='mb-2 text-lg font-semibold text-gray-900'>
              Vous avez d'autres questions ?
            </h3>
            <p className='mb-4 text-gray-600'>
              Notre équipe support est là pour vous aider
            </p>
            <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
              <Link
                href='mailto:support@cvmatchr.com'
                className='inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-blue-600 transition-colors border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100'
              >
                support@cvmatchr.com
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
