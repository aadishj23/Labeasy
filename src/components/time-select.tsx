"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// 30-min slots from 07:00 to 20:00.
const SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = 7; h <= 20; h++) {
    for (const m of [0, 30]) {
      if (h === 20 && m === 30) break;
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
})();

function label12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ap}`;
}

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

export default function TimeSelect({
  value,
  onChange,
  date,
  disabled,
}: {
  value: string;
  onChange: (t: string) => void;
  date?: string; // yyyy-MM-dd of the chosen date (to hide past slots today)
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const now = new Date();
  const isToday = date === todayStr();
  const slots = SLOTS.filter((s) => {
    if (!isToday) return true;
    const [h, m] = s.split(":").map(Number);
    return h > now.getHours() || (h === now.getHours() && m > now.getMinutes());
  });

  return (
    <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-md border border-input bg-secondary/40 px-3 text-left text-sm transition-colors hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="h-4 w-4 shrink-0 text-primary" />
          {value ? label12h(value) : "Select time"}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-3">
        {slots.length === 0 ? (
          <p className="px-1 py-2 text-sm text-muted-foreground">
            No slots left for today — pick another date.
          </p>
        ) : (
          <div className="grid w-56 grid-cols-3 gap-1.5">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-xs transition-colors",
                  value === s
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border hover:bg-secondary"
                )}
              >
                {label12h(s)}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
