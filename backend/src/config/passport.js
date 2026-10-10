import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();

        if (!email) {
          return done(
            new Error("Google account does not provide an email")
          );
        }

        let user = await User.findOne({
          email,
        }).select("+password");

        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.name?.givenName || "Google User",
            email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || "",
            authProvider: "google",
          });

        } else {
          user.googleId = profile.id;

          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }

          if (user.password) {
            user.authProvider = "both";
          } else {
            user.authProvider = "google";
          }

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;