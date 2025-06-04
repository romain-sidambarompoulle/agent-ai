# Sprint 4D — Scaffold React‑Flow Builder (Next.js 14)

> **Version 0.3 – 14 mai 2025**
> **Statut : ✅ Terminé** – la charpente Next.js 14 + React‑Flow est en place ; nous basculons en sprint 4E pour brancher l’**API Builder** et le Compiler.
> 🏗️ *Métaphore* : la structure du hangar est debout ; on va désormais poser les câbles électriques.

---

## 1. Contexte & objectifs

Mettre en place la base front‑end (Next.js 14, React‑Flow, Tailwind) pour :

* Dessiner des workflows IA (drag‑and‑drop, MiniMap).
* Offrir une route Back‑End `/api/flows` mockée le temps que `builder-api` soit câblée (sprint 4E).
* Préparer l’intégration continue (CI) et le dépôt GitHub dédié.

---

## 2. Structure du projet

```text
/apps
  └─ builder-front/          # Next.js 14 + React‑Flow
      ├─ pages/
      ├─ components/FlowCanvas.tsx
      ├─ tailwind.config.ts
      └─ .github/workflows/   # (à créer)
```

---

## 3. Tâches détaillées

| ✔︎ | Tâche                                                               | Dossier / Fichier            |
| -- | ------------------------------------------------------------------- | ---------------------------- |
| ☑️ | **Bootstrap** Next.js 14 : `pnpm dlx create-next-app builder-front` | `/apps`                      |
| ☐ | **Tailwind CSS**                                                     | `tailwind.config.ts`         |
| ☑️ | **React‑Flow** installé + composant `FlowCanvas` + MiniMap          | `/components/FlowCanvas.tsx` |
| ☑️ | **Route API** mock `/api/flows` (in‑memory)                         | `/pages/api/flows.ts`        |
| ☐  | **Repo GitHub** *builder-front* créé & push initial                 | —                            |
| ☐  | **CI GitHub Actions** : job *lint‑build‑test* doit passer ✔️        | `.github/workflows/ci.yaml`  |

---

## 4. Vérification rapide

* `pnpm dev` ➜ app accessible sur `http://localhost:3000/flows/demo` avec grille React‑Flow.
* Drag‑and‑drop fonctionne, MiniMap suit le viewport.
* `curl.exe -s http://localhost:3000/api/flows` renvoie `[]` (mock vide).

---

## 5. Changelog

| Version | Date       | Motif                                                                    |
| ------- | ---------- | ------------------------------------------------------------------------ |
| 0.1     | 2025‑05‑10 | Création scaffold Sprint 4D anticipant 4E                                |
| 0.2     | 2025‑05‑14 | Pivot API ActivePieces → Builder                                         |
| **0.3** | 2025‑05‑14 | Sprint clôturé : tâches bootstrap réalisées, ajout TODO repo GitHub + CI |

---

> *Image mentale* : la **charpente** est solide ; il reste à installer le **tableau électrique** (API Builder) et les **disjoncteurs sécurité** (CI) avant d’inviter les agents IA à l’intérieur.
