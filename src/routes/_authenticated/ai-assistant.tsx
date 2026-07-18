import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const Route = createFileRoute("/_authenticated/ai-assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — Scholar OS" }] }),
  component: () => (
    <SectionPlaceholder
      icon={<Sparkles className="h-5 w-5" />}
      title="AI Assistant"
      description="Personalized study plans, insights and interview prep."
    />
  ),
});
