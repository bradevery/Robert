import NextAuth, { DefaultSession } from 'next-auth'; // eslint-disable-line unused-imports/no-unused-imports

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}
