"use client";

import { useId, useState } from "react";

export function DateSelector({
  date,
  label,
}: {
  date: string;
  label?: string;
}) {
  const id = useId();
  const [value, setValue] = useState(date);

  return (
    <form action="/dailies" method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
      <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label ?? "Entry date"}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          name="entry_date"
          type="date"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            event.currentTarget.form?.requestSubmit();
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Load
        </button>
      </div>
    </form>
  );
}
