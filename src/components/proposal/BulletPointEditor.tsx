'use client';

import { memo, useCallback } from 'react';

import { WordCounter } from './WordCounter';

interface BulletPointEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  minWords?: number;
  maxWords?: number;
  maxItems?: number;
  disabled?: boolean;
}

export const BulletPointEditor = memo(function BulletPointEditor({
  items,
  onChange,
  minWords = 9,
  maxWords = 14,
  maxItems = 5,
  disabled = false,
}: BulletPointEditorProps) {
  const handleChange = useCallback(
    (index: number, value: string) => {
      const next = [...items];
      next[index] = value;
      onChange(next);
    },
    [items, onChange]
  );

  // Ensure we always show exactly maxItems rows
  const rows = Array.from({ length: maxItems }, (_, i) => items[i] ?? '');

  return (
    <div className='space-y-2'>
      {rows.map((text, i) => (
        <div key={i} className='flex items-start gap-2'>
          <span className='mt-2.5 text-orange-400 text-sm font-bold select-none'>
            &#8226;
          </span>
          <div className='flex-1'>
            <textarea
              rows={1}
              value={text}
              disabled={disabled}
              onChange={(e) => handleChange(i, e.target.value)}
              className='w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 outline-none transition-colors disabled:opacity-50'
              placeholder={`Point ${i + 1}...`}
            />
          </div>
          <div className='mt-2'>
            <WordCounter text={text} min={minWords} max={maxWords} />
          </div>
        </div>
      ))}
    </div>
  );
});
