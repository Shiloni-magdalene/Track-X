import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Briefcase, Award, Linkedin, FolderKanban, Github, ExternalLink,
  ThumbsUp, MessageCircle, Share2, Eye, Lightbulb, BookOpen, Clock, Rocket,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/placements")({
  head: () => ({ meta: [{ title: "Placements — Scholar OS" }] }),
  component: PlacementsPage,
});

const skills = [
  { name: "React", learning: 82, hours: 120, projects: 4, confidence: 85 },
  { name: "Node.js", learning: 70, hours: 90, projects: 3, confidence: 72 },
  { name: "System Design", learning: 45, hours: 40, projects: 1, confidence: 50 },
  { name: "SQL & Databases", learning: 78, hours: 65, projects: 3, confidence: 80 },
  { name: "Data Structures", learning: 88, hours: 150, projects: 2, confidence: 90 },
];

type CertRow = {
  id: string; name: string; platform: string; date: string;
  skills: string[]; resume: boolean; linkedin: boolean;
};

const seedCerts: CertRow[] = [
  { id: "c1", name: "AWS Cloud Practitioner", platform: "AWS", date: "2026-05-12", skills: ["Cloud", "AWS"], resume: true, linkedin: true },
  { id: "c2", name: "Meta Front-End Developer", platform: "Coursera", date: "2026-04-02", skills: ["React", "CSS"], resume: true, linkedin: false },
  { id: "c3", name: "Machine Learning Specialization", platform: "Coursera", date: "2026-06-20", skills: ["ML", "Python"], resume: false, linkedin: false },
  { id: "c4", name: "Full-Stack Web Bootcamp", platform: "Udemy", date: "2026-03-15", skills: ["Node", "MongoDB"], resume: true, linkedin: true },
];

type Post = { id: string; column: "ideas" | "drafts" | "published"; title: string; engagement?: { likes: number; comments: number; shares: number; views: number } };
const seedPosts: Post[] = [
  { id: "p1", column: "published", title: "How I cracked my first internship", engagement: { likes: 142, comments: 23, shares: 18, views: 2400 } },
  { id: "p2", column: "published", title: "5 React patterns I use daily", engagement: { likes: 88, comments: 12, shares: 9, views: 1600 } },
  { id: "p3", column: "drafts", title: "Deep dive: LRU cache in TypeScript" },
  { id: "p4", column: "drafts", title: "My DSA revision system" },
  { id: "p5", column: "ideas", title: "Building a full-stack app in a weekend" },
  { id: "p6", column: "ideas", title: "Why open-source contributions matter" },
];

const projects = [
  { id: "pr1", name: "Scholar OS", status: "in_progress", deadline: "2026-08-30", github: "https://github.com", doc: 40 },
  { id: "pr2", name: "AI Resume Builder", status: "completed", deadline: "2026-06-01", github: "https://github.com", doc: 100 },
  { id: "pr3", name: "Portfolio v3", status: "planned", deadline: "2026-09-15", github: null, doc: 10 },
  { id: "pr4", name: "Realtime Chat", status: "completed", deadline: "2026-05-10", github: "https://github.com", doc: 85 },
] as const;

const statusStyles: Record<string, string> = {
  planned: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};
const statusLabel: Record<string, string> = {
  planned: "Planning", in_progress: "In Progress", completed: "Completed",
};

function SkillsSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {skills.map((s) => (
        <Card key={s.name} className="transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{s.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Learning</span><span>{s.learning}%</span>
              </div>
              <Progress value={s.learning} />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Confidence</span><span>{s.confidence}%</span>
              </div>
              <Progress value={s.confidence} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm pt-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Hours</span>
                <span className="ml-auto font-semibold">{s.hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Projects</span>
                <span className="ml-auto font-semibold">{s.projects}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CertificatesSection() {
  const [certs, setCerts] = useState(seedCerts);
  const toggle = (id: string, field: "resume" | "linkedin") =>
    setCerts((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: !c[field] } : c)));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificates & Resume Tracker</CardTitle>
        <CardDescription>Track certs, resume inclusion, and LinkedIn posting.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead className="text-center">On Resume</TableHead>
              <TableHead className="text-center">Posted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certs.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.platform}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(c.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {c.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox checked={c.resume} onCheckedChange={() => toggle(c.id, "resume")} />
                </TableCell>
                <TableCell className="text-center">
                  <Switch checked={c.linkedin} onCheckedChange={() => toggle(c.id, "linkedin")} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LinkedInSection() {
  const columns: { key: Post["column"]; title: string }[] = [
    { key: "ideas", title: "Next Post Ideas" },
    { key: "drafts", title: "Drafts" },
    { key: "published", title: "Published" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => (
          <Card key={col.key} className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                {col.title}
                <Badge variant="secondary">{seedPosts.filter((p) => p.column === col.key).length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {seedPosts.filter((p) => p.column === col.key).map((p) => (
                <div key={p.id} className="rounded-lg border bg-card p-3 space-y-2">
                  <p className="text-sm font-medium">{p.title}</p>
                  {p.engagement && (
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{p.engagement.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{p.engagement.comments}</span>
                      <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{p.engagement.shares}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.engagement.views}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Brainstorm Next Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Jot down your next post idea, hook, or outline..." rows={4} />
          <div className="flex justify-end mt-2">
            <Button size="sm">Save Idea</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectsSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <Card key={p.id} className="transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{p.name}</CardTitle>
              <Badge variant="outline" className={statusStyles[p.status]}>
                {statusLabel[p.status]}
              </Badge>
            </div>
            <CardDescription>Deadline: {new Date(p.deadline).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />Documentation</span>
                <span>{p.doc}%</span>
              </div>
              <Progress value={p.doc} />
            </div>
            <div className="flex gap-2">
              {p.github ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={p.github} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4 mr-1" /> GitHub
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <Github className="h-4 w-4 mr-1" /> No repo
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" /> Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PlacementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" /> Placements
        </h1>
        <p className="text-muted-foreground">Skills, certificates, LinkedIn presence, and projects — all in one command center.</p>
      </div>

      <Tabs defaultValue="skills">
        <TabsList>
          <TabsTrigger value="skills"><Rocket className="h-4 w-4 mr-2" />Technical Skills</TabsTrigger>
          <TabsTrigger value="certs"><Award className="h-4 w-4 mr-2" />Certificates</TabsTrigger>
          <TabsTrigger value="linkedin"><Linkedin className="h-4 w-4 mr-2" />LinkedIn</TabsTrigger>
          <TabsTrigger value="projects"><FolderKanban className="h-4 w-4 mr-2" />Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="skills" className="mt-4"><SkillsSection /></TabsContent>
        <TabsContent value="certs" className="mt-4"><CertificatesSection /></TabsContent>
        <TabsContent value="linkedin" className="mt-4"><LinkedInSection /></TabsContent>
        <TabsContent value="projects" className="mt-4"><ProjectsSection /></TabsContent>
      </Tabs>
    </div>
  );
}
