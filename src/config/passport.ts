import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter'; 
import prisma from '../config/db';
import { UserRole } from '../generated/prisma';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await prisma.account.findUnique({
          where: { email: profile.emails?.[0].value },
        });

        if (existingUser) {
          return done(null, existingUser);
        }
        const newUser = await prisma.account.create({
          data: {
            name: profile.displayName,
            email: profile.emails?.[0].value!,
            profilePicture: profile.photos?.[0].value,
            password: '',
            isVerified: true, 
            role: UserRole.USER,
          },
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails', 'picture.type(large)'],
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0].value;
            if (!email) {
                return done(new Error('Email not provided by Facebook'), false);
            }

            const existingUser = await prisma.account.findUnique({ where: { email } });
            if (existingUser) {
                return done(null, existingUser);
            }

            const newUser = await prisma.account.create({
                data: {
                    name: profile.displayName,
                    email: email,
                    profilePicture: profile.photos?.[0].value,
                    password: '',
                    isVerified: true,
                    role: UserRole.USER,
                },
            });
            return done(null, newUser);
        } catch (error) {
            return done(error, false);
        }
    }
  )
);

  passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY!,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET!,
      callbackURL: '/api/auth/twitter/callback',
      includeEmail: true, // Coba minta email
    },
    async (token, tokenSecret, profile, done) => {
        try {
            // Catatan: Twitter mungkin tidak memberikan email.
            // Anda mungkin perlu logika tambahan untuk menangani kasus ini,
            // misalnya, dengan meminta pengguna memasukkan email secara manual setelah login.
            const email = profile.emails?.[0].value;
            if (!email) {
                return done(new Error('Email not provided by Twitter. Please ensure your app has the correct permissions.'), false);
            }
            
            // Logika findOrCreate sama seperti sebelumnya
            const existingUser = await prisma.account.findUnique({ where: { email } });
            if (existingUser) {
                return done(null, existingUser);
            }

            const newUser = await prisma.account.create({
                data: {
                    name: profile.displayName,
                    email: email,
                    profilePicture: profile.photos?.[0].value.replace('_normal', ''), // Dapatkan gambar resolusi lebih tinggi
                    password: '',
                    isVerified: true,
                    role: UserRole.USER,
                },
            });
            return done(null, newUser);
        } catch (error) {
            return done(error, false);
        }
    }
  )
);
