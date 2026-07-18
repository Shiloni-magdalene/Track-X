import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Award,
  Brain,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Code2,
  Flame,
  GraduationCap,
  Linkedin,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Scholar OS" }],
  }),
  component: Dashboard,
});

// ---------- Placeholder data (matches schema shapes in src/lib/types.ts) ----------

const weeklyGoals = [
  { day: "Mon", planned: 5, completed: 4.5 },
  { day: "Tue", planned: 6, completed: 6 },
  { day: "Wed", planned: 4, completed: 3 },
  { day: "Thu", planned: 5, completed: 5.5 },
  { day: "Fri", planned: 6, completed: 4 },
  { day: "Sat", planned: 7, completed: 6 },
  { day: "Sun", planned: 3, completed: 2 },
];

type TaskCategory = "Academics" | "Coding" | "Aptitude" | "Placement";
type Task = { id: string; title: string; category: TaskCategory; done: boolean };

const seedTasks: Task[] = [
  { id: "1", title: "Revise DBMS normalization notes", category: "Academics", done: false },
  { id: "2", title: "Solve 3 LeetCode medium problems", category: "Coding", done: false },
  { id: "3", title: "Complete Quant mock — Time & Work", category: "Aptitude", done: true },
  { id: "4", title: "Update resume with new certificate", category: "Placement", done: false },
  { id: "5", title: "Read OS scheduling algorithms", category: "Academics", done: false },
];

const recentActivity = [
  {
    id: "a1",
    icon: Code2,
    title: "Solved 'Two Sum II' on LeetCode",
    time: "2h ago",
    tone: "primary" as const,
  },
  {
    id: "a2",
    icon: Brain,
    title: "Aptitude mock — 82% accuracy",
    time: "5h ago",
    tone: "success" as const,
  },
  {
    id: "a3",
    icon: GraduationCap,
    title: "Submitted DBMS assignment",
    time: "Yesterday",
    tone: "primary" as const,
  },
  {
    id: "a4",
    icon: Award,
    title: "Added 'Google Cloud Fundamentals' certificate",
    time: "2d ago",
    tone: "warning" as const,
  },
  {
    id: "a5",
    icon: Linkedin,
    title: "Posted project update on LinkedIn",
    time: "3d ago",
    tone: "primary" as const,
  },
];

const upcomingDeadlines = [
  { id: "d1", name: "Mini Project — Report Draft", due: "In 1 day", daysLeft: 1 },
  { id: "d2", name: "OS Assignment — Scheduling", due: "In 3 days", daysLeft: 3 },
  { id: "d3", name: "Portfolio site v2 ship", due: "In 6 days", daysLeft: 6 },
  { id: "d4", name: "Internship application — Acme", due: "In 12 days", daysLeft: 12 },
];

const upcomingExams = [
  { id: "e1", subject: "DBMS", type: "CAT" as const, date: "Jul 22", daysLeft: 4 },
  { id: "e2", subject: "maths", type: "Unit Test" as const, date: "Jul 25", daysLeft: 7 },
  { id: "e3", subject: "Physics Lab", type: "Practical" as const, date: "Jul 28", daysLeft: 10 },
  { id: "e4", subject: "Data Structures", type: "EndSem" as const, date: "Aug 05", daysLeft: 18 },
];

// ---------- Small building blocks ----------

function CircularProgress({
  value,
  size = 96,
  stroke = 10,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--muted)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tracking-tight">{value}%</span>
        {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

const cardHover =
  "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5";

function urgencyVariant(days: number): {
  label: string;
  className: string;
} {
  if (days <= 2) return { label: "Urgent", className: "bg-destructive/15 text-destructive border-destructive/30" };
  if (days <= 7) return { label: "Soon", className: "bg-warning/15 text-warning-foreground border-warning/30" };
  return { label: "Upcoming", className: "bg-muted text-muted-foreground border-border" };
}

const categoryTone: Record<TaskCategory, string> = {
  Academics: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  Coding: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  Aptitude: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  Placement: "bg-chart-5/15 text-chart-5 border-chart-5/30",
};

const toneRing: Record<"primary" | "success" | "warning", string> = {
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
};

// ---------- Widgets ----------

function CircularStatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card className={cardHover}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <CircularProgress value={value} />
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function NumericStatCard({
  icon: Icon,
  label,
  value,
  suffix,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  suffix?: string;
  hint: string;
  accent: "warning" | "success";
}) {
  return (
    <Card className={cardHover}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            accent === "warning" ? "bg-warning/20 text-warning-foreground" : "bg-success/15 text-success",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium text-popover-foreground">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.fill }}
          />
          <span className="capitalize">{p.dataKey}</span>
          <span className="ml-auto font-medium text-popover-foreground">{p.value}h</span>
        </div>
      ))}
    </div>
  );
}

