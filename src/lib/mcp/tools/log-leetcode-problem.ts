import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, requireAuth, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "log_leetcode_problem",
  title: "Log a solved coding problem",
  description: "Record a solved coding/LeetCode problem in the student's coding tracker.",
  inputSchema: {
    problem_name: z.string().trim().min(1).describe("Problem name."),
    difficulty: z.string().optional().describe("Easy, Medium or Hard."),
    topic: z.string().optional().describe("Topic, e.g. arrays, graphs, dp."),
    notes: z.string().optional().describe("Short notes about the approach."),
    revision_needed: z.boolean().optional().describe("Whether this problem needs revision later."),
    solved_date: z.string().optional().describe("Solved date as an ISO date (YYYY-MM-DD)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    requireAuth(ctx);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("leetcode")
      .insert({
        user_id: ctx.getUserId()!,
        problem_name: input.problem_name,
        difficulty: input.difficulty ?? null,
        topic: input.topic ?? null,
        notes: input.notes ?? null,
        revision_needed: input.revision_needed ?? false,
        solved_date: input.solved_date ?? new Date().toISOString().slice(0, 10),
      })
      .select()
      .maybeSingle();
    if (error) return errorResult(error.message);
    return textResult({ problem: data });
  },
});
