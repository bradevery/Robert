import {
  BarChart3,
  Calendar,
  Download,
  Edit3,
  Eye,
  FileText,
  Plus,
  Settings,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function DashboardPage() {
  const recentCVs = [
    {
      id: 1,
      title: 'CV Développeur Full Stack',
      template: 'Modern Professional',
      lastModified: 'Il y a 2 heures',
      status: 'Optimisé',
      atsScore: 87,
      applications: 3,
    },
    {
      id: 2,
      title: 'CV Marketing Digital',
      template: 'Creative Design',
      lastModified: 'Hier',
      status: 'En révision',
      atsScore: 72,
      applications: 1,
    },
    {
      id: 3,
      title: 'CV Ingénieur Commercial',
      template: 'Professional Clean',
      lastModified: 'Il y a 3 jours',
      status: 'Optimisé',
      atsScore: 93,
      applications: 5,
    },
  ];

  const applicationStats = {
    totalApplied: 12,
    interviews: 3,
    responses: 8,
    avgAtsScore: 84,
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'>
      {/* Header */}
      <header className='sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm'>
        <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-8'>
              <Link href='/' className='flex items-center space-x-2'>
                <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600'>
                  <span className='text-sm font-bold text-white'>CV</span>
                </div>
                <span className='text-lg font-bold text-gray-900'>
                  CVOptimizer AI
                </span>
              </Link>

              <nav className='hidden space-x-6 md:flex'>
                <Link href='/dashboard' className='font-medium text-blue-600'>
                  Tableau de bord
                </Link>
                <Link
                  href='/builder'
                  className='text-gray-600 hover:text-gray-900'
                >
                  Créer un CV
                </Link>
                <Link
                  href='/templates'
                  className='text-gray-600 hover:text-gray-900'
                >
                  Templates
                </Link>
                <Link
                  href='/analytics'
                  className='text-gray-600 hover:text-gray-900'
                >
                  Analytics
                </Link>
              </nav>
            </div>

            <div className='flex items-center space-x-3'>
              <Button variant='ghost' size='sm'>
                <Settings className='w-4 h-4' />
              </Button>
              <Button className='bg-gradient-to-r from-blue-600 to-purple-600'>
                <Plus className='w-4 h-4 mr-2' />
                Nouveau CV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>
            Bonjour Ibrahim 👋
          </h1>
          <p className='text-gray-600'>
            Optimisez vos candidatures avec l'IA et suivez vos progrès
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-6 mb-8 md:grid-cols-4'>
          <Card className='transition-shadow border-0 shadow-md hover:shadow-lg'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Candidatures
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {applicationStats.totalApplied}
                  </p>
                </div>
                <div className='flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full'>
                  <FileText className='w-6 h-6 text-blue-600' />
                </div>
              </div>
              <div className='flex items-center mt-2'>
                <TrendingUp className='w-4 h-4 mr-1 text-green-500' />
                <span className='text-sm text-green-600'>+3 cette semaine</span>
              </div>
            </CardContent>
          </Card>

          <Card className='transition-shadow border-0 shadow-md hover:shadow-lg'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Entretiens
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {applicationStats.interviews}
                  </p>
                </div>
                <div className='flex items-center justify-center w-12 h-12 bg-green-100 rounded-full'>
                  <Calendar className='w-6 h-6 text-green-600' />
                </div>
              </div>
              <div className='flex items-center mt-2'>
                <span className='text-sm text-gray-600'>
                  25% taux de conversion
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className='transition-shadow border-0 shadow-md hover:shadow-lg'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Réponses</p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {applicationStats.responses}
                  </p>
                </div>
                <div className='flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full'>
                  <Target className='w-6 h-6 text-purple-600' />
                </div>
              </div>
              <div className='flex items-center mt-2'>
                <span className='text-sm text-gray-600'>
                  67% taux de réponse
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className='transition-shadow border-0 shadow-md hover:shadow-lg'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Score ATS Moyen
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {applicationStats.avgAtsScore}%
                  </p>
                </div>
                <div className='flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full'>
                  <BarChart3 className='w-6 h-6 text-yellow-600' />
                </div>
              </div>
              <div className='flex items-center mt-2'>
                <span className='text-sm text-green-600'>Excellent score</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Recent CVs */}
          <div className='lg:col-span-2'>
            <Card className='border-0 shadow-lg'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-xl'>Mes CV Récents</CardTitle>
                    <CardDescription>
                      Gérez et optimisez vos CV avec l'IA
                    </CardDescription>
                  </div>
                  <Button className='bg-gradient-to-r from-blue-600 to-purple-600'>
                    <Plus className='w-4 h-4 mr-2' />
                    Nouveau CV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {recentCVs.map((cv) => (
                    <div
                      key={cv.id}
                      className='flex items-center justify-between p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center justify-center w-12 h-16 bg-white border rounded shadow-sm'>
                          <FileText className='w-6 h-6 text-gray-400' />
                        </div>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            {cv.title}
                          </h3>
                          <p className='text-sm text-gray-600'>{cv.template}</p>
                          <p className='text-xs text-gray-500'>
                            {cv.lastModified}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center space-x-4'>
                        <div className='text-center'>
                          <Badge
                            variant={
                              cv.status === 'Optimisé' ? 'default' : 'secondary'
                            }
                            className='mb-1'
                          >
                            {cv.status}
                          </Badge>
                          <p className='text-xs text-gray-600'>
                            Score ATS: {cv.atsScore}%
                          </p>
                        </div>

                        <div className='text-center'>
                          <p className='text-sm font-semibold text-gray-900'>
                            {cv.applications}
                          </p>
                          <p className='text-xs text-gray-600'>candidatures</p>
                        </div>

                        <div className='flex items-center space-x-2'>
                          <Button variant='ghost' size='sm'>
                            <Eye className='w-4 h-4' />
                          </Button>
                          <Button variant='ghost' size='sm'>
                            <Edit3 className='w-4 h-4' />
                          </Button>
                          <Button variant='ghost' size='sm'>
                            <Download className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className='space-y-6'>
            <Card className='border-0 shadow-lg'>
              <CardHeader>
                <CardTitle className='text-lg'>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Button
                  className='justify-start w-full bg-gradient-to-r from-blue-600 to-purple-600'
                  asChild
                >
                  <Link href='/builder'>
                    <Plus className='w-4 h-4 mr-2' />
                    Créer un nouveau CV
                  </Link>
                </Button>

                <Button
                  variant='outline'
                  className='justify-start w-full'
                  asChild
                >
                  <Link href='/optimizer'>
                    <Star className='w-4 h-4 mr-2' />
                    Optimiser un CV existant
                  </Link>
                </Button>

                <Button
                  variant='outline'
                  className='justify-start w-full'
                  asChild
                >
                  <Link href='/templates'>
                    <FileText className='w-4 h-4 mr-2' />
                    Parcourir les templates
                  </Link>
                </Button>

                <Button
                  variant='outline'
                  className='justify-start w-full'
                  asChild
                >
                  <Link href='/analytics'>
                    <BarChart3 className='w-4 h-4 mr-2' />
                    Voir mes statistiques
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className='border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50'>
              <CardHeader>
                <CardTitle className='text-lg'>💡 Conseil IA du jour</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-3 text-sm text-gray-700'>
                  Les CV avec des verbes d'action spécifiques ont 23% plus de
                  chances d'obtenir un entretien.
                </p>
                <Button size='sm' variant='outline'>
                  Optimiser mes CV
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
