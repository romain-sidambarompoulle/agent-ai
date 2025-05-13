# LegoStudio 4C — Compiler Service (Codegen stack isolée)

> **Version 2.2 – 10 mai 2025**
> Aligné sur *Pivot LangFlow → ActivePieces* : le flow est **dessiné dans LangFlow**, **importé dans ActivePieces**, puis **compilé** en Python par ce service.
> 🧱 **1 stack = 1 client** : le Compiler pousse le code dans la branche `tenant/<slug>` de la stack Docker dédiée (pas de header multi‑tenant).

---

## Objectif

* Générer automatiquement `agent-ai/<slug>/<flowId>.py` dès qu’un *flow* ActivePieces est sauvegardé (**événement** `flow.saved`).
* Assurer une exécution **atomique, idempotente** et **tracée** dans Phoenix.

> 🔗 *Chaîne d’assemblage* : *LangFlow* ➜ *ActivePieces* ➜ **Compiler** ➜ *LangServe*.

---

## 1. Pré‑requis

| Élément            | Valeur / Chemin                                             |
| ------------------ | ----------------------------------------------------------- |
| UI ActivePieces CE | `http://localhost:31<idx>` ou `http://ui.<slug>.domain.tld` |
| Atelier LangFlow   | `http://localhost:78<idx>` (contexte design)                |
| Branche Git        | `tenant/<slug>`                                             |
| Dossier courant    | `C:\projets\agent-ai\compose\<slug>`                        |
| Phoenix            | Conteneur `phoenix` de la stack `<slug>` démarré            |

---

## 2. Architecture cible (stack isolée)

```
[LFG] LangFlow  ─ export JSON ─▶ import ⤏ ActivePieces
          (Design)                   (Flow saved)
                                         │
                                         ▼
Compiler Service (FastAPI)
  ① Render Jinja2  ─► flow.py + runner.py
  ② Commit + push branche tenant/<slug>
  ③ POST /restart langserve (hot‑reload)
         │
         ▼
Phoenix : span codegen, tags {stack_port:31<idx>, tenant:<slug>}
```

---

### 2.1 Gestion Git par client

* Monorepo ; chaque client → branche `tenant/<slug>`.
* PAT stocké dans Vault (`git_pat_<slug>`).
* Commits préfixés `codegen:` ; tags `ap‑<slug>‑<ts>`.

---

## 3. Tâches détaillées

| #   | Tâche                                              | Sortie attendue                                                                     |
| --- | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 3.1 | **Modèle JSON Pydantic** (`FlowSchema`)            | Valide structure + `schema_version`.                                                |
| 3.2 | **Templates Jinja** (`flow.py.j2`, `runner.py.j2`) | Placeholders : `{{ imports }}`, `{{ entrypoint }}`, `{{ transitions }}`.            |
| 3.3 | **Endpoint `/build`**                              | Vérifie signature HMAC → génère fichiers → `black` + `pytest -q tests/smoke`.       |
| 3.4 | **Git commit & tag**                               | `git commit -am "codegen: {{ slug }} v{{ ts }}" && git tag ap-{{ slug }}-{{ ts }}`. |
| 3.5 | **Observabilité Phoenix**                          | Span `codegen.{slug}` + outcome success/failed.                                     |
| 3.6 | **Script CLI `create_tenant.ps1`**                 | Branche Git, PAT, secrets MCP, bucket MinIO, stub `/build`.                         |
| 3.7 | **Suite tests “tenant-guard”**                     | Builds parallèles A/B ; échec si fuite artefacts ou secrets.                        |
| 3.8 | **CI GitHub**                                      | Jobs `build`, `lint`, **`tenant-guard`** ; image `compiler:latest` publiée.         |
| 3.9 | **Hot reload**                                     | LangServe surveille `app/flows/*.py` ; dispo en < 2 s.                              |

*Commande Makefile pour test local*

```yaml
- cmd: make build-flow SLUG=my_flow JSON=./samples/hello.json
  path: repo
  venv: on
```

---

## 4. 1ʳᵉ exécution (bootstrap)

Le script `create_tenant.ps1` crée `app/flows/<slug>/`.
Au premier `flow.saved`, le Compiler dépose `flow_<id>.py` + `runner_<id>.py` et déclenche le *hot‑reload* LangServe.

---

## 5. Commandes YAML (pré‑requis locaux)

```yaml
- cmd: pip install -r compiler/requirements.txt
  path: C:\projets\agent-ai\compose\<slug>
  venv: on
- cmd: uvicorn compiler.app:app --reload --port 8081
  path: C:\projets\agent-ai\compose\<slug>
  venv: on
```

---

## 6. Exemple d’appel Webhook (tests)

```bash
curl.exe -s -X POST "http://localhost:31<idx>/hooks/flow.saved" ^
  -H "Content-Type: application/json" ^
  -d "@tests/payloads/flow_saved.json"
```

> ✂️ En‑tête `X‑Tenant‑Slug` supprimé ; non requis dans une stack unique.

---

## 7. Observabilité & idempotence

| Garantie       | Implémentation                                                 |
| -------------- | -------------------------------------------------------------- |
| **Atomicité**  | Transaction Git + refresh LangServe dans la même span Phoenix. |
| **Idempotent** | SHA‑1 du flowID + timestamp ; si identique, skip.              |
| **Trace**      | Tags `stack_port` (31<idx>) + `tenant` facultatif.             |

---

## 8. Checklist fin de phase 4C

* [ ] `compiler/templates/flow.py.j2` + `runner.py.j2` créés.
* [ ] PAT Git configuré dans Vault `tenant/<slug>`.
* [ ] Webhook `flow.saved` déclenche commit **et** restart LangServe.
* [ ] Spans `codegen` visibles dans Phoenix.

---

## 9. Ressources open‑source

* **FastAPI** (MIT)
* **Jinja2** (BSD)
* **Black** (MIT)
* **Pytest** (MIT)
* **GitPython** (BSD)
* **Phoenix** (MIT)

---

> *Image mentale* : le Compiler est une **presse d’imprimerie** : ActivePieces dépose un manuscrit JSON, la presse Jinja imprime le livret Python, le relieur Git le range sur l’étagère, et le serveur LangServe tourne déjà la page pour le lire au client – pendant que le **gardien tenant‑guard** veille à ce qu’aucune page secrète ne finisse dans le mauvais livre.

---

## 📝 Changelog

| Version  | Date       | Motif                                                                                                                |
| -------- | ---------- | -------------------------------------------------------------------------------------------------------------------- |
| **v2.2** | 2025‑05‑10 | Intègre le pivot LangFlow (export) → ActivePieces (flow\.saved) → Compiler ; clarifie Git/PAT, hot‑reload LangServe. |
| v2.1     | 2025‑05‑10 | Pivot Scénario B : suppression header X‑Tenant, chemins `compose/<slug>`.                                            |
| v2       | 2025‑05‑07 | Ajout diagrammes, template paths, OTEL tags tenant.<slug>.                                                           |
| v1       | 2025‑05‑04 | Première ébauche Compiler Service.                                                                                   |
