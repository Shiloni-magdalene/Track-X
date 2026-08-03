import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, requireAuth, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_upcoming_exams",
  title: "List upcoming exams",
  description: "List the student's exams scheduled within the next N days, including marks targets and syllabus coverage.",
  inputSchema: {
    days: z.number().optional().describe("Look-ahead window in days. Defaults to 30."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    requireAuth(ctx);
    const window = Math.max(1, Math.min(365, days ?? 30));
    const today = new Date();
    const until = new Date(today.getTime() + window * 86400000);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("exams")
      .select("*, subjects(name)")
      .gte("date", today.toISOString().slice(0, 10))
      .lte("date", until.toISOString().slice(0, 10))
      .order("date", { ascending: true });
    if (error) return errorResult(error.message);
    return textResult({ days: window, exams: data ?? [] });
  },
});
