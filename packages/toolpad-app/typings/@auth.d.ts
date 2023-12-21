export declare module '@auth/core/types' {
  interface User {
    roles: string[];
  }

  interface Session {
    user: {
      roles: string[];
    };
  }
}

export declare module '@auth/core/jwt' {
  interface JWT {
    roles: string[];
  }
}
