const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user'); 
require('dotenv').config();

console.log(process.env.GOOGLE_CLIENT_ID)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope : ["profile", "email"]
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile._json.email;
        let user = await User.findOne({ email: email });
        if (!user) {
          user = new User({
            sm : 'google',
            smId: profile.id,
            name: profile.displayName,
            email: email,
            profile : profile._json.picture,
            isActive : true
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ?  profile.emails[0].value : '';
        let user = await User.findOne({ email: email });
        if (!user) {
          user = new User({
            sm : 'github',
            smId: profile.id,
            name: profile.displayName,
            email: email ,
            profile : profile._json.avatar_url,
            isActive : true
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        console.log(err)
        done(err, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      scope : ["profile"]
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ smId: profile.id });
        if (!user) {
          user = new User({
            sm : 'facebook',
            smId: profile.id,
            name: profile.displayName,
            emails: profile.emails.map(email => email.value),
            isActive : true
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        console.log(err)
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id); // Store the user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
