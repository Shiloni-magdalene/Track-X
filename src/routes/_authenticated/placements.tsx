import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/_authenticated/placements")({
  head: () => ({ meta: [{ title: "Placements — Scholar OS" }] }),
  component: () => (
    <SectionPlaceholder
      icon={<Briefcase className="h-5 w-5" />}
      title="Placements"
      description="Skills, certificates, LinkedIn presence and readiness score."
    />
  ),
});
