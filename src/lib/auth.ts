import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    jwt({ token, account, profile }) {
      // Use GitHub numeric ID (providerAccountId) for API auth; token.sub is internal UUID
      if (account?.providerAccountId) {
        token.providerUserId = account.providerAccountId;
      }
      if (profile && typeof profile === "object" && "login" in profile) {
        const login = (profile as { login?: string }).login;
        if (typeof login === "string") token.githubLogin = login;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id =
          (token.providerUserId as string) ?? token.sub ?? undefined;
        const gl = token.githubLogin;
        if (typeof gl === "string") {
          (session.user as { githubLogin?: string }).githubLogin = gl;
        }
      }
      return session;
    },
  },
});
