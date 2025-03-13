import CredentialsProvider from "next-auth/providers/credentials";

import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

interface CustomToken extends JWT {
    id: number;
    username: string;
    authToken: string;
}

interface User {
    id: number;
    username: string;
    authToken: string;
}

interface CustomSession extends Session {
    user: User;
}

const server = process.env.NEXT_PUBLIC_BACKEND || `http://localhost:5000`;

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const res = await fetch(`${server}/api/login`, {
                        method: "POST",
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" },
                    });

                    if (!res.ok) {
                        throw new Error("Invalid credentials");
                    }

                    const user = await res.json();
                    if (!user || !user.id || !user.token) {
                        throw new Error("User authentication failed");
                    }

                    return {
                        id: user.id,
                        username: user.username,
                        authToken: user.token,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/",
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 60 * 60 * 24,
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {

        async jwt({ token, user }: { token: CustomToken; user?: User }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.authToken = user.authToken;
            }
            return token;
        },

        async session({ session, token }: { session: CustomSession; token: CustomToken }) {
            if (token) {
                session.user = {
                    id: token.id,
                    username: token.username,
                    authToken: token.authToken,
                };
            return session;
        },
    },
};
