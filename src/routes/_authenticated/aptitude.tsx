import { createFileRoute } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/_authenticated/aptitude")({
  head: () => ({ meta: [{ title: "Aptitude — Scholar OS" }] }),
  component: () => (
    <SectionPlaceholder
      icon={<Brain className="h-5 w-5" />}
      title="Aptitude"
      description="Quant, Logical, Verbal — topic mastery and mock analysis."
    />
  ),
});
