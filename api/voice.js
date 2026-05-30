export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, language } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'No text provided' });
    }

    // Assign kid-friendly voice profiles based on language 
    const voiceName = language === 'fil-PH' ? 'Kore' : 'Puck'; 
    
    // Child-friendly storytelling instructions injected into the AI prompt
    const storytellingPrompt = `Read this story segment to a child warmly, clearly, and expressively: "${text}"`;

    try {
        // Calling the Gemini API Endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${process.env.AI_VOICE_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: storytellingPrompt }]
                }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: voiceName
                            }
                        }
                    }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: `Gemini Error: ${errorText}` });
        }

        const data = await response.json();
        
        // Extract the base64 audio block from Gemini's standard response object
        const base64Audio = data.candidates[0].content.parts[0].inlineData.data;
        const audioBuffer = Buffer.from(base64Audio, 'base64');

        // Send the raw audio file back to the child's browser overlay
        res.setHeader('Content-Type', 'audio/wav');
        return res.send(audioBuffer);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
