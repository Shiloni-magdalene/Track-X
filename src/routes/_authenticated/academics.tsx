import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BookOpen, CalendarDays, ClipboardList, FolderKanban, GraduationCap, ListChecks,
  Loader2, Plus, Trash2, CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Subject, StudyPlanItem } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/academics")({
  head: () => ({ meta: [{ title: "Academics — Track-X" }] }),
  component: AcademicsPage,
});

function subjectProgress(s: Subject) {
  const sp = (Array.isArray(s.study_plan) ? s.study_plan : []) as StudyPlanItem[];
  const t = sp.reduce((a, x) => ({ studied: a.studied + (x.questionsStudied || 0), total: a.total + (x.totalQuestions || 0) }), { studied: 0, total: 0 });
  return t.total ? Math.round((t.studied / t.total) * 100) : 0;
}
function daysUntil(d?: string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

function AcademicsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", credits: 3 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("subjects").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setSubjects((data ?? []) as unknown as Subject[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => { if (addOpen) setForm({ name: "", credits: 3 }); }, [addOpen]);

  const active = useMemo(() => subjects.find((s) => s.id === openId) ?? null, [subjects, openId]);

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Subject name required"); return; }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error("Not signed in"); setSaving(false); return; }
    const { error } = await supabase.from("subjects").insert({
      user_id: uid, name: form.name.trim(), credits: form.credits,
      study_plan: [], assignment: {}, project: {},
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Subject added");
    setAddOpen(false); void load();
  };

  const removeSubject = async (id: string) => {
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Subject removed"); setOpenId(null); void load(); }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <GraduationCap className="h-6 w-6 text-primary" /> Academics
          </h1>
          <p className="text-sm text-muted-foreground">Your subjects, study plans, assignments, and projects.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add Subject</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Subject</DialogTitle><DialogDescription>Add a new subject to track.</DialogDescription></DialogHeader>
            <form onSubmit={submitAdd} className="space-y-4">
              <div className="space-y-2"><Label>Subject Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Credits</Label><Input type="number" min={0} value={form.credits} onChange={(e) => setForm({ ...form, credits: +e.target.value })} /></div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : subjects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-medium">No subjects added yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Subject" to start tracking your coursework.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => {
            const progress = subjectProgress(s);
            const asg = (s.assignment ?? {}) as any;
            const dueSoon = daysUntil(asg.deadline);
            return (
              <button key={s.id} onClick={() => setOpenId(s.id)} className="group text-left">
                <Card className="relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight">{s.name}</CardTitle>
                      <Badge variant="outline" className="shrink-0">{s.credits} cr</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Study plan</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <ClipboardList className="h-3.5 w-3.5" /> Assignment {asg.progress ?? 0}%
                      </span>
                      <span className={cn("inline-flex items-center gap-1", dueSoon !== null && dueSoon <= 3 && "text-destructive font-medium")}>
                        <CalendarDays className="h-3.5 w-3.5" />
                        {dueSoon === null ? "—" : dueSoon < 0 ? "Overdue" : dueSoon === 0 ? "Due today" : `${dueSoon}d left`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {active && (
            <SubjectDetail
              subject={active}
              onChanged={load}
              onDelete={() => removeSubject(active.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubjectDetail({ subject, onChanged, onDelete }: { subject: Subject; onChanged: () => void; onDelete: () => void }) {
  const study = (Array.isArray(subject.study_plan) ? subject.study_plan : []) as StudyPlanItem[];
  const asg = (subject.assignment ?? {}) as any;
  const proj = (subject.project ?? {}) as any;

  const [newTopic, setNewTopic] = useState({ topic: "", questionsStudied: 0, totalQuestions: 0 });
  const [asgForm, setAsgForm] = useState({
    title: asg.title ?? "",
    progress: asg.progress ?? 0,
    deadline: asg.deadline ? new Date(asg.deadline) : (undefined as Date | undefined),
    status: asg.status ?? "not_started",
  });
  const [projForm, setProjForm] = useState({
    title: proj.title ?? "",
    componentsRequired: (proj.componentsRequired ?? []) as string[],
    newComponent: "",
    reportProgress: proj.reportProgress ?? 0,
    deadline: proj.deadline ? new Date(proj.deadline) : (undefined as Date | undefined),
    status: proj.status ?? "not_started",
  });
  const [saving, setSaving] = useState(false);

  const patch = async (payload: Partial<Subject>) => {
    setSaving(true);
    const { error } = await supabase.from("subjects").update(payload as any).eq("id", subject.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    onChanged();
  };

  const addTopic = async () => {
    if (!newTopic.topic.trim()) { toast.error("Topic name required"); return; }
    const next = [...study, { ...newTopic, topic: newTopic.topic.trim() }];
    await patch({ study_plan: next as any });
    setNewTopic({ topic: "", questionsStudied: 0, totalQuestions: 0 });
    toast.success("Topic added");
  };
  const removeTopic = async (i: number) => {
    const next = study.filter((_, idx) => idx !== i);
    await patch({ study_plan: next as any });
  };
  const updateTopicStudied = async (i: number, val: number) => {
    const next = study.map((t, idx) => idx === i ? { ...t, questionsStudied: val } : t);
    await patch({ study_plan: next as any });
  };

  const saveAssignment = async () => {
    await patch({ assignment: {
      title: asgForm.title,
      progress: asgForm.progress,
      deadline: asgForm.deadline ? format(asgForm.deadline, "yyyy-MM-dd") : null,
      status: asgForm.status,
    } as any });
    toast.success("Assignment saved");
  };
  const saveProject = async () => {
    await patch({ project: {
      title: projForm.title,
      componentsRequired: projForm.componentsRequired,
      reportProgress: projForm.reportProgress,
      deadline: projForm.deadline ? format(projForm.deadline, "yyyy-MM-dd") : null,
      status: projForm.status,
    } as any });
    toast.success("Project saved");
  };
  const addComponent = () => {
    if (!projForm.newComponent.trim()) return;
    setProjForm({ ...projForm, componentsRequired: [...projForm.componentsRequired, projForm.newComponent.trim()], newComponent: "" });
  };
  const removeComponent = (i: number) => {
    setProjForm({ ...projForm, componentsRequired: projForm.componentsRequired.filter((_, idx) => idx !== i) });
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <DialogDescription>{subject.credits} credits</DialogDescription>
            <DialogTitle className="text-xl">{subject.name}</DialogTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </DialogHeader>

      <Tabs defaultValue="study" className="mt-2">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="study"><BookOpen className="mr-1.5 h-4 w-4" /> Study Plan</TabsTrigger>
          <TabsTrigger value="assign"><ClipboardList className="mr-1.5 h-4 w-4" /> Assignment</TabsTrigger>
          <TabsTrigger value="project"><FolderKanban className="mr-1.5 h-4 w-4" /> Project</TabsTrigger>
        </TabsList>

        <TabsContent value="study" className="mt-4 space-y-4">
          {study.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No topics yet. Add one below.</p>}
          {study.map((t, i) => {
            const pct = t.totalQuestions ? Math.round((t.questionsStudied / t.totalQuestions) * 100) : 0;
            return (
              <div key={i} className="space-y-1.5 rounded-md border p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{t.questionsStudied}/{t.totalQuestions} · <b>{pct}%</b></span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeTopic(i)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <Progress value={pct} className="h-2" />
                <Slider value={[t.questionsStudied]} min={0} max={t.totalQuestions || 1} step={1} onValueCommit={(v) => updateTopicStudied(i, v[0])} />
              </div>
            );
          })}
          <div className="rounded-md border border-dashed p-3 space-y-2">
            <p className="text-sm font-medium">Add Topic</p>
            <Input placeholder="Topic name" value={newTopic.topic} onChange={(e) => setNewTopic({ ...newTopic, topic: e.target.value })} />
            <div className="grid gap-2 grid-cols-2">
              <Input type="number" placeholder="Studied" value={newTopic.questionsStudied} onChange={(e) => setNewTopic({ ...newTopic, questionsStudied: +e.target.value })} />
              <Input type="number" placeholder="Total questions" value={newTopic.totalQuestions} onChange={(e) => setNewTopic({ ...newTopic, totalQuestions: +e.target.value })} />
            </div>
            <Button size="sm" onClick={addTopic} disabled={saving}><Plus className="h-4 w-4 mr-1" /> Add Topic</Button>
          </div>
        </TabsContent>

        <TabsContent value="assign" className="mt-4 space-y-3">
          <div className="space-y-2"><Label>Assignment Title</Label><Input value={asgForm.title} onChange={(e) => setAsgForm({ ...asgForm, title: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !asgForm.deadline && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />{asgForm.deadline ? format(asgForm.deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={asgForm.deadline} onSelect={(d) => setAsgForm({ ...asgForm, deadline: d })} initialFocus className="p-3 pointer-events-auto" /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2"><Label>Status</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={asgForm.status} onChange={(e) => setAsgForm({ ...asgForm, status: e.target.value as any })}>
                <option value="not_started">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><Label>Progress</Label><span className="text-sm font-medium">{asgForm.progress}%</span></div>
            <Slider value={[asgForm.progress]} min={0} max={100} step={5} onValueChange={(v) => setAsgForm({ ...asgForm, progress: v[0] })} />
          </div>
          <Button onClick={saveAssignment} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Assignment</Button>
        </TabsContent>

        <TabsContent value="project" className="mt-4 space-y-3">
          <div className="space-y-2"><Label>Project Title</Label><Input value={projForm.title} onChange={(e) => setProjForm({ ...projForm, title: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !projForm.deadline && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />{projForm.deadline ? format(projForm.deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={projForm.deadline} onSelect={(d) => setProjForm({ ...projForm, deadline: d })} initialFocus className="p-3 pointer-events-auto" /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2"><Label>Status</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={projForm.status} onChange={(e) => setProjForm({ ...projForm, status: e.target.value as any })}>
                <option value="not_started">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><ListChecks className="h-4 w-4" /> Required Components</Label>
            {projForm.componentsRequired.length === 0 && <p className="text-xs text-muted-foreground">None yet.</p>}
            <ul className="space-y-1">
              {projForm.componentsRequired.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="flex-1">{c}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeComponent(i)}><Trash2 className="h-3 w-3" /></Button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input placeholder="Component" value={projForm.newComponent} onChange={(e) => setProjForm({ ...projForm, newComponent: e.target.value })} />
              <Button type="button" variant="outline" onClick={addComponent}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><Label>Report progress</Label><span className="text-sm font-medium">{projForm.reportProgress}%</span></div>
            <Slider value={[projForm.reportProgress]} min={0} max={100} step={5} onValueChange={(v) => setProjForm({ ...projForm, reportProgress: v[0] })} />
          </div>
          <Button onClick={saveProject} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Project</Button>
        </TabsContent>
      </Tabs>
    </>
  );
}
