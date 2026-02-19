import { Shield, Users, Zap } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Optimisation instantanée',
      description:
        'Transformez votre CV existant en version optimisée en quelques minutes grâce à notre IA avancée.',
      icon: Zap,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Compatible ATS',
      description:
        'Votre CV optimisé passera facilement les filtres des systèmes de recrutement automatisés.',
      icon: Shield,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: "Personnalisé par l'IA",
      description:
        "L'IA analyse l'offre d'emploi et adapte automatiquement votre CV pour maximiser vos chances.",
      icon: Users,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <section className='px-6 py-16'>
      <div className='max-w-6xl mx-auto '>
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold text-gray-900 md:text-4xl'>
            Pourquoi choisir notre optimiseur de CV ?
          </h2>
          <p className='max-w-2xl mx-auto text-xl text-gray-600'>
            Ne partez plus de zéro. Améliorez votre CV existant avec
            l'intelligence artificielle pour décrocher plus d'entretiens.
          </p>
        </div>
        <div className='grid gap-8 md:grid-cols-3'>
          {features.map((feature, index) => (
            <Card key={index} className='p-6 text-center'>
              <CardHeader>
                <div
                  className={`flex items-center justify-center w-16 h-16 mx-auto mb-4 ${feature.iconBgColor} rounded-full`}
                >
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
