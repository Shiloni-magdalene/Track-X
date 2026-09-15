import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertTriangle, CalendarDays, CalendarIcon, ClipboardCheck, FlaskConical,
  GraduationCap, Loader2, Plus, Target, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Exam, Subject } from "@/lib/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/exams")({
  head: () => ({ meta: [{ title: "Exams — Aria" }] }),
  component: ExamsPage,
});

type ExamType = "CAT" | "Unit Test" | "Practical" | "EndSem";

type Form = {
  subject_id: string | null;
  type: ExamType;
  date: Date | undefined;
  marks: string;
  target_marks: string;
  syllabus_covered: number;
  revision_percent: number;
  weak_topics: string;
  // practical
  expCompletion: number;
  recordStatus: "pending" | "in_progress" | "complete";
  vivaPrep: number;
  // endsem
  mockTests: number;
  confidenceLevel: "low" | "medium" | "high";
};
const emptyForm: Form = {
  subject_id: null, type: "CAT", date: undefined, marks: "", target_marks: "",
  syllabus_covered: 0, revision_percent: 0, weak_topics: "",
  expCompletion: 0, recordStatus: "pending", vivaPrep: 0,
  mockTests: 0, confidenceLevel: "medium",
};

function urgency(dateStr?: string | null) {
  if (!dateStr) return { label: "—", className: "bg-muted text-muted-foreground" };
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (diff < 0) return { label: "Past", className: "bg-muted text-muted-foreground" };
  if (diff <= 3) return { label: `${diff}d`, className: "bg-destructive/15 text-destructive" };
  if (diff <= 10) return { label: `${diff}d`, className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" };
  return { label: `${diff}d`, className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" };
}

function ExamsPage() {
  const [exams, setExams] = useState<(Exam & { subjects?: { name: string } | null })[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [e, s] = await Promise.all([
      supabase.from("exams").select("*, subjects(name)").order("date", { ascending: true, nullsFirst: false }),
      supabase.from("subjects").select("*").order("name"),
    ]);
    if (e.error) toast.error(e.error.message); else setExams((e.data ?? []) as any);
    if (s.error) toast.error(s.error.message); else setSubjects((s.data ?? []) as unknown as Subject[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => { if (open) setForm(emptyForm); }, [open]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error("Not signed in"); setSaving(false); return; }
    const payload: any = {
      user_id: uid,
      subject_id: form.subject_id || null,
      type: form.type,
      date: form.date ? format(form.date, "yyyy-MM-dd") : null,
      marks: form.marks === "" ? null : Number(form.marks),
      target_marks: form.target_marks === "" ? null : Number(form.target_marks),
      syllabus_covered: form.syllabus_covered,
      revision_percent: form.revision_percent,
      weak_topics: form.weak_topics.split(",").map((s) => s.trim()).filter(Boolean),
      practical_data: form.type === "Practical" ? { expCompletion: form.expCompletion, recordStatus: form.recordStatus, vivaPrep: form.vivaPrep } : {},
      end_sem_data: form.type === "EndSem" ? { mockTests: form.mockTests, confidenceLevel: form.confidenceLevel === "low" ? 33 : form.confidenceLevel === "medium" ? 66 : 100 } : {},
    };
    const { error } = await supabase.from("exams").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Exam added");
    setOpen(false); void load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); void load(); }
  };

  const cats = exams.filter((e) => e.type === "CAT" || e.type === "Unit Test");
  const pracs = exams.filter((e) => e.type === "Practical");
  const ends = exams.filter((e) => e.type === "EndSem");

  const nameOf = (e: any) => e.subjects?.name ?? "—";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ClipboardCheck className="h-6 w-6 text-primary" /> Exams
          </h1>
          <p className="text-sm text-muted-foreground">CATs, unit tests, practicals, and end-sems.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add Exam</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add Exam</DialogTitle><DialogDescription>Track a new exam.</DialogDescription></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={form.subject_id ?? ""} onValueChange={(v) => setForm({ ...form, subject_id: v || null })}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.length === 0 ? (
                        <div className="px-2 py-2 text-xs text-muted-foreground">Add a subject first in Academics.</div>
                      ) : subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ExamType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAT">CAT</SelectItem>
                      <SelectItem value="Unit Test">Unit Test</SelectItem>
                      <SelectItem value="Practical">Practical</SelectItem>
                      <SelectItem value="EndSem">End Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !form.date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />{form.date ? format(form.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.date} onSelect={(d) => setForm({ ...form, date: d })} initialFocus className="p-3 pointer-events-auto" /></PopoverContent>
                </Popover>
              </div>

              {(form.type === "CAT" || form.type === "Unit Test") && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2"><Label>Marks Obtained</Label><Input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} placeholder="—" /></div>
                    <div className="space-y-2"><Label>Target Marks</Label><Input type="number" value={form.target_marks} onChange={(e) => setForm({ ...form, target_marks: e.target.value })} placeholder="—" /></div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2"><Label>Syllabus Covered %</Label><Input type="number" min={0} max={100} value={form.syllabus_covered} onChange={(e) => setForm({ ...form, syllabus_covered: +e.target.value })} /></div>
                    <div className="space-y-2"><Label>Revision %</Label><Input type="number" min={0} max={100} value={form.revision_percent} onChange={(e) => setForm({ ...form, revision_percent: +e.target.value })} /></div>
                  </div>
                  <div className="space-y-2"><Label>Weak Topics (comma-separated)</Label><Input value={form.weak_topics} onChange={(e) => setForm({ ...form, weak_topics: e.target.value })} placeholder="e.g. Normalization, Concurrency" /></div>
                </>
              )}

              {form.type === "Practical" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2"><Label>Exp Completion %</Label><Input type="number" min={0} max={100} value={form.expCompletion} onChange={(e) => setForm({ ...form, expCompletion: +e.target.value })} /></div>
                  <div className="space-y-2">
                    <Label>Record Status</Label>
                    <Select value={form.recordStatus} onValueChange={(v) => setForm({ ...form, recordStatus: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="complete">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Viva Prep %</Label><Input type="number" min={0} max={100} value={form.vivaPrep} onChange={(e) => setForm({ ...form, vivaPrep: +e.target.value })} /></div>
                  <div className="space-y-2 sm:col-span-3"><Label>Marks Obtained</Label><Input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} placeholder="—" /></div>
                </div>
              )}

              {form.type === "EndSem" && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2"><Label>Syllabus Completion %</Label><Input type="number" min={0} max={100} value={form.syllabus_covered} onChange={(e) => setForm({ ...form, syllabus_covered: +e.target.value })} /></div>
                    <div className="space-y-2"><Label>Mock Tests Taken</Label><Input type="number" min={0} value={form.mockTests} onChange={(e) => setForm({ ...form, mockTests: +e.target.value })} /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confidence Level</Label>
                    <Select value={form.confidenceLevel} onValueChange={(v) => setForm({ ...form, confidenceLevel: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : exams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <ClipboardCheck className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-medium">No exams added yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Exam" to log CATs, practicals or end-sems.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="cat">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cat"><Target className="mr-1.5 h-4 w-4" /> CAT / Unit ({cats.length})</TabsTrigger>
            <TabsTrigger value="prac"><FlaskConical className="mr-1.5 h-4 w-4" /> Practicals ({pracs.length})</TabsTrigger>
            <TabsTrigger value="end"><CalendarDays className="mr-1.5 h-4 w-4" /> End Sem ({ends.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="cat" className="mt-4">
            {cats.length === 0 ? <EmptyMsg text="No CATs or unit tests yet." /> : (
              <Card><CardContent className="p-0"><div className="overflow-x-auto"><Table>
                <TableHeader><TableRow>
                  <TableHead>Subject</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead>
                  <TableHead>Marks/Target</TableHead><TableHead>Syllabus</TableHead><TableHead>Revision</TableHead>
                  <TableHead>Weak Topics</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {cats.map((r) => {
                    const u = urgency(r.date);
                    const wt = Array.isArray(r.weak_topics) ? r.weak_topics : [];
                    const pct = r.marks !== null && r.target_marks ? (Number(r.marks) / Number(r.target_marks)) * 100 : 0;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{nameOf(r)}</TableCell>
                        <TableCell><Badge variant="outline">{r.type}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="text-sm">{r.date ? new Date(r.date).toLocaleDateString() : "—"}</span>
                            <Badge className={cn("text-xs", u.className)}>{u.label}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1"><span className={cn("text-xs font-semibold", r.marks === null && "text-muted-foreground")}>{r.marks ?? "—"} / {r.target_marks ?? "—"}</span><Progress value={pct} className="h-1.5" /></div>
                        </TableCell>
                        <TableCell><div className="space-y-1"><span className="text-xs font-semibold">{r.syllabus_covered}%</span><Progress value={r.syllabus_covered} className="h-1.5" /></div></TableCell>
                        <TableCell><div className="space-y-1"><span className="text-xs font-semibold">{r.revision_percent}%</span><Progress value={r.revision_percent} className="h-1.5" /></div></TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {wt.length === 0 ? <span className="text-xs text-muted-foreground">—</span> :
                              wt.map((t: string) => <Badge key={t} variant="outline" className="gap-1 border-destructive/40 text-destructive"><AlertTriangle className="h-3 w-3" />{t}</Badge>)}
                          </div>
                        </TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table></div></CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="prac" className="mt-4">
            {pracs.length === 0 ? <EmptyMsg text="No practicals added." /> : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {pracs.map((p) => {
                  const pd = (p.practical_data ?? {}) as any;
                  const u = urgency(p.date);
                  return (
                    <Card key={p.id} className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-base">{nameOf(p)}</CardTitle>
                            <CardDescription className="mt-1 flex items-center gap-1"><CalendarDays className="h-3 w-3" />{p.date ? new Date(p.date).toLocaleDateString() : "—"}</CardDescription>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className={cn("text-xs", u.className)}>{u.label}</Badge>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <StatBar label="Experiment completion" value={pd.expCompletion ?? 0} />
                        <StatBar label="Viva prep" value={pd.vivaPrep ?? 0} />
                        <div className="flex justify-between"><span className="text-muted-foreground">Record</span><Badge variant="secondary">{pd.recordStatus ?? "pending"}</Badge></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Marks</span><span className="font-semibold">{p.marks ?? "—"}</span></div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="end" className="mt-4">
            {ends.length === 0 ? <EmptyMsg text="No end-sem exams added." /> : (
              <Card><CardContent className="p-0"><div className="overflow-x-auto"><Table>
                <TableHeader><TableRow>
                  <TableHead>Subject</TableHead><TableHead>Date</TableHead><TableHead>Syllabus</TableHead>
                  <TableHead>Mock Tests</TableHead><TableHead>Confidence</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {ends.map((e) => {
                    const ed = (e.end_sem_data ?? {}) as any;
                    const conf = ed.confidenceLevel ?? 0;
                    const confLabel = conf >= 80 ? "High" : conf >= 50 ? "Medium" : "Low";
                    const confCls = conf >= 80 ? "bg-emerald-500/15 text-emerald-600" : conf >= 50 ? "bg-amber-500/15 text-amber-600" : "bg-destructive/15 text-destructive";
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{nameOf(e)}</TableCell>
                        <TableCell>{e.date ? new Date(e.date).toLocaleDateString() : "—"}</TableCell>
                        <TableCell><div className="space-y-1"><span className="text-xs font-semibold">{e.syllabus_covered}%</span><Progress value={e.syllabus_covered} className="h-1.5" /></div></TableCell>
                        <TableCell>{ed.mockTests ?? 0}</TableCell>
                        <TableCell><Badge className={cn("text-xs", confCls)}>{confLabel}</Badge></TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table></div></CardContent></Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function EmptyMsg({ text }: { text: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-8 text-center text-sm text-muted-foreground">
        <GraduationCap className="h-6 w-6 mx-auto mb-2" />{text}
      </CardContent>
    </Card>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>{label}</span><span>{value}%</span></div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}
