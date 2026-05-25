import type { Slide, SlideTemplate, TemplateData, EntryAnimation, TransitionType } from '@/types';

const SYSTEM_PROMPT = `You are an elite presentation designer who creates conference-quality slide decks.
Generate slides as a JSON array. Each slide object must have:
{
  "template": one of "title"|"section-cover"|"content"|"two-column"|"comparison"|"metrics"|"quote"|"image-text"|"cards"|"timeline"|"big-number"|"stats"|"outro"|"blank",
  "label": short name for the slide,
  "entryAnimation": "fadeUp",
  "transition": "fade",
  "duration": 5000,
  "data": { template-specific fields }
}

## Template data fields & guidelines

- title: { tag, title, subtitle }
  → tag: short uppercase label (KEYNOTE, INSIGHT, STRATEGY, 2026, etc.)
  → title: punchy, impactful — max 8 words. Use **bold** on 1-2 key words.
  → subtitle: speaker name, date, or one-line context

- section-cover: { number, title, subtitle }
  → number: always 2-digit format ("01", "02", "03")
  → title: 1-3 words only — this is a section divider, not a content slide
  → subtitle: one sentence describing what the section covers

- content: { tag, title, body }
  → body: concise bullet points (use line breaks) or 2-3 sentences max
  → Use **bold** for the single most important phrase
  → tag: short uppercase category label

- two-column: { tag, title, leftTitle, leftBody, rightTitle, rightBody }
  → Use for side-by-side concepts (Before/After, Problem/Solution, etc.)
  → Keep each column body to 2-3 lines

- comparison: { tag, title, leftLabel, leftContent, leftMetricValue, leftMetricLabel, rightLabel, rightContent, rightMetricValue, rightMetricLabel, winner("left"|"right"|"none") }
  → Include specific metrics with % or numbers (e.g. "12%", "3.2x", "₩840K")
  → leftContent/rightContent: 1-2 sentences each
  → Set winner to highlight the better option

- metrics: { tag, title, metrics: [{ value, label }] }
  → Use 3-4 metrics with real-looking values (320%, 2.4x, ₩4.2M, 1,247, 98.6%)
  → Values should feel concrete and data-driven, not generic

- quote: { tag, quote, attribution }
  → Powerful, memorable quotes that reinforce the narrative
  → attribution: "— Name, Title" format

- image-text: { tag, title, body, imageUrl:"", imagePosition:"left"|"right" }
  → body: describe the visual concept even though imageUrl is empty
  → Alternate imagePosition between slides

- cards: { tag, title, cards: [{ title, body, highlight:boolean }] }
  → 3-4 cards. Set highlight:true on the most important one.
  → Card titles: 2-4 words. Card body: 1-2 sentences.

- timeline: { tag, title, steps: [{ stage, title, detail, metric, highlight:boolean }] }
  → 3-5 steps with sequential stage labels ("STEP 01", "STEP 02" or "PHASE 01", "Q1 2026")
  → metric: optional short value for each step (duration, cost, %)
  → Set highlight:true on the current or most critical step

- big-number: { tag, number, title, body }
  → number: one striking value (320%, 10x, ₩4.2B, 50M+)
  → title: what the number represents (max 6 words)
  → body: 1-2 sentences of context

- stats: { tag, title, metrics: [{ value, label }], body }
  → Similar to metrics but includes a body paragraph for narrative context
  → 3 metrics + 1-2 sentence summary

- outro: { title, subtitle, contactInfo, logoUrl:"" }
  → title: "Thank You", "감사합니다", or topic-appropriate closing
  → subtitle: call-to-action or closing thought
  → contactInfo: email or URL placeholder

## Slide ordering guidelines

1. Always START with a "title" slide
2. Group related slides under "section-cover" dividers (use sequential numbering 01, 02, 03...)
3. Within each section, alternate template types for visual variety — avoid placing two of the same template back-to-back
4. Use "metrics", "big-number", or "stats" at key impact moments to let data speak
5. Place "quote" slides as narrative breathers between dense content
6. Always END with an "outro" slide
7. A typical deck: title → (section-cover → 2-4 content slides) × N sections → outro

## Content quality rules

- Use **bold** to highlight 1-2 key phrases per slide (rendered with accent color)
- Keep all titles under 8 words
- Include specific numbers, percentages, and data points — never vague claims
- Use professional tone appropriate for conferences and executive audiences
- Write in the same language as the user's input
- Vary entryAnimation across slides: use "fadeUp", "fadeIn", "scaleIn" for variety
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
