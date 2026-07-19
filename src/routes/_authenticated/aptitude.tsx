import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Calculator, MessageSquare, Puzzle, ChevronDown, Clock, Target, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import type { AptitudeCategory } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/aptitude")({
  head: () => ({ meta: [{ title: "Aptitude — Scholar OS" }] }),
  component: AptitudePage,
});

type Topic = {
  topic: string;
  progress: number;
  accuracy: number;
  timePerQ: number;
  weakness: "low" | "medium" | "high";
};

const topicsByCategory: Record<AptitudeCategory, Topic[]> = {
  Quant: [
    { topic: "Percentages", progress: 82, accuracy: 88, timePerQ: 45, weakness: "low" },
    { topic: "Profit & Loss", progress: 68, accuracy: 74, timePerQ: 62, weakness: "medium" },
    { topic: "Time & Work", progress: 41, accuracy: 55, timePerQ: 95, weakness: "high" },
    { topic: "Probability", progress: 55, accuracy: 63, timePerQ: 78, weakness: "medium" },
    { topic: "Number System", progress: 90, accuracy: 92, timePerQ: 35, weakness: "low" },
  ],
  Logical: [
    { topic: "Syllogisms", progress: 72, accuracy: 80, timePerQ: 50, weakness: "low" },
    { topic: "Blood Relations", progress: 60, accuracy: 70, timePerQ: 55, weakness: "medium" },
    { topic: "Seating Arrangement", progress: 38, accuracy: 52, timePerQ: 110, weakness: "high" },
    { topic: "Coding-Decoding", progress: 85, accuracy: 90, timePerQ: 30, weakness: "low" },
  ],
  Verbal: [
    { topic: "Reading Comprehension", progress: 65, accuracy: 72, timePerQ: 90, weakness: "medium" },
    { topic: "Sentence Correction", progress: 78, accuracy: 82, timePerQ: 40, weakness: "low" },
    { topic: "Para Jumbles", progress: 45, accuracy: 58, timePerQ: 85, weakness: "high" },
    { topic: "Vocabulary", progress: 88, accuracy: 91, timePerQ: 25, weakness: "low" },
  ],
};

const mockTests = [
  {
    id: "m1",
    date: "2026-07-15",
    quant: 32, logical: 28, verbal: 30,
    accuracy: 78, timeTaken: 85,
    mistakes: ["Time & Work — 3 wrong", "Seating Arrangement — 2 wrong", "Para Jumbles — 2 wrong"],
    suggestions: "Revisit shortcut tricks for Time & Work. Practice 5 seating arrangement puzzles daily.",
  },
  {
    id: "m2",
    date: "2026-07-08",
    quant: 28, logical: 25, verbal: 27,
    accuracy: 71, timeTaken: 92,
    mistakes: ["Probability — 4 wrong", "Blood Relations — 2 wrong"],
    suggestions: "Focus on conditional probability. Draw family trees for blood relation problems.",
  },
  {
    id: "m3",
    date: "2026-06-30",
    quant: 35, logical: 30, verbal: 32,
    accuracy: 83, timeTaken: 80,
    mistakes: ["Profit & Loss — 2 wrong"],
    suggestions: "Strong performance. Push into harder difficulty for Quant.",
  },
];

const weaknessStyles = {
  low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  high: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
} as const;

function TopicList({ items }: { items: Topic[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((t) => (
        <Card key={t.topic} className="transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t.topic}</CardTitle>
              <Badge variant="outline" className={weaknessStyles[t.weakness]}>
                {t.weakness.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span><span>{t.progress}%</span>
              </div>
              <Progress value={t.progress} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Accuracy</span>
                <span className="ml-auto font-semibold">{t.accuracy}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Time/Q</span>
                <span className="ml-auto font-semibold">{t.timePerQ}s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AptitudePage() {
  const [openMock, setOpenMock] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" /> Aptitude
        </h1>
        <p className="text-muted-foreground">Topic mastery, mock analysis, and improvement plans.</p>
      </div>

      <Tabs defaultValue="Quant">
        <TabsList>
          <TabsTrigger value="Quant"><Calculator className="h-4 w-4 mr-2" />Quantitative</TabsTrigger>
          <TabsTrigger value="Logical"><Puzzle className="h-4 w-4 mr-2" />Logical Reasoning</TabsTrigger>
          <TabsTrigger value="Verbal"><MessageSquare className="h-4 w-4 mr-2" />Verbal Ability</TabsTrigger>
        </TabsList>
        <TabsContent value="Quant" className="mt-4"><TopicList items={topicsByCategory.Quant} /></TabsContent>
        <TabsContent value="Logical" className="mt-4"><TopicList items={topicsByCategory.Logical} /></TabsContent>
        <TabsContent value="Verbal" className="mt-4"><TopicList items={topicsByCategory.Verbal} /></TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Mock Tests
          </CardTitle>
          <CardDescription>Sectional performance and improvement suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Quant</TableHead>
                <TableHead>Logical</TableHead>
                <TableHead>Verbal</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Time</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTests.map((m) => {
                const total = m.quant + m.logical + m.verbal;
                const isOpen = openMock === m.id;
                return (
                  <>
                    <TableRow key={m.id} className="cursor-pointer" onClick={() => setOpenMock(isOpen ? null : m.id)}>
                      <TableCell className="font-medium">{new Date(m.date).toLocaleDateString()}</TableCell>
                      <TableCell>{m.quant}</TableCell>
                      <TableCell>{m.logical}</TableCell>
                      <TableCell>{m.verbal}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{m.accuracy}%</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.timeTaken}m</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow key={`${m.id}-detail`} className="bg-muted/30">
                        <TableCell colSpan={7} className="p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Mistakes ({total} correct total)</h4>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {m.mistakes.map((mk) => (
                                  <li key={mk} className="flex gap-2">
                                    <span className="text-rose-500">•</span>{mk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Improvement Suggestions</h4>
                              <p className="text-sm text-muted-foreground">{m.suggestions}</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
