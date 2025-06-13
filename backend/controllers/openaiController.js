const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate reply suggestions based on chat snippet and tone
 */
exports.generateReplies = async (req, res) => {
    try {
        const { snippet, tone } = req.body;

        // Validate inputs
        if (!snippet) {
            return res.status(400).json({ error: 'Chat snippet is required' });
        }

        const selectedTone = tone || 'friendly'; // Default to friendly if no tone is provided

        // Define the prompt for OpenAI
        const prompt = `
      Below is a chat conversation snippet. Generate 3 distinct response options in a ${selectedTone} tone.
      Each response should be unique, natural, and appropriate for the conversation.
      
      Chat snippet: "${snippet}"
      
      Format your response with exactly 3 numbered replies as follows:
      1. [First reply option]
      2. [Second reply option]
      3. [Third reply option]
    `;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // or your preferred model
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates natural text message replies."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 250
        });

        // Extract and parse the response
        const responseText = completion.choices[0].message.content;

        // Parse the 3 replies using regex
        const replies = [];
        const regex = /\d+\.\s+(.+?)(?=\n\d+\.|\n*$)/gs;
        let match;

        while ((match = regex.exec(responseText)) !== null) {
            replies.push(match[1].trim());
        }

        // Ensure we have at least some replies
        if (replies.length === 0) {
            // Fallback: just split by newlines if parsing failed
            const fallbackReplies = responseText.split('\n')
                .filter(line => line.trim() !== '')
                .slice(0, 3);

            return res.json({ replies: fallbackReplies });
        }

        // Return the parsed replies
        return res.json({ replies });

    } catch (error) {
        console.error('Error generating replies:', error);
        return res.status(500).json({
            error: 'Failed to generate replies',
            details: error.message
        });
    }
};