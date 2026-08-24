import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      username: string;
      fullName: string;
      role: string;
      department?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    fullName?: string;
    role?: string;
    department?: string | null;
  }
}