function WeeklyGoalsChart() {
  return (
    <Card className={cn(cardHover, "lg:col-span-2")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Weekly Goals Progress
        </CardTitle>
        <CardDescription>Planned vs. completed study hours this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyGoals} barGap={4}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltip />} />
              <Bar dataKey="planned" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="completed" fill="var(--chart-2)" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chart-1" /> Planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chart-2" /> Completed
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function TodaysTasks() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const toggle = (id: string) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const done = tasks.filter((t) => t.done).length;

  return (
    <Card className={cardHover}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Today's Tasks
        </CardTitle>
        <CardDescription>
          {done}/{tasks.length} completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {tasks.map((task) => (
          <label
            key={task.id}
            className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/50"
          >
            <Checkbox checked={task.done} onCheckedChange={() => toggle(task.id)} />
            <span
              className={cn(
                "flex-1 text-sm",
                task.done && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </span>
            <Badge variant="outline" className={cn("shrink-0 text-[10px]", categoryTone[task.category])}>
              {task.category}
            </Badge>
          </label>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  return (
    <Card className={cardHover}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest wins</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l border-border pl-5">
          {recentActivity.map((a) => {
            const Icon = a.icon;
            return (
              <li key={a.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[30px] grid h-6 w-6 place-items-center rounded-full ring-4 ring-background",
                    toneRing[a.tone],
                  )}
                >
                  <Icon className="h-3 w-3" />
                </span>
                <p className="text-sm font-medium leading-tight">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.time}</p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function UpcomingDeadlines() {
  return (
    <Card className={cardHover}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          Upcoming Deadlines
        </CardTitle>
        <CardDescription>Projects & assignments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {upcomingDeadlines.map((d, i) => {
          const u = urgencyVariant(d.daysLeft);
          return (
            <div key={d.id}>
              {i > 0 && <Separator className="my-1" />}
              <div className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/50">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.due}</p>
                </div>
                <Badge variant="outline" className={cn("shrink-0 text-[10px]", u.className)}>
                  {u.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function UpcomingExams() {
  return (
    <Card className={cardHover}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Upcoming Exams
        </CardTitle>
        <CardDescription>Next tests on your calendar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {upcomingExams.map((e, i) => {
          const u = urgencyVariant(e.daysLeft);
          return (
            <div key={e.id}>
              {i > 0 && <Separator className="my-1" />}
              <div className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/50">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.subject}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">
                      {e.type}
                    </Badge>
                    <span>{e.date}</span>
                  </div>
                </div>
                <Badge variant="outline" className={cn("shrink-0 text-[10px]", u.className)}>
                  {e.daysLeft}d
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ---------- Page ----------

function Dashboard() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-2xl bg-gradient-brand p-6 text-primary-foreground shadow-glow sm:p-8">
        <p className="text-sm/6 opacity-80">Welcome back 👋</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Your placement readiness starts today
        </h1>
        <p className="mt-2 max-w-2xl text-sm/6 opacity-90">
          Track academics, aptitude, projects, coding and placement prep — all in one intelligent
          workspace.
        </p>
      </section>

      {/* Row 1 — Quick stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CircularStatCard
          icon={TrendingUp}
          label="Academic Progress"
          value={68}
          hint="Across 6 active subjects"
        />
        <CircularStatCard
          icon={Target}
          label="Placement Readiness"
          value={54}
          hint="Skills, coding & aptitude"
        />
        <NumericStatCard
          icon={Flame}
          label="Coding Streak"
          value={12}
          suffix="days"
          hint="Keep going — personal best is 18"
          accent="warning"
        />
        <NumericStatCard
          icon={Brain}
          label="Aptitude Accuracy"
          value="76"
          suffix="%"
          hint="Last 5 mock tests average"
          accent="success"
        />
      </section>

      {/* Row 2 — Chart + Tasks + Activity */}
      <section className="grid gap-4 lg:grid-cols-3">
        <WeeklyGoalsChart />
        <div className="flex flex-col gap-4">
          <TodaysTasks />
          <RecentActivity />
        </div>
      </section>

      {/* Row 3 — Alerts */}
      <section className="grid gap-4 lg:grid-cols-2">
        <UpcomingDeadlines />
        <UpcomingExams />
      </section>
    </div>
  );
}
