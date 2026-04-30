import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { prisma } from "./db";
export const auth = betterAuth({
    trustedOrigins: ["http://localhost:3000"],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [bearer()],
    emailAndPassword: {
        enabled: true
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());
                    if (adminEmails.includes(user.email)) {
                        return {
                            data: {
                                ...user,
                                role: "ADMIN"
                            }
                        };
                    }
                    return { data: user };
                }
            }
        },
        session: {
            create: {
                before: async (session) => {
                    // Check if user should be promoted on sign in
                    const user = await prisma.user.findUnique({ where: { id: session.userId } });
                    if (user && user.role !== 'ADMIN') {
                        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());
                        if (adminEmails.includes(user.email)) {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { role: 'ADMIN' }
                            });
                        }
                    }
                    return { data: session };
                }
            }
        }
    },
    user: {
        additionalFields: {
            role: { type: "string" },
            title: { type: "string" },
            bio: { type: "string" },
            college: { type: "string" },
            city: { type: "string" },
            linkedinUrl: { type: "string" },
            githubUrl: { type: "string" },
        }
    }
});
