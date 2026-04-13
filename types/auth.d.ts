// auth.d.ts
declare module "#auth-utils" {
  interface User {
    login: string;
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  }

  interface UserSession {
    // Add your own fields
    user: User;
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {};
