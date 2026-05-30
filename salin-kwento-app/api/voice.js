export default async function handler(req, res) {
    // Only allow secure POST network requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, language } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'No text provided' });
    }

    // Determine the ideal AI voice ID based on the language detected by your frontend
    // (These IDs match OpenAI's natural narrative voice profiles)
    const chosenVoice = language === 'fil-PH' ? 'shimmer' : 'alloy';

    try {
        // Send the story text to the AI Text-to-Speech Engine
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AI_VOICE_KEY}`, // Your key stays safely locked in Vercel
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1',
                input: text,
                voice: chosenVoice,
                response_format: 'mp3',
                speed: 0.92 // Slightly relaxed reading speed for children
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: errorData.error.message });
        }

        // Convert the audio stream data to a buffer and stream it back to your webpage
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'audio/mpeg');
        return res.send(buffer);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}