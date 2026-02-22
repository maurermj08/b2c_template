import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: { host: "smtp.example.com", port: 587, auth: { user: "not-used", pass: "not-used" } },
      from: process.env.EMAIL_FROM || "noreply@example.com",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        if (process.env.NODE_ENV !== "production") {
          console.log(`\n✉️  Magic link for ${email}:\n${url}\n`);
          return;
        }
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: "Your sign-in link",
          html: `
            <div style="max-width: 400px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
              <h2 style="margin-bottom: 16px;">Sign in to your account</h2>
              <p style="margin-bottom: 24px; color: #555;">Click the button below to sign in. This link expires in 24 hours.</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px; font-size: 16px;">Sign in</a>
              <p style="margin-top: 24px; font-size: 14px; color: #555;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
    error: "/auth-error",
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
