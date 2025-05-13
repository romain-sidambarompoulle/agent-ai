> **Version 2.2 – 8 mai 2025**
> Boussole pivot LangFlow → ActivePieces intégré ; ajout des sprints front‑end **4D** et **4E** (React‑Flow Builder).

## Objectifs pédagogiques

* **Apprendre en construisant** : chaque commande est exécutée puis expliquée.
* **Conserver l’autonomie** : maîtrise du terminal *Python* / *Git* / *Docker* insuffisante donc être très pédagogue.
* **Évoluer sans refonte** : toutes les briques sont open‑source et compatibles entre elles.  Si refonte nécessaire, en parler rapidement (je ne suis pas fermé).

---
## Phases du projet (vue d’ensemble)

| Phase  | Intitulé                             | Objectifs clés                                                                                          | Dépendances clés         | Statut |
| ------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------ | ------ |
| **0**  | Environnement & Hello‑World          | Cloner l’exemple **LangServe** → exécuter localement → dockeriser                                       | Outils installés         | ✅      |
| **1**  | Mémoire & mini RAG                   | Ajouter **ChromaDB** + persistance ; badge concierge                                                    | Phase 0                  | ✅      |
| **2**  | Orchestration **LangGraph**          | Graphe *think → validate → act* ; tests transitions                                                     | Phase 1                  | ✅      |
| **3**  | Multi‑agents **CrewAI**              | 3 rôles (analyste, rédacteur, vérificateur) + vote                                                      | Phase 2                  | ✅      |
| 4A     | Stack **ActivePieces CE** isolée                           | ⏳ En cours     |
| 4B     | Flows **LangFlow → ActivePieces**                          | ⏳ En cours     |
| 4C     | **Compiler Service** (codegen Cloud + Edge)                | ⏳ En cours     |
| 4D     | Scaffold **React‑Flow Builder** (Next.js 14)               | ⏳ En cours     |
| 4E     | Intégration **API Builder** (/flows & /build)              | 🕓 À planifier |
| 5      | Lego‑studio dual‑target **Cloud / Desktop**                | 🅿️ Prévu      |
| 6      | **Sécurité & distribution** (signatures, auto‑update Edge) | 🅿️ Prévu      |
| 7      | RAG offline & optimisations embeddings           | 🔜 Backlog     |

| **8**  | Guardrails & Robustesse              | Prompt shielding, quotas, retries, monitoring Colang + Phoenix                                          | RAG up                   | ⏳      |
| **9**  | **LLM locaux**                       | Intégrer **Ollama / llama.cpp** via **LiteLLM** ; bench perf                                            | GPU dispo, guardrails ok | 🅿️    |
| **10** | POC Secrétaire‑robot                 | **Playwright** + CrewAI sur sandbox clinique                                                            | Phases 4‑9               | 🕓     |
| **11** | Sécurisation & CI e2e                | **Secret MCP**, tests bout‑en‑bout, CI verte **(incluant tenant‑guard)**                                | 10                       | 🕓     |
| **12** | Packaging Docker Compose             | Bundle tout‑en‑un + docs utilisateur                                                                    | 11                       | 🕓     |

---
## Fiches de phase / sprint

* **activepieces\_4A.md** – Stack isolée ActivePieces.
* **flows4B.md** – Import LangFlow → AP.
* **Legostudio4c.md** – Compiler Service.
* **builder\_front\_4D.md** – Scaffold Front Builder.
* **builder\_front\_4E.md** – Intégration API Builder.
* **Legostudio5.md** – Dual‑target Cloud / Desktop.
* **Edgeagent6.md** – Runner Edge.

---

## 📝 Changelog

| Version  | Date       | Motif                                                                               |
| -------- | ---------- | ----------------------------------------------------------------------------------- |
| **v3.1** | 2025-05-10 | Ajout sprints 4D & 4E (React‑Flow Builder), statuts mis à jour, bandeau version.    |
| v3.0     | 2025-05-10 | Roadmap simplifiée : retrait Objectifs/Dépendances, regroupement « Fondations IA ». |
| v2.1     | 2025‑05‑08 | Ajout phases 4A‑6 détaillées.                                                       |
| v2       | 2025‑05‑07 | Première table structurée.                                                          |
| v1       | 2025‑05‑04 | Esquisse initiale.                                                                  |
