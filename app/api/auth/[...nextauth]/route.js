import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      authorization: {
        params: {
          scope: "public_profile email", // Ensure only basic permissions are requested
        },
      },
    }),
  ],
  debug: true,
  pages: {
    error: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
