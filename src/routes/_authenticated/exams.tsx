import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardCheck,
  FlaskConical,
  GraduationCap,
  Target,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/exams")({
  head: () => ({ meta: [{ title: "Exams — Scholar OS" }] }),
  component: ExamsPage,
});

// ---------- Placeholder data ----------

type CATRow = {
  id: string;
  subject: string;
  type: "CAT-1" | "CAT-2" | "Unit Test";
  date: string;
  marks: number | null;
  target: number;
  syllabus: number;
  revision: number;
  weakTopics: string[];
};

type PracticalRow = {
  id: string;
  subject: string;
  date: string;
  expCompletion: number;
  recordStatus: "pending" | "in_progress" | "complete";
  vivaPrep: number;
  marks: number | null;
};

type EndSemRow = {
  id: string;
  subject: string;
  date: string;
  syllabus: number;
  mockTests: number;
  confidence: "low" | "medium" | "high";
};

type SemesterData = {
  id: string;
  label: string;
  active?: boolean;
  cats: CATRow[];
  practicals: PracticalRow[];
  endSem: EndSemRow[];
};

const semesters: SemesterData[] = [
  {
    id: "sem-6",
    label: "Semester 6 (Current)",
    active: true,
    cats: [
      {
        id: "1",
        subject: "DBMS",
        type: "CAT-1",
        date: "2026-07-24",
        marks: null,
        target: 45,
        syllabus: 72,
        revision: 55,
        weakTopics: ["Normalization", "Concurrency"],
      },
      {
        id: "2",
        subject: "Operating Systems",
        type: "CAT-1",
        date: "2026-07-26",
        marks: null,
        target: 42,
        syllabus: 60,
        revision: 40,
        weakTopics: ["Deadlocks", "Paging"],
      },
      {
        id: "3",
        subject: "Computer Networks",
        type: "Unit Test",
        date: "2026-07-18",
        marks: 38,
        target: 45,
        syllabus: 100,
        revision: 80,
        weakTopics: ["Routing"],
      },
      {
        id: "4",
        subject: "Discrete Maths",
        type: "CAT-1",
        date: "2026-07-29",
        marks: null,
        target: 40,
        syllabus: 55,
        revision: 30,
        weakTopics: ["Graph Theory", "Recurrences"],
      },
    ],
    practicals: [
      {
        id: "p1",
        subject: "DBMS Lab",
        date: "2026-08-04",
        expCompletion: 80,
        recordStatus: "in_progress",
        vivaPrep: 55,
        marks: null,
      },
      {
        id: "p2",
        subject: "OS Lab",
        date: "2026-08-06",
        expCompletion: 65,
        recordStatus: "pending",
        vivaPrep: 30,
        marks: null,
      },
      {
        id: "p3",
        subject: "Networks Lab",
        date: "2026-08-08",
        expCompletion: 90,
        recordStatus: "complete",
        vivaPrep: 70,
        marks: null,
      },
    ],
    endSem: [
      {
        id: "e1",
        subject: "DBMS",
        date: "2026-08-22",
        syllabus: 62,
        mockTests: 2,
        confidence: "medium",
      },
      {
        id: "e2",
        subject: "Operating Systems",
        date: "2026-08-24",
        syllabus: 48,
        mockTests: 1,
        confidence: "low",
      },
      {
        id: "e3",
        subject: "Computer Networks",
        date: "2026-08-26",
        syllabus: 85,
        mockTests: 3,
        confidence: "high",
      },
      {
        id: "e4",
        subject: "Discrete Maths",
        date: "2026-08-28",
        syllabus: 40,
        mockTests: 0,
        confidence: "low",
      },
      {
        id: "e5",
        subject: "Software Engineering",
        date: "2026-08-30",
        syllabus: 70,
        mockTests: 2,
        confidence: "medium",
      },
    ],
  },
  {
    id: "sem-5",
    label: "Semester 5",
    cats: [
      {
        id: "5a",
        subject: "Data Structures",
        type: "CAT-1",
        date: "2026-01-20",
        marks: 44,
        target: 45,
        syllabus: 100,
        revision: 100,
        weakTopics: [],
      },
      {
        id: "5b",
        subject: "Data Structures",
        type: "CAT-2",
        date: "2026-03-15",
        marks: 41,
        target: 45,
        syllabus: 100,
        revision: 100,
        weakTopics: ["AVL Trees"],
      },
      {
        id: "5c",
        subject: "Theory of Computation",
        type: "CAT-1",
        date: "2026-01-22",
        marks: 35,
        target: 40,
        syllabus: 100,
        revision: 100,
        weakTopics: ["Turing Machines"],
      },
    ],
    practicals: [
      {
        id: "5p1",
        subject: "DS Lab",
        date: "2026-04-05",
        expCompletion: 100,
        recordStatus: "complete",
        vivaPrep: 100,
        marks: 47,
      },
    ],
    endSem: [
      {
        id: "5e1",
        subject: "Data Structures",
        date: "2026-05-02",
        syllabus: 100,
        mockTests: 4,
        confidence: "high",
      },
      {
        id: "5e2",
        subject: "Theory of Computation",
        date: "2026-05-06",
        syllabus: 100,
        mockTests: 3,
        confidence: "medium",
      },
    ],
  },
];

