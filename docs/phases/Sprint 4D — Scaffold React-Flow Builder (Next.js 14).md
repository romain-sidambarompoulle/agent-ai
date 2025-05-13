# Sprint 4D — Scaffold React‑Flow Builder (Next.js 14)

> **Version 0.1 — 10 mai 2025**
> **Objectif :** poser l’ossature **Next.js 14** + **React‑Flow** en anticipant le sprint 4E (intégration API ActivePieces / Compiler).
> 🏗️ *Métaphore* : on dresse l’armature du hangar avant de brancher les câbles électriques.

## 1. Prérequis GO ✅

* `FlowSchema` v1 figée.
* Endpoint `/build` renvoie **200 OK**.
* Tests `tenant-guard` verts sur 2 locataires.

## 2. Structure cible (anticipation 4E)

```
builder-front/
├─ app/
│  ├─ (auth)/layout.tsx         # Auth JWT (lecture-seule)
│  ├─ flows/page.tsx            # Liste des flows (GET /flows)
│  ├─ flows/[id]/page.tsx       # Canvas React‑Flow (GET /flows/:id)
│  └─ build/[id]/page.tsx       # Bouton Build Edge (POST /build)
├─ components/
│  ├─ FlowCanvas.tsx            # Wrapper React‑Flow, anticipé 4E
│  ├─ FlowToolbar.tsx           # Actions (save, export, build)
│  └─ Loading.tsx               # Spinner shadcn/ui
├─ lib/
│  ├─ api.ts                    # fetcher w/ react‑query (stub)
│  └─ schema.ts                 # zod version de FlowSchema
├─ styles/
│  └─ globals.css               # Tailwind + tokens
├─ public/brand/                # Logos white‑label (multi‑tenant)
├─ .env.example                 # NEXT_PUBLIC_API_URL, AUTH_ISSUER…
├─ next.config.js               # Output standalone, basePath="/builder"
└─ tailwind.config.js           # Theme couleurs (import Boussole)
```

## 3. Commandes bootstrap (Windows / PowerShell)

```yaml
- cmd: npx create-next-app@latest builder-front --ts --tailwind --eslint --app --import-alias "@/*"
  path: C:\projets\agent-ai
  venv: off
- cmd: cd builder-front; pnpm add react-flow-renderer @tanstack/react-query zod lucide-react shadcn-ui
  path: C:\projets\agent-ai
  venv: off
- cmd: npx shadcn-ui@latest init -y
  path: C:\projets\agent-ai\builder-front
  venv: off
```

> *Note* : substituez `pnpm` par `npm` si PNPM non installé.

## 4. Composant FlowCanvas (stub prêt 4E)

```tsx
// components/FlowCanvas.tsx
"use client";
import React, { useCallback } from "react";
import ReactFlow, { Background, Controls } from "react-flow-renderer";
import { Button } from "@/components/ui/button";

export default function FlowCanvas({ initialNodes, initialEdges, onSave }: {
  initialNodes: any[];
  initialEdges: any[];
  onSave: (nodes: any[], edges: any[]) => void;
}) {
  const handleSave = useCallback(() => {
    onSave(initialNodes, initialEdges); // 🔌 4E: POST /flows/:id
  }, [onSave, initialNodes, initialEdges]);

  return (
    <div className="h-full w-full">
      <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
      <div className="absolute bottom-4 right-4 space-x-2">
        <Button onClick={handleSave}>Enregistrer</Button>
      </div>
    </div>
  );
}
```

## 5. Hooks & API (anticipation 4E)

```ts
// lib/api.ts (stub)
import { useQuery, useMutation } from "@tanstack/react-query";

export const useFlows = () => useQuery({ queryKey: ["flows"], queryFn: fetchFlows });
export const useFlow = (id: string) => useQuery({ queryKey: ["flow", id], queryFn: () => fetchFlow(id) });
export const useBuild = () => useMutation({ mutationFn: buildFlow });
```

## 6. CI GitHub minimal

```yaml
name: builder-front CI
on: [push]
jobs:
  lint-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - run: pnpm i --frozen-lockfile
      - run: pnpm run lint && pnpm run build
```

## 7. Check‑list fin sprint 4D

* [ ] Repo **builder-front** créé sur GitHub.
* [ ] Scaffold Next.js installé + dépendances React‑Flow, shadcn/ui, react‑query, zod.
* [ ] Composant **FlowCanvas** compilable.
* [ ] CI lint + build verte.

---

### 📝 Changelog

| Version | Date       | Motif                                     |
| ------- | ---------- | ----------------------------------------- |
| 0.1     | 2025-05-10 | Création scaffold Sprint 4D anticipant 4E |
