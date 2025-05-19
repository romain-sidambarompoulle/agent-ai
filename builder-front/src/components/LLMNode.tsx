import { NodeProps, Handle, Position } from 'reactflow';
import { LLMNodeData } from '@/lib/nodeTypes';

export default function LLMNode({ data }: NodeProps<LLMNodeData>) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-md">
      <p className="font-semibold text-center truncate text-gray-900">
        {data.prompt.slice(0, 42) || 'LLM Chain'}
      </p>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}