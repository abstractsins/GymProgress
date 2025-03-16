import NextAuth, { DefaultSession } from "next-auth";



declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      authToken: string;
    } & DefaultSession["user"]; 
  }

  interface User {
    id: string;
    username: string;
    authToken: string;
  }
}
