import { corsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = `You are MindEase, a compassionate AI mental wellness companion designed for students and young professionals. 

Your role:
- Listen empathetically and without judgment
- Offer emotional support, coping strategies, and gentle guidance
- Detect the user's emotional state from their messages
- Respond with warmth, clarity, and care
- FORMATTING: Avoid long, solid text paragraphs. Instead, format your suggestions, coping advice, and exercises into short, numbered steps or clear bullet points so it is extremely easy for a stressed user to scan and read.
- Keep responses concise and use calming, supportive language — never clinical or robotic
- Include practical micro-techniques formatted as direct, step-by-step "Points of Instruction" when helping with stress or anxiety (e.g. 1. Focus on breath, 2. Relax shoulders)
- Use occasional emojis to feel warm and human (not excessive)

Emotion detection:
- After your response, on a new line output EXACTLY: EMOTION:detected_emotion
- detected_emotion must be one of: neutral, stressed, anxious, happy, sad, motivated, calm

Crisis protocol:
- If you detect self-harm, suicidal ideation, or extreme distress: respond with immediate compassion, validate their pain, and strongly encourage them to call iCall India (9152987821) or Vandrevala Foundation (1860-2662-345). Do not minimize their feelings.

Important disclaimer:
- You are a wellness support tool, NOT a replacement for professional therapy or medical care.
- Never diagnose conditions or prescribe treatments.

Always start your response with genuine empathy for what the user shared.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ONSPACE_AI_API_KEY");
    const baseUrl = Deno.env.get("ONSPACE_AI_BASE_URL");

    if (!apiKey || !baseUrl) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { messages, stream = true, action } = body;

    // ── Generate conversation title ─────────────────────────────────
    if (action === "generate_title") {
      const titleMessages = [
        {
          role: "system",
          content: `You are a helpful assistant. Generate a short, empathetic 3-5 word title for a mental wellness conversation based on the first user message. 
Examples: "Exam Stress Support", "Feeling Overwhelmed Today", "Sleep Anxiety Help", "Work Pressure Relief", "Loneliness and Connection"
Return ONLY the title, no quotes, no punctuation at the end.`,
        },
        {
          role: "user",
          content: `First message: "${messages[0]?.content || "General wellness chat"}"`,
        },
      ];

      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: titleMessages,
          stream: false,
          temperature: 0.7,
          max_tokens: 20,
        }),
      });

      const data = await resp.json();
      const title = data.choices?.[0]?.message?.content?.trim() || "Wellness Chat";
      return new Response(JSON.stringify({ title }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Generate journal AI insight ─────────────────────────────────
    if (action === "journal_insight") {
      const { title: journalTitle, content: journalContent, mood } = body;
      const insightMessages = [
        {
          role: "system",
          content: `You are a compassionate AI wellness analyst. Analyze a journal entry and provide a short, personalized emotional insight (2-3 sentences max).
Focus on: emotional patterns detected, a gentle reframe or encouragement, and one actionable micro-suggestion.
Use warm, non-clinical language. Include 1 relevant emoji at the end. Be specific to their actual words.`,
        },
        {
          role: "user",
          content: `Journal Title: "${journalTitle}"
Mood: ${mood}
Entry: "${journalContent}"

Provide a brief, personalized AI insight for this journal entry.`,
        },
      ];

      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: insightMessages,
          stream: false,
          temperature: 0.8,
          max_tokens: 150,
        }),
      });

      const data = await resp.json();
      const insight = data.choices?.[0]?.message?.content?.trim() || "";
      return new Response(JSON.stringify({ insight }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Default: chat completion ────────────────────────────────────
    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream,
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      return new Response(
        JSON.stringify({ error: `AI service error: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (stream) {
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
