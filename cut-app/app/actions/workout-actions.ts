"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/types/database";

function parseNumber(value: FormDataEntryValue | null, decimals = 2) {
  if (!value) return null;
  const parsed = parseFloat(value.toString());
  if (Number.isNaN(parsed)) return null;
  return Number(parsed.toFixed(decimals));
}

function parseInteger(value: FormDataEntryValue | null) {
  if (!value) return null;
  const parsed = parseInt(value.toString(), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function createWorkoutEntry(formData: FormData) {
  const user = await requireUser();

  const workoutDate = formData.get("workout_date")?.toString();
  const exercise = formData.get("exercise")?.toString();

  if (!workoutDate || !exercise) {
    throw new Error("Date and exercise are required");
  }

  const workoutEntry: Database["public"]["Tables"]["workout_entries"]["Insert"] = {
    user_id: user.id,
    workout_date: workoutDate,
    exercise,
    weight_lbs: parseNumber(formData.get("weight_lbs")),
    reps: parseInteger(formData.get("reps")),
    distance_miles: parseNumber(formData.get("distance_miles")),
    duration_minutes: parseInteger(formData.get("duration_minutes")),
    calories: parseInteger(formData.get("calories")),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("workout_entries").insert(workoutEntry);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/workouts");
  redirect("/workouts");
}
