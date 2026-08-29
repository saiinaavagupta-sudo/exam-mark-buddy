import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  paper: z.enum(["literature", "directed", "composition"]),
  context: z.string().min(1),
  total: z.number(),
  questionImage: z.string().min(20),
  answerImage: z.string().min(20),
});

const AO: Record<string, string> = {
  literature: `Cambridge IGCSE Literature in English (0475), marked out of 25 using the Cambridge levels-based criteria:
- Knowledge and understanding of the text, its concerns and contexts.
- Response to the writer's use of language, form and structure, with sustained personal engagement.
- A structured, well-communicated argument supported by relevant, well-integrated textual reference/quotation.`,
  directed: `Cambridge IGCSE First Language English (0500) Directed Writing, marked out of 35:
- Reading/Content (15): understanding and use of the source ideas, relevance to task, audience, purpose and format; development of ideas rather than lifting.
- Writing (20): structure, register, style, vocabulary and technical accuracy.`,
  composition: `Cambridge IGCSE First Language English (0500) Composition (narrative/descriptive), marked out of 40:
- Content and structure (16): originality, development, shaping, cohesion, effective openings/endings.
- Style and accuracy (24): vocabulary choice, sentence variety, imagery, punctuation, grammar, spelling.`,
};

export const markAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Grading service is not configured.");

    const system = `You are a strict, experienced Cambridge IGCSE examiner marking a student's OWN handwritten work from photographs.

${AO[data.paper]}

ABSOLUTE RULE: You must NEVER write, generate, rewrite, draft, or suggest any exam answer text, model answer, sample paragraph, sample sentence, essay or "here's how you could phrase it" wording. You only evaluate what the student actually wrote. If asked or tempted to produce answer content, refuse within the feedback.

Process:
1. Read the question photo and the handwritten answer photo.
2. If either image is blank, illegible, not an exam question/answer, or the answer clearly does not respond to the question, do NOT invent a mark: set "valid" to false and explain the problem plainly.
3. Otherwise mark strictly to Cambridge standards out of ${data.total}. Do not be generous.

Return ONLY JSON with this exact shape:
{"valid": boolean, "mark": number|null, "total": ${data.total}, "feedback": string}
"feedback" must be 150-250 words, addressed directly to the student ("you"), covering: what genuinely worked, what is weak or missing against the assessment criteria, and specific concrete next steps. No generic praise. No model answer or suggested wording.`;

    const body = {
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Set text / component context: ${data.context}. Marked out of ${data.total}. First image = the exam question. Second image = my handwritten answer. Mark it.`,
            },
            { type: "image_url", image_url: { url: data.questionImage } },
            { type: "image_url", image_url: { url: data.answerImage } },
          ],
        },
      ],
      response_format: { type: "json_object" as const },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Too many requests right now — wait a moment and try again.");
      if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
      throw new Error(`Marking failed (${res.status}). ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content ?? "";
    let parsed: { valid?: boolean; mark?: number | null; feedback?: string };
    try {
      parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "").trim());
    } catch {
      return { valid: false, mark: null, total: data.total, feedback: raw || "No response from the marker." };
    }

    return {
      valid: parsed.valid !== false,
      mark: typeof parsed.mark === "number" ? parsed.mark : null,
      total: data.total,
      feedback: parsed.feedback ?? "No feedback returned.",
    };
  });
