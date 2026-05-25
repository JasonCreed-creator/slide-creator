import type { Slide, SlideTemplate, TemplateData, EntryAnimation, TransitionType } from '@/types';

const SYSTEM_PROMPT = `You are a professional presentation slide generator.
Generate slides as a JSON array. Each slide object must have:
{
  "template": one of "title"|"section-cover"|"content"|"two-column"|"comparison"|"metrics"|"quote"|"image-text"|"cards"|"blank",
  "label": short name for the slide,
  "entryAnimation": "fadeUp",
  "transition": "fade",
  "duration": 5000,
  "data": { template-specific fields }
}

Template data fields:
- title: { tag, title, subtitle }
- section-cover: { number, title, subtitle }
- content: { tag, title, body }
- two-column: { tag, title, leftTitle, leftBody, rightTitle, rightBody }
- comparison: { tag, title, leftLabel, leftContent, leftMetricValue, leftMetricLabel, rightLabel, rightContent, rightMetricValue, rightMetricLabel, winner("left"|"right"|"none") }
- metrics: { tag, title, metrics: [{ value, label }] }
- quote: { tag, quote, attribution }
- image-text: { tag, title, body, imageUrl:"", imagePosition:"left"|"right" }
- cards: { tag, title, cards: [{ title, body, highlight:boolean }] }

Rules:
- Use **bold** to highlight key words (rendered with accent color)
- Write in the same language as the user's input
- Create professional, impactful content suitable for conferences
- Use specific numbers and data when relevant
- Keep titles concise and punchy
- Return ONLY a valid JSON array, no markdown or explanation`;

const API_KEY_STORAGE = 'slide-creator-anthropic-key';

export function getStoredApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function setStoredApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export async function generateSlides(prompt: string, apiKey: string): Promise<Slide[]> {
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
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message || `API error: ${response.status}`);
  }

  const result = await response.json() as { content: Array<{ text: string }> };
  const text = result.content[0].text.trim();

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI 응답에서 JSON을 찾을 수 없습니다');

  const rawSlides = JSON.parse(jsonMatch[0]) as Array<{
    template: SlideTemplate;
    label: string;
    entryAnimation?: EntryAnimation;
    transition?: TransitionType;
    duration?: number;
    data: TemplateData;
  }>;

  return rawSlides.map((raw, i) => ({
    id: crypto.randomUUID(),
    order: i,
    label: raw.label || `슬라이드 ${i + 1}`,
    template: raw.template || 'content',
    data: raw.data || {},
    transition: raw.transition || 'fade',
    duration: raw.duration || 5000,
    entryAnimation: raw.entryAnimation || 'fadeUp',
  }));
}
