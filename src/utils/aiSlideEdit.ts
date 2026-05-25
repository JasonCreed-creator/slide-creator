import type { Slide, TemplateData } from '@/types';

const SYSTEM_PROMPT = `You are editing a single presentation slide. You will receive the current slide data as JSON and the user's edit instruction.
Return the modified slide data as a JSON object with the same structure, plus optionally a "label" field for the slide name.

Rules:
- Only modify what the user asks for
- Keep the same template type and field structure
- Use **bold** for accent-colored highlights
- Write in the same language as the user
- Return ONLY valid JSON, no markdown or explanation
- The response must be a single JSON object (not an array)`;

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
