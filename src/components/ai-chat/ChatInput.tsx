'use client';

import { FileText, Image, Paperclip, Send, X } from 'lucide-react';
import { KeyboardEvent, useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

interface Attachment {
  id: string;
  type: 'file' | 'image' | 'document';
  name: string;
  file?: File;
}

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Écrivez votre message...',
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    if (!message.trim() && attachments.length === 0) return;
    onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
    setMessage('');
    setAttachments([]);
  }, [message, attachments, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      // Auto-resize
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          200
        )}px`;
      }
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const newAttachments: Attachment[] = files.map((file) => ({
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        name: file.name,
        file,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
      e.target.value = '';
    },
    []
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getAttachmentIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return Image;
      default:
        return FileText;
    }
  };

  return (
    <div className={cn('border-t border-gray-100 bg-white p-4', className)}>
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-3'>
          {attachments.map((attachment) => {
            const Icon = getAttachmentIcon(attachment.type);
            return (
              <div
                key={attachment.id}
                className='flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg'
              >
                <Icon className='w-4 h-4 text-gray-500' />
                <span className='text-sm text-gray-700 truncate max-w-[150px]'>
                  {attachment.name}
                </span>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className='p-0.5 text-gray-400 hover:text-gray-600'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input area */}
      <div className='flex items-end gap-3'>
        {/* Attachment button */}
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50'
        >
          <Paperclip className='w-5 h-5' />
        </button>
        <input
          ref={fileInputRef}
          type='file'
          multiple
          className='hidden'
          onChange={handleFileSelect}
        />

        {/* Text input */}
        <div className='flex-1 relative'>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className='w-full px-4 py-3 pr-12 text-sm bg-gray-100 border-0 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50'
            style={{ maxHeight: '200px' }}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className='p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl disabled:opacity-50'
        >
          <Send className='w-5 h-5' />
        </Button>
      </div>

      {/* Helper text */}
      <p className='mt-2 text-xs text-gray-400 text-center'>
        Appuyez sur Entrée pour envoyer, Maj+Entrée pour un retour à la ligne
      </p>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  className?: string;
}

const colorVariants = {
  blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
  green: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200',
  purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200',
  orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200',
};

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  color = 'blue',
  className,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-colors',
        colorVariants[color],
        className
      )}
    >
      <Icon className='w-4 h-4' />
      {label}
    </button>
  );
}
