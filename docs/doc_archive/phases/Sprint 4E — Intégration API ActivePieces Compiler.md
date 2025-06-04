# Sprint 4E — Intégration API **Builder** / Compiler

> **Version 0.2 – 14 mai 2025**
> **Objectif :** connecter le scaffold React‑Flow Builder (4D) au backend **Builder + Compiler**, avec les hooks nécessaires pour la **Phase 5** (dual‑target Cloud / Edge).
> 🛠️ *Métaphore* : on relie maintenant les câbles au **tableau électrique Builder** ; l’étage Edge est déjà câblé mais son disjoncteur reste OFF jusqu’au sprint 5.

---

## 1. Prérequis GO ✅

* Repo `builder-front` présent (**Sprint 4D** terminé).
* Endpoints live (exposés par le service `builder-api`, port **41<idx>**) :

  * `GET  /flows`         – liste
  * `GET  /flows/:id`     – détail JSON
  * `PUT  /flows/:id`     – update
  * `POST /flows/import` – import JSON (export LangFlow)
  * `POST /build`         – build Cloud/Edge (200 OK, header `X‑Api‑Key: $env:BLD_KEY`)
* Token JWT utilisateur (claim `slug`).

---

## 2. Extensions structure (anticipation Phase 5)

```text
builder-front/
├─ lib/
│  ├─ api.ts             # axios instance + typed hooks (react-query)
│  └─ auth.ts            # getToken(), attach Authorization header
├─ components/
│  ├─ FlowUpload.tsx     # Drag‑n‑drop JSON → POST /flows/import
│  ├─ BuildDialog.tsx    # Choix target : cloud|edge (Phase 5 ready)
│  └─ Toast.tsx          # react-hot-toast wrapper
├─ app/flows/page.tsx    # Liste + bouton "Importer JSON"
├─ app/flows/[id]/page.tsx
│  └─ utilise FlowCanvas + BuildDialog
└─ tests/e2e/            # cypress specs (import + build)
```

---

## 3. Dépendances supplémentaires

```yaml
- cmd: pnpm add axios react-hot-toast @hookform/resolvers react-hook-form
  path: C:\projets\agent-ai\builder-front
  venv: off
- cmd: pnpm add -D cypress
  path: C:\projets\agent-ai\builder-front
  venv: off
```

---

## 4. Exemple d’appel API (axios instance)

```ts
// lib/api.ts
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FlowSchema } from "./schema";
import { getToken } from "./auth";

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
api.interceptors.request.use((config) => {
  config.headers["Authorization"] = `Bearer ${getToken()}`;
  return config;
});

export const useFlows = () =>
  useQuery({ queryKey: ["flows"], queryFn: () => api.get("/flows").then(r => r.data) });

export const useFlow = (id: string) =>
  useQuery({ queryKey: ["flow", id], queryFn: () => api.get(`/flows/${id}`).then(r => r.data) });

export const useSaveFlow = (id: string) =>
  useMutation({ mutationFn: (data: FlowSchema) => api.put(`/flows/${id}`, data) });

export const useImportFlow = () =>
  useMutation({ mutationFn: (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post("/flows/import", fd);
  }});

export const useBuild = () =>
  useMutation({ mutationFn: (payload: { id: string; target: "cloud"|"edge" }) => api.post("/build", payload) });
```

---

## 5. Composant BuildDialog (cloud ↔ edge)

```tsx
// components/BuildDialog.tsx
"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBuild } from "@/lib/api";
import toast from "react-hot-toast";

export default function BuildDialog({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (v: boolean)=>void }) {
  const build = useBuild();
  const handleBuild = (target: "cloud"|"edge") => {
    build.mutate({ id, target }, {
      onSuccess: () => { toast.success(`Build ${target} lancé !`); onOpenChange(false); },
      onError: () => toast.error("Erreur build")
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <h3 className="text-lg font-semibold mb-4">Choisir la cible du build</h3>
        <div className="flex gap-4">
          <Button onClick={() => handleBuild("cloud")}>🌩️ Cloud</Button>
          <Button onClick={() => handleBuild("edge")}>🖥️ Edge*</Button>
        </div>
        <p className="text-xs mt-2">*Edge disponible en Phase 5 (câblé mais disjoncteur OFF).</p>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 6. Mise à jour FlowCanvas (hook save)

```tsx
// components/FlowCanvas.tsx (ajout)
const saveMutation = useSaveFlow(flowId);
const handleSave = useCallback(() => {
  saveMutation.mutate({ nodes: data.nodes, edges: data.edges });
}, [saveMutation, data]);
```

---

## 7. Tests e2e de base (cypress)

```js
// tests/e2e/import_build.cy.js
it('importe un flow puis lance un build cloud', () => {
  cy.visit('/flows');
  cy.contains('Importer JSON').selectFile('cypress/fixtures/hello_agent.flow.json');
  cy.contains('Importer').click();
  cy.contains('hello_agent').click();
  cy.contains('Build').click();
  cy.contains('🌩️ Cloud').click();
  cy.contains('Build cloud lancé !');
});
```

---

## 8. CI GitHub – ajout e2e

```yaml
jobs:
  lint-build:
    ... # (inchangé)
  e2e:
    runs-on: ubuntu-latest
    container: cypress/included:13.8.1
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - run: pnpm i --frozen-lockfile
      - run: pnpm run build
      - run: pnpm cypress run --browser chrome
```

---

## 9. Check-list fin sprint 4E

* [ ] Liste des flows (GET) affiche les titres.
* [ ] Import JSON via **FlowUpload** crée un flow.
* [ ] Édition React‑Flow sauvegarde (PUT).
* [ ] Bouton **Build Cloud** fonctionne (toast OK, mutation POST).
* [ ] CI lint + build + e2e verte.

---

### 🗓️ Anticipation Phase 5 (Edge)

* `BuildDialog` déjà câblé pour `target:"edge"`.
* Toast affiche « Edge disponible Phase 5 ».
* Hook `useBuild` accepte `edge` : endpoint répond **202 Accepted** pour l’instant.

---

### 📝 Changelog

| Version | Date       | Motif                                                                                                       |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| 0.1     | 2025‑05‑10 | Création Sprint 4E — intégration API, hooks, dialog build, tests e2e ; anticipation Edge Phase 5            |
| **0.2** | 2025‑05‑14 | **Pivot ActivePieces → Builder** : ports 41<idx>, header `X‑Api‑Key`, renommages texte & métaphores Builder |
