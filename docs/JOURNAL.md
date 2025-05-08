# Journal 2025 – Projet Agents IA

> **Version 2 – 7 mai 2025**

Ce carnet recense **toutes** les actions, commandes et décisions techniques du projet. Les entrées sont classées **chronologiquement** (des plus récentes aux plus anciennes) ; un sommaire cliquable facilite la navigation. 

---

## Sommaire

* [2025‑05‑07 – Sprint 4A : Kick‑off ActivePieces #S4A\_ui](#2025-05-07--sprint4a)
* [2025‑05‑06 – Sprint 3 ter : Post‑mortem Phoenix #S3c\_phoenix](#2025-05-06--sprint3ter)
* [2025‑05‑05 – Sprint 3 bis : Consolidation Git & CI #S3b\_ci](#2025-05-05--sprint3bis)
* [2025‑05‑02 – Sprint 3 : Implémentation CrewAI #S3\_crewai](#2025-05-02--sprint3)
* [2025‑05‑02 – Sprint 2 : Orchestration LangGraph #S2\_graph](#2025-05-02--sprint2)
* [2025‑05‑02 – Sprint 1 : Mémoire / Chroma #S1\_chroma](#2025-05-02--sprint1)
* [2025‑04‑30 – Sprint 0 : Setup LangServe #S0\_setup](#2025-04-30--sprint0)

---

## 2025-05-07 – Sprint 4A : Kick‑off ActivePieces #S4A\_ui <a id="2025-05-07--sprint4a"></a>

| Date       | Action                      | Détail / Commande                                                                               |
| ---------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| 2025-05-07 | **Création branche**        | `git checkout -b feat/s4a-activepieces`                                                         |
| 2025-05-07 | **Clone ActivePieces core** | `git submodule add https://github.com/activepieces/activepieces-core.git external/activepieces` |
| 2025-05-07 | **Docker Compose front**    | Ajout service `activepieces-ui` exposé sur **3000**                                             |
| 2025-05-07 | **Phoenix démarré**         | `docker compose up -d phoenix` – collecteur OTEL prêt                                           |
| 2025-05-07 | **Webhook test**            | Flow "Ping → Console" déclenché depuis UI : event log dans Phoenix OK                           |

---

## 2025-05-06 – Sprint 3 ter : Post‑mortem Phoenix Tracing #S3c\_phoenix <a id="2025-05-06--sprint3ter"></a>

*(Résumé détaillé de la session de débogage Phoenix / OTEL, 7 h de travail).* citeturn10file4

| Date       | Action / Décision    | REX                                                                                |
| ---------- | -------------------- | ---------------------------------------------------------------------------------- |
| 2025‑05‑06 | **Échec tracing CI** | Provider OTEL déjà fixé par Phoenix ⇒ aucun span enregistré.                       |
| 2025‑05‑06 | **Tentatives**       | Forcer `trace.set_tracer_provider`, déplacer imports CrewAI, `@pytest.mark.xfail`… |
| 2025‑05‑06 | **Décision**         | Marquer le test *xfail* ; lancer Phoenix **en dehors** de l’image CI.              |
| 2025‑05‑06 | **Pins dépendances** | `litellm 1.38.5`, `crewai 0.118.0`, `arize-phoenix-otel 0.9.2`.                    |
| 2025‑05‑06 | **Docker local**     | `agent-ai:local` 3.5 Go, `/invoke` OK.                                             |

---

## 2025-05-05 – Sprint 3 bis : Consolidation Git & CI #S3b\_ci <a id="2025-05-05--sprint3bis"></a>

| Date       | Action                     | Décision                                                              |
| ---------- | -------------------------- | --------------------------------------------------------------------- |
| 2025‑05‑05 | **Migrations dépendances** | Alignement LangChain & CrewAI; CI repasse au vert.                    |
| 2025‑05‑05 | **Nettoyage branches**     | Branches fusionnées → supprimées locale + GitHub.                     |
| 2025‑05‑05 | **Audit Git**              | `git fsck` → repo sain.                                               |
| 2025‑05‑05 | **Règle d’or**             | Une branche terminée + tests verts ⇒ merge dans **main** puis delete. |

---

## 2025-05-02 – Sprint 3 : Implémentation CrewAI #S3\_crewai <a id="2025-05-02--sprint3"></a>

| Date       | Action                    | Commande / Détail                                    |
| ---------- | ------------------------- | ---------------------------------------------------- |
| 2025‑05‑02 | **Branch feat/s3-crewai** | `git checkout -b feat/s3-crewai`                     |
| 2025‑05‑02 | **Python 3.11**           | `py -3.11 -m venv .venv`                             |
| 2025‑05‑02 | **Install CrewAI 0.118**  | `pip install crewai==0.118.0 langchain-core>=0.1.12` |
| 2025‑05‑02 | **Squelette Crew**        | `app/crew.py` : Analyste, Rédacteur, Vérificateur    |
| 2025‑05‑02 | **Tests verts**           | `pytest -q` → 3 tests OK                             |

---

## 2025-05-02 – Sprint 2 : Orchestration LangGraph #S2\_graph <a id="2025-05-02--sprint2"></a>

| Date       | Action                       | Commande / Détail                     |
| ---------- | ---------------------------- | ------------------------------------- |
| 2025‑05‑02 | **Graph think→validate→act** | `app/graph.py`                        |
| 2025‑05‑02 | **Runner**                   | `python -m app.agent_ai.graph_runner` |
| 2025‑05‑02 | **Image Docker sprint2**     | `docker build -t agent-ai:sprint2 .`  |

---

## 2025-05-02 – Sprint 1 : Mémoire / Chroma #S1\_chroma <a id="2025-05-02--sprint1"></a>

| Date       | Action                 | Commande / Détail                                       |
| ---------- | ---------------------- | ------------------------------------------------------- |
| 2025‑05‑01 | **Install Chroma**     | `pip install chromadb`                                  |
| 2025‑05‑01 | **Ajout mémoire**      | `Chroma(collection_name="chat_memory")` dans `chain.py` |
| 2025‑05‑01 | **CI GitHub workflow** | `.github/workflows/ci.yml` + dummy `OPENAI_API_KEY`     |
| 2025‑05‑02 | **Fin Sprint 1**       | Mémoire vectorielle opérationnelle.                     |

---

## 2025-04-30 – Sprint 0 : Setup LangServe #S0\_setup <a id="2025-04-30--sprint0"></a>

| Date       | Action                      | Commande / Détail                                                        |
| ---------- | --------------------------- | ------------------------------------------------------------------------ |
| 2025‑04‑28 | **Pré‑requis**              | `py --version`, `git --version`, `docker version`                        |
| 2025‑04‑28 | **Clone demo**              | `git clone https://github.com/langchain-ai/langserve-launch-example.git` |
| 2025‑04‑28 | **Install LangServe 0.3.1** | `pip install -e .`                                                       |
| 2025‑04‑30 | **Dockerisation**           | `docker build -t agent-ai .` → `/invoke` 200 OK                          |
| 2025‑04‑30 | **Fin Sprint 0**            | Stack LangServe fonctionnelle local & Docker.                            |

---

## 📌 Leçons retenues (par sprint)

* **Phoenix first** : démarrer Phoenix avant tout test multi‑agents ; sinon tracers OTEL en double. citeturn10file4
* **Tests API via PowerShell** uniquement tant que Swagger HS. citeturn10file17
* **Branches terminées ⇒ merge + delete** : éviter la dette Git. citeturn10file19
* **Clé OpenAI factice en CI** pour préserver quota. citeturn10file6
* **cmd pour arboresence du projet important pour context** & "$env:ChocolateyInstall\bin\tree.exe" -I "__pycache__|\.venv|\.venv_py313|\.git|docs|\.pytest_cache|\.egg-info|\.mypy_cache|\.vscode|\.idea|node_modules|dist|build" -L 5 -a > TREE.md

---

*👉 Tout ajout ou modification doit suivre cette structure ; merci de maintenir la cohérence pour garder le fil du projet intact.*
