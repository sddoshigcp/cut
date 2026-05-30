import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/types/database";

type DailyEntry = Database["public"]["Tables"]["daily_entries"]["Row"];
type WorkoutEntry = Database["public"]["Tables"]["workout_entries"]["Row"];

type DailyFeedRow = {
  id: string;
  entry_date: string;
  distance_miles: number | null;
  steps: number | null;
  protein_grams: number | null;
  profiles: { display_name: string } | null;
};

type WorkoutFeedRow = {
  id: string;
  workout_date: string;
  exercise: string;
  distance_miles: number | null;
  duration_minutes: number | null;
  calories: number | null;
  profiles: { display_name: string } | null;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const fetchCache = "force-no-store";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [dailyResponse, workoutResponse, todayResponse, profileResponse, dailyFeedResponse, workoutFeedResponse] =
    await Promise.all([
      supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(6),
      supabase
        .from("workout_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("workout_date", { ascending: false })
        .limit(6),
      supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", today)
        .maybeSingle(),
      supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      supabase
        .from("daily_entries")
        .select("id,entry_date,distance_miles,steps,protein_grams,user_id,profiles(display_name)")
        .order("entry_date", { ascending: false })
        .limit(4),
      supabase
        .from("workout_entries")
        .select("id,workout_date,exercise,distance_miles,duration_minutes,calories,user_id,profiles(display_name)")
        .order("workout_date", { ascending: false })
        .limit(4),
    ]);

  const dailyEntries = dailyResponse.data ?? [];
  const workoutEntries = workoutResponse.data ?? [];
  const todayEntry = todayResponse.data;
  const profile = profileResponse.data;
  const dailyFeed = (dailyFeedResponse.data ?? []) as DailyFeedRow[];
  const workoutFeed = (workoutFeedResponse.data ?? []) as WorkoutFeedRow[];

  const latestBodyweight = dailyEntries.find((entry) => entry.bodyweight_lbs != null)?.bodyweight_lbs;
  const latestDistance = dailyEntries.find((entry) => entry.distance_miles != null)?.distance_miles;
  const todaySteps = todayEntry?.steps ?? 0;
  const todayProtein = todayEntry?.protein_grams ?? 0;

  const feedItems = [
    ...dailyFeed.map((entry) => ({
      id: entry.id,
      type: "Daily",
      label: `${entry.profiles?.display_name ?? "Anonymous"} logged daily activity`,
      date: entry.entry_date,
      details: [
        entry.distance_miles ? `${entry.distance_miles.toFixed(2)} mi` : null,
        entry.steps ? `${entry.steps} steps` : null,
        entry.protein_grams ? `${entry.protein_grams}g protein` : null,
      ].filter(Boolean),
    })),
    ...workoutFeed.map((entry) => ({
      id: entry.id,
      type: "Workout",
      label: `${entry.profiles?.display_name ?? "Anonymous"} logged a workout`,
      date: entry.workout_date,
      details: [
        entry.exercise,
        entry.distance_miles ? `${entry.distance_miles.toFixed(2)} mi` : null,
        entry.duration_minutes ? `${entry.duration_minutes} min` : null,
        entry.calories ? `${entry.calories} kcal` : null,
      ].filter(Boolean),
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="grid gap-8">
      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {profile?.display_name ?? user.email}</CardTitle>
            <CardDescription>
              Your fitness dashboard with daily and workout tracking in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted p-4">
                <p className="text-sm text-muted-foreground">Latest bodyweight</p>
                <p className="mt-2 text-2xl font-semibold">
                  {latestBodyweight != null ? `${latestBodyweight.toFixed(1)} lbs` : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted p-4">
                <p className="text-sm text-muted-foreground">Today’s steps</p>
                <p className="mt-2 text-2xl font-semibold">{todaySteps}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted p-4">
                <p className="text-sm text-muted-foreground">Latest distance</p>
                <p className="mt-2 text-2xl font-semibold">
                  {latestDistance != null ? `${latestDistance.toFixed(2)} mi` : "—"}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/dailies">
                <Button className="w-full">Update daily log</Button>
              </Link>
              <Link href="/workouts">
                <Button variant="outline" className="w-full">
                  Log a workout
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shared Activity Feed</CardTitle>
            <CardDescription>Recent updates from the community.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No shared activity yet.</p>
            ) : (
              feedItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.details.join(" · ")}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent daily entries</CardTitle>
            <CardDescription>Your latest daily tracking history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No daily entries yet. Add today’s log.</p>
            ) : (
              dailyEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{formatDate(entry.entry_date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.steps ?? 0} steps · {entry.protein_grams ?? 0}g protein
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.distance_miles != null ? `${entry.distance_miles.toFixed(2)} mi` : "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent workouts</CardTitle>
            <CardDescription>Your most recent workout sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workoutEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workouts logged yet. Add a workout.</p>
            ) : (
              workoutEntries.map((workout) => (
                <div key={workout.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{workout.exercise}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(workout.workout_date)} · {workout.duration_minutes ?? "—"} min
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {workout.distance_miles != null ? `${workout.distance_miles.toFixed(2)} mi` : "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
