# JOURNAL.md — Chronologie détaillée

> **Version 3 – 10 mai 2025**
> Journal post‑pivot Scénario B

## 2025-05-11 – Reprise de la Phase 4A (stack demo)

| # | Action / Décision                        | Commande / Commit                                      | Résultat |
|---|------------------------------------------|--------------------------------------------------------|----------|
| 1 | **Pull LangFlow 1.1.4**                  | `docker compose pull langflow`                         | image 3.4 Go |
| 2 | Ajout LangFlow + OTEL dans compose/demo  | commit `c6e4d5e`                                       | ✔️ service :7860 |
| 3 | Création mini-flow **hello_flow**        | UI LangFlow → Export JSON                              | `flows/hello_flow.json` |
| 4 | Nettoyage clé API dans JSON              | `git grep -n "sk-"` → removal                          | commit `9d360b2` |

---

## 2025-05-12 – Finalisation 4A & outillage

| # | Action                                     | Commande / Commit                 | Résultat |
|---|--------------------------------------------|-----------------------------------|----------|
| 5 | **Variable OTEL** pour ActivePieces        | ajout `AP_OTEL_EXPORTER_OTLP_ENDPOINT` | traces visibles Phoenix |
| 6 | Script **create_tenant.ps1**               | commit `5b2b767`                  | clone stack → `compose/<slug>` |
| 7 | Déplacement compose → `compose/demo`       | commit `fbbf428`                  | arbo OK |
| 8 | Smoke-tests PowerShell (AP + LangFlow)     | `tests/smoke_4A.ps1`, commit `8eca70e` | retour 200 / 200 |
| 9 | Branding (v1) tentative + rollback         | image `activepieces-branded` puis retour officiel | couleur OK, logo à refaire |
|10 | Ajout `.env` (ENCRYPTION / JWT)            | local only (git-ignored)          | conteneur healthy |
|11 | Journal & Boussole à mettre à jour         | **cette entrée**                  | ⏳ en cours |

---

> 🔖 Toutes les opérations ci-dessus clôturent la **Phase 4A** (stack ActivePieces CE + LangFlow, télémétrie, smoke-tests, script tenant).  
> Le branding sera repris plus tard ; passage imminent à la **Phase 4B** (import LangFlow → ActivePieces) ou au skin LangFlow, selon la priorité du jour.
---

## 2025‑05‑10 – Pivot Scénario B <a id="Pivot_B"></a>

| Décision                                                         | Commande clé              | Statut |
| ---------------------------------------------------------------- | ------------------------- | ------ |
| 1 stack CE par client, abandon header X‑Tenant, ajout Edge‑Agent | `create_tenant.ps1 —help` | ✅      |
  1. **Stack isolée ActivePieces CE (4A)**                         |                           | en cours|
---

## Journal de déploiement

### 08/05/2025 – Phoenix

* **Problème :** crash à cause des URLs doublées (`http://http://…`)
* **Cause :** variables d’environnement `PHOENIX_HOST` / `PHOENIX_COLLECTOR_ENDPOINT` superflues
* **Solution :** suppression des deux variables dans `.env`
* **Vérification :** `curl.exe -I http://localhost:6006` → HTTP/1.1 200 OK

---

## Journal de déploiement – **Phase 4A / ActivePieces**

> *Session unique : 9 mai 2025 – dépôt **agent-ai***

### 1. Clone initial du sous‑module **ActivePieces** (08/05/2025)

| #   | Action                          | Commande YAML                                                                                                  | Résultat                 |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 2‑1 | **Se placer à la racine**       | `cmd: cd C:\Users\Util\Desktop\agent-ai`<br>`path: ~`                                                          | ✔️                       |
| 2‑2 | Clone (URL erronée)             | `cmd: git submodule add https://github.com/activepieces/activepieces-core.git external/activepieces`           | ❌ *Repository not found* |
| 2‑3 | Nettoyage tentative ratée       | `cmd: git submodule deinit -f external/activepieces ; git rm -rf external/activepieces`                        | ✔️                       |
| 2‑4 | **Ajout sous-module correct**   | `cmd: git submodule add https://github.com/activepieces/activepieces.git external/activepieces`                | ✔️ clone ≈ 273 Mo        |
| 2‑5 | Commit (par mégarde sur `main`) | `cmd: git add .gitmodules external/activepieces && git commit -m "chore: add ActivePieces GPLv3 as submodule"` | ✔️ SHA `4dd995f`         |

### 2. Branche locataire créée… puis annulée

| #   | Action                                             | Commande                                                                                         | Résultat                                |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| B‑1 | Stash WIP (docs + Docker)                          | `cmd: git stash push -m "wip: docs et docker avant réorganisation"`                              | ✔️                                      |
| B‑2 | Création **prématurée** `tenant/demo-activepieces` | `cmd: git branch tenant/demo-activepieces`<br>`cmd: git push -u origin tenant/demo-activepieces` | ✔️ *(incohérent vis‑à‑vis Vision 360°)* |
| B‑3 | Alignement `main` ← origin                         | `cmd: git checkout main && git reset --hard origin/main`                                         | ✔️                                      |
| B‑4 | Retour branche locataire + pop stash               | `cmd: git checkout tenant/demo-activepieces && git stash pop`                                    | ✔️                                      |

