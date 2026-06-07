"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BellRing,
  Plus,
  Trash2,
  RefreshCw,
  CalendarClock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const INTERVALS = [
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "12 months", days: 365 },
];

export default function RemindersSection() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [testName, setTestName] = useState("");
  const [days, setDays] = useState(180);
  const [adding, setAdding] = useState(false);

  const load = () =>
    fetch("/api/v1/reminders", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { reminders: [], suggestedTests: [] }))
      .then((d) => {
        setReminders(d.reminders || []);
        setSuggested(d.suggestedTests || []);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!testName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/v1/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_name: testName.trim(), interval_days: days }),
      });
      if (res.ok) {
        setTestName("");
        load();
      }
    } finally {
      setAdding(false);
    }
  };

  const reschedule = async (id: string) => {
    await fetch(`/api/v1/reminders/${id}`, { method: "PATCH" });
    load();
  };
  const remove = async (id: string) => {
    await fetch(`/api/v1/reminders/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return null;

  return (
    <div className="mt-12">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <BellRing className="h-5 w-5 text-primary" /> Re-test reminders
      </h2>

      {/* Add form */}
      <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-card p-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Test
          </label>
          <input
            list="reminder-tests"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g. Lipid Profile"
            className="h-10 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <datalist id="reminder-tests">
            {suggested.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Repeat every
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-10 rounded-md border border-input bg-secondary/40 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {INTERVALS.map((i) => (
              <option key={i.days} value={i.days}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <Button variant="gradient" onClick={add} disabled={adding || !testName.trim()}>
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add
        </Button>
      </div>

      {/* List */}
      {reminders.length > 0 && (
        <div className="mt-3 space-y-2">
          {reminders.map((r) => {
            const overdue = new Date(r.due_at) <= new Date();
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.test_name}</span>
                    {overdue ? (
                      <Badge variant="destructive">Due now</Badge>
                    ) : (
                      <Badge variant="secondary">
                        Due {new Date(r.due_at).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="h-3 w-3" /> Every{" "}
                    {Math.round(r.interval_days / 30)} months
                  </p>
                </div>
                <div className="flex gap-1">
                  {overdue && (
                    <Button asChild size="sm" variant="gradient">
                      <Link href="/tests">Book again</Link>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => reschedule(r.id)}
                    title="Reschedule to next cycle"
                  >
                    <RefreshCw className="h-4 w-4" /> Done
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(r.id)}
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
