import type { AIClient } from './types.ts';
import { OPENAI_DEFAULT_API_BASE, OPENAI_DEFAULT_MODEL } from './types.ts';

async function callOpenAICompatible(
  prompt: string,
  apiKey: string,
  apiBase: string,
  model: string
): Promise<string> {
  const normalizedBase = apiBase.replace(/\/+$/, '');
  const needsJson = prompt.includes('"results"') || prompt.includes('"index"');
  const messages: Array<{ role: string; content: string }> = [];
  if (needsJson) {
    messages.push({
      role: 'system',
      content: 'You are a JSON-only API. You MUST respond with valid JSON and nothing else. No markdown, no explanations, no preamble. Output starts with { and ends with }.',
    });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${normalizedBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      top_p: 0.8,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`OpenAI-compatible API error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === 'text' && typeof item.text === 'string')
      .map(item => item.text)
      .join('\n');
  }
  return '';
}

export function inferOpenAIModel(apiBase: string): string {
  const base = apiBase.toLowerCase();
  if (base.includes('deepseek')) return 'deepseek-chat';
  return OPENAI_DEFAULT_MODEL;
}

export function createAIClient(config: {
  openaiApiKey: string;
  openaiApiBase?: string;
  openaiModel?: string;
}): AIClient {
  const apiBase = (config.openaiApiBase?.trim() || OPENAI_DEFAULT_API_BASE).replace(/\/+$/, '');
  const model = config.openaiModel?.trim() || inferOpenAIModel(apiBase);

  return {
    async call(prompt: string): Promise<string> {
      return callOpenAICompatible(prompt, config.openaiApiKey, apiBase, model);
    },
  };
}

export function parseJsonResponse<T>(text: string): T {
  let jsonText = text.trim();

  // Strip markdown code fences
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  // Fast path: text is already valid JSON
  try {
    return JSON.parse(jsonText) as T;
  } catch {
    // Slow path: extract first { ... } block from garbage
  }

  const start = jsonText.indexOf('{');
  if (start === -1) throw new SyntaxError(`No JSON object found in response: ${jsonText.slice(0, 120)}`);

  // Find matching closing brace
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < jsonText.length; i++) {
    const ch = jsonText[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return JSON.parse(jsonText.slice(start, i + 1)) as T; }
  }

  throw new SyntaxError(`Unterminated JSON object in response: ${jsonText.slice(0, 120)}`);
}
