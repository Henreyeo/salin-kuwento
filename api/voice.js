export const config = {
  runtime: "edge", // ⚡ faster than serverless (important for Vercel timeout issues)
};

export default async function handler(req) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid text input" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Trim text to prevent long TTS overload (critical for speed)
    const safeText = text.slice(0, 3000);

    // Call OpenAI TTS (fast model: tts-1)
    const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1", // ⚡ fastest TTS model
        voice: "alloy", // fast neutral voice
        input: safeText,
        format: "mp3",
      }),
    });

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      return new Response(
        JSON.stringify({ error: "TTS failed", details: errText }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream audio directly back to browser (no buffering)
    const audioStream = ttsResponse.body;

    return new Response(audioStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
