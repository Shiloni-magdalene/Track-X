import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, requireAuth, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "create_project",
  title: "Create project",
  description: "Add a new project to the signed-in student's project tracker.",
  inputSchema: {
    name: z.string().trim().min(1).describe("Project name."),
    status: z.string().optional().describe("Status, e.g. planned, in-progress, completed."),
    deadline: z.string().optional().describe("Deadline as an ISO date (YYYY-MM-DD)."),
    github_link: z.string().optional().describe("GitHub repository URL."),
    doc_progress: z.number().optional().describe("Documentation progress percentage, 0-100."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    requireAuth(ctx);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: ctx.getUserId()!,
        name: input.name,
        status: input.status ?? "planned",
        deadline: input.deadline ?? null,
        github_link: input.github_link ?? null,
        doc_progress: Math.max(0, Math.min(100, input.doc_progress ?? 0)),
      })
      .select()
      .maybeSingle();
    if (error) return errorResult(error.message);
    return textResult({ project: data });
  },
});
