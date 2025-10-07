
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: 'INSTRUCTOR' | 'STUDENT';
    }
  }

  interface User {
    role: 'INSTRUCTOR' | 'STUDENT';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'INSTRUCTOR' | 'STUDENT';
  }
}
