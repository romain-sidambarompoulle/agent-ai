import { Node } from 'reactflow';

export type LLMNodeData = {
    prompt: string;      // Texte du prompt avec {{input}}
    model?: string;      // ex: "gpt-4o" (default)
    temperature?: number // 0-2
  };
  
  export const isLLMNode = (n: Node): n is Node<LLMNodeData> =>
    n.type === 'llm';