'use client';

import {
  CheckCircle,
  FileSearch,
  MessageCircle,
  PenTool,
  Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import {
  type Attachment,
  useActiveThread,
  useChatStore,
} from '@/stores/chat-store';

import { ActionButton, ChatInput } from './ChatInput';
import { ChatMessage, TypingIndicator } from './ChatMessage';

interface ChatContainerProps {
  threadId?: string;
  className?: string;
}

export function ChatContainer({ threadId, className }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    activeThreadId,
    isTyping,
    setActiveThread,
    addMessage,
    createThread,
    setTyping,
  } = useChatStore();

  const activeThread = useActiveThread();

  // Set active thread if provided
  useEffect(() => {
    if (threadId && threadId !== activeThreadId) {
      setActiveThread(threadId);
    }
  }, [threadId, activeThreadId, setActiveThread]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isTyping]);

  const handleSend = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      let currentThreadId = activeThreadId;

      // Create thread if none exists
      if (!currentThreadId) {
        currentThreadId = createThread();
      }

      // Add user message
      addMessage(currentThreadId, {
        role: 'user',
        content,
        attachments,
      });

      // Get AI response from API
      setTyping(true);
      try {
        // Build history for context
        const history =
          activeThread?.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })) || [];

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            history: history.slice(-10),
            context: 'chat',
          }),
        });

        if (!response.ok) {
          throw new Error('API error');
        }

        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        addMessage(currentThreadId!, {
          role: 'assistant',
          content: data.response?.message || getSimulatedResponse(content),
        });
      } catch (error) {
        console.error('Chat API error:', error);
        // Fallback to simulated response
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        addMessage(currentThreadId!, {
          role: 'assistant',
          content: getSimulatedResponse(content),
        });
      } finally {
        setTyping(false);
      }
    },
    [activeThreadId, activeThread, addMessage, createThread, setTyping]
  );

  const handleQuickAction = useCallback(
    (action: string) => {
      const prompts: Record<string, string> = {
        'analyze-ao':
          "Analyse cet appel d'offre et extrais les compétences clés requises.",
        'match-profiles':
          'Trouve les meilleurs profils correspondant à ce projet.',
        'generate-cv': 'Génère un CV adapté pour cette opportunité.',
        'pre-qualify': 'Pré-qualifie ce candidat pour la mission.',
      };
      if (prompts[action]) {
        handleSend(prompts[action]);
      }
    },
    [handleSend]
  );

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Messages area */}
      <div className='flex-1 overflow-y-auto p-6 space-y-6'>
        {!activeThread || activeThread.messages.length === 0 ? (
          <EmptyState onQuickAction={handleQuickAction} />
        ) : (
          <>
            {activeThread.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}

function EmptyState({
  onQuickAction,
}: {
  onQuickAction: (action: string) => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center h-full text-center px-4'>
      <div className='flex items-center justify-center w-16 h-16 mb-6 bg-violet-100 rounded-2xl'>
        <MessageCircle className='w-8 h-8 text-violet-600' />
      </div>
      <h2 className='text-2xl font-bold text-gray-900 mb-2'>
        Comment puis-je vous aider ?
      </h2>
      <p className='text-gray-500 mb-8 max-w-md'>
        Je suis votre assistant IA spécialisé dans le staffing et le
        recrutement. Posez-moi vos questions ou utilisez les actions rapides
        ci-dessous.
      </p>

      {/* Quick actions */}
      <div className='grid grid-cols-2 gap-3 w-full max-w-lg'>
        <ActionButton
          icon={FileSearch}
          label='Analyser un AO'
          onClick={() => onQuickAction('analyze-ao')}
          color='blue'
        />
        <ActionButton
          icon={Sparkles}
          label='Matcher des profils'
          onClick={() => onQuickAction('match-profiles')}
          color='green'
        />
        <ActionButton
          icon={PenTool}
          label='Générer un CV'
          onClick={() => onQuickAction('generate-cv')}
          color='purple'
        />
        <ActionButton
          icon={CheckCircle}
          label='Pré-qualifier'
          onClick={() => onQuickAction('pre-qualify')}
          color='orange'
        />
      </div>
    </div>
  );
}

// Simulated AI responses
function getSimulatedResponse(userMessage: string): string {
  const lowercaseMessage = userMessage.toLowerCase();

  if (
    lowercaseMessage.includes('analyse') ||
    lowercaseMessage.includes("appel d'offre")
  ) {
    return `J'ai analysé l'appel d'offre. Voici les points clés identifiés :

**Compétences techniques requises :**
- Architecture microservices
- React / Node.js
- AWS ou Azure
- PostgreSQL / MongoDB

**Profil recherché :**
- 5-8 ans d'expérience
- Expérience secteur public appréciée
- Habilitation possible

**Budget estimé :** 450k€ - 550k€

Souhaitez-vous que je recherche des profils correspondants dans votre base ?`;
  }

  if (
    lowercaseMessage.includes('match') ||
    lowercaseMessage.includes('profil')
  ) {
    return `J'ai identifié 3 profils correspondants :

1. **Thomas M.** - Lead Dev Fullstack (98% match)
   - React, Node.js, Architecture
   - 8 ans d'expérience
   - Disponibilité : Immédiate

2. **Sarah C.** - Architecte Cloud (85% match)
   - AWS, Terraform, Kubernetes
   - 10 ans d'expérience
   - Disponibilité : 1 mois

3. **Marc D.** - Data Engineer (72% match)
   - Python, Spark, BigQuery
   - 5 ans d'expérience
   - Disponibilité : Immédiate

Voulez-vous voir plus de détails sur l'un de ces profils ?`;
  }

  if (lowercaseMessage.includes('cv') || lowercaseMessage.includes('générer')) {
    return `Je peux générer un CV adapté pour cette opportunité. J'ai besoin de quelques informations :

1. **Quel candidat ?** (Thomas M., Sarah C., Marc D., ou autre)
2. **Format souhaité ?** (Standard, ESN, Dossier de compétences)
3. **Points à mettre en avant ?**

Une fois ces informations fournies, je générerai un CV optimisé pour maximiser vos chances de succès.`;
  }

  if (
    lowercaseMessage.includes('pré-qualif') ||
    lowercaseMessage.includes('qualifier')
  ) {
    return `Pour la pré-qualification, je vais évaluer le candidat sur plusieurs critères :

**Check-list de pré-qualification :**
- [ ] Compétences techniques alignées
- [ ] Années d'expérience suffisantes
- [ ] Disponibilité compatible
- [ ] TJM dans le budget
- [ ] Soft skills adaptés au contexte

Quel candidat souhaitez-vous pré-qualifier ?`;
  }

  return `Je comprends votre demande concernant "${userMessage.slice(
    0,
    50
  )}...".

Comment puis-je vous aider plus précisément ? Je peux :
- Analyser des appels d'offres
- Rechercher et matcher des profils
- Générer des CV adaptés
- Pré-qualifier des candidats
- Répondre à vos questions sur le recrutement

N'hésitez pas à me donner plus de détails.`;
}

interface ThreadSidebarProps {
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  className?: string;
}

export function ThreadSidebar({
  onSelectThread,
  onNewThread,
  className,
}: ThreadSidebarProps) {
  const { threads, activeThreadId } = useChatStore();

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-gray-50 border-r border-gray-200',
        className
      )}
    >
      <div className='p-4 border-b border-gray-200'>
        <button
          onClick={onNewThread}
          className='w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors'
        >
          <MessageCircle className='w-4 h-4' />
          Nouvelle conversation
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-2 space-y-1'>
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg transition-colors',
              thread.id === activeThreadId
                ? 'bg-white shadow-sm border border-gray-200'
                : 'hover:bg-white/50'
            )}
          >
            <p className='text-sm font-medium text-gray-900 truncate'>
              {thread.title}
            </p>
            <p className='text-xs text-gray-500'>
              {new Date(thread.updatedAt).toLocaleDateString('fr-FR')}
            </p>
          </button>
        ))}

        {threads.length === 0 && (
          <p className='text-sm text-gray-500 text-center py-8'>
            Aucune conversation
          </p>
        )}
      </div>
    </div>
  );
}
