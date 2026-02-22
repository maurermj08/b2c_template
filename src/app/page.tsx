import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Sparkles } from "lucide-react";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "My App";

const features = [
  {
    icon: Zap,
    title: "Feature One",
    description: "Customize this feature for your specific use case. Build something your users will love.",
  },
  {
    icon: Shield,
    title: "Feature Two",
    description: "Customize this feature for your specific use case. Reliable and secure by default.",
  },
  {
    icon: Sparkles,
    title: "Feature Three",
    description: "Customize this feature for your specific use case. Designed with simplicity in mind.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Welcome to {appName}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground">
              A simple, beautiful app designed for you. Get started in seconds &mdash; no password required.
            </p>
            <div className="mt-10">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <h2 className="text-center text-3xl font-bold text-foreground">
              Everything you need
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg text-muted-foreground">
              Built with care to give you the best experience.
            </p>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-background p-8 text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <feature.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-base text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
