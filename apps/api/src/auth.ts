import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma"; //connects better auth to prisma
import { prisma } from "./db"; //used to run db queries

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {  
        enabled: true
    }
});
