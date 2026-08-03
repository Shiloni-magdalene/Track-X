import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getAcademicOverview from "./tools/get-academic-overview";
import listProjects from "./tools/list-projects";
import createProject from "./tools/create-project";
import updateProject from "./tools/update-project";
import logLeetcodeProblem from "./tools/log-leetcode-problem";
import listUpcomingExams from "./tools/list-upcoming-exams";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "academic-ai",
  title: "Academic AI",
  version: "0.1.0",
  instructions:
    "Tools for Academic AI, a student academic & placement tracker. Use `get_academic_overview` for a full snapshot, `list_upcoming_exams` for exam planning, `list_projects`/`create_project`/`update_project` for project tracking, and `log_leetcode_problem` to record solved coding problems. All tools act on the signed-in student's own data.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getAcademicOverview,
    listUpcomingExams,
    listProjects,
    createProject,
    updateProject,
    logLeetcodeProblem,
  ],
});
