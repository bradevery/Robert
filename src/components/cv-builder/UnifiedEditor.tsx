'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Types génériques pour l'éditeur
interface FieldConfig {
  key: string;
  label: string;
  type:
    | 'text'
    | 'textarea'
    | 'date'
    | 'select'
    | 'multiselect'
    | 'url'
    | 'email';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => string | null;
}

interface ItemEditorProps<T> {
  items: T[];
  onUpdate: (items: T[]) => void;
  itemConfig: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    fields: FieldConfig[];
    createNew: () => T;
    getDisplayText: (item: T) => string;
    getKey: (item: T) => string;
  };
  className?: string;
  maxItems?: number;
  allowReorder?: boolean;
  allowVisibility?: boolean;
}

export function UnifiedEditor<T extends Record<string, any>>({
  items,
  onUpdate,
  itemConfig,
  className = '',
  maxItems,
  allowReorder = false,
  allowVisibility = false,
}: ItemEditorProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [newItem, setNewItem] = useState<T>(itemConfig.createNew());

  // Validation
  const validateItem = useCallback(
    (item: T): string[] => {
      const errors: string[] = [];

      itemConfig.fields.forEach((field) => {
        if (
          field.required &&
          (!item[field.key] || item[field.key].toString().trim() === '')
        ) {
          errors.push(`${field.label} est requis`);
        }

        if (field.validation && item[field.key]) {
          const error = field.validation(item[field.key]);
          if (error) errors.push(error);
        }
      });

      return errors;
    },
    [itemConfig]
  );

  // Actions
  const handleAdd = useCallback(() => {
    const errors = validateItem(newItem);
    if (errors.length > 0) {
      // Afficher les erreurs (vous pouvez implémenter un toast ici)
      console.warn('Validation errors:', errors);
      return;
    }

    if (maxItems && items.length >= maxItems) {
      console.warn(`Maximum ${maxItems} items allowed`);
      return;
    }

    const updatedItems = [...items, { ...newItem }];
    onUpdate(updatedItems);
    setNewItem(itemConfig.createNew());
    setIsAdding(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, newItem, onUpdate, validateItem, maxItems]);

  const handleEdit = useCallback(
    (id: string, updatedItem: Partial<T>) => {
      const updatedItems = items.map((item) =>
        itemConfig.getKey(item) === id ? { ...item, ...updatedItem } : item
      );
      onUpdate(updatedItems);
    },
    [items, onUpdate, itemConfig]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updatedItems = items.filter(
        (item) => itemConfig.getKey(item) !== id
      );
      onUpdate(updatedItems);
    },
    [items, onUpdate, itemConfig]
  );

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Rendu des champs
  const renderField = useCallback(
    (field: FieldConfig, value: any, onChange: (value: any) => void) => {
      const commonProps = {
        value: value || '',
        onChange: (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => onChange(e.target.value),
        placeholder: field.placeholder,
        className: 'w-full',
      };

      switch (field.type) {
        case 'textarea':
          return <Textarea {...commonProps} rows={3} />;

        case 'date':
          return <Input {...commonProps} type='date' />;

        case 'email':
          return <Input {...commonProps} type='email' />;

        case 'url':
          return <Input {...commonProps} type='url' />;

        case 'select':
          return (
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Sélectionner...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        default:
          return <Input {...commonProps} type='text' />;
      }
    },
    []
  );

  // Composant de formulaire
  const ItemForm = ({
    item,
    onChange,
    onSave,
    onCancel,
    isNew = false,
  }: {
    item: T;
    onChange: (updates: Partial<T>) => void;
    onSave: () => void;
    onCancel: () => void;
    isNew?: boolean;
  }) => {
    const errors = validateItem(item);
    const hasErrors = errors.length > 0;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className='space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'
      >
        {hasErrors && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-700 font-medium mb-2'>
              Erreurs de validation :
            </p>
            <ul className='text-sm text-red-600 space-y-1'>
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {itemConfig.fields.map((field) => (
            <div
              key={field.key}
              className={field.type === 'textarea' ? 'md:col-span-2' : ''}
            >
              <Label
                htmlFor={field.key}
                className='text-sm font-medium text-gray-700'
              >
                {field.label}
                {field.required && <span className='text-red-500 ml-1'>*</span>}
              </Label>
              {renderField(field, item[field.key], (value) =>
                onChange({ [field.key]: value })
              )}
            </div>
          ))}
        </div>

        <div className='flex gap-2 pt-2'>
          <button
            onClick={onSave}
            disabled={hasErrors}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm'
          >
            <Save className='w-4 h-4' />
            {isNew ? 'Ajouter' : 'Sauvegarder'}
          </button>
          <button
            onClick={onCancel}
            className='flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm'
          >
            <X className='w-4 h-4' />
            Annuler
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`unified-editor ${className}`}>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <itemConfig.icon className='w-5 h-5 text-blue-600' />
              <CardTitle className='text-lg'>{itemConfig.title}</CardTitle>
              <Badge variant='secondary'>{items.length}</Badge>
            </div>

            {(!maxItems || items.length < maxItems) && (
              <button
                onClick={() => setIsAdding(true)}
                disabled={isAdding}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm'
              >
                <Plus className='w-4 h-4' />
                Ajouter
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className='space-y-3'>
          {/* Formulaire d'ajout */}
          <AnimatePresence>
            {isAdding && (
              <ItemForm
                item={newItem}
                onChange={(updates) =>
                  setNewItem((prev) => ({ ...prev, ...updates }))
                }
                onSave={handleAdd}
                onCancel={() => {
                  setIsAdding(false);
                  setNewItem(itemConfig.createNew());
                }}
                isNew={true}
              />
            )}
          </AnimatePresence>

          {/* Liste des éléments */}
          <div className='space-y-2'>
            {items.map((item, index) => {
              const itemId = itemConfig.getKey(item);
              const isEditing = editingId === itemId;
              const isExpanded = expandedItems.has(itemId);

              return (
                <motion.div
                  key={itemId}
                  layout
                  className='border border-gray-200 rounded-lg overflow-hidden'
                >
                  {/* En-tête de l'élément */}
                  <div className='flex items-center justify-between p-4 bg-gray-50'>
                    <div className='flex items-center gap-3 flex-1'>
                      {allowReorder && (
                        <GripVertical className='w-4 h-4 text-gray-400 cursor-grab' />
                      )}

                      <div className='flex-1'>
                        <p className='font-medium text-gray-900'>
                          {itemConfig.getDisplayText(item)}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {items.length > 1 && `Élément ${index + 1}`}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      {allowVisibility && (
                        <button
                          onClick={() =>
                            handleEdit(itemId, { visible: !item.visible })
                          }
                          className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors'
                        >
                          {item.visible ? (
                            <Eye className='w-4 h-4 text-green-600' />
                          ) : (
                            <EyeOff className='w-4 h-4 text-gray-400' />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => toggleExpanded(itemId)}
                        className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors'
                      >
                        {isExpanded ? (
                          <ChevronUp className='w-4 h-4' />
                        ) : (
                          <ChevronDown className='w-4 h-4' />
                        )}
                      </button>

                      <button
                        onClick={() => setEditingId(isEditing ? null : itemId)}
                        className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors'
                      >
                        <Edit2 className='w-4 h-4' />
                      </button>

                      <button
                        onClick={() => handleDelete(itemId)}
                        className='p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>

                  {/* Contenu de l'élément */}
                  <AnimatePresence>
                    {(isEditing || isExpanded) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className='overflow-hidden'
                      >
                        {isEditing ? (
                          <ItemForm
                            item={item}
                            onChange={(updates) => handleEdit(itemId, updates)}
                            onSave={() => setEditingId(null)}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <div className='p-4 space-y-3'>
                            {itemConfig.fields
                              .filter((field) => item[field.key])
                              .map((field) => (
                                <div key={field.key}>
                                  <Label className='text-sm font-medium text-gray-700'>
                                    {field.label}
                                  </Label>
                                  <p className='text-gray-900 mt-1'>
                                    {Array.isArray(item[field.key])
                                      ? item[field.key].join(', ')
                                      : item[field.key]}
                                  </p>
                                </div>
                              ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {items.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              <p>Aucun élément ajouté</p>
              <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
