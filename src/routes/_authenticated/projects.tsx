import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  FolderKanban, Github, ExternalLink, Plus, Pencil, Trash2,
  BookOpen, CalendarIcon, Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({ meta: [{ title: "Projects — Scholar OS" }] }),
  component: ProjectsPage,
});

type ProjectStatus = "planned" | "in_progress" | "completed";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "planned", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const statusStyles: Record<string, string> = {
  planned: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};
const statusLabel: Record<string, string> = {
  planned: "Planning",
  in_progress: "In Progress",
  completed: "Completed",
  shipped: "Shipped",
};

type FormState = {
  name: string;
  status: ProjectStatus;
  deadline: Date | undefined;
  github_link: string;
  doc_progress: number;
};

const emptyForm: FormState = {
  name: "",
  status: "planned",
  deadline: undefined,
  github_link: "",
  doc_progress: 0,
};

function ProjectDialog({
  open, onOpenChange, initial, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Project | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          name: initial.name,
          status: (["planned", "in_progress", "completed"].includes(initial.status)
            ? initial.status
            : "planned") as ProjectStatus,
          deadline: initial.deadline ? new Date(initial.deadline) : undefined,
          github_link: initial.github_link ?? "",
          doc_progress: Number(initial.doc_progress) || 0,
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      toast.error("Not signed in");
      setSaving(false);
      return;
    }
    const payload = {
      name: form.name.trim(),
      status: form.status,
      deadline: form.deadline ? format(form.deadline, "yyyy-MM-dd") : null,
      github_link: form.github_link.trim() || null,
      doc_progress: form.doc_progress,
    };
    const { error } = initial
      ? await supabase.from("projects").update(payload).eq("id", initial.id)
      : await supabase.from("projects").insert({ ...payload, user_id: uid });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(initial ? "Project updated" : "Project created");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Project" : "Add New Project"}</DialogTitle>
          <DialogDescription>
            {initial ? "Update your project details." : "Track a new personal project."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Scholar OS" required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button" variant="outline"
                    className={cn("w-full justify-start text-left font-normal",
                      !form.deadline && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.deadline ? format(form.deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single" selected={form.deadline}
                    onSelect={(d) => setForm({ ...form, deadline: d })}
                    initialFocus className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub Repository URL</Label>
            <Input
              id="github" type="url" value={form.github_link}
              onChange={(e) => setForm({ ...form, github_link: e.target.value })}
              placeholder="https://github.com/user/repo"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Documentation Progress</Label>
              <span className="text-sm font-medium">{form.doc_progress}%</span>
            </div>
            <Slider
              value={[form.doc_progress]} min={0} max={100} step={5}
              onValueChange={(v) => setForm({ ...form, doc_progress: v[0] })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {initial ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProjectCard({
  project, onChanged, onEdit, onDelete,
}: {
  project: Project;
  onChanged: () => void;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const [localDoc, setLocalDoc] = useState<number>(Number(project.doc_progress) || 0);
  const [savingDoc, setSavingDoc] = useState(false);

  useEffect(() => { setLocalDoc(Number(project.doc_progress) || 0); }, [project.doc_progress]);

  const updateStatus = async (status: ProjectStatus) => {
    const { error } = await supabase.from("projects").update({ status }).eq("id", project.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated");
    onChanged();
  };

  const commitDoc = async (value: number) => {
    if (value === Number(project.doc_progress)) return;
    setSavingDoc(true);
    const { error } = await supabase
      .from("projects")
      .update({ doc_progress: value })
      .eq("id", project.id);
    setSavingDoc(false);
    if (error) { toast.error(error.message); return; }
    onChanged();
  };

  return (
    <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{project.name}</CardTitle>
          <Select value={project.status} onValueChange={(v) => updateStatus(v as ProjectStatus)}>
            <SelectTrigger
              className={cn(
                "h-7 w-auto gap-1 border px-2 py-0 text-xs font-medium rounded-full",
                statusStyles[project.status] ?? statusStyles.planned,
              )}
            >
              <SelectValue>{statusLabel[project.status] ?? project.status}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          {project.deadline
            ? `Deadline: ${new Date(project.deadline).toLocaleDateString()}`
            : "No deadline set"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />Documentation
            </span>
            <span>{localDoc}%{savingDoc && " …"}</span>
          </div>
          <Progress value={localDoc} />
          <Slider
            className="mt-2"
            value={[localDoc]} min={0} max={100} step={5}
            onValueChange={(v) => setLocalDoc(v[0])}
            onValueCommit={(v) => commitDoc(v[0])}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {project.github_link ? (
            <Button variant="outline" size="sm" asChild>
              <a href={project.github_link} target="_blank" rel="noreferrer">
                <Github className="h-4 w-4 mr-1" /> GitHub
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <Github className="h-4 w-4 mr-1" /> No repo
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button
            variant="ghost" size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(project)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [toDelete, setToDelete] = useState<Project | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setProjects((data ?? []) as unknown as Project[]);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p: Project) => { setEditing(p); setDialogOpen(true); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("projects").delete().eq("id", toDelete.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Project deleted");
    setToDelete(null);
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" /> Projects
          </h1>
          <p className="text-muted-foreground">
            Personal projects, GitHub links, docs and deadlines.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" /> Add New Project
            </Button>
          </DialogTrigger>
          <ProjectDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            initial={editing}
            onSaved={load}
          />
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">No projects yet</p>
              <p className="text-sm text-muted-foreground">
                Start tracking your first project to see it here.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" /> Add New Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id} project={p}
              onChanged={load}
              onEdit={openEdit}
              onDelete={(pr) => setToDelete(pr)}
            />
          ))}
          {projects.length > 0 && (
            <Card
              className="border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors min-h-[220px]"
              onClick={openCreate}
            >
              <div className="text-center text-muted-foreground">
                <Plus className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Add New Project</p>
              </div>
            </Card>
          )}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              "{toDelete?.name}" will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
