import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

function parseDotEnvLine(line: string): { key: string; value: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!match) return null;

  const key = match[1];
  let value = match[2] ?? '';

  if (value.startsWith('"') && value.endsWith('"')) {
    value = value
      .slice(1, -1)
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  } else if (value.startsWith("'") && value.endsWith("'")) {
    value = value.slice(1, -1);
  } else {
    value = value.replace(/\s+#.*$/, '').trim();
  }

  return { key, value };
}

export async function loadEnvFiles(): Promise<void> {
  const initialEnvKeys = new Set(Object.keys(process.env));
  const envFiles = ['.env', '.env.local'];

  for (const fileName of envFiles) {
    const filePath = resolve(process.cwd(), fileName);
    let raw = '';

    try {
      raw = await readFile(filePath, 'utf-8');
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw err;
    }

    for (const line of raw.split(/\r?\n/)) {
      const parsed = parseDotEnvLine(line);
      if (!parsed) continue;
      if (initialEnvKeys.has(parsed.key)) continue;
      process.env[parsed.key] = parsed.value;
    }
  }
}
