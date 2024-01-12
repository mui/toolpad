export declare module '@auth/core/types' {
  interface User {
    roles: string[];
  }
  interface Profile {
    verifiedEmails?: string[];
  }
}
export declare module '@auth/core/jwt' {
  interface JWT {
    roles: string[];
  }
}
