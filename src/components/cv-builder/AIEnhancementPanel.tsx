'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AlertCircle,
  CheckCircle,
  Copy,
  Globe,
  Loader2,
  MessageSquare,
  RotateCcw,
  Settings,
  Sparkles,
  Wand2,
} from 'lucide-react';
import React, { useState } from 'react';

import { AIEnhancementRequest, useOpenAI } from '@/lib/openai-service';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AIEnhancementPanelProps {
  text: string;
  onTextChange: (newText: string) => void;
  context?: string;
  className?: string;
}

export const AIEnhancementPanel: React.FC<AIEnhancementPanelProps> = ({
  text,
  onTextChange,
  context,
  className = '',
}) => {
  const [enhancementType, setEnhancementType] = useState<string>('improve');
  const [tone, setTone] = useState<string>('professional');
  const [targetLanguage, setTargetLanguage] = useState<string>('English');
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [originalText, setOriginalText] = useState<string>('');

  const { enhanceText, initializeService } = useOpenAI();

  const handleEnhance = async () => {
    if (!text.trim()) {
      setError('Veuillez entrer du texte à améliorer');
      return;
    }

    if (!apiKey.trim()) {
      setError('Veuillez entrer votre clé API OpenAI');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuggestions([]);

    try {
      // Initialiser le service avec la clé API
      initializeService(apiKey);

      // Préparer la requête
      const request: AIEnhancementRequest = {
        text: text,
        type: enhancementType as any,
        context: context,
        ...(enhancementType === 'change_tone' && { tone: tone as any }),
        ...(enhancementType === 'translate' && { targetLanguage }),
      };

      // Sauvegarder le texte original si c'est la première amélioration
      if (!originalText) {
        setOriginalText(text);
      }

      // Appeler l'API
      const response = await enhanceText(request);

      // Mettre à jour le texte
      onTextChange(response.enhancedText);
      setSuggestions(response.suggestions || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'amélioration du texte"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = () => {
    if (originalText) {
      onTextChange(originalText);
      setSuggestions([]);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
  };

  const enhancementTypes = [
    {
      value: 'improve',
      label: 'Améliorer le texte',
      icon: Sparkles,
      description: "Améliore la clarté et l'impact",
    },
    {
      value: 'fix_grammar',
      label: 'Corriger la grammaire',
      icon: CheckCircle,
      description: 'Corrige les erreurs grammaticales',
    },
    {
      value: 'change_tone',
      label: 'Changer le ton',
      icon: MessageSquare,
      description: 'Modifie le style et le ton',
    },
    {
      value: 'translate',
      label: 'Traduire',
      icon: Globe,
      description: 'Traduit dans une autre langue',
    },
  ];

  const tones = [
    { value: 'professional', label: 'Professionnel' },
    { value: 'confident', label: 'Confiant' },
    { value: 'casual', label: 'Décontracté' },
    { value: 'formal', label: 'Formel' },
  ];

  const languages = [
    { value: 'English', label: 'Anglais' },
    { value: 'French', label: 'Français' },
    { value: 'Spanish', label: 'Espagnol' },
    { value: 'German', label: 'Allemand' },
    { value: 'Italian', label: 'Italien' },
  ];

  const selectedType = enhancementTypes.find(
    (type) => type.value === enhancementType
  );

  return (
    <div className={`ai-enhancement-panel ${className}`}>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Wand2 className='w-5 h-5 text-purple-600' />
            Amélioration IA
            <Badge variant='secondary' className='ml-auto'>
              OpenAI GPT
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Configuration de la clé API */}
          <div className='space-y-2'>
            <Label htmlFor='api-key'>Clé API OpenAI</Label>
            <div className='flex gap-2'>
              <Input
                id='api-key'
                type='password'
                placeholder='sk-...'
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className='flex-1'
              />
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  const storedKey = localStorage.getItem('openai-api-key');
                  if (storedKey) setApiKey(storedKey);
                }}
              >
                <Settings className='w-4 h-4' />
              </Button>
            </div>
            <p className='text-xs text-gray-500'>
              Votre clé API est stockée localement et n'est jamais envoyée à nos
              serveurs.
            </p>
          </div>

          {/* Type d'amélioration */}
          <div className='space-y-3'>
            <Label>Type d'amélioration</Label>
            <div className='grid grid-cols-2 gap-2'>
              {enhancementTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={
                    enhancementType === type.value ? 'default' : 'outline'
                  }
                  size='sm'
                  onClick={() => setEnhancementType(type.value)}
                  className='flex flex-col items-center h-auto py-3'
                >
                  <type.icon className='w-4 h-4 mb-1' />
                  <span className='text-xs'>{type.label}</span>
                </Button>
              ))}
            </div>
            {selectedType && (
              <p className='text-sm text-gray-600'>
                {selectedType.description}
              </p>
            )}
          </div>

          {/* Options spécifiques */}
          {enhancementType === 'change_tone' && (
            <div className='space-y-2'>
              <Label>Ton souhaité</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((toneOption) => (
                    <SelectItem key={toneOption.value} value={toneOption.value}>
                      {toneOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {enhancementType === 'translate' && (
            <div className='space-y-2'>
              <Label>Langue cible</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className='flex gap-2'>
            <Button
              onClick={handleEnhance}
              disabled={isLoading || !text.trim() || !apiKey.trim()}
              className='flex-1'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Amélioration en cours...
                </>
              ) : (
                <>
                  <Sparkles className='w-4 h-4 mr-2' />
                  Améliorer le texte
                </>
              )}
            </Button>

            {originalText && (
              <Button variant='outline' onClick={handleRestore} size='sm'>
                <RotateCcw className='w-4 h-4' />
              </Button>
            )}

            <Button variant='outline' onClick={handleCopyText} size='sm'>
              <Copy className='w-4 h-4' />
            </Button>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <AlertCircle className='w-4 h-4 text-red-600' />
              <span className='text-sm text-red-700'>{error}</span>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className='space-y-2'>
              <Label>Suggestions</Label>
              <div className='space-y-2'>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className='flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg'
                  >
                    <CheckCircle className='w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0' />
                    <span className='text-sm text-blue-700'>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
