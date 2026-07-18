import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({ meta: [{ title: "Projects — Scholar OS" }] }),
  component: () => (
    <SectionPlaceholder
      icon={<FolderKanban className="h-5 w-5" />}
      title="Projects"
      description="Personal projects, GitHub links, docs and deadlines."
    />
  ),
});
