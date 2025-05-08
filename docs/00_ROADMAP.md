> **Version 2.2 – 8 mai 2025**

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
| **4A** | **ActivePieces (UI)**                | Conteneur ActivePieces prêt ; déclencheurs front ; tests agents réels via UI                            | Phoenix démarré          | ⏳      |
| **4B** | Flows manuels + Piece « Hello »      | Configurer **CrewAI/LangGraph** manuellement ; première Piece « Hello » + test webhook build            | 4A                       | ⏳      |
| **4C** | **Compiler Service (codegen cloud)** | Générer `app/flows/<slug>.py` + runner ; hot‑reload ; **tests CI + suite tenant‑guard (isolation A/B)** | 4B                       | ⏳      |
| **5**  | **Lego‑studio étendu : dual‑target** | Compiler Service v2 : séparer nœuds *cloud* / *edge* ; générer également `edge_scripts/<slug>.py`       | 4C                       | ⏳      |
| **6**  | **Edge‑Agent packaging**             | Agent local (Electron/Go) : tunnel sortant sécurisé, auto‑update, exécution Playwright/AutoHotkey       | 5                        | ⏳      |
| **7**  | **RAG complet**                      | **Llama‑Index** + Chroma ; Pieces RAG ; workflow cloud/edge intégré                                     | Edge‑Agent prêt          | ⏳      |
| **8**  | Guardrails & Robustesse              | Prompt shielding, quotas, retries, monitoring Colang + Phoenix                                          | RAG up                   | ⏳      |
| **9**  | **LLM locaux**                       | Intégrer **Ollama / llama.cpp** via **LiteLLM** ; bench perf                                            | GPU dispo, guardrails ok | 🅿️    |
| **10** | POC Secrétaire‑robot                 | **Playwright** + CrewAI sur sandbox clinique                                                            | Phases 4‑9               | 🕓     |
| **11** | Sécurisation & CI e2e                | **Secret MCP**, tests bout‑en‑bout, CI verte **(incluant tenant‑guard)**                                | 10                       | 🕓     |
| **12** | Packaging Docker Compose             | Bundle tout‑en‑un + docs utilisateur                                                                    | 11                       | 🕓     |

---

## Méta‑procédures

* Chaque phase a son chat dédié (`#S0_setup`, `#S1_memoire`, …).
* Pour **cocher une tâche** : voir le mémo de commande dans chaque chat.
* Après achèvement : **journaliser** dans `JOURNAL_2025.md`.
* Tests toujours dans la branche tenant/<slug> : exécuter, valider et corriger les flows dans l’espace client isolé afin d’éviter toute collision avec main.

---

## 📝 Changelog

| Version  | Date       | Motif                                                                                                     |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| **v2.2** | 2025‑05‑08 | Ajout phases **5 Lego‑studio dual‑target** et **6 Edge‑Agent packaging** ; décalage des phases suivantes. |
| **v2.1** | 2025‑05‑08 | Ajout 4C Compiler Service (codegen cloud).                                                                |
| **v2**   | 2025‑05‑07 | Réécriture complète : découpe 4A/4B, ajout phases 5‑10.                                                   |
| **v1**   | 2025‑04‑29 | Roadmap initiale.                                                                                         |
