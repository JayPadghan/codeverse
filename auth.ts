import NextAuth from 'next-auth';
import {PrismaAdapter} from '@auth/prisma-adapter';
import { db } from './lib/db';
import authConfig from './auth.config';
import { getAccountByUserId, getUserById } from './features/auth/actions';

export const {auth, handlers, signIn, signOut} = NextAuth({
    callbacks:{ 
        
        async signIn({user, account, profile}){
            if(!user || !account) return false;

            const existingUser = await db.user.findUnique({
                where:{email:user.email!},
            });

            if(!existingUser){
                // Create a new user if they don't exist
                const newUser = await db.user.create({
                    data:{
                        email: user.email!,
                        name: user.name,
                        image: user.image,

                        accounts: {
                            // @ts-ignore
                            create: {
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                refreshToken: account.refresh_token,
                                accessToken: account.access_token,
                                expiresAt: account.expires_at,
                                tokenType: account.token_type,
                                scope: account.scope,
                                idToken: account.id_token,
                                sessionState: account.session_state,
                            },
                        },
                    },
                });

                if(!newUser) {
                    return false; // User creation failed
                }
            }
            else{
                const existingAccount = await db.account.findUnique({
                    where: {
                        provider_providerAccountId: {
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                        },
                    },
                })

                if(!existingAccount){
                    // Create a new account if it doesn't exist
                    await db.account.create({
                        data: {
                            userId: existingUser.id,
                            type: account.type,
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                            accessToken: account.access_token,
                            refreshToken: account.refresh_token,
                            expiresAt: account.expires_at,
                            tokenType: account.token_type,
                            scope: account.scope,
                            idToken: account.id_token,
                            // @ts-ignore
                            sessionState: account.session_state,
                        },
                    });
                }
            }

            return true; // Sign in successful
        },

        async jwt({token, user, account}){
            if(!token.sub) return token;

            const existingUser = await getUserById(token.sub);

            if(!existingUser) return token;

            const existingAccount = await getAccountByUserId(existingUser.id);

            token.name = existingUser.name;
            token.email = existingUser.email;
            token.role = existingUser.role;

            return token;
        },

        async session({session, token}){
            if(token.sub && session.user){
                session.user.id= token.sub;
            }

            if(token.sub && session.user){
                session.user.role = token.role
            }

            return session;
        }
    },
    secret: process.env.AUTH_SECRET,
    adapter: PrismaAdapter(db),
    session: {strategy: 'jwt'},
    ...authConfig
});


