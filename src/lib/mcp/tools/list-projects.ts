import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, requireAuth, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_projects",
  title: "List projects",
  description: "List the signed-in student's tracked projects with status, deadline and documentation progress.",
  inputSchema: {
    status: z.string().optional().describe("Optional status filter, e.g. planned, in-progress, completed."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status }, ctx) => {
    requireAuth(ctx);
    const supabase = supabaseForUser(ctx);
    let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return errorResult(error.message);
    return textResult({ projects: data ?? [] });
  },
});