// ---------- Helpers ----------

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function urgency(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "Past", className: "bg-muted text-muted-foreground" };
  if (diff <= 3)
    return { label: `${diff}d`, className: "bg-destructive/15 text-destructive" };
  if (diff <= 10)
    return {
      label: `${diff}d`,
      className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    };
  return {
    label: `${diff}d`,
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  };
}

function recordBadge(status: PracticalRow["recordStatus"]) {
  const map = {
    pending: { label: "Pending", className: "bg-destructive/15 text-destructive" },
    in_progress: {
      label: "In progress",
      className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    complete: {
      label: "Done",
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
  } as const;
  const s = map[status];
  return <Badge className={cn("font-medium", s.className)}>{s.label}</Badge>;
}

function confidenceBadge(c: EndSemRow["confidence"]) {
  const map = {
    low: { label: "Low", className: "bg-destructive/15 text-destructive" },
    medium: {
      label: "Medium",
      className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    high: {
      label: "High",
      className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
  } as const;
  const s = map[c];
  return <Badge className={cn("font-medium", s.className)}>{s.label}</Badge>;
}

// ---------- Page ----------

function ExamsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Exams
          </h1>
          <p className="text-sm text-muted-foreground">
            CATs, unit tests, practicals and end-sem — grouped by semester.
          </p>
        </div>
      </header>

      <Accordion
        type="multiple"
        defaultValue={semesters.filter((s) => s.active).map((s) => s.id)}
        className="space-y-3"
      >
        {semesters.map((sem) => (
          <AccordionItem
            key={sem.id}
            value={sem.id}
            className="rounded-lg border bg-card px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between pr-3">
                <span className="flex items-center gap-2 text-base font-semibold">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {sem.label}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary">{sem.cats.length} tests</Badge>
                  <Badge variant="secondary">{sem.practicals.length} practicals</Badge>
                  <Badge variant="secondary">{sem.endSem.length} end-sem</Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Tabs defaultValue="cat" className="mt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="cat">
                    <Target className="mr-1.5 h-4 w-4" /> CAT / Unit Tests
                  </TabsTrigger>
                  <TabsTrigger value="prac">
                    <FlaskConical className="mr-1.5 h-4 w-4" /> Practicals
                  </TabsTrigger>
                  <TabsTrigger value="end">
                    <CalendarDays className="mr-1.5 h-4 w-4" /> End Semester
                  </TabsTrigger>
                </TabsList>

                {/* CAT / Unit tests */}
                <TabsContent value="cat" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="min-w-[180px]">Marks vs Target</TableHead>
                              <TableHead className="min-w-[140px]">Syllabus</TableHead>
                              <TableHead className="min-w-[140px]">Revision</TableHead>
                              <TableHead>Weak topics</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sem.cats.map((r) => {
                              const u = urgency(r.date);
                              const pct = r.marks !== null ? (r.marks / r.target) * 100 : 0;
                              return (
                                <TableRow key={r.id}>
                                  <TableCell className="font-medium">{r.subject}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{r.type}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                      <span className="text-sm">{formatDate(r.date)}</span>
                                      <Badge className={cn("text-xs", u.className)}>
                                        {u.label}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span
                                          className={cn(
                                            "font-semibold",
                                            r.marks === null && "text-muted-foreground",
                                          )}
                                        >
                                          {r.marks ?? "—"} / {r.target}
                                        </span>
                                      </div>
                                      <Progress value={pct} className="h-1.5" />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <span className="text-xs font-semibold">
                                        {r.syllabus}%
                                      </span>
                                      <Progress value={r.syllabus} className="h-1.5" />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <span className="text-xs font-semibold">
                                        {r.revision}%
                                      </span>
                                      <Progress value={r.revision} className="h-1.5" />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {r.weakTopics.length === 0 ? (
                                        <span className="text-xs text-muted-foreground">
                                          —
                                        </span>
                                      ) : (
                                        r.weakTopics.map((t) => (
                                          <Badge
                                            key={t}
                                            variant="outline"
                                            className="gap-1 border-destructive/40 text-destructive"
                                          >
                                            <AlertTriangle className="h-3 w-3" />
                                            {t}
                                          </Badge>
                                        ))
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Practicals */}
                <TabsContent value="prac" className="mt-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {sem.practicals.map((p) => {
                      const u = urgency(p.date);
                      return (
                        <Card
                          key={p.id}
                          className="transition-all hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <CardTitle className="text-base">{p.subject}</CardTitle>
                                <CardDescription className="mt-1 flex items-center gap-1">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {formatDate(p.date)}
                                  <Badge className={cn("ml-1 text-xs", u.className)}>
                                    {u.label}
                                  </Badge>
                                </CardDescription>
                              </div>
                              {recordBadge(p.recordStatus)}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <div className="mb-1 flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Experiments completion
                                </span>
                                <span className="font-semibold">{p.expCompletion}%</span>
                              </div>
                              <Progress value={p.expCompletion} className="h-1.5" />
                            </div>
                            <div>
                              <div className="mb-1 flex justify-between text-xs">
                                <span className="text-muted-foreground">Viva prep</span>
                                <span className="font-semibold">{p.vivaPrep}%</span>
                              </div>
                              <Progress value={p.vivaPrep} className="h-1.5" />
                            </div>
                            <div className="flex items-center justify-between border-t pt-2 text-xs">
                              <span className="text-muted-foreground">Marks</span>
                              <span className="font-semibold">
                                {p.marks !== null ? `${p.marks} / 50` : "—"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* End sem */}
                <TabsContent value="end" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Subject</TableHead>
                              <TableHead>Exam date</TableHead>
                              <TableHead className="min-w-[180px]">Syllabus</TableHead>
                              <TableHead>Mock tests</TableHead>
                              <TableHead>Confidence</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sem.endSem.map((e) => {
                              const u = urgency(e.date);
                              return (
                                <TableRow key={e.id}>
                                  <TableCell className="font-medium">{e.subject}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                      <span className="text-sm">{formatDate(e.date)}</span>
                                      <Badge className={cn("text-xs", u.className)}>
                                        {u.label}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <span className="text-xs font-semibold">
                                        {e.syllabus}%
                                      </span>
                                      <Progress value={e.syllabus} className="h-1.5" />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">{e.mockTests} taken</Badge>
                                  </TableCell>
                                  <TableCell>{confidenceBadge(e.confidence)}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
