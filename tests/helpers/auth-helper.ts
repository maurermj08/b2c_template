import { PrismaClient } from "@prisma/client";
import type { Page } from "@playwright/test";

const prisma = new PrismaClient();

/**
 * Create a test user and a valid session directly in the database.
 * This bypasses the magic link flow for tests that just need an authenticated user.
 * Returns the session token that can be set as a cookie.
 */
export async function createAuthenticatedUser(email: string, name?: string) {
  // Create or get the user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: name || null,
      emailVerified: new Date(),
    },
  });

  // Create a session that expires in 30 days
  const sessionToken = `test-session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  return { user, sessionToken };
}

/**
 * Set the auth session cookie on a Playwright page.
 */
export async function loginAsUser(page: Page, email: string, name?: string) {
  const { sessionToken } = await createAuthenticatedUser(email, name);

  // Set the session cookie
  await page.context().addCookies([
    {
      name: "authjs.session-token",
      value: sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  return sessionToken;
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
