import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Award, BookOpen, Briefcase, Clock, FolderKanban, Github, Lightbulb, Linkedin,
  Loader2, Plus, Rocket, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Certificate, LinkedinTracker, Project, Skill } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/placements")({
  head: () => ({ meta: [{ title: "Placements — Gradus" }] }),
  component: PlacementsPage,
});

/* ---------------- Skills ---------------- */

function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", learning_percent: 0, hours_studied: 0, projects_built: 0, confidence: 0 });

  const load = async () => {
    const { data, error } = await supabase.from("skills").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setSkills((data ?? []) as unknown as Skill[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => { if (open) setForm({ name: "", learning_percent: 0, hours_studied: 0, projects_built: 0, confidence: 0 }); }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Skill name required"); return; }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error("Not signed in"); setSaving(false); return; }
    const { error } = await supabase.from("skills").insert({ user_id: uid, category: "Technical", ...form });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Skill added"); setOpen(false); void load();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); void load(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Skill</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Skill</DialogTitle><DialogDescription>Add a technical skill you're building.</DialogDescription></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2"><Label>Learning %</Label><Input type="number" min={0} max={100} value={form.learning_percent} onChange={(e) => setForm({ ...form, learning_percent: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Confidence %</Label><Input type="number" min={0} max={100} value={form.confidence} onChange={(e) => setForm({ ...form, confidence: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Hours studied</Label><Input type="number" min={0} value={form.hours_studied} onChange={(e) => setForm({ ...form, hours_studied: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Projects built</Label><Input type="number" min={0} value={form.projects_built} onChange={(e) => setForm({ ...form, projects_built: +e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <Loader className="py-10" /> : skills.length === 0 ? (
        <EmptyState icon={Rocket} title="No skills tracked yet" hint="Click 'Add Skill' to start." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {skills.map((s) => (
            <Card key={s.id} className="transition-all hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{s.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div><div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Learning</span><span>{s.learning_percent}%</span></div><Progress value={s.learning_percent} /></div>
                <div><div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Confidence</span><span>{s.confidence}%</span></div><Progress value={s.confidence} /></div>
                <div className="grid grid-cols-2 gap-3 text-sm pt-1">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Hours</span><span className="ml-auto font-semibold">{s.hours_studied}</span></div>
                  <div className="flex items-center gap-2"><Rocket className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Projects</span><span className="ml-auto font-semibold">{s.projects_built}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Certificates ---------------- */

function CertificatesSection() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", platform: "", date: "", skills_learned: "" });

  const load = async () => {
    const { data, error } = await supabase.from("certificates").select("*").order("date", { ascending: false, nullsFirst: false });
    if (error) toast.error(error.message); else setCerts((data ?? []) as unknown as Certificate[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => { if (open) setForm({ name: "", platform: "", date: "", skills_learned: "" }); }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error("Not signed in"); setSaving(false); return; }
    const { error } = await supabase.from("certificates").insert({
      user_id: uid, name: form.name.trim(),
      platform: form.platform.trim() || null,
      date: form.date || null,
      skills_learned: form.skills_learned.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Certificate added"); setOpen(false); void load();
  };
  const toggle = async (c: Certificate, field: "resume_added" | "linkedin_posted") => {
    const patch = field === "resume_added" ? { resume_added: !c.resume_added } : { linkedin_posted: !c.linkedin_posted };
    const { error } = await supabase.from("certificates").update(patch).eq("id", c.id);
    if (error) toast.error(error.message); else void load();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); void load(); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Certificates & Resume Tracker</CardTitle>
          <CardDescription>Track certs, resume inclusion, LinkedIn posting.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Certificate</DialogTitle><DialogDescription>Log a certificate you earned.</DialogDescription></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2"><Label>Certificate Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2"><Label>Platform</Label><Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="e.g. Coursera" /></div>
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Skills (comma-separated)</Label><Input value={form.skills_learned} onChange={(e) => setForm({ ...form, skills_learned: e.target.value })} placeholder="React, Node" /></div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? <Loader className="py-8" /> : certs.length === 0 ? (
          <EmptyState icon={Award} title="No certificates yet" hint="Add your first certificate to start tracking." />
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Certificate</TableHead><TableHead>Platform</TableHead><TableHead>Date</TableHead>
              <TableHead>Skills</TableHead><TableHead className="text-center">On Resume</TableHead>
              <TableHead className="text-center">Posted</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {certs.map((c) => {
                const skills = Array.isArray(c.skills_learned) ? c.skills_learned : [];
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.platform ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.date ? new Date(c.date).toLocaleDateString() : "—"}</TableCell>
                    <TableCell><div className="flex flex-wrap gap-1">{skills.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}</div></TableCell>
                    <TableCell className="text-center"><Checkbox checked={c.resume_added} onCheckedChange={() => toggle(c, "resume_added")} /></TableCell>
                    <TableCell className="text-center"><Switch checked={c.linkedin_posted} onCheckedChange={() => toggle(c, "linkedin_posted")} /></TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- LinkedIn ---------------- */

function LinkedInSection() {
  const [items, setItems] = useState<LinkedinTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [idea, setIdea] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("linkedin_tracker").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setItems((data ?? []) as unknown as LinkedinTracker[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const saveIdea = async () => {
    if (!idea.trim()) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error("Not signed in"); setSaving(false); return; }
    const { error } = await supabase.from("linkedin_tracker").insert({
      user_id: uid, type: "Post", engagement: {}, next_post_idea: idea.trim(),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Idea saved"); setIdea(""); void load();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("linkedin_tracker").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); void load(); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Add a Post Idea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea placeholder="Jot down your next post idea, hook, or outline..." rows={3} value={idea} onChange={(e) => setIdea(e.target.value)} />
          <div className="flex justify-end">
            <Button size="sm" onClick={saveIdea} disabled={saving || !idea.trim()}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Idea</Button>
          </div>
        </CardContent>
      </Card>
      {loading ? <Loader className="py-8" /> : items.length === 0 ? (
        <EmptyState icon={Linkedin} title="No LinkedIn items yet" hint="Save your first post idea above." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Card key={p.id} className="transition-all hover:shadow-md">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="secondary">{p.type}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
                <p className="text-sm">{p.next_post_idea ?? "—"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Projects (read-only mirror) ---------------- */

function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) toast.error(error.message); else setProjects((data ?? []) as unknown as Project[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader className="py-10" />;
  if (projects.length === 0) return <EmptyState icon={FolderKanban} title="No projects yet" hint="Add projects from the Projects page." />;

  const statusStyles: Record<string, string> = {
    planned: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
    in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  };
  const statusLabel: Record<string, string> = { planned: "Planning", in_progress: "In Progress", completed: "Completed" };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <Card key={p.id} className="transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{p.name}</CardTitle>
              <Badge variant="outline" className={statusStyles[p.status] ?? statusStyles.planned}>{statusLabel[p.status] ?? p.status}</Badge>
            </div>
            <CardDescription>{p.deadline ? `Deadline: ${new Date(p.deadline).toLocaleDateString()}` : "No deadline"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><div className="flex justify-between text-xs text-muted-foreground mb-1"><span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />Documentation</span><span>{p.doc_progress}%</span></div><Progress value={p.doc_progress} /></div>
            {p.github_link && <Button variant="outline" size="sm" asChild><a href={p.github_link} target="_blank" rel="noreferrer"><Github className="h-4 w-4 mr-1" /> GitHub</a></Button>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- shared ---------------- */

function Loader({ className }: { className?: string }) {
  return <div className={`flex justify-center text-muted-foreground ${className ?? ""}`}><Loader2 className="h-5 w-5 animate-spin" /></div>;
}
function EmptyState({ icon: Icon, title, hint }: { icon: any; title: string; hint: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-10 text-center space-y-2">
        <Icon className="h-8 w-8 mx-auto text-muted-foreground" />
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function PlacementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Briefcase className="h-6 w-6 text-primary" /> Placements</h1>
        <p className="text-muted-foreground">Skills, certificates, LinkedIn presence, and projects.</p>
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
