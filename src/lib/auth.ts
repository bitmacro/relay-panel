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
    jwt({ token, account }) {
      // Use GitHub numeric ID (providerAccountId) for API auth; token.sub is internal UUID
      if (account?.providerAccountId) {
        token.providerUserId = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id =
          (token.providerUserId as string) ?? token.sub ?? undefined;
      }
      return session;
    },
  },
});
