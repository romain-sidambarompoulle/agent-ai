> **Version 3.2 – 14 mai 2025**
> Pivot flows LangFlow → Builder maison (post-phase 4A)

## Objectifs pédagogiques

* **Apprendre en construisant** : chaque commande est exécutée puis expliquée.
* **Conserver l’autonomie** : maîtrise du terminal *Python* / *Git* / *Docker* insuffisante donc être très pédagogue.
* **Évoluer sans refonte** : toutes les briques sont open-source...refonte nécessaire, en parler rapidement (je ne suis pas fermé).

---

## Phases du projet (vue d’ensemble)

\| Phase  | Intitulé                             | Objectifs clés...                           | Dépendances clés         | Statut |
\| ------ | ------------------------------------ | --------------...-------------------------- | ------------------------ | ------ |
\| **0**  | Environnement & Hello-World          | Cloner l’ex...                           | Outils installés         | ✅      |
\| **1**  | Mémoire & mini RAG                   | Ajouter \*\*C...                           | Phase 0                  | ✅      |
\| **2**  | Orchestration **LangGraph**          | Graphe \*thi...                           | Phase 1                  | ✅      |
\| **3**  | Multi-agents **CrewAI**              | 3 rôles (an...                           | Phase 2                  | ✅      |
\| 4A     | Stack **ActivePieces CE** isolée                           | ✅    |
\| 4B     | Flows **LangFlow → Builder maison**                 | Import JSON ↔ Builder, déclencheur validé | 4A | ⏳ En cours |
\| 4C     | **Compiler Service** (codegen Cloud + Edge)        | Génération runners Cloud + Edge, push Git | ⚙️ Flow Builder prêt | ⏳ En cours |
\| 4D     | Scaffold **React-Flow Builder** (Next.js 14)               | ⏳ En cours     |
\| 4E     | Intégration **API Builder** (/flows & /build)              | 🕓 À planifier |
\| 5      | Lego-studio dual-target **Cloud / Desktop**                | 🅿️ Prévu      |
\| 6      | **Sécurité & distribution** (signatures, auto-update Edge) | 🅿️ Prévu      |
\| 7      | RAG offline & optimisations embeddings           | 🔜 Backlog     |
\| **8**  | Guardrails & Robustesse              | Prompt shie...                           | RAG up                   | ⏳      |
\| **9**  | **LLM locaux**                       | Intégrer \*\*...                            | GPU dispo, guardrails ok | 🅿️    |
\| **10** | POC Secrétaire-robot                 | \*\*Playwrigh...                            | Phases 4-9               | 🕓     |
\| **11** | Sécurisation & CI e2e                | \*\*Secret MC...                            | 10                       | 🕓     |
\| **12** | Packaging Docker Compose             | Bundle tout...                            | 11                       | 🕓     |

---

## Fiches de phase / sprint

* **activepieces\_4A.md** – Stack isolée ActivePieces.
* **builder\_flows\_4B.md** – Import LangFlow → Builder maison.
* **Legostudio4c.md** – Compiler Service.
* **builder\_front\_4D.md** – Scaffold Front Builder.
* **builder\_front\_4E.md** – Intégration API Builder.
* **Legostudio5.md** – Dual-target Cloud / Desktop.
* **Edgeagent6.md** – Runner Edge.

---

## 📝 Changelog

| Version  | Date       | Motif                                                                               |                                        |
| -------- | ---------- | ----------------------------------------------------------------------------------- | -------------------------------------- |
| **v3.2** | 2025-05-14 | Migration flows 4B+ vers Builder maison ; renommage fichiers                        |                                        |
| **v3.1** | 2025-05-10 | Ajout sprints 4D & 4E (React-Flow Buil...our, bandeau version.                      | **\[OBSOLETE – remplacé par Builder]** |
| v3.0     | 2025-05-10 | Roadmap simplifiée : retrait Objectifs/Dépendances, regroupement « Fondations IA ». |                                        |
| v2.1     | 2025-05-08 | Ajout phases 4A-6 détaillées.                                                       |                                        |
| v2       | 2025-05-07 | Première table structurée.                                                          |                                        |
| v1       | 2025-05-04 | Esquisse initiale.                                                                  |                                        |
