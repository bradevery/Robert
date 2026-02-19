import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import LinkedIn from 'next-auth/providers/linkedin';

export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 2592000,
    updateAge: 86400,
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/',
    error: '/error',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email.toLowerCase(),
          image: profile.picture,
        };
      },
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID ?? '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
      authorization: { params: { scope: 'profile email openid' } },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email.toLowerCase(),
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ user, token }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
