import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Search, User as UserIcon, CalendarDays, AlertCircle } from "lucide-react";
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
import { ThemeToggle } from "./theme-toggle";
import { supabase } from "@/integrations/supabase/client";

type Notif = { id: string; title: string; sub: string; daysLeft: number; kind: "exam" | "deadline" };

export function AppTopbar({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [notifs, setNotifs] = useState<Notif[]>([]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [examRes, projRes] = await Promise.all([
        supabase.from("exams").select("id, type, date, subjects(name)"),
        supabase.from("projects").select("id, name, deadline, status"),
      ]);
      const now = Date.now();
      const daysFrom = (d: string) => Math.ceil((new Date(d).getTime() - now) / 86400000);
      const list: Notif[] = [];
      for (const e of (examRes.data ?? []) as any[]) {
        if (!e.date) continue;
        const dl = daysFrom(e.date);
        if (dl < 0 || dl > 14) continue;
        list.push({ id: `e-${e.id}`, kind: "exam", title: e.subjects?.name || "Exam", sub: e.type || "Exam", daysLeft: dl });
      }
      for (const p of (projRes.data ?? []) as any[]) {
        if (!p.deadline || p.status === "completed") continue;
        const dl = daysFrom(p.deadline);
        if (dl < 0 || dl > 14) continue;
        list.push({ id: `p-${p.id}`, kind: "deadline", title: p.name, sub: "Project deadline", daysLeft: dl });
      }
      list.sort((a, b) => a.daysLeft - b.daysLeft);
      setNotifs(list);
    })();
  }, [user]);

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
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
            3
          </Badge>
        </Button>
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
