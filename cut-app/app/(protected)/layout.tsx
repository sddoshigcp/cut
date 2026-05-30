import { AppNav } from "@/components/app-nav";

export const fetchCache = "force-no-store";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppNav />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-8">
        {children}
      </div>
    </main>
  );
}
