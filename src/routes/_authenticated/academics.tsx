import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  ListChecks,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type {
  StudyPlanItem,
  SubjectAssignment,
  SubjectProject,
} from "@/lib/types";

export const Route = createFileRoute("/_authenticated/academics")({
  head: () => ({ meta: [{ title: "Academics — Scholar OS" }] }),
  component: AcademicsPage,
});

// ---------- Placeholder data (matches shapes in src/lib/types.ts) ----------

type SubjectCard = {
  id: string;
  name: string;
  code: string;
  credits: number;
  color: string;
  study_plan: StudyPlanItem[];
  assignment: SubjectAssignment & { title: string };
  project: SubjectProject & { title: string };
};

const subjects: SubjectCard[] = [
  {
    id: "1",
    name: "Database Management Systems",
    code: "CS-301",
    credits: 4,
    color: "from-indigo-500/20 to-violet-500/20",
    study_plan: [
      { topic: "ER Model & Relational Design", questionsStudied: 42, totalQuestions: 50 },
      { topic: "SQL & Joins", questionsStudied: 58, totalQuestions: 60 },
      { topic: "Normalization (1NF–BCNF)", questionsStudied: 18, totalQuestions: 40 },
      { topic: "Transactions & Concurrency", questionsStudied: 12, totalQuestions: 45 },
      { topic: "Indexing & Query Optimization", questionsStudied: 6, totalQuestions: 30 },
    ],
    assignment: {
      title: "Assignment 3 — Normalization Case Study",
      progress: 65,
      deadline: "2026-07-24",
      status: "in_progress",
    },
    project: {
      title: "Mini Project — Library DB",
      componentsRequired: [
        "ER diagram",
        "Schema (3NF)",
        "SQL scripts",
        "Stored procedures",
        "Report (10 pg)",
      ],
      reportProgress: 40,
      deadline: "2026-08-02",
      status: "in_progress",
    },
  },
  {
    id: "2",
    name: "Operating Systems",
    code: "CS-302",
    credits: 4,
    color: "from-emerald-500/20 to-teal-500/20",
    study_plan: [
      { topic: "Processes & Threads", questionsStudied: 32, totalQuestions: 40 },
      { topic: "CPU Scheduling", questionsStudied: 24, totalQuestions: 35 },
      { topic: "Memory Management", questionsStudied: 14, totalQuestions: 40 },
      { topic: "Deadlocks", questionsStudied: 10, totalQuestions: 25 },
      { topic: "File Systems", questionsStudied: 4, totalQuestions: 20 },
    ],
    assignment: {
      title: "Assignment 2 — Scheduling Simulator",
      progress: 30,
      deadline: "2026-07-28",
      status: "in_progress",
    },
    project: {
      title: "Shell Implementation in C",
      componentsRequired: [
        "Command parser",
        "Pipes & redirection",
        "Background jobs",
        "Signal handling",
        "Report",
      ],
      reportProgress: 20,
      deadline: "2026-08-10",
      status: "in_progress",
    },
  },
  {
    id: "3",
    name: "Computer Networks",
    code: "CS-303",
    credits: 3,
    color: "from-sky-500/20 to-cyan-500/20",
    study_plan: [
      { topic: "OSI & TCP/IP", questionsStudied: 28, totalQuestions: 30 },
      { topic: "Data Link Layer", questionsStudied: 20, totalQuestions: 30 },
      { topic: "Routing Algorithms", questionsStudied: 12, totalQuestions: 30 },
      { topic: "Transport Layer (TCP/UDP)", questionsStudied: 22, totalQuestions: 35 },
      { topic: "Application Layer", questionsStudied: 8, totalQuestions: 25 },
    ],
    assignment: {
      title: "Assignment 1 — Subnetting Worksheet",
      progress: 100,
      deadline: "2026-07-15",
      status: "submitted",
    },
    project: {
      title: "Packet Sniffer (Python)",
      componentsRequired: ["Raw sockets", "Protocol parsing", "UI dashboard", "Report"],
      reportProgress: 55,
      deadline: "2026-08-05",
      status: "in_progress",
    },
  },
  {
    id: "4",
    name: "Discrete Mathematics",
    code: "MA-201",
    credits: 3,
    color: "from-amber-500/20 to-orange-500/20",
    study_plan: [
      { topic: "Set Theory & Logic", questionsStudied: 40, totalQuestions: 45 },
      { topic: "Combinatorics", questionsStudied: 26, totalQuestions: 40 },
      { topic: "Graph Theory", questionsStudied: 18, totalQuestions: 35 },
      { topic: "Recurrence Relations", questionsStudied: 8, totalQuestions: 25 },
    ],
    assignment: {
      title: "Assignment 3 — Graph Coloring Problems",
      progress: 45,
      deadline: "2026-07-26",
      status: "in_progress",
    },
    project: {
      title: "Graph Algorithm Visualizer",
      componentsRequired: ["BFS/DFS", "Dijkstra", "MST", "UI", "Report"],
      reportProgress: 25,
      deadline: "2026-08-15",
      status: "in_progress",
    },
  },
  {
    id: "5",
    name: "Software Engineering",
    code: "CS-304",
    credits: 3,
    color: "from-rose-500/20 to-pink-500/20",
    study_plan: [
      { topic: "SDLC Models", questionsStudied: 20, totalQuestions: 25 },
      { topic: "Requirements Engineering", questionsStudied: 16, totalQuestions: 25 },
      { topic: "UML & Design", questionsStudied: 22, totalQuestions: 30 },
      { topic: "Testing Strategies", questionsStudied: 10, totalQuestions: 30 },
    ],
    assignment: {
      title: "Assignment 2 — SRS Document",
      progress: 80,
      deadline: "2026-07-22",
      status: "in_progress",
    },
    project: {
      title: "Team Project — Task Manager App",
      componentsRequired: ["SRS", "Design docs", "Code", "Test plan", "Final report"],
      reportProgress: 60,
      deadline: "2026-08-20",
      status: "in_progress",
    },
  },
  {
    id: "6",
    name: "Machine Learning",
    code: "CS-401",
    credits: 4,
    color: "from-fuchsia-500/20 to-purple-500/20",
    study_plan: [
      { topic: "Regression", questionsStudied: 25, totalQuestions: 30 },
      { topic: "Classification", questionsStudied: 20, totalQuestions: 35 },
      { topic: "Neural Networks", questionsStudied: 8, totalQuestions: 40 },
      { topic: "Unsupervised Learning", questionsStudied: 5, totalQuestions: 25 },
    ],
    assignment: {
      title: "Assignment 1 — Linear Regression from Scratch",
      progress: 55,
      deadline: "2026-07-30",
      status: "in_progress",
    },
    project: {
      title: "Image Classifier (CNN)",
      componentsRequired: ["Dataset prep", "Model", "Training", "Evaluation", "Report"],
      reportProgress: 15,
      deadline: "2026-08-25",
      status: "planned" as never,
    },
  },
];

