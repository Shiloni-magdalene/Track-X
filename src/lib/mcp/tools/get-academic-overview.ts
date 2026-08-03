import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, requireAuth, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "get_academic_overview",
  title: "Get academic overview",
  description:
    "Summarize the signed-in student's academic and placement data: subjects, upcoming exams, projects, skills, aptitude topics and coding progress.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    requireAuth(ctx);
    const supabase = supabaseForUser(ctx);
    const [subjects, exams, projects, skills, aptitude, leetcode, growth] = await Promise.all([
      supabase.from("subjects").select("*"),
      supabase.from("exams").select("*").order("date", { ascending: true }),
      supabase.from("projects").select("*"),
      supabase.from("skills").select("*"),
      supabase.from("aptitude").select("*"),
      supabase.from("leetcode").select("*"),
      supabase.from("growth_progress").select("*").maybeSingle(),
    ]);

    const firstError = [subjects, exams, projects, skills, aptitude, leetcode].find((r) => r.error)?.error;
    if (firstError) return errorResult(firstError.message);

    return textResult({
      today: new Date().toISOString().slice(0, 10),
      subjects: subjects.data ?? [],
      exams: exams.data ?? [],
      projects: projects.data ?? [],
      skills: skills.data ?? [],
      aptitude: aptitude.data ?? [],
      leetcode: leetcode.data ?? [],
      growth: growth.data ?? null,
    });
  },
});
