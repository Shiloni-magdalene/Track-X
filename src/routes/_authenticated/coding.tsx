import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Code2, Flame, Target, TrendingUp, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/coding")({
  head: () => ({ meta: [{ title: "Coding — Scholar OS" }] }),
  component: CodingPage,
});

type Problem = {
  id: string;
  name: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  date: string;
  revision: boolean;
};

const seedProblems: Problem[] = [
  { id: "p1", name: "Two Sum", topic: "Array", difficulty: "Easy", date: "2026-07-01", revision: false },
  { id: "p2", name: "Longest Substring Without Repeating", topic: "Sliding Window", difficulty: "Medium", date: "2026-07-04", revision: true },
  { id: "p3", name: "Median of Two Sorted Arrays", topic: "Binary Search", difficulty: "Hard", date: "2026-07-06", revision: true },
  { id: "p4", name: "Valid Parentheses", topic: "Stack", difficulty: "Easy", date: "2026-07-08", revision: false },
  { id: "p5", name: "Merge Intervals", topic: "Sorting", difficulty: "Medium", date: "2026-07-10", revision: false },
  { id: "p6", name: "Word Ladder", topic: "BFS", difficulty: "Hard", date: "2026-07-12", revision: true },
  { id: "p7", name: "Best Time to Buy Stock", topic: "DP", difficulty: "Easy", date: "2026-07-14", revision: false },
  { id: "p8", name: "LRU Cache", topic: "Design", difficulty: "Medium", date: "2026-07-16", revision: false },
  { id: "p9", name: "Trapping Rain Water", topic: "Two Pointers", difficulty: "Hard", date: "2026-07-18", revision: true },
];

const difficultyStyles = {
  Easy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Hard: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
} as const;

function CodingPage() {
  const [problems, setProblems] = useState(seedProblems);

  const easy = problems.filter((p) => p.difficulty === "Easy").length;
  const medium = problems.filter((p) => p.difficulty === "Medium").length;
  const hard = problems.filter((p) => p.difficulty === "Hard").length;
  const weeklyGoal = { done: 6, target: 10 };
  const monthlyGoal = { done: 22, target: 40 };
  const weakTopics = ["Binary Search", "BFS", "Two Pointers", "Sliding Window"];

  const toggleRevision = (id: string) =>
    setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, revision: !p.revision } : p)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" /> LeetCode Tracker
        </h1>
        <p className="text-muted-foreground">Problem log, goals, and weak-topic radar.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Easy", count: easy, cls: difficultyStyles.Easy },
          { label: "Medium", count: medium, cls: difficultyStyles.Medium },
          { label: "Hard", count: hard, cls: difficultyStyles.Hard },
        ].map((s) => (
          <Card key={s.label} className="transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="pb-2">
              <CardDescription>{s.label} Solved</CardDescription>
              <CardTitle className="text-4xl">{s.count}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className={s.cls}>{s.label}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Problem Log</CardTitle>
            <CardDescription>{problems.length} problems tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Problem</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Solved</TableHead>
                  <TableHead className="text-center">Revision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="secondary">{p.topic}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={difficultyStyles[p.difficulty]}>
                        {p.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(p.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={p.revision}
                        onCheckedChange={() => toggleRevision(p.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Weekly Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{weeklyGoal.done} / {weeklyGoal.target}</span>
                <span className="font-semibold">{Math.round((weeklyGoal.done / weeklyGoal.target) * 100)}%</span>
              </div>
              <Progress value={(weeklyGoal.done / weeklyGoal.target) * 100} />
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Monthly Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{monthlyGoal.done} / {monthlyGoal.target}</span>
                <span className="font-semibold">{Math.round((monthlyGoal.done / monthlyGoal.target) * 100)}%</span>
              </div>
              <Progress value={(monthlyGoal.done / monthlyGoal.target) * 100} />
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500" /> Weak Topics
              </CardTitle>
              <CardDescription>Need more practice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {weakTopics.map((t) => (
                  <Badge key={t} variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">
                    <Flame className="h-3 w-3 mr-1" />{t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
