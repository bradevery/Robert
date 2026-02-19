import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import prismadb from '@/lib/prisma.db';

import { authConfig } from '@/auth.config';
import loginLocales from '@/locales/loginLocales';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prismadb),
  providers: [
    ...authConfig.providers,
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(loginLocales.fr.invalidCredentials);
        }

        const user = await prismadb.user.findUnique({
          where: {
            email: (credentials.email as string).toLowerCase(),
          },
        });

        if (!user) {
          throw new Error(loginLocales.fr.accountNotFound);
        }

        if (user.password) {
          const passwordMatch = await compare(
            credentials.password as string,
            user.password
          );
          if (!passwordMatch) {
            throw new Error(loginLocales.fr.invalidCredentials);
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      const dbUser = await prismadb.user.findFirst({
        where: {
          email: user.email ?? undefined,
        },
      });

      if (account?.provider === 'linkedin' || account?.provider === 'google') {
        return true;
      }

      if (
        account?.provider !== 'linkedin' &&
        account?.provider !== 'google' &&
        dbUser?.emailVerified
      ) {
        return true;
      }

      return false;
    },
  },
});
