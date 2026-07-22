import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are an intelligent Academic & Placement Assistant integrated into a student's personal dashboard. Your purpose is to analyze the student's real-time academic and placement data, identify priorities, predict risks, and provide actionable recommendations. Never invent information. Base every response only on the provided context. If required information is missing, clearly state what is needed instead of making assumptions.

Decision Priority (in order):
1. Exams within the next 7 days
2. Overdue assignments
3. Projects nearing deadlines
4. Weak subjects
5. Placement preparation
6. Aptitude practice
7. Coding practice
8. Certificates
9. Resume improvements
10. LinkedIn updates

Response Format (use this structure with markdown headings):
### Current Status
Brief summary of the student's current position.
### Key Insights
Important observations derived from the data.
### Top Priorities
Ranked list of the most important tasks.
### Recommended Actions
Specific step-by-step actions.
### Risks
Potential issues if current progress continues.
### Next Milestone
The most impactful goal to complete next.

End with one short encouraging sentence about consistency and progress.

Rules: Never fabricate marks, deadlines, or statistics. Mention uncertainty when data is incomplete. Keep recommendations practical and measurable. Explain reasoning. Use concise bullet points.`;

export const chatWithAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { messages: ChatMessage[] }) => {
    if (!input || !Array.isArray(input.messages)) throw new Error("Invalid input");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Gather all user context in parallel
    const [profile, subjects, exams, skills, aptitude, aptitudeMocks, leetcode, projects, linkedin, certificates] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("subjects").select("*"),
        supabase.from("exams").select("*, subjects(name)"),
        supabase.from("skills").select("*"),
        supabase.from("aptitude").select("*"),
        supabase.from("aptitude_mocks").select("*").order("date", { ascending: false }).limit(10),
        supabase.from("leetcode").select("*"),
        supabase.from("projects").select("*"),
        supabase.from("linkedin_tracker").select("*"),
        supabase.from("certificates").select("*"),
      ]);

    const contextData = {
      today: new Date().toISOString().slice(0, 10),
      profile: profile.data,
      subjects: subjects.data ?? [],
      exams: exams.data ?? [],
      skills: skills.data ?? [],
      aptitude: aptitude.data ?? [],
      aptitude_mocks: aptitudeMocks.data ?? [],
      leetcode: leetcode.data ?? [],
      projects: projects.data ?? [],
      linkedin: linkedin.data ?? [],
      certificates: certificates.data ?? [],
    };

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "system",
            content: `Student data (single source of truth, JSON):\n${JSON.stringify(contextData)}`,
          },
          ...data.messages,
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      if (response.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (response.status === 402) throw new Error("AI credits exhausted. Add credits in your workspace billing.");
      throw new Error(`AI request failed (${response.status}): ${text.slice(0, 200)}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    return { content };
  });
