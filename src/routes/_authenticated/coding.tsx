import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Code2, Plus, Loader2, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { LeetcodeEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/coding")({
  head: () => ({ meta: [{ title: "Coding — Scholar OS" }] }),
  component: CodingPage,
});

type Difficulty = "Easy" | "Medium" | "Hard";
const difficultyStyles: Record<Difficulty, string> = {
  Easy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Hard: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

type Form = {
  problem_name: string;
  topic: string;
  difficulty: Difficulty;
  solved_date: Date | undefined;
  notes: string;
  revision_needed: boolean;
};
const emptyForm: Form = {
  problem_name: "", topic: "", difficulty: "Easy",
  solved_date: undefined, notes: "", revision_needed: false,
};

function CodingPage() {
  const [items, setItems] = useState<LeetcodeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("leetcode").select("*").order("solved_date", { ascending: false, nullsFirst: false });
    if (error) toast.error(error.message);
    else setItems((data ?? []) as unknown as LeetcodeEntry[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  useEffect(() => { if (open) setForm(emptyForm); }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.problem_name.trim()) { toast.error("Problem name is required"); return; }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error("Not signed in"); setSaving(false); return; }
    const { error } = await supabase.from("leetcode").insert({
      user_id: uid,
      problem_name: form.problem_name.trim(),
      topic: form.topic.trim() || null,
      difficulty: form.difficulty,
      solved_date: form.solved_date ? format(form.solved_date, "yyyy-MM-dd") : null,
      notes: form.notes.trim() || null,
      revision_needed: form.revision_needed,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Problem added");
    setOpen(false);
    void load();
  };

  const toggleRevision = async (row: LeetcodeEntry) => {
    const { error } = await supabase.from("leetcode")
      .update({ revision_needed: !row.revision_needed }).eq("id", row.id);
    if (error) toast.error(error.message);
    else void load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("leetcode").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); void load(); }
  };

  const easy = items.filter((p) => p.difficulty === "Easy").length;
  const medium = items.filter((p) => p.difficulty === "Medium").length;
  const hard = items.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" /> LeetCode Tracker
          </h1>
          <p className="text-muted-foreground">Log the problems you solve and mark what needs revision.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add Problem</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Problem</DialogTitle>
              <DialogDescription>Log a problem you solved.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Problem Name</Label>
                <Input value={form.problem_name} onChange={(e) => setForm({ ...form, problem_name: e.target.value })} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Array, DP" />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as Difficulty })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Solved Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !form.solved_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.solved_date ? format(form.solved_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.solved_date}
                      onSelect={(d) => setForm({ ...form, solved_date: d })} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.revision_needed} onCheckedChange={(v) => setForm({ ...form, revision_needed: !!v })} id="rev" />
                <Label htmlFor="rev" className="cursor-pointer">Needs revision</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Add
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(["Easy", "Medium", "Hard"] as const).map((label, i) => (
          <Card key={label} className="transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="pb-2">
              <CardDescription>{label} Solved</CardDescription>
              <CardTitle className="text-4xl">{[easy, medium, hard][i]}</CardTitle>
            </CardHeader>
            <CardContent><Badge variant="outline" className={difficultyStyles[label]}>{label}</Badge></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem Log</CardTitle>
          <CardDescription>{items.length} problem{items.length === 1 ? "" : "s"} tracked</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Code2 className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="font-medium">No problems tracked yet</p>
              <p className="text-sm text-muted-foreground">Click "Add Problem" to log your first solve.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Problem</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Solved</TableHead>
                  <TableHead className="text-center">Revision</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.problem_name}</TableCell>
                    <TableCell>{p.topic ? <Badge variant="secondary">{p.topic}</Badge> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                    <TableCell>
                      {p.difficulty && <Badge variant="outline" className={difficultyStyles[p.difficulty as Difficulty]}>{p.difficulty}</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.solved_date ? new Date(p.solved_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox checked={p.revision_needed} onCheckedChange={() => toggleRevision(p)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => remove(p.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
