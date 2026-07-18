import { createFileRoute } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/_authenticated/coding")({
  head: () => ({ meta: [{ title: "Coding — Scholar OS" }] }),
  component: () => (
    <SectionPlaceholder
      icon={<Code2 className="h-5 w-5" />}
      title="Coding"
      description="LeetCode log, topic coverage, revision queue."
    />
  ),
});
