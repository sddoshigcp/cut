import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateSelector } from "@/components/date-selector";
import { upsertDailyEntry } from "@/app/actions/daily-actions";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/types/database";

const formatDate = (value: string) => value;

export const fetchCache = "force-no-store";

export default async function DailiesPage({
  searchParams,
}: {
  // `searchParams` may be a Promise in this Next version — await it below.
  searchParams: any;
}) {
  const user = await requireUser();
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const selectedDate = resolvedSearchParams?.entry_date ?? new Date().toISOString().slice(0, 10);

  const [entryResponse, recentResponse] = await Promise.all([
    supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("entry_date", selectedDate)
      .maybeSingle(),
    supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false })
      .limit(6),
  ]);

  const entry = entryResponse.data;
  const recentEntries = recentResponse.data ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Daily tracker</CardTitle>
          <CardDescription>
            Log steps, protein, distance and bodyweight for your daily activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <DateSelector date={selectedDate} />
          <form action={upsertDailyEntry} className="grid gap-6">
            <input type="hidden" name="entry_date" value={selectedDate} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="distance_miles">Distance (mi)</Label>
                <Input
                  id="distance_miles"
                  name="distance_miles"
                  type="number"
                  step="0.01"
                  defaultValue={entry?.distance_miles ?? ""}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="steps">Steps</Label>
                <Input
                  id="steps"
                  name="steps"
                  type="number"
                  step="1"
                  defaultValue={entry?.steps ?? ""}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="protein_grams">Protein (g)</Label>
                <Input
                  id="protein_grams"
                  name="protein_grams"
                  type="number"
                  step="1"
                  defaultValue={entry?.protein_grams ?? ""}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bodyweight_lbs">Bodyweight (lbs)</Label>
                <Input
                  id="bodyweight_lbs"
                  name="bodyweight_lbs"
                  type="number"
                  step="0.01"
                  defaultValue={entry?.bodyweight_lbs ?? ""}
                  placeholder="0.0"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="vitamin"
                  defaultChecked={entry?.vitamin ?? false}
                  className="h-4 w-4 rounded border-input text-primary"
                />
                Vitamin
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="protein_shake"
                  defaultChecked={entry?.protein_shake ?? false}
                  className="h-4 w-4 rounded border-input text-primary"
                />
                Protein shake
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="lift"
                  defaultChecked={entry?.lift ?? false}
                  className="h-4 w-4 rounded border-input text-primary"
                />
                Lift
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="softball"
                  defaultChecked={entry?.softball ?? false}
                  className="h-4 w-4 rounded border-input text-primary"
                />
                Softball
              </label>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Button type="submit">Save daily entry</Button>
              <p className="text-sm text-muted-foreground">
                {entry ? "Updates existing entry." : "Creates a new entry."}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent daily entries</CardTitle>
          <CardDescription>Review your last six log entries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No daily history yet.</p>
          ) : (
            recentEntries.map((log) => (
              <div key={log.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{formatDate(log.entry_date)}</p>
                  <span className="text-sm text-muted-foreground">
                    {log.distance_miles != null ? `${log.distance_miles.toFixed(2)} mi` : "—"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {log.steps ?? 0} steps · {log.protein_grams ?? 0}g protein
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
