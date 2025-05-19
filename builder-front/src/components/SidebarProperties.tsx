// src/components/SidebarProperties.tsx
import { Node } from 'reactflow';
import { LLMNodeData } from '@/lib/nodeTypes';

type Props = {
  selected: Node | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateNodeData: (nodeId: string, partialData: any) => void;
};

export default function SidebarProperties({ selected, updateNodeData }: Props) {
  if (!selected || selected.type !== 'llm') return null;

  const d = selected.data as LLMNodeData;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: keyof LLMNodeData, value: any) => {
    if (selected) {
      let processedValue = value;
      if (field === 'temperature') {
        processedValue = parseFloat(value);
        if (isNaN(processedValue)) processedValue = 0;
      }
      updateNodeData(selected.id, { [field]: processedValue });
    }
  };

  return (
    <>
      <label htmlFor="prompt" className="block font-medium">Prompt</label>
      <textarea
        id="prompt"
        value={d.prompt || ''}
        onChange={(e) => handleChange('prompt', e.target.value)}
        className="w-full h-24 border mb-2 p-1 bg-white text-gray-900"
      />
      <label htmlFor="model" className="block font-medium">Model</label>
      <input
        id="model"
        className="w-full border mb-2 p-1 bg-white text-gray-900"
        value={d.model ?? 'gpt-4o'}
        onChange={(e) => handleChange('model', e.target.value)}
      />
      <label htmlFor="temperature" className="block font-medium">Temperature</label>
      <input
        id="temperature"
        type="number"
        step="0.1"
        min="0"
        max="2"
        className="w-full border p-1 bg-white text-gray-900"
        value={d.temperature ?? 0.7}
        onChange={(e) => handleChange('temperature', e.target.value)}
      />
    </>
  );
}