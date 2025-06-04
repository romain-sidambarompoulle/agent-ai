# LegoStudio 4C — Compiler Service (Codegen stack isolée)

> **Version 2.4 – 14 mai 2025**
> Aligné sur *Pivot LangFlow → Builder maison* (ActivePieces devient **\[OBSOLETE – remplacé par Builder]**) : le flow est **dessiné dans LangFlow**, **importé dans Builder**, puis **compilé** en Python par ce service.
> 🧱 **1 stack = 1 client** : le Compiler pousse le code dans la branche `tenant/<slug>` du dépôt Git de la stack Docker dédiée.

---

## Objectif

* Générer automatiquement `agent-ai/<slug>/<flowId>.py` dès qu’un *flow* Builder est sauvegardé (**événement** `flow.saved`).
* Assurer une exécution **atomique, idempotente** et **tracée** dans Phoenix.

> 🔗 *Chaîne d’assemblage* : **LangFlow ➜ Builder ➜ Compiler ➜ LangServe**.

---

## 1. Pré‑requis

| Élément          | Valeur / Chemin                                             |
| ---------------- | ----------------------------------------------------------- |
| UI Builder       | `http://localhost:41<idx>` ou `http://ui.<slug>.domain.tld` |
| Atelier LangFlow | `http://localhost:78<idx>` (zone design)                    |
| Branche Git      | `tenant/<slug>`                                             |
| Dossier courant  | `C:\projets\agent-ai\compose\<slug>`                        |
| Phoenix          | Conteneur `phoenix` de la stack `<slug>` démarré            |

---

## 2. Architecture cible (stack isolée)

```
[LFG] LangFlow  ─ export JSON ─▶ import ⤏ Builder
          (Design)                   (flow.saved)
                                         ▼
Compiler Service (FastAPI)
  ① Render Jinja2  ─► flow.py + runner.py
  ② Commit + push branche tenant/<slug>
  ③ POST /restart langserve (hot‑reload)
         │
         ▼
Phoenix : span codegen, tags {stack_port:41<idx>, tenant:<slug>}
```

### 2.1 Gestion Git par client

* **Monorepo** ; chaque client → branche `tenant/<slug>`.
* PAT stocké dans Vault (`git_pat_<slug>`).
* Commits préfixés `codegen:` ; tags `bld‑<slug>‑<ts>`.

---

## 3. Tâches détaillées

| #   | Tâche                                              | Sortie / Détails                                                                                 |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 3.1 | **Modèle JSON Pydantic** (`FlowSchema`)            | Valide et versionne le JSON du flow ; expose champ `schema_version`.                             |
| 3.2 | **Templates Jinja** (`flow.py.j2`, `runner.py.j2`) | Placeholders : `{{ slug }}`, `{{ ports }}`, `{{ entrypoint }}`, `{{ transitions }}`.             |
| 3.3 | **Endpoint `/build`**                              | Vérifie signature HMAC → génère fichiers → `black` + `pytest -q tests/smoke`.                    |
| 3.4 | **Git commit & tag**                               | `git add . && git commit -m "codegen: {{ slug }} v{{ ts }}" && git tag bld-{{ slug }}-{{ ts }}`. |
| 3.5 | **Observabilité Phoenix**                          | Span `codegen.{slug}` + tags `{stack_port:41<idx>, tenant:<slug>}` ; export OTEL vers Jaeger     |

> 🖨️ *Métaphore* : le Compiler est une **presse d’imprimerie** : Builder déclenche la presse Jinja qui imprime le livret Python, le relieur Git le coud, et Phoenix appose le timbre‑dateur.

---

## 4. 1ʳᵉ exécution (bootstrap)

Le script **`create_tenant.ps1`** crée automatiquement l’arborescence `app/flows/<slug>/`.
Au premier **`flow.saved`** reçu, le Compiler dépose `flow_<id>.py` + `runner_<id>.py`, puis déclenche le *hot‑reload* LangServe.

---

## 5. Commandes YAML (pré‑requis locaux)

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

```powershell
curl.exe -s -X POST "http://localhost:41<idx>/hooks/flow.saved" `
  -H "Content-Type: application/json" `
  -H "X-Api-Key: $Env:BLD_KEY" `
  -d "@tests/payloads/flow_saved.json"
```

> ✂️ En‑tête `X‑Tenant‑Slug` supprimé ; inutile dans une stack unique.

---

## 7. Observabilité & idempotence

| Garantie       | Implémentation                                                             |
| -------------- | -------------------------------------------------------------------------- |
| **Atomicité**  | Transaction Git + refresh LangServe dans la même span Phoenix.             |
| **Idempotent** | SHA‑1 du flowId + timestamp ; si identique, skip.                          |
| **Trace**      | Tags `stack_port:41<idx>` + `tenant` facultatif ; export OTEL vers Jaeger. |

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

> *Image mentale* : le Compiler est une **presse d’imprimerie** : Builder dépose un manuscrit JSON, la presse Jinja imprime le livret Python, le relieur Git le range sur l’étagère, et le serveur LangServe tourne déjà la page pour le lire au client – pendant que le **gardien tenant‑guard** veille à ce qu’aucune page secrète ne finisse dans le mauvais livre.

---

## 📝 Changelog

| Version  | Date       | Motif                                                                                                                                                       |
| -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v2.4** | 2025‑05‑14 | Ajout sections 4‑9 perdues + correction ports/variables (`31<idx>` → `41<idx>`, `AP_KEY` → `BLD_KEY`) ; diagramme & CLI Builder                             |
| **v2.3** | 2025‑05‑14 | Pivot complet vers Builder maison (ports, URLs, diagramme, variables)                                                                                       |
| **v2.2** | 2025‑05‑10 | Intègre le pivot LangFlow (export) → ActivePieces (flow\.saved) → Compiler ; clarifie Git/PAT, hot‑reload LangServe. **\[OBSOLETE – remplacé par Builder]** |
| v2.1     | 2025‑05‑10 | Pivot Scénario B : suppression header multi‑tenant, réorganisation chemins `compose/<slug>`.                                                                |
| v2       | 2025‑05‑07 | Ajout diagrammes, template paths, OTEL tags `tenant/<slug>`.                                                                                                |
| v1       | 2025‑05‑04 | Première ébauche Compiler Service.                                                                                                                          |