### 3. Validation sous‑module

| #   | Action                   | Commande                                          | Résultat       |
| --- | ------------------------ | ------------------------------------------------- | -------------- |
| V‑1 | Contrôle gitlink         | `cmd: git submodule status external/activepieces` | ✔️ `d0847488…` |
| V‑2 | Init/update profondeur 1 | `cmd: git submodule update --init --depth 1`      | ✔️             |

### 4. Nettoyage fichiers obsolètes

| #   | Action                    | Commande                                                                 | Résultat         |
| --- | ------------------------- | ------------------------------------------------------------------------ | ---------------- |
| N‑1 | Suppression README racine | `cmd: git rm README.md && git commit -m "chore: remove obsolete README"` | ✔️ SHA `a294dfb` |
| N‑2 | Push branche locataire    | `cmd: git push`                                                          | ✔️               |

### 5. **Ré‑alignement Git complet** (09/05/2025)

| #   | Action / Décision                            | Commande YAML                                                                                     | Résultat           |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| G‑1 | Cherry‑pick sous-module sur `main`           | `cmd: git cherry-pick 4dd995f`                                                                    | ✔️ SHA `23893f1`   |
| G‑2 | Cherry‑pick **infra Docker & docs**          | `cmd: git cherry-pick 19b2505`                                                                    | ✔️ SHA `1e71fc6`   |
| G‑3 | Cherry‑pick README removal                   | `cmd: git cherry-pick a294dfb`                                                                    | ✔️                 |
| G‑4 | Cherry‑pick docs onboarding & multi‑tenant   | `cmd: git cherry-pick 40eac5e`                                                                    | ✔️                 |
| G‑5 | Push `main` réaligné                         | `cmd: git push origin main`                                                                       | GitHub ← `105b760` |
| G‑6 | **Suppression branche locataire prématurée** | `cmd: git branch -D tenant/demo-activepieces`<br>`cmd: git push origin :tenant/demo-activepieces` | ✔️                 |
| G‑7 | Contrôle final                               | `cmd: git branch -a`                                                                              | Liste = `* main`   |

> **Bilan** : le dépôt est de nouveau conforme à la Vision 360° – aucune branche locataire fantôme.

### 6. Pré‑commit *infra* (Docker & docs) — 09/05/2025

| #   | Action                             | Commande YAML                                                                         | Résultat         |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------- | ---------------- |
| P‑1 | Staging Docker & docs              | `git add .dockerignore .gitignore Dockerfile docker-compose.yml docs/ Dockerfile.app` | ✔️               |
| P‑2 | Commit "infra: base Docker & docs" | `git commit -m "infra: base Docker & docs"`                                           | ✔️ SHA `78dfbdf` |

### 7. Mise à jour `docker-compose.yml` + build images

| #   | Action                                       | Commande                      | Résultat |
| --- | -------------------------------------------- | ----------------------------- | -------- |
| 4‑1 | Ajout Postgres / Redis / ActivePieces (mono) | édition compose               | ✔️       |
| 4‑2 | Uniformisation restart policy                | —                             | ✔️       |
| 4‑3 | Pull images distantes                        | `docker compose pull`         | ✔️       |
| 4‑4 | Build LangServe server                       | `docker compose build server` | ✔️       |

### 8. Démarrage stack complète & tests

| #   | Action                    | Commande / Vérif          | Résultat        |
| --- | ------------------------- | ------------------------- | --------------- |
| 5‑1 | Lancement stack           | `docker compose up -d`    | ✔️              |
| 5‑2 | Variables sécurité (.env) | ajout 2×32 car            | ✔️              |
| 5‑3 | Accès UI                  | `http://localhost:3000`   | ✔️ écran signup |
| 5‑4 | Création compte admin     | John Biche                | ✔️              |
| 5‑5 | **Constat limitation UI** | pas de création workspace | 🟡              |

### 9. Limitation « multi‑locataires » détectée

* **Observation :** bannière « Unlock Projects » apparue.
* **Impact :** impossibilité de créer workspace dans CE ≥ 0.28.
* **Pistes (A/B/C)** énumérées (voir doc historique).
* **Décision finale :** **pivot vers Scénario B (10 mai)** → 1 stack CE par client (voir #Pivot\_B).

---

### Entrée \[OBSOLETE – pivot B] Sprint 4A (flags EE) <a id="obsolete_ee"></a>

*Sous‑module EE, patch flags `manageProjectsEnabled = true` – devenu caduc après pivot du 10 mai.*

---

## Leçons retenues

* **Phoenix first** avant tout test.
* **PowerShell only** sur Windows pour éviter confusion `curl`/`Invoke-RestMethod`.
* **Stack par client** : toujours opérer dans `compose/<slug>`.
* ADR pour tout hack temporaire.


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
