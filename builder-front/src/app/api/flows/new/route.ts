import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'flows.json');

async function readFlows() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, 'utf8') || '{}');
  } catch {
    return {};
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function writeFlows(f: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(f, null, 2), 'utf8');
}

export async function POST() {
  const flows = await readFlows();
  let id = crypto.randomUUID();          // Node 18+ ✔
  while (flows[id]) id = crypto.randomUUID();

  flows[id] = { id, name: '' };          // fiche vide
  await writeFlows(flows);

  return NextResponse.json({ id });
}
