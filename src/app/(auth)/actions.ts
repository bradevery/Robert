'use server';

import { AuthError } from 'next-auth';

import { signIn } from '@/auth';

export async function authenticate(
  email: string,
  password: string,
  redirectTo: string
) {
  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email ou mot de passe incorrect' };
    }
    // Re-throw non-auth errors (NEXT_REDIRECT, etc.)
    throw error;
  }
}