// ---------- Helpers ----------

function subjectProgress(s: SubjectCard) {
  const totals = s.study_plan.reduce(
    (acc, t) => {
      acc.studied += t.questionsStudied;
      acc.total += t.totalQuestions;
      return acc;
    },
    { studied: 0, total: 0 },
  );
  return totals.total ? Math.round((totals.studied / totals.total) * 100) : 0;
}

function statusBadge(status?: string) {
  const map: Record<string, { label: string; className: string }> = {
    not_started: { label: "Not started", className: "bg-muted text-muted-foreground" },
    planned: { label: "Planned", className: "bg-muted text-muted-foreground" },
    in_progress: {
      label: "In progress",
      className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    submitted: {
      label: "Submitted",
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    graded: {
      label: "Graded",
      className: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    },
  };
  const s = map[status ?? "not_started"] ?? map.not_started;
  return <Badge className={cn("font-medium", s.className)}>{s.label}</Badge>;
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(d?: string | null) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

// ---------- Page ----------

function AcademicsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = useMemo(() => subjects.find((s) => s.id === openId) ?? null, [openId]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <GraduationCap className="h-6 w-6 text-primary" />
            Academics
          </h1>
          <p className="text-sm text-muted-foreground">
            Your subjects, study plans, assignments and projects — all in one view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{subjects.length} subjects</Badge>
          <Badge variant="secondary">
            {subjects.reduce((n, s) => n + s.credits, 0)} credits this sem
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => {
          const progress = subjectProgress(s);
          const dueSoon = daysUntil(s.assignment.deadline);
          return (
            <button
              key={s.id}
              onClick={() => setOpenId(s.id)}
              className="group text-left"
            >
              <Card className="relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40">
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none",
                    s.color,
                  )}
                />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardDescription className="text-xs font-mono">{s.code}</CardDescription>
                      <CardTitle className="text-lg leading-tight">{s.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="shrink-0 bg-background/60 backdrop-blur">
                      {s.credits} cr
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Study plan</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <ClipboardList className="h-3.5 w-3.5" />
                      Assignment {s.assignment.progress ?? 0}%
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        dueSoon !== null && dueSoon <= 3 && "text-destructive font-medium",
                      )}
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      {dueSoon === null
                        ? "—"
                        : dueSoon < 0
                          ? "Overdue"
                          : dueSoon === 0
                            ? "Due today"
                            : `${dueSoon}d left`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <DialogDescription className="font-mono text-xs">
                  {active.code} · {active.credits} credits
                </DialogDescription>
                <DialogTitle className="text-xl">{active.name}</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="study" className="mt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="study">
                    <BookOpen className="mr-1.5 h-4 w-4" /> Study Plan
                  </TabsTrigger>
                  <TabsTrigger value="assign">
                    <ClipboardList className="mr-1.5 h-4 w-4" /> Assignments
                  </TabsTrigger>
                  <TabsTrigger value="project">
                    <FolderKanban className="mr-1.5 h-4 w-4" /> Projects
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="study" className="mt-4 space-y-4">
                  {active.study_plan.map((t) => {
                    const pct = t.totalQuestions
                      ? Math.round((t.questionsStudied / t.totalQuestions) * 100)
                      : 0;
                    return (
                      <div key={t.topic} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{t.topic}</span>
                          <span className="text-muted-foreground">
                            {t.questionsStudied}/{t.totalQuestions} ·{" "}
                            <span className="font-semibold text-foreground">{pct}%</span>
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="assign" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{active.assignment.title}</CardTitle>
                        {statusBadge(active.assignment.status)}
                      </div>
                      <CardDescription className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Due {formatDate(active.assignment.deadline)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {active.assignment.progress ?? 0}%
                        </span>
                      </div>
                      <Progress value={active.assignment.progress ?? 0} className="h-2" />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="project" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{active.project.title}</CardTitle>
                        {statusBadge(active.project.status)}
                      </div>
                      <CardDescription className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Due {formatDate(active.project.deadline)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                          <ListChecks className="h-4 w-4 text-primary" />
                          Required components
                        </div>
                        <ul className="space-y-2">
                          {(active.project.componentsRequired ?? []).map((c, i) => (
                            <li key={c} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                id={`c-${i}`}
                                defaultChecked={
                                  i <
                                  Math.floor(
                                    ((active.project.reportProgress ?? 0) / 100) *
                                      (active.project.componentsRequired?.length ?? 0),
                                  )
                                }
                              />
                              <label htmlFor={`c-${i}`} className="cursor-pointer">
                                {c}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Target className="h-3.5 w-3.5" /> Report prep
                          </span>
                          <span className="font-semibold">
                            {active.project.reportProgress ?? 0}%
                          </span>
                        </div>
                        <Progress
                          value={active.project.reportProgress ?? 0}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
