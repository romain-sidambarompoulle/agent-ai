# Roadmap – Projet Agents IA

## Objectifs pédagogiques

- **Apprendre en construisant** : chaque commande est exécutée puis expliquée.
- **Conserver l’autonomie** : maîtrise du terminal *Python* / *Git* / *Docker* minimale mais suffisante.
- **Évoluer sans refonte** : toutes les briques sont open‑source et compatibles entre elles.

---

## Phases du projet

| Phase | Intitulé | Objectif principal |
|-------|----------|--------------------|
| **0** | Mise en place environnement & Hello‑World | Cloner l’exemple LangServe → exécuter localement → dockeriser → déployer (Render). |
| **1** | Agent enrichi | Ajouter mémoire + mini RAG (Chroma). |
| **2** | Orchestration **LangGraph** | Refactoriser en graphe d’états « think‑validate‑act ». |
| **3** | Multi‑agents **CrewAI** | Créer 2‑3 rôles (analyste, vérificateur, rédacteur) et voter sur la réponse. |
| **4** | Création d'un RAG pour experimentation| Commprendre le RAG sa création son utilisation et comprendre comment en tirer le plus davantage. |
| **5** | LLM local & *docker‑compose* | Lancer **Ollama** en conteneur, basculer l’endpoint OpenAI vers le serveur **llama.cpp**. |
| **6** | Tests, Guardrails & Observabilité | Intégrer **TruLens**, règles **Guardrails Colang**, dashboard **Phoenix**. |
| **7** | Intégration ERP *(optionnel / en pause)* | L’ERP pourra être ajouté quand prêt. |

---

## Méta‑procédures

- Chaque phase correspond à un chat dédié (`#S0_setup`, `#S1_enrichi`, …).
- Pour **cocher une tâche** : voir le mémo de commande dans chaque chat.
- Après achèvement : **ajouter une entrée** au `JOURNAL_2025.md`.

---

