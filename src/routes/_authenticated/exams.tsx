import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/_authenticated/exams")({
  head: () => ({ meta: [{ title: "Exams — Scholar OS" }] }),
  component: () => (
    <SectionPlaceholder
      icon={<ClipboardCheck className="h-5 w-5" />}
      title="Exams"
      description="CATs, unit tests, practicals and end-sem — plan, revise, track."
    />
  ),
});
