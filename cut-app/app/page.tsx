import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const fetchCache = "force-no-store";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-10 p-5">
        <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Shared fitness tracker</p>
            <h1 className="text-4xl font-semibold sm:text-5xl">Track workouts, habits, and daily progress.</h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Sign in to add daily entries, log workouts, and follow recent activity from your community.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="default">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/sign-up">Create account</Link>
              </Button>
            </div>
            <AuthButton />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>See your recent activity, stats, and community feed.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Daily Log</CardTitle>
              <CardDescription>Enter steps, protein, distance, and bodyweight for each day.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Workout Log</CardTitle>
              <CardDescription>Save exercises, weights, duration, calories, and distance.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
