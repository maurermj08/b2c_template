import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getMagicLinkForEmail(
  email: string,
  timeout = 10000
): Promise<string> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const token = await prisma.verificationToken.findFirst({
      where: { identifier: email },
      orderBy: { expires: "desc" },
    });

    if (token) {
      const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const params = new URLSearchParams({
        callbackUrl: "/dashboard",
        token: token.token,
        email: email,
      });
      return `${baseUrl}/api/auth/callback/email?${params}`;
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  throw new Error(
    `No verification token found for ${email} after ${timeout}ms`
  );
}

export async function cleanupTestUser(email: string) {
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.session.deleteMany({ where: { user: { email } } });
  await prisma.account.deleteMany({ where: { user: { email } } });
  await prisma.user.deleteMany({ where: { email } });
}

export async function cleanup() {
  await prisma.verificationToken.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
}
