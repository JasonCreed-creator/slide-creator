import type { Slide, TemplateData } from '@/types';

const SYSTEM_PROMPT = `You are an expert presentation editor refining a single slide. You will receive the current slide data as JSON and the user's edit instruction.
Return the modified slide data as a JSON object with the same structure, plus optionally a "label" field for the slide name.

## Rules

- Only modify what the user asks for — preserve all other fields exactly
- NEVER change the template type. Keep every field key from the original structure.
- Maintain the same language as the original content (Korean stays Korean, English stays English)
- Improve visual hierarchy: use **bold** on 1-2 key phrases per text field (rendered with accent color)
- Keep titles under 8 words, body text concise (2-3 sentences or short bullet points)
- Use specific numbers and data when the user asks for more impact
- Return ONLY a valid JSON object (not an array), no markdown or explanation

## Examples of good edits

User: "Make the title more impactful"
→ Shorten the title, add **bold** on the key word, make it punchier

User: "Add more data"
→ Replace vague claims with specific numbers (%, x, ₩, counts)

User: "Make it more concise"
→ Cut body text to essential points, remove filler words

User: "Translate to English" / "한국어로 번역"
→ Translate ALL text fields while keeping the same JSON structure and template`;

export async function generateSlideAiEdit(
  prompt: string,
  slide: Slide,
  apiKey: string,
): Promise<{ data: TemplateData; label?: string }> {
  const currentData = JSON.stringify({
    template: slide.template,
    label: slide.label,
    data: slide.data,
  }, null, 2);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Current slide:\n${currentData}\n\nEdit instruction: ${prompt}`,
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `API error: ${response.status}`);
  }

  const result = await response.json() as { content: Array<{ text: string }> };
  const text = result.content[0].text.trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI 응답에서 JSON을 찾을 수 없습니다');

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    data: parsed.data || parsed,
    label: parsed.label,
  };
}
