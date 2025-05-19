// src/components/FlowCanvas.tsx
'use client';

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  OnSelectionChangeFunc,
} from 'reactflow';
import 'reactflow/dist/style.css';
import LLMNode from '@/components/LLMNode';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlowJson = { nodes: any[]; edges: any[] };

interface FlowCanvasProps {
  initialJson: FlowJson;
   
  onChange: (json: FlowJson) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
}

export default function FlowCanvas({ initialJson, onChange, onNodeClick }: FlowCanvasProps) {
  /* ───── état interne (utilisé UNE fois au mount) ───── */
  const [nodes, setNodes, onNodesChange] = useNodesState(initialJson.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialJson.edges);

  /* drapeau pour savoir si nous venons de synchroniser */
  const skipNextChange = useRef(false);

  // Synchroniser le canvas avec initialJson seulement si le contenu a réellement changé
  useEffect(() => {
    /** util rapide pour voir si l'array a VRAIMENT changé (contenu profond) */
    const sameNodes =
      JSON.stringify(nodes) === JSON.stringify(initialJson.nodes);
    const sameEdges =
      JSON.stringify(edges) === JSON.stringify(initialJson.edges);

    if (!sameNodes) {
      skipNextChange.current = true;
      setNodes(initialJson.nodes);
    }
    if (!sameEdges) {
      skipNextChange.current = true;
      setEdges(initialJson.edges);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialJson]);      // déclenche UNIQUEMENT si FlowPage a vraiment muté

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /* ───── Types de nœuds personnalisés ───── */
  const nodeTypes = useMemo(() => ({ llm: LLMNode }), []);

  /* ───── connexion entre nœuds ───── */
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  /* ───── remonte les changements au parent ───── */
  useEffect(() => {
    if (skipNextChange.current) {
      /* on vient juste de se synchroniser : on ignore ce passage */
      skipNextChange.current = false;
      return;
    }
    onChange({ nodes, edges });          // ✅ uniquement les vraies actions utilisateur
  }, [nodes, edges, onChange]);

  /* ─────────── rendu ─────────── */
  return (
    <div
      className="w-full h-full"
      tabIndex={0} /* pour recevoir la touche Suppr */
      onKeyDown={(e) => {
          // ——— Duplication avec Ctrl+D ———
          if (e.key === 'd' && e.ctrlKey && selectedIds.length) {
            e.preventDefault();
            setNodes((nds) => {
              const now = Date.now();
              const clones = nds
                .filter((n) => selectedIds.includes(n.id))
                .map((n, i) => ({
                  ...n,
                  id: `n${now + i}`,                /* nouvel id unique */
                  position: { x: n.position.x + 60, y: n.position.y + 60 },
                }));
              /* sélectionne directement les clones */
              setSelectedIds(clones.map((c) => c.id));
              return [...nds, ...clones];
            });
            return;
          }
          // ——— Suppression avec Suppr ou Backspace ——— 
        if (
          (e.key === 'Delete' || e.key === 'Backspace') &&
          selectedIds.length
        ) {
          setNodes((nds) => nds.filter((n) => !selectedIds.includes(n.id)));
          setEdges((eds) => eds.filter(edge => !selectedIds.includes(edge.source) && !selectedIds.includes(edge.target)));
          setSelectedIds([]);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!rfInstance) return;

        /* position du clic → coordonnées canevas */
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = rfInstance.project({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });

        // Étape B: Bon type dans le menu contextuel
        setNodes((nds) => [
          ...nds,
          {
            id: `n${Date.now()}`,
            type: 'llm',
            position: pos,
            data: { prompt: '', model: 'gpt-4o', temperature: 0.7 },
          },
        ]);
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        onInit={setRfInstance}
        onSelectionChange={((p) => {
          const ids = p.nodes.map((n) => n.id);
      
          setSelectedIds((prev) =>
            prev.length === ids.length && prev.every((id, i) => id === ids[i])
              ? prev            // sélection inchangée → pas de setState
              : ids
          );
        }) as OnSelectionChangeFunc}
        style={{ width: '100%', height: '100%' }}
      >
        <Background gap={12} size={1} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
