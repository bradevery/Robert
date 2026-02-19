import { render } from '@react-email/components';
import { createElement } from 'react';
import { Resend } from 'resend';

import CandidateInvitation from '@/emails/CandidateInvitation';
import ResetPassword from '@/emails/ResetPassword';
import VerifyEmail from '@/emails/VerifyEmail';

const FROM = 'DcBuilder <no-reply@dcbuilder.fr>';

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
  const html = await render(createElement(VerifyEmail, { name, url }));

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'Vérifiez votre adresse email - DcBuilder',
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  const html = await render(createElement(ResetPassword, { name, url }));

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'Réinitialisation du mot de passe - DcBuilder',
    html,
  });
}

export async function sendCandidateInvitationEmail(
  email: string,
  name: string,
  token: string,
  dossierTitle?: string
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/invitation?token=${token}`;
  const html = await render(
    createElement(CandidateInvitation, { name, url, dossierTitle })
  );

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'Vous êtes invité(e) sur DcBuilder',
    html,
  });
}
