import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { ReadWritingApp } from "@/components/readwriting/readwriting-app";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <ReadWritingApp />
      </main>
      <PublicFooter />
    </div>
  );
}
