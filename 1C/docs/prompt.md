# Gemini Prompt Strategy

To ensure reliable data extraction from receipt images, we use **Google Gemini 1.5 Flash** with a carefully crafted prompt and strict schema instruction.

## The Prompt

We send the image along with this text prompt:

> Extract data from this receipt image and return strict JSON.
> Schema:
> ```json
> {
>   "merchant": string,
>   "date": string (ISO 8601 YYYY-MM-DD or null),
>   "currency": string (e.g. "USD"),
>   "items": [
>     {"name": string, "qty": number, "unit_price": number, "total_price": number}
>   ],
>   "subtotal": number,
>   "tax": number (null if missing),
>   "tip": number (null if missing),
>   "total": number
> }
> ```
> Ensure all numbers are floats. If quantity is missing, assume 1.
> If an item name is truncated, try to reconstruct it.

## Handling Ambiguity

- **Missing Qty**: Defaults to 1.
- **Truncated Text**: The model is instructed to infer full names (e.g. "Chz Brgr" → "Cheese Burger").
- **Currency symbols**: We prefer standard codes ("USD") over symbols ("$") to avoid parsing issues.

## Parsing logic

The `GeminiService` class:
1. Receives the raw text response.
2. Strips any markdown code fences (if present).
3. Decodes JSON.
4. Validates existence of `items` and `total`.
5. Maps to Dart `Receipt` object.
