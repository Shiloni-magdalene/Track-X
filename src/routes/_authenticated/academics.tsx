import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/_authenticated/academics")({
  head: () => ({ meta: [{ title: "Academics — Scholar OS" }] }),
  component: () => (
    <SectionPlaceholder
      icon={<BookOpen className="h-5 w-5" />}
      title="Academics"
      description="Subjects, credits, assignments, projects and study plans."
    />
  ),
});
