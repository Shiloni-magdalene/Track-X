import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  Briefcase,
  Code2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Scholar OS" }],
  }),
  component: Dashboard,
});

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  progress,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  progress?: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {progress !== undefined && <Progress value={progress} className="mt-3 h-2" />}
        {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-2xl bg-gradient-brand p-6 text-primary-foreground shadow-glow sm:p-8">
        <p className="text-sm/6 opacity-80">Welcome back 👋</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Your placement readiness starts today
        </h1>
        <p className="mt-2 max-w-2xl text-sm/6 opacity-90">
          Track academics, aptitude, projects, coding and placement prep — all in one
          intelligent workspace.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Academic Progress"
          value="0%"
          progress={0}
          hint="Add subjects to start tracking"
        />
        <StatCard
          icon={Briefcase}
          label="Placement Readiness"
          value="0%"
          progress={0}
          hint="Skills + coding + aptitude"
        />
        <StatCard icon={Code2} label="LeetCode Solved" value="0" hint="Log your first problem" />
        <StatCard icon={Brain} label="Aptitude Accuracy" value="—" hint="Take a mock to begin" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              This Week
            </CardTitle>
            <CardDescription>Upcoming exams, deadlines and revisions</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Nothing scheduled yet. Add subjects and exams from the Academics section.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>Personalized suggestions</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            AI insights will appear here once you have data to analyze.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
