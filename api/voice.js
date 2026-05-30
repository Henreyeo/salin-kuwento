export const config = {
  runtime: "edge", // fastest runtime on Vercel
};

export default async function handler(req) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid or missing text" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Optional safety limit (prevents huge payloads)
    const safeText = text.slice(0, 5000);

    // We do NOT generate audio here anymore
    // We only pass text back to frontend for instant TTS
    return new Response(
      JSON.stringify({
        success: true,
        text: safeText,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        message: err.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
