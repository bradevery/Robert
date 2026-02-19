'use client';

import { Building2, FolderOpen, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { ClientStatusBadge } from '@/components/ui/status-indicator';

import type { Client } from '@/stores/clients-store';

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
  className?: string;
}

export function ClientCard({ client, onClick, className }: ClientCardProps) {
  const primaryContact =
    client.contacts.find((c) => c.isPrimary) || client.contacts[0];

  return (
    <Link
      href={`/mes-clients/${client.id}`}
      onClick={onClick}
      className={cn(
        'block p-5 bg-white border border-gray-100 rounded-2xl transition-all duration-200 hover:shadow-md hover:border-gray-200 group',
        className
      )}
    >
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl'>
            <Building2 className='w-6 h-6 text-indigo-500' />
          </div>
          <div>
            <h3 className='font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors'>
              {client.name}
            </h3>
            <p className='text-sm text-gray-500'>{client.sector}</p>
          </div>
        </div>
        <ClientStatusBadge status={client.status} />
      </div>

      {primaryContact && (
        <div className='mb-4 p-3 bg-gray-50 rounded-xl'>
          <p className='text-sm font-medium text-gray-900 mb-1'>
            {primaryContact.name}
          </p>
          <p className='text-xs text-gray-500'>{primaryContact.role}</p>
          <div className='flex items-center gap-4 mt-2 text-xs text-gray-500'>
            {primaryContact.email && (
              <span className='flex items-center gap-1'>
                <Mail className='w-3 h-3' />
                {primaryContact.email}
              </span>
            )}
            {primaryContact.phone && (
              <span className='flex items-center gap-1'>
                <Phone className='w-3 h-3' />
                {primaryContact.phone}
              </span>
            )}
          </div>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5 text-sm text-gray-500'>
          <FolderOpen className='w-4 h-4' />
          <span>
            {client.projects.length} projet
            {client.projects.length !== 1 ? 's' : ''}
          </span>
        </div>
        {client.tags.length > 0 && (
          <div className='flex gap-1'>
            {client.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className='px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded'
              >
                {tag}
              </span>
            ))}
            {client.tags.length > 2 && (
              <span className='px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded'>
                +{client.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

interface ClientListProps {
  clients: Client[];
  className?: string;
}

export function ClientList({ clients, className }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full'>
          <Building2 className='w-8 h-8 text-gray-400' />
        </div>
        <h3 className='text-lg font-medium text-gray-900'>Aucun client</h3>
        <p className='mt-1 text-sm text-gray-500'>
          Commencez par ajouter votre premier client
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}
