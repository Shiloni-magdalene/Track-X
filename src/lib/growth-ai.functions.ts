import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type GeneratedQuiz = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export const generateGrowthQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { trackId: string; trackTitle: string }) => {
    if (!input?.trackId || !input?.trackTitle) throw new Error("Invalid input");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const [aptitude, leetcode, exams, skills] = await Promise.all([
      supabase.from("aptitude").select("topic, weakness_level, accuracy").eq("user_id", userId),
      supabase.from("leetcode").select("topic, revision_needed").eq("user_id", userId),
      supabase.from("exams").select("weak_topics").eq("user_id", userId),
      supabase.from("skills").select("name, confidence").eq("user_id", userId),
    ]);

    const weakAptitude = (aptitude.data ?? [])
      .filter((a: { weakness_level?: string | null; accuracy?: number | null }) =>
        a.weakness_level === "high" || (a.accuracy != null && a.accuracy < 60),
      )
      .map((a: { topic: string }) => a.topic);
    const revisionLeet = (leetcode.data ?? [])
      .filter((l: { revision_needed?: boolean | null }) => l.revision_needed)
      .map((l: { topic?: string | null }) => l.topic)
      .filter(Boolean);
    const weakExamTopics = ((exams.data ?? []) as Array<{ weak_topics?: unknown }>)
      .flatMap((e) => (Array.isArray(e.weak_topics) ? (e.weak_topics as string[]) : []));
    const weakSkills = (skills.data ?? [])
      .filter((s: { confidence?: number | null }) => (s.confidence ?? 0) < 60)
      .map((s: { name: string }) => s.name);

    const weakList = [...new Set([...weakAptitude, ...revisionLeet, ...weakExamTopics, ...weakSkills])].slice(0, 8);

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const prompt = `Create exactly 3 easy multiple-choice questions for the "${data.trackTitle}" track of a student learning app.
Target the student's weak areas when relevant: ${weakList.length ? weakList.join(", ") : "general fundamentals"}.
Rules:
- Very simple, beginner-friendly English. No jargon.
- Each question has exactly 4 short options.
- Include the index (0-3) of the correct option.
- Add a short plain-English explanation (1-2 sentences).
Return ONLY valid JSON, no prose, matching:
{"questions":[{"question":"...","options":["a","b","c","d"],"answerIndex":0,"explanation":"..."}]}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: "You are a helpful tutor. Reply with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      if (response.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
      if (response.status === 402) throw new Error("AI credits exhausted.");
      throw new Error(`AI request failed (${response.status}): ${text.slice(0, 200)}`);
    }
    const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { questions?: GeneratedQuiz[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    const questions = (parsed.questions ?? []).slice(0, 5).map((q) => ({
      question: String(q.question ?? ""),
      options: Array.isArray(q.options) ? q.options.slice(0, 4).map((o) => String(o)) : [],
      answerIndex: Number(q.answerIndex ?? 0),
      explanation: String(q.explanation ?? ""),
    }));
    return { questions, weakList };
  });
