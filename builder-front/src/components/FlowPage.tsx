// src/components/FlowPage.tsx
// -------------------------------------------------------------
// Composant principal d'édition visuelle d'un flow
// Ajout : champ d'édition du NOM + bouton 💾 pour sauvegarder
// -------------------------------------------------------------
'use client';

import { useEffect, useState, useCallback } from 'react';
import FlowCanvas from '@/components/FlowCanvas';
import { Node } from 'reactflow';
import SidebarProperties from '@/components/SidebarProperties';
import { useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlowJson = { nodes: Node[]; edges: any[] };

type FlowMeta = { id: string; name?: string };

export default function FlowPage({ id }: { id: string }) {
  /* ────────── État local : structure + meta ────────── */
  const [flow, setFlow] = useState<FlowJson | null>(null);
  const [name, setName] = useState<string>(id);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [runInput, setRunInput] = useState('');
  const [runOutput, setRunOutput] = useState('');

  const [savingName, setSavingName] = useState(false);
  const [renameStatus, setRenameStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  /* ───── Charge le JSON DU FLOW (nodes+edges) ───── */
  useEffect(() => {
    fetch(`/api/flows?id=${id}`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (json) {
          setFlow(json);
          setSelectedNode(null);
        }
      })
      .catch(console.error);
  }, [id]);

  /* ───── Charge le méta (nom) ───── */
  useEffect(() => {
    fetch(`/api/flows/${id}`)
      .then(r => (r.ok ? r.json() : null))
      .then((meta: FlowMeta | null) => {
        if (meta && meta.name) setName(meta.name);
      })
      .catch(console.error);
  }, [id]);

  /* ───── Enregistre le NOM du flow ───── */
  async function handleRename() {
    setSavingName(true);
    setRenameStatus('idle');
    try {
      const res = await fetch(`/api/flows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setRenameStatus('ok');
        router.refresh(); // met à jour la liste d'accueil si en cache
      } else {
        setRenameStatus('error');
      }
    } catch {
      setRenameStatus('error');
    } finally {
      setSavingName(false);
      setTimeout(() => setRenameStatus('idle'), 2500);
    }
  }

  /* ───── Met à jour les données d'un nœud ───── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateNodeData = useCallback((nodeId: string, partialData: any) => {
    setFlow(currentFlow => {
      if (!currentFlow) return null;
      const updatedNodes = currentFlow.nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...partialData } } : n
      );
      return { ...currentFlow, nodes: updatedNodes };
    });

    setSelectedNode(prev =>
      prev && prev.id === nodeId ? { ...prev, data: { ...prev.data, ...partialData } } : prev
    );
  }, []);

  /* ───── Remonte les modifs du canvas ───── */
  const handleChange = useCallback(
    (newFlowJson: FlowJson) => {
      setFlow(prevFlow => {
        if (
          prevFlow &&
          prevFlow.nodes === newFlowJson.nodes &&
          prevFlow.edges === newFlowJson.edges
        ) {
          return prevFlow;
        }
        if (selectedNode) {
          const newSel = newFlowJson.nodes.find(n => n.id === selectedNode.id);
          setSelectedNode(newSel || null);
        }
        return newFlowJson;
      });
    },
    [selectedNode]
  );

  /* ───── Ajoute un nœud ───── */
  const handleAddNode = () => {
    const newNode: Node = {
      id: `n${Date.now()}`,
      type: 'llm',
      position: { x: 60, y: 60 },
      data: { prompt: '', model: 'gpt-4o', temperature: 0.7 },
    };
    setFlow(prev => {
      const base = prev ?? { nodes: [], edges: [] };
      return { ...base, nodes: [...base.nodes, newNode] };
    });
  };

  /* ───── Sauvegarde les nodes/edges ───── */
  const handleSave = async () => {
    if (!flow) return;
    await fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, json: flow }),
    });
    alert('💾 Flow sauvegardé !');
  };

  /* ───── Exécution du flow ───── */
  async function handleRun() {
    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowId: id, input: runInput }),
    });
    if (res.ok) {
      const { output } = await res.json();
      setRunOutput(output);
    } else {
      setRunOutput("Erreur lors de l'exécution.");
      console.error('Erreur API Run:', await res.text());
    }
  }

  /* ───── Suppression du flow ───── */
  async function handleDelete() {
    if (!confirm('Supprimer ce flow ? Opération irréversible.')) return;

    setDeleting(true);
    const res = await fetch(`/api/flows/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh(); // Pour s'assurer que la page d'accueil est à jour
      router.push('/'); // retour à l'accueil
    } else {
      alert('Erreur lors de la suppression');
      setDeleting(false);
    }
  }

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  /* ─────────── Rendu ─────────── */
  return (
    <div className="flex flex-col h-screen">
      {/* Barre d'en‑tête */}
      <header className="p-2 border-b flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            aria-label="Nom du flow"
            className="border rounded px-2 py-1 w-48"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <button
            onClick={handleRename}
            disabled={savingName}
            className="px-2 py-1 rounded bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50"
          >
            {savingName ? '…' : '💾'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? '…' : '🗑️'}
          </button>
          {renameStatus === 'ok' && <span className="text-green-600 text-sm">✔</span>}
          {renameStatus === 'error' && <span className="text-red-600 text-sm">✖</span>}
        </div>

        <div className="space-x-2 flex items-center">
          <button
            onClick={handleAddNode}
            className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
          >
            + Node
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>

          <input
            className="border px-2 mx-2 py-1"
            placeholder="Input…"
            value={runInput}
            onChange={e => setRunInput(e.target.value)}
          />

          <button
            onClick={handleRun}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Run
          </button>
          {runOutput && <span className="ml-2 italic max-w-xs truncate">→ {runOutput}</span>}
        </div>
      </header>

      {/* Zone principale */}
      <div className="flex flex-1 overflow-hidden">
        <main className="relative flex-1 h-full z-0">
          <FlowCanvas
            initialJson={flow ?? { nodes: [], edges: [] }}
            onChange={handleChange}
            onNodeClick={handleNodeClick}
          />
        </main>
        <aside className="relative w-96 shrink-0 border-l p-4 overflow-y-auto bg-white text-gray-900 z-50">
          <SidebarProperties selected={selectedNode} updateNodeData={updateNodeData} />
        </aside>
      </div>
    </div>
  );
}
