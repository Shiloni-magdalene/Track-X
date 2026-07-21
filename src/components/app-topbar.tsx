import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Search, Settings, User as UserIcon, CalendarDays, AlertCircle, Linkedin } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";
import { supabase } from "@/integrations/supabase/client";

type NotifKind = "exam" | "deadline" | "linkedin";
type Notif = { id: string; title: string; sub: string; daysLeft: number; kind: NotifKind };

type Prefs = {
  exams: boolean;
  deadlines: boolean;
  linkedin: boolean;
  windowDays: number;
};

const PREFS_KEY = "notif-prefs-v1";
const DEFAULT_PREFS: Prefs = { exams: true, deadlines: true, linkedin: true, windowDays: 14 };

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function AppTopbar({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [allNotifs, setAllNotifs] = useState<Notif[]>([]);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const updatePrefs = (patch: Partial<Prefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      try {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [examRes, projRes, liRes] = await Promise.all([
        supabase.from("exams").select("id, type, date, subjects(name)"),
        supabase.from("projects").select("id, name, deadline, status"),
        supabase.from("linkedin_tracker").select("id, type, next_post_idea, updated_at"),
      ]);
      const now = Date.now();
      const daysFrom = (d: string) => Math.ceil((new Date(d).getTime() - now) / 86400000);
      const list: Notif[] = [];
      for (const e of (examRes.data ?? []) as any[]) {
        if (!e.date) continue;
        const dl = daysFrom(e.date);
        if (dl < 0) continue;
        list.push({ id: `e-${e.id}`, kind: "exam", title: e.subjects?.name || "Exam", sub: e.type || "Exam", daysLeft: dl });
      }
      for (const p of (projRes.data ?? []) as any[]) {
        if (!p.deadline || p.status === "completed") continue;
        const dl = daysFrom(p.deadline);
        if (dl < 0) continue;
        list.push({ id: `p-${p.id}`, kind: "deadline", title: p.name, sub: "Project deadline", daysLeft: dl });
      }
      for (const l of (liRes.data ?? []) as any[]) {
        if (!l.next_post_idea) continue;
        list.push({
          id: `l-${l.id}`,
          kind: "linkedin",
          title: l.next_post_idea,
          sub: `LinkedIn ${l.type || "post"} idea`,
          daysLeft: 0,
        });
      }
      list.sort((a, b) => a.daysLeft - b.daysLeft);
      setAllNotifs(list);
    })();
  }, [user]);

  const notifs = useMemo(
    () =>
      allNotifs.filter((n) => {
        if (n.kind === "exam" && !prefs.exams) return false;
        if (n.kind === "deadline" && !prefs.deadlines) return false;
        if (n.kind === "linkedin" && !prefs.linkedin) return false;
        if (n.kind !== "linkedin" && n.daysLeft > prefs.windowDays) return false;
        return true;
      }),
    [allNotifs, prefs],
  );

  const name =
    (user?.user_metadata?.name as string | undefined) ??
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    "Student";
  const initials = name
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const routeFor = (kind: NotifKind) =>
    kind === "exam" ? "/exams" : kind === "deadline" ? "/projects" : "/placements";
  const iconFor = (kind: NotifKind) =>
    kind === "exam" ? <CalendarDays className="h-4 w-4" /> : kind === "deadline" ? <AlertCircle className="h-4 w-4" /> : <Linkedin className="h-4 w-4" />;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger />

      <div className="relative ml-1 hidden max-w-md flex-1 items-center sm:flex">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search subjects, skills, projects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="h-4 w-4" />
              {notifs.length > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
                  {notifs.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {showSettings ? "Choose what to show" : `Upcoming (next ${prefs.windowDays} days)`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Notification settings"
                onClick={() => setShowSettings((s) => !s)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {showSettings ? (
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="notif-exams" className="flex flex-col gap-0.5">
                    <span className="text-sm">Upcoming exams</span>
                    <span className="text-xs text-muted-foreground">CAT, practical, end-sem</span>
                  </Label>
                  <Switch id="notif-exams" checked={prefs.exams} onCheckedChange={(v) => updatePrefs({ exams: v })} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="notif-deadlines" className="flex flex-col gap-0.5">
                    <span className="text-sm">Project deadlines</span>
                    <span className="text-xs text-muted-foreground">Active projects only</span>
                  </Label>
                  <Switch id="notif-deadlines" checked={prefs.deadlines} onCheckedChange={(v) => updatePrefs({ deadlines: v })} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="notif-linkedin" className="flex flex-col gap-0.5">
                    <span className="text-sm">LinkedIn updates</span>
                    <span className="text-xs text-muted-foreground">Next post ideas</span>
                  </Label>
                  <Switch id="notif-linkedin" checked={prefs.linkedin} onCheckedChange={(v) => updatePrefs({ linkedin: v })} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Time window</Label>
                    <span className="text-xs text-muted-foreground">{prefs.windowDays} days</span>
                  </div>
                  <Slider
                    min={1}
                    max={60}
                    step={1}
                    value={[prefs.windowDays]}
                    onValueChange={(v) => updatePrefs({ windowDays: v[0] ?? 14 })}
                  />
                </div>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up 🎉</p>
                ) : (
                  notifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => navigate({ to: routeFor(n.kind) })}
                      className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/50"
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                        {iconFor(n.kind)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{n.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{n.sub}</p>
                      </div>
                      {n.kind !== "linkedin" && (
                        <Badge
                          variant="outline"
                          className={
                            n.daysLeft <= 2
                              ? "shrink-0 border-destructive/30 bg-destructive/15 text-destructive text-[10px]"
                              : n.daysLeft <= 7
                                ? "shrink-0 border-warning/30 bg-warning/15 text-warning-foreground text-[10px]"
                                : "shrink-0 text-[10px]"
                          }
                        >
                          {n.daysLeft}d
                        </Badge>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Profile">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-brand text-xs font-semibold text-primary-foreground">
                  {initials || <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="truncate text-sm font-medium">{name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
