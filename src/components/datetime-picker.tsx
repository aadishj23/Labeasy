"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
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

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

function label12h(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ap}`;
}

// Date-only values are parsed as local (avoids UTC off-by-one); datetime uses ISO.
function parseValue(value: string, withTime: boolean): Date | undefined {
  if (!value) return undefined;
  if (!withTime && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  /** future = disable past (scheduling), past = disable future (DOB), all = no limit */
  variant?: "future" | "past" | "all";
  placeholder?: string;
};

export default function DateTimePicker({
  value,
  onChange,
  withTime = false,
  variant = "all",
  placeholder,
}: Props) {
  const initial = parseValue(value, withTime);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(initial);
  const [time, setTime] = useState<string>(
    initial && withTime ? format(initial, "HH:mm") : ""
  );

  const today = startOfToday();
  const disabled =
    variant === "future"
      ? { before: today }
      : variant === "past"
        ? { after: today }
        : undefined;
  const dropdown = variant === "past"; // DOB-style year/month dropdowns

  const emit = (d: Date | undefined, t: string) => {
    if (!d) return;
    if (withTime) {
      if (!t) return;
      const [h, m] = t.split(":").map(Number);
      const out = new Date(d);
      out.setHours(h, m, 0, 0);
      onChange(out.toISOString());
    } else {
      onChange(format(d, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  const now = new Date();
  const isToday = date && now.toDateString() === date.toDateString();
  const slotDisabled = (slot: string) => {
    if (!isToday) return false;
    const [h, m] = slot.split(":").map(Number);
    return h < now.getHours() || (h === now.getHours() && m <= now.getMinutes());
  };

  const display = date
    ? withTime
      ? time
        ? `${format(date, "EEE, d MMM yyyy")} · ${label12h(time)}`
        : format(date, "EEE, d MMM yyyy")
      : format(date, "d MMM yyyy")
    : placeholder || (withTime ? "Pick a date & time" : "Pick a date");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-md border border-input bg-secondary/40 px-3 text-left text-sm transition-colors hover:bg-secondary/60",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{display}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Calendar
          mode="single"
          captionLayout={dropdown ? "dropdown" : "label"}
          startMonth={dropdown ? new Date(1920, 0) : undefined}
          endMonth={dropdown ? today : undefined}
          defaultMonth={date ?? (dropdown ? new Date(2000, 0) : undefined)}
          selected={date}
          onSelect={(d) => {
            setDate(d);
            if (d) emit(d, time);
          }}
          disabled={disabled}
        />
        {withTime && (
          <div className="border-t border-border p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Time
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {SLOTS.map((s) => {
                const dis = slotDisabled(s);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={dis}
                    onClick={() => {
                      setTime(s);
                      emit(date, s);
                      if (date) setOpen(false);
                    }}
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-xs transition-colors",
                      time === s
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border hover:bg-secondary",
                      dis &&
                        "cursor-not-allowed opacity-40 hover:bg-transparent"
                    )}
                  >
                    {label12h(s)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
