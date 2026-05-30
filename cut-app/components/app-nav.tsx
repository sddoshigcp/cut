import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AppNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="w-full border-b border-border bg-background/60 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight"
          >
            Cut Fitness
          </Link>
          <nav className="hidden items-center gap-3 text-sm md:flex">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/dailies" className="text-muted-foreground hover:text-foreground">
              Daily Log
            </Link>
            <Link href="/workouts" className="text-muted-foreground hover:text-foreground">
              Workouts
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">
                {user.email}
              </span>
              <Link href="/dashboard" className="hidden md:inline-block">
                <Button size="sm" variant="outline">
                  Dashboard
                </Button>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild size="sm" variant="default">
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
