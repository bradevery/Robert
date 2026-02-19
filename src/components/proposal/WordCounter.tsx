'use client';

import { memo } from 'react';

interface WordCounterProps {
  text: string;
  min: number;
  max: number;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const WordCounter = memo(function WordCounter({
  text,
  min,
  max,
}: WordCounterProps) {
  const count = countWords(text);
  const isInRange = count >= min && count <= max;
  const isOver = count > max;

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium tabular-nums ${
        isInRange
          ? 'bg-green-100 text-green-700'
          : isOver
          ? 'bg-red-100 text-red-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {count}/{min}-{max}
    </span>
  );
});
