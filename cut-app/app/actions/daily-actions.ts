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

export async function upsertDailyEntry(formData: FormData) {
  const user = await requireUser();

  const entryDate = formData.get("entry_date")?.toString();
  if (!entryDate) {
    throw new Error("Entry date is required");
  }

  const dailyEntry: Database["public"]["Tables"]["daily_entries"]["Insert"] = {
    user_id: user.id,
    entry_date: entryDate,
    distance_miles: parseNumber(formData.get("distance_miles")),
    steps: parseInteger(formData.get("steps")),
    protein_grams: parseInteger(formData.get("protein_grams")),
    bodyweight_lbs: parseNumber(formData.get("bodyweight_lbs")),
    vitamin: formData.get("vitamin") === "on",
    protein_shake: formData.get("protein_shake") === "on",
    lift: formData.get("lift") === "on",
    softball: formData.get("softball") === "on",
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_entries")
    .upsert(dailyEntry, { onConflict: "user_id,entry_date" });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dailies");
  redirect(`/dailies?entry_date=${entryDate}`);
}
