import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { format } from "date-fns";
import { Brain, Calculator, MessageSquare, Puzzle, ChevronDown, Clock, Target, TrendingUp, Plus, Loader2, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Aptitude, AptitudeCategory, AptitudeMock } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/aptitude")({
  head: () => ({ meta: [{ title: "Aptitude — Gradus" }] }),
  component: AptitudePage,
});

const weaknessStyles = {
  low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  high: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
} as const;

type TopicForm = {
  category: AptitudeCategory;
  topic: string;
  progress_percent: number;
  accuracy: number;
  time_per_question: number;
  weakness_level: "low" | "medium" | "high";
};
const emptyTopicForm: TopicForm = {
  category: "Quant", topic: "", progress_percent: 0, accuracy: 0, time_per_question: 0, weakness_level: "medium",
};

type MockForm = {
  date: Date | undefined;
  quant_score: number;
  logical_score: number;
  verbal_score: number;
  accuracy: number;
  time_taken: number;
  mistakes: string;
  improvement_suggestions: string;
};
const emptyMockForm: MockForm = {
  date: undefined, quant_score: 0, logical_score: 0, verbal_score: 0,
  accuracy: 0, time_taken: 0, mistakes: "", improvement_suggestions: "",
};

function AptitudePage() {
  const [topics, setTopics] = useState<Aptitude[]>([]);
  const [mocks, setMocks] = useState<AptitudeMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMock, setOpenMock] = useState<string | null>(null);
  const [topicOpen, setTopicOpen] = useState(false);
  const [mockOpen, setMockOpen] = useState(false);
  const [topicForm, setTopicForm] = useState<TopicForm>(emptyTopicForm);
  const [mockForm, setMockForm] = useState<MockForm>(emptyMockForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [t, m] = await Promise.all([
      supabase.from("aptitude").select("*").order("created_at", { ascending: false }),
      supabase.from("aptitude_mocks").select("*").order("date", { ascending: false }),
    ]);
    if (t.error) toast.error(t.error.message); else setTopics((t.data ?? []) as unknown as Aptitude[]);
    if (m.error) toast.error(m.error.message); else setMocks((m.data ?? []) as unknown as AptitudeMock[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => { if (topicOpen) setTopicForm(emptyTopicForm); }, [topicOpen]);
  useEffect(() => { if (mockOpen) setMockForm(emptyMockForm); }, [mockOpen]);

  const submitTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicForm.topic.trim()) { toast.error("Topic is required"); return; }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error("Not signed in"); setSaving(false); return; }
    const { error } = await supabase.from("aptitude").insert({
      user_id: uid,
      category: topicForm.category,
      topic: topicForm.topic.trim(),
      progress_percent: topicForm.progress_percent,
      accuracy: topicForm.accuracy,
      time_per_question: topicForm.time_per_question,
      weakness_level: topicForm.weakness_level,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Topic added");
    setTopicOpen(false);
    void load();
  };

  const submitMock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockForm.date) { toast.error("Date is required"); return; }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error("Not signed in"); setSaving(false); return; }
    const mistakesArr = mockForm.mistakes.split("\n").map((s) => s.trim()).filter(Boolean).map((topic) => ({ topic }));
    const total = mockForm.quant_score + mockForm.logical_score + mockForm.verbal_score;
    const { error } = await supabase.from("aptitude_mocks").insert({
      user_id: uid,
      date: format(mockForm.date, "yyyy-MM-dd"),
      quant_score: mockForm.quant_score,
      logical_score: mockForm.logical_score,
      verbal_score: mockForm.verbal_score,
      total_score: total,
      accuracy: mockForm.accuracy,
      time_taken: mockForm.time_taken || null,
      mistakes: mistakesArr,
      improvement_suggestions: mockForm.improvement_suggestions.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Mock test added");
    setMockOpen(false);
    void load();
  };

  const removeTopic = async (id: string) => {
    const { error } = await supabase.from("aptitude").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); void load(); }
  };
  const removeMock = async (id: string) => {
    const { error } = await supabase.from("aptitude_mocks").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); void load(); }
  };

  const byCat = (cat: AptitudeCategory) => topics.filter((t) => t.category === cat);

  const renderTopicList = (list: Aptitude[]) => {
    if (list.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center space-y-2">
            <Brain className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">No topics yet</p>
            <p className="text-xs text-muted-foreground">Click "Add Topic" to track your first topic.</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((t) => (
          <Card key={t.id} className="transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.topic}</CardTitle>
                <div className="flex items-center gap-2">
                  {t.weakness_level && (
                    <Badge variant="outline" className={weaknessStyles[t.weakness_level]}>
                      {t.weakness_level.toUpperCase()}
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeTopic(t.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span><span>{t.progress_percent}%</span>
                </div>
                <Progress value={t.progress_percent} />
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
                  <span className="ml-auto font-semibold">{t.time_per_question}s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Aptitude
          </h1>
          <p className="text-muted-foreground">Topic mastery, mock analysis, and improvement notes.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={topicOpen} onOpenChange={setTopicOpen}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-1" /> Add Topic</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Topic</DialogTitle><DialogDescription>Track a new aptitude topic.</DialogDescription></DialogHeader>
              <form onSubmit={submitTopic} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={topicForm.category} onValueChange={(v) => setTopicForm({ ...topicForm, category: v as AptitudeCategory })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quant">Quantitative</SelectItem>
                        <SelectItem value="Logical">Logical Reasoning</SelectItem>
                        <SelectItem value="Verbal">Verbal Ability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Weakness Level</Label>
                    <Select value={topicForm.weakness_level} onValueChange={(v) => setTopicForm({ ...topicForm, weakness_level: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Topic Name</Label>
                  <Input value={topicForm.topic} onChange={(e) => setTopicForm({ ...topicForm, topic: e.target.value })} required />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2"><Label>Progress %</Label><Input type="number" min={0} max={100} value={topicForm.progress_percent} onChange={(e) => setTopicForm({ ...topicForm, progress_percent: +e.target.value })} /></div>
                  <div className="space-y-2"><Label>Accuracy %</Label><Input type="number" min={0} max={100} value={topicForm.accuracy} onChange={(e) => setTopicForm({ ...topicForm, accuracy: +e.target.value })} /></div>
                  <div className="space-y-2"><Label>Time/Q (s)</Label><Input type="number" min={0} value={topicForm.time_per_question} onChange={(e) => setTopicForm({ ...topicForm, time_per_question: +e.target.value })} /></div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setTopicOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Add</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={mockOpen} onOpenChange={setMockOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add Mock Test</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Mock Test</DialogTitle><DialogDescription>Log a mock test result.</DialogDescription></DialogHeader>
              <form onSubmit={submitMock} className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !mockForm.date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {mockForm.date ? format(mockForm.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={mockForm.date} onSelect={(d) => setMockForm({ ...mockForm, date: d })} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2"><Label>Quant Score</Label><Input type="number" value={mockForm.quant_score} onChange={(e) => setMockForm({ ...mockForm, quant_score: +e.target.value })} /></div>
                  <div className="space-y-2"><Label>Logical</Label><Input type="number" value={mockForm.logical_score} onChange={(e) => setMockForm({ ...mockForm, logical_score: +e.target.value })} /></div>
                  <div className="space-y-2"><Label>Verbal</Label><Input type="number" value={mockForm.verbal_score} onChange={(e) => setMockForm({ ...mockForm, verbal_score: +e.target.value })} /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Accuracy %</Label><Input type="number" min={0} max={100} value={mockForm.accuracy} onChange={(e) => setMockForm({ ...mockForm, accuracy: +e.target.value })} /></div>
                  <div className="space-y-2"><Label>Time Taken (min)</Label><Input type="number" value={mockForm.time_taken} onChange={(e) => setMockForm({ ...mockForm, time_taken: +e.target.value })} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Mistakes (one per line)</Label>
                  <Textarea rows={3} value={mockForm.mistakes} onChange={(e) => setMockForm({ ...mockForm, mistakes: e.target.value })} placeholder="e.g. Time & Work — 3 wrong" />
                </div>
                <div className="space-y-2">
                  <Label>Improvement Suggestions</Label>
                  <Textarea rows={2} value={mockForm.improvement_suggestions} onChange={(e) => setMockForm({ ...mockForm, improvement_suggestions: e.target.value })} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setMockOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Add</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <>
          <Tabs defaultValue="Quant">
            <TabsList>
              <TabsTrigger value="Quant"><Calculator className="h-4 w-4 mr-2" />Quantitative</TabsTrigger>
              <TabsTrigger value="Logical"><Puzzle className="h-4 w-4 mr-2" />Logical Reasoning</TabsTrigger>
              <TabsTrigger value="Verbal"><MessageSquare className="h-4 w-4 mr-2" />Verbal Ability</TabsTrigger>
            </TabsList>
            <TabsContent value="Quant" className="mt-4">{renderTopicList(byCat("Quant"))}</TabsContent>
            <TabsContent value="Logical" className="mt-4">{renderTopicList(byCat("Logical"))}</TabsContent>
            <TabsContent value="Verbal" className="mt-4">{renderTopicList(byCat("Verbal"))}</TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Mock Tests</CardTitle>
              <CardDescription>Sectional performance and improvement suggestions.</CardDescription>
            </CardHeader>
            <CardContent>
              {mocks.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">No mock tests logged</p>
                  <p className="text-xs text-muted-foreground">Click "Add Mock Test" to record your first one.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead><TableHead>Quant</TableHead><TableHead>Logical</TableHead>
                      <TableHead>Verbal</TableHead><TableHead>Accuracy</TableHead><TableHead>Time</TableHead><TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mocks.map((m) => {
                      const isOpen = openMock === m.id;
                      const mistakes = Array.isArray(m.mistakes) ? m.mistakes : [];
                      return (
                        <Fragment key={m.id}>
                          <TableRow className="cursor-pointer" onClick={() => setOpenMock(isOpen ? null : m.id)}>
                            <TableCell className="font-medium">{new Date(m.date).toLocaleDateString()}</TableCell>
                            <TableCell>{m.quant_score}</TableCell>
                            <TableCell>{m.logical_score}</TableCell>
                            <TableCell>{m.verbal_score}</TableCell>
                            <TableCell><Badge variant="secondary">{m.accuracy}%</Badge></TableCell>
                            <TableCell className="text-muted-foreground">{m.time_taken ?? "—"}{m.time_taken ? "m" : ""}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); removeMock(m.id); }} className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="sm"><ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} /></Button>
                            </TableCell>
                          </TableRow>
                          {isOpen && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={7} className="p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Mistakes</h4>
                                    {mistakes.length === 0 ? <p className="text-sm text-muted-foreground">None logged</p> : (
                                      <ul className="space-y-1 text-sm text-muted-foreground">
                                        {mistakes.map((mk: any, i: number) => (
                                          <li key={i} className="flex gap-2"><span className="text-rose-500">•</span>{mk.topic}{mk.question ? ` — ${mk.question}` : ""}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Improvement Suggestions</h4>
                                    <p className="text-sm text-muted-foreground">{m.improvement_suggestions || "—"}</p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
