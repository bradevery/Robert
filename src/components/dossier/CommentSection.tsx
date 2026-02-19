'use client';
/* eslint-disable @next/next/no-img-element */

import { Loader2, MessageSquare, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { addComment } from '@/actions/comments';

interface Comment {
  id: string;
  user: {
    name: string;
    image?: string;
  };
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  dossierId: string;
  comments?: Comment[];
}

export function CommentSection({
  dossierId,
  comments: initialComments = [],
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const content = newComment; // Capture value
    setNewComment(''); // Clear immediately for UX

    startTransition(async () => {
      try {
        const addedComment = await addComment(dossierId, content);

        // Convert to UI format
        const uiComment: Comment = {
          id: addedComment.id,
          content: addedComment.content,
          createdAt: addedComment.createdAt.toISOString(),
          user: {
            name: addedComment.user.name || 'Vous',
            image: addedComment.user.image || undefined,
          },
        };

        setComments((prev) => [uiComment, ...prev]);
        router.refresh();
      } catch (error) {
        console.error('Failed to add comment:', error);
        // Optionally restore the text if it failed
        setNewComment(content);
      }
    });
  };

  return (
    <div className='space-y-4 border-t pt-4 mt-6'>
      <h3 className='text-lg font-semibold flex items-center gap-2'>
        <MessageSquare className='w-5 h-5' />
        Commentaires ({comments.length})
      </h3>

      <div className='space-y-4 max-h-[400px] overflow-y-auto'>
        {comments.length === 0 ? (
          <p className='text-muted-foreground text-sm italic'>
            Aucun commentaire pour le moment.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className='flex gap-3 bg-muted/50 p-3 rounded-lg'
            >
              <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0 overflow-hidden'>
                {comment.user.image ? (
                  <img
                    src={comment.user.image}
                    alt={comment.user.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  comment.user.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='font-medium text-sm'>
                    {comment.user.name}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {new Date(comment.createdAt).toLocaleDateString()}{' '}
                    {new Date(comment.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className='flex gap-2'>
        <Textarea
          placeholder='Ajouter un commentaire...'
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className='min-h-[80px]'
          disabled={isPending}
        />
        <Button
          onClick={handleAddComment}
          className='self-end'
          disabled={isPending || !newComment.trim()}
        >
          {isPending ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Send className='w-4 h-4' />
          )}
        </Button>
      </div>
    </div>
  );
}
