'use client';

import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useOnboarding, useOnboardingStore } from '@/hooks/use-onboarding';
import { useOnboardingApi } from '@/hooks/useOnboardingApi';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const ROLES = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'editor', label: 'Éditeur' },
  { value: 'viewer', label: 'Lecteur' },
];

interface Invitation {
  id: string;
  email: string;
  role: string;
}

export default function InviteTeamPage() {
  const { nextStep, prevStep, skipStep } = useOnboarding();
  const { setStep, setInvitations } = useOnboardingStore();
  const { inviteTeam } = useOnboardingApi();
  const [invitations, setLocalInvitations] = useState<Invitation[]>([
    { id: '1', email: '', role: 'editor' },
  ]);

  const isLoading = inviteTeam.isPending;

  // Set step on mount
  useEffect(() => {
    setStep(4);
  }, [setStep]);

  const addInvitation = () => {
    setLocalInvitations([
      ...invitations,
      { id: crypto.randomUUID(), email: '', role: 'editor' },
    ]);
  };

  const removeInvitation = (id: string) => {
    if (invitations.length > 1) {
      setLocalInvitations(invitations.filter((inv) => inv.id !== id));
    }
  };

  const updateInvitation = (
    id: string,
    field: 'email' | 'role',
    value: string
  ) => {
    setLocalInvitations(
      invitations.map((inv) =>
        inv.id === id ? { ...inv, [field]: value } : inv
      )
    );
  };

  const handleSubmit = async () => {
    // Filter out empty emails
    const validInvitations = invitations.filter(
      (inv) => inv.email.trim() && inv.email.includes('@')
    );

    if (validInvitations.length === 0) {
      skipStep();
      return;
    }

    try {
      // Save to store
      setInvitations(
        validInvitations.map((inv) => ({ email: inv.email, role: inv.role }))
      );

      // Send invitations
      await inviteTeam.mutateAsync(validInvitations);

      toast.success(`${validInvitations.length} invitation(s) envoyée(s)`);
      nextStep();
    } catch {
      toast.error("Erreur lors de l'envoi des invitations");
    }
  };

  return (
    <div>
      <div className='mb-8 text-center'>
        <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full'>
          <Users className='w-8 h-8 text-green-600' />
        </div>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>
          Invitez votre équipe
        </h1>
        <p className='text-gray-600'>
          Ajoutez des collaborateurs pour travailler ensemble
        </p>
      </div>

      <Card className='border-gray-100 shadow-xl'>
        <CardContent className='p-8'>
          <div className='space-y-4'>
            {invitations.map((invitation, _index) => (
              <div key={invitation.id} className='flex gap-3'>
                <div className='flex-1'>
                  <Input
                    type='email'
                    placeholder='email@exemple.com'
                    className='h-12 rounded-xl'
                    value={invitation.email}
                    onChange={(e) =>
                      updateInvitation(invitation.id, 'email', e.target.value)
                    }
                  />
                </div>
                <select
                  className='h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[140px]'
                  value={invitation.role}
                  onChange={(e) =>
                    updateInvitation(invitation.id, 'role', e.target.value)
                  }
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {invitations.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-12 w-12 text-gray-400 hover:text-red-500 rounded-xl'
                    onClick={() => removeInvitation(invitation.id)}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type='button'
              variant='outline'
              className='w-full gap-2 h-12 rounded-xl'
              onClick={addInvitation}
            >
              <Plus className='w-4 h-4' />
              Ajouter un collaborateur
            </Button>
          </div>

          {/* Navigation */}
          <div className='flex justify-between pt-8'>
            <Button
              type='button'
              variant='outline'
              className='gap-2 rounded-xl'
              onClick={prevStep}
            >
              <ArrowLeft className='w-4 h-4' />
              Retour
            </Button>

            <div className='flex gap-3'>
              <Button
                type='button'
                variant='ghost'
                className='text-gray-500'
                onClick={skipStep}
              >
                Passer
              </Button>

              <Button
                className='gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl'
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <>
                    Envoyer les invitations
                    <ArrowRight className='w-4 h-4' />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
