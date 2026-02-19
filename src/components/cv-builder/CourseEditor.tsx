'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BookOpen, Edit, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { CVItem, useCVStore } from '@/stores/cv-store-unified';

interface CourseItem extends CVItem {
  title: string;
  description: string;
}

export const CourseEditor: React.FC = () => {
  const { cv, addItem, updateItem, removeItem } = useCVStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const createNewCourse = (): CourseItem => ({
    id: `course_${Date.now()}`,
    title: '',
    description: '',
    visible: true,
  });

  const [newCourse, setNewCourse] = useState<CourseItem>(createNewCourse());

  if (!cv) return null;

  const courses = (cv.data.sections.courses?.items || []) as CourseItem[];

  const handleAdd = () => {
    if (newCourse.title) {
      addItem('courses', newCourse);
      setNewCourse(createNewCourse());
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, updatedCourse: Partial<CourseItem>) => {
    updateItem('courses', id, updatedCourse);
  };

  const handleDelete = (id: string) => {
    removeItem('courses', id);
  };

  const CourseForm = ({
    course,
    onChange,
    onSave,
    onCancel,
  }: {
    course: CourseItem;
    onChange: (field: string, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => (
    <div className='p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Titre du cours / Formation *
        </label>
        <input
          type='text'
          value={course.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Ex: Formation React Avancé...'
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Institution / Description
        </label>
        <textarea
          value={course.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          placeholder='Détails sur la formation...'
        />
      </div>

      <div className='flex gap-2 pt-2'>
        <button
          onClick={onSave}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500'
        >
          Annuler
        </button>
      </div>
    </div>
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <BookOpen className='w-5 h-5 text-blue-600' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Formations & Cours
          </h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <Plus className='w-4 h-4' />
          Ajouter
        </button>
      </div>

      {isAdding && (
        <CourseForm
          course={newCourse}
          onChange={(field, value) =>
            setNewCourse({ ...newCourse, [field]: value })
          }
          onSave={handleAdd}
          onCancel={() => {
            setIsAdding(false);
            setNewCourse(createNewCourse());
          }}
        />
      )}

      <div className='space-y-4'>
        {courses.map((item: CourseItem) => (
          <div
            key={item.id}
            className='border border-gray-200 rounded-lg p-4 bg-white'
          >
            {editingId === item.id ? (
              <CourseForm
                course={item}
                onChange={(field, value) =>
                  handleEdit(item.id, { [field]: value })
                }
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className='flex items-start justify-between'>
                <div>
                  <h4 className='font-semibold text-gray-900'>{item.title}</h4>
                  <p className='text-gray-700 text-sm mt-1'>
                    {item.description}
                  </p>
                </div>
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => setEditingId(item.id)}
                    className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md'
                  >
                    <Edit className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {courses.length === 0 && !isAdding && (
          <div className='text-center py-8 text-gray-500'>
            <BookOpen className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p>Aucun cours ajouté</p>
            <p className='text-sm'>Cliquez sur "Ajouter" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
};
