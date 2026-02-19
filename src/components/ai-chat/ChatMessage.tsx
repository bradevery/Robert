'use client';

import { Bot, Check, Copy, RefreshCw, User } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import type { Message } from '@/stores/chat-store';

interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
  className?: string;
}

export function ChatMessage({ message, onRetry, className }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex gap-4', isUser && 'flex-row-reverse', className)}>
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full',
          isUser ? 'bg-blue-100' : 'bg-emerald-100'
        )}
      >
        {isUser ? (
          <User className='w-5 h-5 text-blue-600' />
        ) : (
          <Bot className='w-5 h-5 text-emerald-600' />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          'flex-1 max-w-[80%]',
          isUser && 'flex flex-col items-end'
        )}
      >
        <div
          className={cn(
            'relative px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-gray-100 text-gray-900 rounded-tl-none'
          )}
        >
          {/* Message content */}
          <div className='prose prose-sm max-w-none'>
            {message.content.split('\n').map((line, i) => (
              <p
                key={i}
                className={cn('mb-1 last:mb-0', isUser && 'text-white')}
              >
                {line || '\u00A0'}
              </p>
            ))}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className='mt-3 space-y-2'>
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg',
                    isUser ? 'bg-blue-500' : 'bg-white border border-gray-200'
                  )}
                >
                  <span className='text-sm truncate'>{attachment.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {isAssistant && (
          <div className='flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button
              onClick={handleCopy}
              className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
              title='Copier'
            >
              {copied ? (
                <Check className='w-4 h-4 text-green-500' />
              ) : (
                <Copy className='w-4 h-4' />
              )}
            </button>
            {onRetry && (
              <button
                onClick={onRetry}
                className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                title='Régénérer'
              >
                <RefreshCw className='w-4 h-4' />
              </button>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className='mt-1 text-xs text-gray-400'>
          {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-4', className)}>
      <div className='flex-shrink-0 flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full'>
        <Bot className='w-5 h-5 text-emerald-600' />
      </div>
      <div className='bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3'>
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
  );
}
