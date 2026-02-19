'use client';

import {
  BarChart3,
  Calendar,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Share2,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SharingPanelProps {
  resumeId: string;
  resumeTitle: string;
  isPublic: boolean;
  slug?: string;
  onPublicToggle: (isPublic: boolean) => void;
  className?: string;
}

interface ViewStats {
  totalViews: number;
  uniqueViews: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  recentViews: Array<{
    id: string;
    viewedAt: string;
    ipAddress: string;
    userAgent: string;
  }>;
  dailyViews: Array<{
    date: string;
    count: number;
  }>;
}

export const SharingPanel: React.FC<SharingPanelProps> = ({
  resumeId,
  _resumeTitle,
  isPublic,
  slug,
  onPublicToggle,
  className = '',
}) => {
  const [stats, setStats] = useState<ViewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = slug
    ? `${window.location.origin}/public/resume/${slug}`
    : '';

  useEffect(() => {
    if (isPublic && resumeId) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPublic, resumeId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/views`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePublicToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}/public`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: checked }),
      });

      if (response.ok) {
        onPublicToggle(checked);
        if (checked) {
          // Recharger les stats après avoir rendu public
          setTimeout(fetchStats, 1000);
        }
      }
    } catch (error) {
      console.error('Error updating public status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (publicUrl) {
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const openPublicUrl = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
  };

  return (
    <div className={`sharing-panel ${className}`}>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Share2 className='w-5 h-5 text-blue-600' />
            Partage et Visibilité
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Toggle Public */}
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <Label htmlFor='public-toggle' className='text-base font-medium'>
                Rendre ce CV public
              </Label>
              <p className='text-sm text-gray-600'>
                Permet à d'autres personnes de voir votre CV via un lien
                partageable
              </p>
            </div>
            <Switch
              id='public-toggle'
              checked={isPublic}
              onCheckedChange={handlePublicToggle}
              disabled={isLoading}
            />
          </div>

          {/* URL de partage */}
          {isPublic && publicUrl && (
            <div className='space-y-3'>
              <Label>Lien de partage</Label>
              <div className='flex gap-2'>
                <Input value={publicUrl} readOnly className='flex-1' />
                <Button
                  variant='outline'
                  onClick={copyToClipboard}
                  disabled={!publicUrl}
                >
                  {copied ? (
                    <>
                      <Copy className='w-4 h-4 mr-2' />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className='w-4 h-4 mr-2' />
                      Copier
                    </>
                  )}
                </Button>
                <Button
                  variant='outline'
                  onClick={openPublicUrl}
                  disabled={!publicUrl}
                >
                  <ExternalLink className='w-4 h-4' />
                </Button>
              </div>
              <p className='text-xs text-gray-500'>
                Partagez ce lien pour permettre aux autres de voir votre CV
              </p>
            </div>
          )}

          {/* Statistiques de vues */}
          {isPublic && stats && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <BarChart3 className='w-5 h-5 text-green-600' />
                <h3 className='text-lg font-semibold'>Statistiques de vues</h3>
              </div>

              {/* Métriques principales */}
              <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                <div className='p-4 text-center rounded-lg bg-blue-50'>
                  <Eye className='w-6 h-6 mx-auto mb-2 text-blue-600' />
                  <div className='text-2xl font-bold text-blue-900'>
                    {stats.totalViews}
                  </div>
                  <div className='text-sm text-blue-600'>Total</div>
                </div>

                <div className='p-4 text-center rounded-lg bg-green-50'>
                  <Users className='w-6 h-6 mx-auto mb-2 text-green-600' />
                  <div className='text-2xl font-bold text-green-900'>
                    {stats.uniqueViews}
                  </div>
                  <div className='text-sm text-green-600'>Uniques</div>
                </div>

                <div className='p-4 text-center rounded-lg bg-purple-50'>
                  <Calendar className='w-6 h-6 mx-auto mb-2 text-purple-600' />
                  <div className='text-2xl font-bold text-purple-900'>
                    {stats.viewsThisWeek}
                  </div>
                  <div className='text-sm text-purple-600'>Cette semaine</div>
                </div>

                <div className='p-4 text-center rounded-lg bg-orange-50'>
                  <TrendingUp className='w-6 h-6 mx-auto mb-2 text-orange-600' />
                  <div className='text-2xl font-bold text-orange-900'>
                    {stats.viewsThisMonth}
                  </div>
                  <div className='text-sm text-orange-600'>Ce mois</div>
                </div>
              </div>

              {/* Vues récentes */}
              {stats.recentViews.length > 0 && (
                <div className='space-y-3'>
                  <h4 className='font-medium'>Vues récentes</h4>
                  <div className='space-y-2 overflow-y-auto max-h-40'>
                    {stats.recentViews.slice(0, 5).map((view) => (
                      <div
                        key={view.id}
                        className='flex items-center justify-between p-3 rounded-lg bg-gray-50'
                      >
                        <div className='flex items-center gap-3'>
                          <Globe className='w-4 h-4 text-gray-500' />
                          <div>
                            <p className='text-sm font-medium'>
                              {new Date(view.viewedAt).toLocaleString('fr-FR')}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {view.ipAddress !== 'unknown'
                                ? view.ipAddress
                                : 'Visiteur anonyme'}
                            </p>
                          </div>
                        </div>
                        <Badge variant='secondary' className='text-xs'>
                          {view.userAgent.includes('Mobile')
                            ? 'Mobile'
                            : 'Desktop'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message d'information */}
          {!isPublic && (
            <div className='p-4 border rounded-lg bg-blue-50 border-blue-200'>
              <div className='flex items-center gap-2'>
                <Eye className='w-5 h-5 text-yellow-600' />
                <div>
                  <h4 className='font-medium text-yellow-800'>CV privé</h4>
                  <p className='text-sm text-yellow-700'>
                    Votre CV est actuellement privé. Activez le partage public
                    pour permettre aux autres de le voir et suivre les
                    statistiques de vues.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
