'use client';

import { ArrowRight, CalendarDays, Clock, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Switch } from '@/components/ui/switch';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onDateChange: (startDate: string, endDate: string) => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
  onClose,
  position = { x: 0, y: 0 },
}) => {
  const parseMonthYear = (
    dateStr?: string
  ): { month: number; year: number } | null => {
    if (
      !dateStr ||
      dateStr === "aujourd'hui" ||
      dateStr === "aujourd'hui" ||
      dateStr === ''
    ) {
      return null;
    }

    try {
      // Format: MM/YYYY
      if (dateStr.includes('/')) {
        const [month, year] = dateStr.split('/');
        return { month: parseInt(month), year: parseInt(year) };
      } else if (dateStr.includes('-')) {
        // Format: YYYY-MM
        const [year, month] = dateStr.split('-');
        return { month: parseInt(month), year: parseInt(year) };
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const currentYear = new Date().getFullYear();
  const startParsed = parseMonthYear(startDate);
  const endParsed = parseMonthYear(endDate);

  const [startYear, setStartYear] = useState(startParsed?.year || currentYear);
  const [startMonth, setStartMonth] = useState(startParsed?.month || 1);
  const [endYear, setEndYear] = useState(endParsed?.year || currentYear);
  const [endMonth, setEndMonth] = useState(endParsed?.month || 1);
  const [isPresent, setIsPresent] = useState<boolean>(
    endDate === "aujourd'hui" || endDate === "aujourd'hui" || endDate === ''
  );
  const [computedPosition, setComputedPosition] = useState(position);

  // Validate dates
  const isStartAfterEnd = () => {
    if (isPresent) return false;
    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);
    return startDate > endDate;
  };

  const isEndAfterToday = () => {
    if (isPresent) return false;
    const endDate = new Date(endYear, endMonth - 1);
    const today = new Date();
    today.setDate(1); // Set to first day of current month for comparison
    return endDate > today;
  };

  // Auto-adjust end month if it exceeds current month when end year is current year
  useEffect(() => {
    if (!isPresent && endYear === currentYear) {
      const currentMonth = new Date().getMonth() + 1;
      if (endMonth > currentMonth) {
        setEndMonth(currentMonth);
      }
    }
  }, [endYear, endMonth, isPresent, currentYear]);

  // Auto-adjust start month if start date is after end date (same year)
  useEffect(() => {
    if (!isPresent && startYear === endYear && startMonth > endMonth) {
      setStartMonth(endMonth);
    }
  }, [startYear, endYear, startMonth, endMonth, isPresent]);

  // Auto-apply changes with validation
  useEffect(() => {
    // Don't apply if validation fails
    if (isStartAfterEnd() || isEndAfterToday()) {
      return;
    }

    const formattedStart = `${String(startMonth).padStart(
      2,
      '0'
    )}/${startYear}`;
    const formattedEnd = isPresent
      ? "aujourd'hui"
      : `${String(endMonth).padStart(2, '0')}/${endYear}`;

    onDateChange(formattedStart, formattedEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startYear, startMonth, endYear, endMonth, isPresent]);

  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  const years = Array.from({ length: 60 }, (_, i) => currentYear - i);

  // Filter months for end date if it's the current year
  const getAvailableEndMonths = () => {
    if (endYear === currentYear) {
      const currentMonth = new Date().getMonth() + 1;
      return months.filter((m) => m.value <= currentMonth);
    }
    return months;
  };

  // Filter months for start date if start year equals end year
  const getAvailableStartMonths = () => {
    if (!isPresent && startYear === endYear) {
      return months.filter((m) => m.value <= endMonth);
    }
    return months;
  };

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const width = 340;
    const height = 420;
    const safeMargin = 16;

    const nextX = Math.min(
      Math.max(position.x, safeMargin),
      window.innerWidth - width - safeMargin
    );
    const nextY = Math.min(
      Math.max(position.y + 10, safeMargin),
      window.innerHeight - height - safeMargin
    );

    setComputedPosition({ x: nextX, y: nextY });
  }, [position]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const hasError = isStartAfterEnd() || isEndAfterToday();

  const getMonthLabel = (monthValue?: number) =>
    months.find((m) => m.value === monthValue)?.label ?? '';

  const formatPreview = (monthValue: number, yearValue: number) => {
    if (!monthValue || !yearValue) return '—';
    const label = getMonthLabel(monthValue);
    return `${label.slice(0, 3)} ${yearValue}`;
  };

  const startPreview = formatPreview(startMonth, startYear);
  const endPreview = isPresent
    ? "Aujourd'hui"
    : formatPreview(endMonth, endYear);

  return (
    <>
      {/* Date Picker Popup */}
      <div
        ref={modalRef}
        className='fixed z-50 w-[320px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-all animate-in fade-in zoom-in-95'
        style={{
          top: computedPosition.y,
          left: computedPosition.x,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-muted/60'>
          <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
            <CalendarDays className='w-4 h-4 text-primary' />
            <span>Période</span>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md p-1.5 text-muted-foreground transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            aria-label='Fermer le sélecteur de dates'
          >
            <X className='h-3.5 w-3.5' strokeWidth={2.2} />
          </button>
        </div>

        {/* Date Selectors */}
        <div className='px-4 py-4 space-y-4'>
          {/* Start Date */}
          <div className='space-y-2.5'>
            <label className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground'>
              <div className='w-1 h-3 rounded-full bg-primary'></div>
              Début
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <select
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value))}
                className={`w-full cursor-pointer rounded-lg border bg-background px-3 py-2 text-xs font-medium shadow-sm transition-all focus:outline-none focus:ring-2 hover:border-primary/60 ${
                  isStartAfterEnd()
                    ? 'border-destructive/40 focus:border-destructive focus:ring-destructive/40'
                    : 'border-border focus:border-primary focus:ring-primary/40'
                }`}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={startMonth}
                onChange={(e) => setStartMonth(parseInt(e.target.value))}
                className={`w-full cursor-pointer rounded-lg border bg-background px-3 py-2 text-xs font-medium shadow-sm transition-all focus:outline-none focus:ring-2 hover:border-primary/60 ${
                  isStartAfterEnd()
                    ? 'border-destructive/40 focus:border-destructive focus:ring-destructive/40'
                    : 'border-border focus:border-primary focus:ring-primary/40'
                }`}
              >
                {getAvailableStartMonths().map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* End Date */}
          <div className='space-y-2.5'>
            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground'>
                <div className='w-1 h-3 rounded-full bg-primary'></div>
                Fin
              </label>
              <div className='flex items-center gap-2 text-xs font-semibold text-muted-foreground'>
                <span>Aujourd&apos;hui</span>
                <Switch checked={isPresent} onCheckedChange={setIsPresent} />
              </div>
            </div>
            {!isPresent && (
              <div className='space-y-3 duration-200 animate-in fade-in slide-in-from-top-2'>
                <div className='grid grid-cols-2 gap-3'>
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(parseInt(e.target.value))}
                    className={`w-full cursor-pointer rounded-lg border bg-background px-3 py-2 text-xs font-medium shadow-sm transition-all focus:outline-none focus:ring-2 hover:border-primary/60 ${
                      hasError
                        ? 'border-destructive/40 focus:border-destructive focus:ring-destructive/40'
                        : 'border-border focus:border-primary focus:ring-primary/40'
                    }`}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(parseInt(e.target.value))}
                    className={`w-full cursor-pointer rounded-lg border bg-background px-3 py-2 text-xs font-medium shadow-sm transition-all focus:outline-none focus:ring-2 hover:border-primary/60 ${
                      hasError
                        ? 'border-destructive/40 focus:border-destructive focus:ring-destructive/40'
                        : 'border-border focus:border-primary focus:ring-primary/40'
                    }`}
                  >
                    {getAvailableEndMonths().map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error Messages */}
                {hasError && (
                  <div className='rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[11px] font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-200'>
                    {isStartAfterEnd() && (
                      <p>La date de début doit être avant la date de fin</p>
                    )}
                    {isEndAfterToday() && (
                      <p>La date de fin ne peut pas être dans le futur</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className='px-4 py-3 border-t border-border'>
          <div className='flex items-center gap-2.5'>
            <div className='flex flex-1 items-start justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5'>
              <div>
                <p className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                  Début
                </p>
                <p className='text-sm font-semibold text-foreground'>
                  {startPreview}
                </p>
              </div>
              <Clock className='w-4 h-4 text-primary' strokeWidth={2.2} />
            </div>
            <ArrowRight className='w-4 h-4 text-muted-foreground' />
            <div className='flex flex-1 items-start justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5'>
              <div>
                <p className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
                  Fin
                </p>
                <p className='text-sm font-semibold text-foreground'>
                  {endPreview}
                </p>
              </div>
              <Clock className='w-4 h-4 text-primary' strokeWidth={2.2} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
