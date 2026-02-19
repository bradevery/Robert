/* eslint-disable @typescript-eslint/no-explicit-any */
import DOMPurify from 'dompurify';

// Utility functions compatible with Reactive-Resume

export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};

export const isEmptyString = (value: string | undefined | null): boolean => {
  return !value || value.trim().length === 0;
};

export const isUrl = (value: string | undefined | null): boolean => {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const sanitize = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: return as-is or use a server-safe alternative
    return html;
  }
  return DOMPurify.sanitize(html);
};

// Date formatting utility
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
    });
  } catch {
    return dateString;
  }
};

// Convert month string (YYYY-MM) to readable format
export const formatMonthYear = (monthString: string): string => {
  if (!monthString) return '';

  try {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
    });
  } catch {
    return monthString;
  }
};

// Create date range string
export const createDateRange = (
  startDate?: string,
  endDate?: string
): string => {
  if (!startDate && !endDate) return '';

  const start = startDate ? formatMonthYear(startDate) : '';
  const end = endDate ? formatMonthYear(endDate) : 'Présent';

  if (start && end) {
    return `${start} - ${end}`;
  } else if (start) {
    return start;
  } else if (end) {
    return end;
  }

  return '';
};

// Generate unique ID
export const generateId = (prefix = 'item'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Convert rating to level (1-5 scale to 1-4 scale)
export const convertRatingToLevel = (rating: string): number => {
  const ratingMap: Record<string, number> = {
    beginner: 1,
    elementary: 1,
    intermediate: 2,
    limited: 2,
    advanced: 3,
    professional: 3,
    expert: 4,
    native: 4,
  };

  return ratingMap[rating] || 2;
};

// Convert level to rating
export const convertLevelToRating = (level: number): string => {
  const levelMap: Record<number, string> = {
    1: 'beginner',
    2: 'intermediate',
    3: 'advanced',
    4: 'expert',
  };

  return levelMap[level] || 'intermediate';
};

// Safe get function (lodash.get alternative)
export const get = <T>(obj: any, path: string, defaultValue?: T): T => {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue as T;
    }
  }

  return current as T;
};
