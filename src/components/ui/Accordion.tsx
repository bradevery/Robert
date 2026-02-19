'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { ReactNode, useState } from 'react';

import { cn } from '@/lib/utils';

interface AccordionItemProps {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
}

interface AccordionProps {
  children: React.ReactElement<AccordionItemProps>[];
  allowMultiple?: boolean;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  _id,
  _title,
  icon: _Icon,
  _badge,
  children,
  _defaultOpen = false,
  _disabled = false,
}) => {
  return <>{children}</>;
};

export const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = false,
  className,
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    const defaultOpen = new Set<string>();
    React.Children.forEach(children, (child) => {
      if (child.props.defaultOpen) {
        defaultOpen.add(child.props.id);
      }
    });
    return defaultOpen;
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newOpenItems = new Set(prev);

      if (newOpenItems.has(id)) {
        newOpenItems.delete(id);
      } else {
        if (!allowMultiple) {
          newOpenItems.clear();
        }
        newOpenItems.add(id);
      }

      return newOpenItems;
    });
  };

  return (
    <div className={cn('space-y-2', className)}>
      {React.Children.map(children, (child) => {
        const {
          id,
          title,
          icon: Icon,
          badge,
          children: content,
          disabled,
        } = child.props;
        const isOpen = openItems.has(id);

        return (
          <div
            key={id}
            className='border border-gray-200 rounded-lg overflow-hidden'
          >
            <button
              onClick={() => !disabled && toggleItem(id)}
              disabled={disabled}
              className={cn(
                'w-full flex items-center justify-between p-4 text-left transition-all duration-200',
                'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                disabled && 'opacity-50 cursor-not-allowed',
                isOpen && 'bg-blue-50 border-b border-blue-200'
              )}
            >
              <div className='flex items-center gap-3'>
                {Icon && (
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isOpen ? 'text-blue-600' : 'text-gray-500'
                    )}
                  />
                )}
                <span
                  className={cn(
                    'font-medium transition-colors',
                    isOpen ? 'text-blue-900' : 'text-gray-900'
                  )}
                >
                  {title}
                </span>
                {badge !== undefined && (
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      isOpen
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {badge}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  'transition-transform duration-200',
                  isOpen ? 'rotate-90' : 'rotate-0'
                )}
              >
                <ChevronRight className='w-4 h-4 text-gray-500' />
              </div>
            </button>

            {isOpen && (
              <div className='border-t border-gray-200 bg-white'>
                <div className='p-4'>{content}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Composant accordéon spécialisé pour les sections CV
interface CVSectionAccordionProps {
  sections: Array<{
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    component: ReactNode;
    itemCount?: number;
    visible?: boolean;
  }>;
  className?: string;
}

export const CVSectionAccordion: React.FC<CVSectionAccordionProps> = ({
  sections,
  className,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basics']) // Basics ouvert par défaut
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  };

  return (
    <div className={cn('space-y-1', className)}>
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        const Icon = section.icon;

        return (
          <div
            key={section.id}
            className='bg-white border border-gray-200 rounded-lg overflow-hidden'
          >
            <button
              onClick={() => toggleSection(section.id)}
              className={cn(
                'w-full flex items-center justify-between p-3 text-left transition-all duration-200',
                'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                isExpanded && 'bg-blue-50 shadow-sm'
              )}
            >
              <div className='flex items-center gap-3'>
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isExpanded
                      ? 'text-blue-600'
                      : section.visible
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isExpanded ? 'text-blue-900' : 'text-gray-900',
                    !section.visible && 'text-gray-500'
                  )}
                >
                  {section.title}
                </span>
                {section.itemCount !== undefined && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      isExpanded
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {section.itemCount}
                  </span>
                )}
              </div>

              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-500 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
            </button>

            {isExpanded && (
              <div className='border-t border-gray-200'>
                <div className='p-4 bg-gray-50'>{section.component}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
