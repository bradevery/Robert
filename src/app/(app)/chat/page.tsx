'use client';

import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

import { cn } from '@/lib/utils';

import { ChatContainer } from '@/components/ai-chat/ChatContainer';

import { useChatStore } from '@/stores/chat-store';

export default function ChatPage() {
  const [showThreadSidebar] = useState(true);

  const {
    threads,
    activeThreadId,
    setActiveThread,
    createThread,
    deleteThread,
  } = useChatStore();

  const handleNewThread = useCallback(() => {
    createThread();
  }, [createThread]);

  const handleSelectThread = useCallback(
    (threadId: string) => {
      setActiveThread(threadId);
    },
    [setActiveThread]
  );

  const handleDeleteThread = useCallback(
    (threadId: string) => {
      deleteThread(threadId);
    },
    [deleteThread]
  );

  return (
    <div className='flex min-h-screen bg-gray-50/50'>
      {/* Thread sidebar */}
      <div
        className={cn(
          'hidden md:flex flex-col w-72 bg-white border-r border-gray-100 transition-all duration-300',
          !showThreadSidebar && 'w-0 overflow-hidden'
        )}
      >
        {/* Header */}
        <div className='p-4 border-b border-gray-100'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 bg-violet-50 rounded-xl'>
                <MessageCircle className='w-5 h-5 text-violet-500' />
              </div>
              <div>
                <h1 className='text-lg font-bold text-gray-900'>Chat IA</h1>
                <p className='text-xs text-gray-500'>
                  {threads.length} conversation{threads.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleNewThread}
            className='w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors'
          >
            <Plus className='w-4 h-4' />
            Nouvelle conversation
          </button>
        </div>

        {/* Thread list */}
        <div className='flex-1 overflow-y-auto p-3 space-y-1'>
          {threads.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <div className='flex items-center justify-center w-12 h-12 mb-3 bg-gray-100 rounded-full'>
                <MessageCircle className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-sm text-gray-500'>Aucune conversation</p>
              <p className='text-xs text-gray-400 mt-1'>
                Créez une nouvelle conversation pour commencer
              </p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  'group relative rounded-xl transition-all',
                  thread.id === activeThreadId
                    ? 'bg-violet-50 border border-violet-100'
                    : 'hover:bg-gray-50'
                )}
              >
                <button
                  onClick={() => handleSelectThread(thread.id)}
                  className='w-full text-left px-3 py-3'
                >
                  <p className='text-sm font-medium text-gray-900 truncate pr-8'>
                    {thread.title}
                  </p>
                  <div className='flex items-center gap-2 mt-1'>
                    {thread.module && (
                      <span className='px-1.5 py-0.5 text-[10px] font-medium text-violet-600 bg-violet-100 rounded'>
                        {thread.module}
                      </span>
                    )}
                    <span className='text-xs text-gray-400'>
                      {new Date(thread.updatedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span className='text-xs text-gray-400'>
                      {thread.messages.length} msg
                    </span>
                  </div>
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteThread(thread.id);
                  }}
                  className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat container */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Mobile header */}
        <div className='md:hidden sticky top-0 z-10 px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-8 h-8 bg-violet-50 rounded-lg'>
                <MessageCircle className='w-4 h-4 text-violet-500' />
              </div>
              <span className='font-semibold text-gray-900'>Chat IA</span>
            </div>
            <button
              onClick={handleNewThread}
              className='p-2 text-violet-600 hover:bg-violet-50 rounded-lg'
            >
              <Plus className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Chat */}
        <ChatContainer className='flex-1' />
      </div>
    </div>
  );
}
