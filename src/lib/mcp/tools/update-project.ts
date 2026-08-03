import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, requireAuth, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "update_project",
  title: "Update project",
  description: "Update the status, deadline or documentation progress of one of the student's projects.",
  inputSchema: {
    id: z.string().describe("Project id."),
    status: z.string().optional().describe("New status, e.g. planned, in-progress, completed."),
    deadline: z.string().optional().describe("New deadline as an ISO date (YYYY-MM-DD)."),
    doc_progress: z.number().optional().describe("Documentation progress percentage, 0-100."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ id, status, deadline, doc_progress }, ctx) => {
    requireAuth(ctx);
    const supabase = supabaseForUser(ctx);
    const patch: Record<string, unknown> = {};
    if (status !== undefined) patch.status = status;
    if (deadline !== undefined) patch.deadline = deadline;
    if (doc_progress !== undefined) patch.doc_progress = Math.max(0, Math.min(100, doc_progress));
    if (Object.keys(patch).length === 0) return errorResult("Nothing to update.");

    const { data, error } = await supabase.from("projects").update(patch).eq("id", id).select().maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("Project not found.");
    return textResult({ project: data });
  },
});
