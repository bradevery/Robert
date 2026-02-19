'use client';

import { Eye, EyeOff, FileText, Save, StickyNote } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PersonalNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  className?: string;
}

export const PersonalNotes: React.FC<PersonalNotesProps> = ({
  notes,
  onNotesChange,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempNotes, setTempNotes] = useState(notes);
  const [isVisible, setIsVisible] = useState(false);

  const handleSave = () => {
    onNotesChange(tempNotes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempNotes(notes);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setTempNotes(notes);
    setIsEditing(true);
  };

  const hasNotes = notes.trim().length > 0;

  return (
    <div className={`personal-notes ${className}`}>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <StickyNote className='w-5 h-5 text-yellow-600' />
            Notes personnelles
            <Badge variant='secondary' className='ml-auto'>
              Privé
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          {/* Contrôles de visibilité */}
          <div className='flex items-center justify-between'>
            <Label className='text-sm text-gray-600'>
              Ces notes ne sont visibles que par vous
            </Label>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsVisible(!isVisible)}
              className={isVisible ? 'text-green-600' : 'text-gray-400'}
            >
              {isVisible ? (
                <>
                  <Eye className='w-4 h-4 mr-2' />
                  Masquer
                </>
              ) : (
                <>
                  <EyeOff className='w-4 h-4 mr-2' />
                  Afficher
                </>
              )}
            </Button>
          </div>

          {/* Contenu des notes */}
          {isVisible && (
            <div className='space-y-4'>
              {isEditing ? (
                <div className='space-y-3'>
                  <Textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder='Ajoutez vos notes personnelles ici... Par exemple : points à améliorer, objectifs pour ce CV, informations à retenir, etc.'
                    rows={8}
                    className='resize-none'
                  />

                  <div className='flex gap-2'>
                    <button
                      onClick={handleSave}
                      className='flex items-center gap-2 px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700'
                    >
                      <Save className='w-4 h-4' />
                      Sauvegarder
                    </button>
                    <button
                      onClick={handleCancel}
                      className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50'
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className='space-y-3'>
                  {hasNotes ? (
                    <div className='p-4 border border-blue-200 rounded-lg bg-blue-50'>
                      <div className='text-gray-700 whitespace-pre-wrap'>
                        {notes}
                      </div>
                    </div>
                  ) : (
                    <div className='p-8 text-center text-gray-500 border-2 border-gray-300 border-dashed rounded-lg'>
                      <FileText className='w-12 h-12 mx-auto mb-4 text-gray-400' />
                      <p className='mb-2'>Aucune note personnelle</p>
                      <p className='text-sm'>
                        Ajoutez des notes pour vous aider à organiser vos idées
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleStartEditing}
                    className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50'
                  >
                    <FileText className='w-4 h-4' />
                    {hasNotes ? 'Modifier les notes' : 'Ajouter des notes'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Conseils d'utilisation */}
          {isVisible && (
            <div className='p-4 border border-blue-200 rounded-lg bg-blue-50'>
              <h4 className='mb-2 font-medium text-blue-900'>
                💡 Conseils pour vos notes
              </h4>
              <ul className='space-y-1 text-sm text-blue-800'>
                <li>• Notez les points à améliorer ou à développer</li>
                <li>• Gardez une trace des objectifs spécifiques à ce CV</li>
                <li>• Ajoutez des informations contextuelles importantes</li>
                <li>• Utilisez ces notes pour préparer vos entretiens</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
