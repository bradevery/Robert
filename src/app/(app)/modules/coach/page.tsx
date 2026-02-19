'use client';

import {
  BookOpen,
  Bot,
  Briefcase,
  ChevronRight,
  Clock,
  GraduationCap,
  Plus,
  Send,
  Sparkles,
  Target,
  Trash2,
  User,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import { useCoach } from '@/hooks/useCoach';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Message, useChatStore } from '@/stores/chat-store';

const COACH_MODULE = 'coach';

const quickPrompts = [
  {
    icon: Target,
    title: 'Préparer un entretien',
    prompt:
      'Je souhaite préparer un entretien pour un poste de développeur. Quelles questions dois-je anticiper ?',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: Briefcase,
    title: 'Négocier son salaire',
    prompt:
      "Comment négocier efficacement mon salaire lors d'un nouvel emploi ?",
    color: 'bg-green-50 text-green-600 border-green-100',
  },
  {
    icon: GraduationCap,
    title: 'Plan de carrière',
    prompt:
      'Je suis développeur depuis 3 ans, quelles sont les évolutions de carrière possibles ?',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    icon: BookOpen,
    title: 'Améliorer mon CV',
    prompt:
      "Quels sont les éléments essentiels d'un bon CV pour le secteur tech ?",
    color: 'bg-orange-50 text-orange-600 border-orange-100',
  },
];

export default function CoachPage() {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { sendMessage } = useCoach();
  const isTyping = sendMessage.isPending;

  // Chat store
  const threads = useChatStore((state) => state.threads);
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const createThread = useChatStore((state) => state.createThread);
  const setActiveThread = useChatStore((state) => state.setActiveThread);
  const addMessage = useChatStore((state) => state.addMessage);
  const deleteThread = useChatStore((state) => state.deleteThread);

  // Filter threads for coach module
  const coachThreads = useMemo(
    () => threads.filter((t) => t.module === COACH_MODULE),
    [threads]
  );

  const activeThread = useMemo(
    () =>
      threads.find((t) => t.id === activeThreadId && t.module === COACH_MODULE),
    [threads, activeThreadId]
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  // Create initial thread if none exists
  useEffect(() => {
    if (coachThreads.length === 0) {
      const welcomeMessage: Omit<Message, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: `Bonjour ! Je suis votre coach carrière IA. Je peux vous aider avec :

• La préparation d'entretiens d'embauche
• L'évolution de votre carrière
• La négociation salariale
• L'amélioration de votre CV et profil LinkedIn

Comment puis-je vous aider aujourd'hui ?`,
      };
      createThread('Nouvelle conversation', COACH_MODULE, welcomeMessage);
    } else if (!activeThread) {
      setActiveThread(coachThreads[0].id);
    }
  }, [coachThreads, activeThread, createThread, setActiveThread]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !activeThread || isTyping) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message
    addMessage(activeThread.id, {
      role: 'user',
      content: userMessage,
    });

    // Prepare history for API
    const history = activeThread.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await sendMessage.mutateAsync({
        message: userMessage,
        history,
        context: 'coach'
      });
      
      addMessage(activeThread.id, {
        role: 'assistant',
        content: response,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur IA');
      addMessage(activeThread.id, {
        role: 'assistant',
        content:
          'Une erreur est survenue. Veuillez reessayer dans quelques instants.',
      });
    } finally {
      inputRef.current?.focus();
    }
  }, [inputMessage, activeThread, isTyping, addMessage, sendMessage]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    setInputMessage(prompt);
    inputRef.current?.focus();
  }, []);

  const handleNewConversation = useCallback(() => {
    const welcomeMessage: Omit<Message, 'id' | 'timestamp'> = {
      role: 'assistant',
      content: 'Nouvelle conversation démarrée ! Comment puis-je vous aider ?',
    };
    createThread('Nouvelle conversation', COACH_MODULE, welcomeMessage);
  }, [createThread]);

  const handleDeleteThread = useCallback(
    (threadId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteThread(threadId);
    },
    [deleteThread]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <>
      {/* Header */}
      <div className='sticky top-0 z-10 px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-emerald-50 rounded-lg text-emerald-600'>
              <GraduationCap className='w-5 h-5' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                Career Coach IA
              </h1>
              <p className='text-sm text-gray-500'>
                Votre assistant carrière personnalisé
              </p>
            </div>
          </div>
          <Button
            onClick={handleNewConversation}
            className='gap-2 bg-emerald-600 hover:bg-emerald-700 text-white'
          >
            <Plus className='w-4 h-4' />
            Nouvelle conversation
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-8 h-[calc(100vh-80px)]'>
        <div className='flex gap-6 h-full'>
          {/* Conversations Sidebar */}
          <div className='w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4 overflow-hidden flex flex-col'>
            <h3 className='font-semibold text-gray-900 mb-4 px-2'>
              Conversations
            </h3>
            <div className='flex-1 overflow-y-auto space-y-1'>
              {coachThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setActiveThread(thread.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors group ${
                    activeThreadId === thread.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-sm truncate'>
                      {thread.title}
                    </div>
                    <div className='text-xs text-gray-500 flex items-center gap-1 mt-1'>
                      <Clock className='w-3 h-3' />
                      {new Date(thread.updatedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteThread(thread.id, e)}
                    className='opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className='flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden'>
            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-6 space-y-6'>
              {activeThread?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className='w-6 h-6' />
                    ) : (
                      <Bot className='w-6 h-6' />
                    )}
                  </div>
                  <div
                    className={`max-w-2xl p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <div className='whitespace-pre-wrap text-sm leading-relaxed'>
                      {message.content.split('\n').map((line, i) => {
                        // Handle bold text
                        const parts = line.split(/(\*\*[^*]+\*\*)/g);
                        return (
                          <p key={i} className={i > 0 ? 'mt-2' : ''}>
                            {parts.map((part, j) => {
                              if (
                                part.startsWith('**') &&
                                part.endsWith('**')
                              ) {
                                return (
                                  <strong key={j}>{part.slice(2, -2)}</strong>
                                );
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className='flex gap-4'>
                  <div className='w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0'>
                    <Bot className='w-6 h-6' />
                  </div>
                  <div className='bg-gray-100 p-4 rounded-2xl rounded-tl-none'>
                    <div className='flex gap-1'>
                      <span
                        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {activeThread?.messages.length === 1 && (
              <div className='px-6 pb-4'>
                <p className='text-sm text-gray-500 mb-3 flex items-center gap-2'>
                  <Sparkles className='w-4 h-4' />
                  Suggestions pour démarrer
                </p>
                <div className='grid grid-cols-2 gap-3'>
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${prompt.color} hover:shadow-sm transition-shadow text-left`}
                    >
                      <prompt.icon className='w-5 h-5 flex-shrink-0' />
                      <span className='text-sm font-medium'>
                        {prompt.title}
                      </span>
                      <ChevronRight className='w-4 h-4 ml-auto opacity-50' />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className='p-4 border-t border-gray-100 bg-gray-50/50'>
              <div className='flex gap-3 max-w-4xl mx-auto'>
                <Input
                  ref={inputRef}
                  placeholder='Posez votre question...'
                  className='h-12 rounded-xl border-gray-200 bg-white shadow-sm'
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                />
                <Button
                  className='h-12 w-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 flex-shrink-0'
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <Send className='w-5 h-5' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
