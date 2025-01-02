import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

 const authOptions = {
  // Configure one or more authentication providers
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET,
      version: "2.0", // opt-in to Twitter OAuth 2.0
    }),
    // ...add more providers here
  ],
};

// export default NextAuth(authOptions);
