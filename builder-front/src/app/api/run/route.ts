import { NextRequest, NextResponse } from 'next/server';



import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import prisma from '@/lib/prisma';
import { isLLMNode } from '@/lib/nodeTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { flowId, input = '' } = await req.json();
  const flow = await prisma.flow.findUnique({ where: { id: flowId } });
  if (!flow) return NextResponse.json({ error: 'flow not found' }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes } = flow.json as any;
  const llm = new ChatOpenAI({ modelName: 'gpt-4o' });
  let current = input;

  for (const n of nodes.filter(isLLMNode)) {
    const prompt = n.data.prompt.replace('{{input}}', current);
    const result = await llm.invoke([new HumanMessage(prompt)]);
    current = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
  }
  return NextResponse.json({ output: current });
}