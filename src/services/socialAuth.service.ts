import { prisma } from '../config/prisma';

const _findOrCreateUser = async (provider: string, profile: any, emailExtractor: (p: any) => string, photoExtractor: (p: any) => string | null) => {
    const existingUser = await prisma.user.findUnique({
        where: { provider_providerId: { provider, providerId: profile.id } },
    });
    if (existingUser) return existingUser;

    const email = emailExtractor(profile);
    if (!email) throw new Error(`Email tidak ditemukan dari profil ${provider}.`);
    
    const userByEmail = await prisma.user.findUnique({ where: { email } });
    if (userByEmail) throw new Error('Email sudah terdaftar dengan metode lain.');

    return prisma.user.create({
        data: {
            email,
            fullName: profile.displayName,
            provider,
            providerId: profile.id,
            role: 'USER',
            verified: true,
            profilePicture: photoExtractor(profile),
        },
    });
};

export const SocialAuthService = {
    findOrCreateGoogleUser: async (profile: any) => {
        return _findOrCreateUser(
            'google',
            profile,
            p => p.emails[0].value,
            p => p.photos[0].value
        );
    },

    findOrCreateFacebookUser: async (profile: any) => {
        return _findOrCreateUser(
            'facebook',
            profile,
            p => p.emails?.[0]?.value,
            p => p.photos?.[0]?.value ?? null
        );
    },

    findOrCreateTwitterUser: async (profile: any) => {
        return _findOrCreateUser(
            'twitter',
            profile,
            p => p.emails?.[0]?.value,
            p => p.photos?.[0]?.value.replace('_normal', '') ?? null
        );
    },
};