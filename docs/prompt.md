# Gemini Prompt & Schema

## Prompt Template

The following prompt is sent to Google Gemini (`gemini-2.0-flash`) via the Next.js API route `/api/generate-flashcards`:

```
You are an expert educator and flashcard creator. Generate exactly {numCards} flashcards about the topic "{topic}" at a "{difficulty}" difficulty level. {examContext}

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
- Generate EXACTLY {numCards} cards
- Questions should progress from foundational to more nuanced
- Answers should be educational and accurate
- Hints should be helpful but not give away the answer
- Return ONLY the JSON object, nothing else
```

## Variables

| Variable      | Source           | Example                    |
|---------------|------------------|----------------------------|
| `{topic}`     | User input       | "React Hooks"              |
| `{difficulty}`| User selection   | "Beginner"                 |
| `{numCards}`  | User slider      | 10                         |
| `{examContext}` | Optional dropdown | Interview / School / Cert |

## Expected Response Schema

```json
{
  "title": "string – short descriptive title",
  "cards": [
    {
      "question": "string – the flashcard question",
      "answer": "string – thorough but concise answer",
      "hint": "string – helpful recall hint"
    }
  ]
}
```

## Validation

The API route validates:
1. Response is valid JSON (strips markdown code fences if present)
2. `title` exists and is a string
3. `cards` is a non-empty array
4. Each card has `question`, `answer`, and `hint` fields
5. On validation failure → returns 502 with descriptive error → user can retry
