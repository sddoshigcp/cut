import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkoutEntry } from "@/app/actions/workout-actions";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/types/database";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const fetchCache = "force-no-store";

export default async function WorkoutsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: workouts } = await supabase
    .from("workout_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("workout_date", { ascending: false })
    .limit(8);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Workout log</CardTitle>
          <CardDescription>Save workouts and track your progress.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form action={createWorkoutEntry} className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="workout_date">Workout date</Label>
                <Input id="workout_date" name="workout_date" type="date" defaultValue={today} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exercise">Exercise</Label>
                <Input id="exercise" name="exercise" required defaultValue="" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="weight_lbs">Weight (lbs)</Label>
                <Input id="weight_lbs" name="weight_lbs" type="number" step="0.01" defaultValue="" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reps">Reps</Label>
                <Input id="reps" name="reps" type="number" step="1" defaultValue="" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="distance_miles">Distance (mi)</Label>
                <Input id="distance_miles" name="distance_miles" type="number" step="0.01" defaultValue="" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration_minutes">Duration (min)</Label>
                <Input id="duration_minutes" name="duration_minutes" type="number" step="1" defaultValue="" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="calories">Calories</Label>
                <Input id="calories" name="calories" type="number" step="1" defaultValue="" />
              </div>
              <div className="flex items-end justify-end">
                <Button type="submit">Add workout</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent workout history</CardTitle>
          <CardDescription>Review the work you&apos;ve logged recently.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {workouts?.length ? (
            workouts.map((workout) => (
              <div key={workout.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{workout.exercise}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(workout.workout_date)} · {workout.reps ?? "—"} reps
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {workout.distance_miles != null && `${workout.distance_miles.toFixed(2)} mi`}
                    {workout.calories != null ? ` · ${workout.calories} kcal` : ""}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No workouts logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
