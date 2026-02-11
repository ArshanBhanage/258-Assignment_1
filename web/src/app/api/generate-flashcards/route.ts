import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key is not configured on the server.' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { topic, difficulty, numCards, examType } = body;

        if (!topic || !difficulty || !numCards) {
            return NextResponse.json(
                { error: 'Missing required fields: topic, difficulty, numCards' },
                { status: 400 }
            );
        }

        if (numCards < 5 || numCards > 20) {
            return NextResponse.json(
                { error: 'numCards must be between 5 and 20' },
                { status: 400 }
            );
        }

        const examContext = examType
            ? `The flashcards should be tailored for a "${examType}" style exam (e.g., Interview, School, or Certification).`
            : '';

        const prompt = `You are an expert educator and flashcard creator. Generate exactly ${numCards} flashcards about the topic "${topic}" at a "${difficulty}" difficulty level. ${examContext}

Each flashcard must have:
- "question": A clear, concise question
- "answer": A thorough but concise answer
- "hint": A short hint to help the student recall the answer

Return ONLY valid JSON matching this exact schema (no markdown, no explanation, no code fences):
{
  "title": "A short descriptive title for this flashcard deck",
  "cards": [
    {
      "question": "string",
      "answer": "string",
      "hint": "string"
    }
  ]
}

Rules:
- Generate EXACTLY ${numCards} cards
- Questions should progress from foundational to more nuanced
- Answers should be educational and accurate
- Hints should be helpful but not give away the answer
- Return ONLY the JSON object, nothing else`;

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 4096,
            },
        });

        const text = response.text ?? '';

        // Clean the response - remove markdown code fences if present
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.slice(7);
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.slice(3);
        }
        if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.slice(0, -3);
        }
        cleanedText = cleanedText.trim();

        // Parse and validate
        let parsed;
        try {
            parsed = JSON.parse(cleanedText);
        } catch {
            return NextResponse.json(
                { error: 'Gemini returned invalid JSON. Please try again.' },
                { status: 502 }
            );
        }

        // Validate schema
        if (!parsed.title || typeof parsed.title !== 'string') {
            return NextResponse.json(
                { error: 'Invalid response: missing title' },
                { status: 502 }
            );
        }

        if (!Array.isArray(parsed.cards) || parsed.cards.length === 0) {
            return NextResponse.json(
                { error: 'Invalid response: missing or empty cards array' },
                { status: 502 }
            );
        }

        for (let i = 0; i < parsed.cards.length; i++) {
            const card = parsed.cards[i];
            if (!card.question || !card.answer || !card.hint) {
                return NextResponse.json(
                    { error: `Invalid card at index ${i}: missing question, answer, or hint` },
                    { status: 502 }
                );
            }
        }

        return NextResponse.json(parsed);
    } catch (error: unknown) {
        console.error('Error generating flashcards:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Failed to generate flashcards: ${message}` },
            { status: 500 }
        );
    }
}
