"use client";

import { useEffect, useState } from "react";
import { CLINIC } from "@/data";
import { cn } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Current weekday + minute of day in the clinic's time zone, independent of the visitor's device zone. */
function clinicNow(): { day: number; min: number } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: CLINIC.timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, min: Number(get("hour")) * 60 + Number(get("minute")) };
}

function fmt(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

export function getOpenStatus(): { open: boolean; label: string; soon: boolean } {
  const { day, min } = clinicNow();
  const [start, end] = CLINIC.schedule[day];
  if (min >= start && min < end) {
    const soon = end - min <= 30;
    return { open: true, soon, label: soon ? `Closing soon · until ${fmt(end)}` : `Open now · until ${fmt(end)}` };
  }
  if (min < start) return { open: false, soon: false, label: `Closed · opens at ${fmt(start)} today` };
  const next = (day + 1) % 7;
  return { open: false, soon: false, label: `Closed · opens tomorrow (${DAYS[next]}) at ${fmt(CLINIC.schedule[next][0])}` };
}

export default function OpenStatus({ className }: { className?: string }) {
  const [status, setStatus] = useState<ReturnType<typeof getOpenStatus> | null>(null);
  useEffect(() => {
    const tick = () => setStatus(getOpenStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  if (!status) return <span className={cn("inline-block h-7 w-40 animate-pulse rounded-full bg-slate-100", className)} aria-hidden />;
  return (
    <span role="status" data-testid="open-status-badge" data-open={status.open}
      className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        status.open ? (status.soon ? "border-amber-300 bg-amber-50 text-amber-800" : "border-emerald-300 bg-emerald-50 text-emerald-800") : "border-[#a00000]/25 bg-[#fbeaea] text-[#7d0000]", className)}>
      <span className="relative flex size-2">
        {status.open && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />}
        <span className={cn("relative inline-flex size-2 rounded-full", status.open ? (status.soon ? "bg-amber-500" : "bg-emerald-500") : "bg-[#a00000]")} />
      </span>
      {status.label}
    </span>
  );
}
