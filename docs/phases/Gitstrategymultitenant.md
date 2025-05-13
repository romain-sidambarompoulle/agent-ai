# Stratégie Git par client

> **Version 3.2 – 10 mai 2025**
> Aligné sur *Pivot LangFlow → ActivePieces* + *Scénario B : 1 stack ActivePieces CE cloud + Edge‑Agent local*.
> **Chaîne complète** : **LangFlow** (design) ➜ **ActivePieces** (`flow.saved`) ➜ **Compiler** ➜ *Cloud Agent* & *Edge‑Agent*.

Chaque **client** dispose toujours de sa branche Git dédiée `tenant/<slug>`, garantissant isolation et audit traçable des artefacts (flows, agents, bundles desktop) — **source unique** = Flow JSON **exporté depuis LangFlow puis importé** dans ActivePieces.

---

## 0. Pourquoi cette stratégie ?

* Centraliser le code généré **à partir des flows dessinés dans LangFlow**.
* Éviter collisions de code et de secrets entre clients.
* Simplifier les revues (diff confinés à une branche).
* Purger facilement les artefacts grâce aux tags `bld/<slug>/<ts>/<target>`.
* Offrir un audit clair (spans OTEL taggés `stack_port:31<idx>` et `agent_type`).

---

## 1. Organisation du dépôt

```
monorepo/
 ├── main/                     # Ossature commune (Pieces, scripts, CI)
 ├── tenant/
 │    ├── acme-inc/            # Branche acme-inc (= slug)
 │    │    ├── agent-ai/acme-inc/      # Cloud Agents (Python)
 │    │    ├── desktop/acme-inc/       # Edge bundles (.zip/.exe)
 │    │    ├── app/flows/acme-inc/     # Flows JSON & schema (export LangFlow)
 │    │    └── compose/acme-inc/       # Stack Docker isolée
 │    └── beta-corp/
 │         └── …
```

> 📌 **Création automatique** : le script `create_tenant.ps1 <slug>` (Phase 4A) crée le dossier `compose/<slug>`, initialise la branche `tenant/<slug>`, pousse le commit **chore(tenant): bootstrap** et installe le *hook* pré‑commit.

---

## 2. Cycle de vie d’un build

| Étape | Acteur                                          | Action                                | Trace OTEL                             |
| ----- | ----------------------------------------------- | ------------------------------------- | -------------------------------------- |
| 0     | **LangFlow**                                    | Export JSON `flow_<id>.json`          | *(hors stack)*                         |
| 1     | **Webhook** `flow.saved` (stack port 31<idx>)   | Appelle `/build` sans header X‑Tenant | span `build.received` tag `stack_port` |
| 2     | **Compiler Service**                            | Jinja → rend *cloud* et/ou *desktop*  | span `build.render` tag `agent_type`   |
| 3     | Tests (`pytest`, lint, antivirus)               | Fail‑fast                             | span `build.test` status ERROR/OK      |
| 4     | `git add/commit --tag bld/<slug>/<ts>/<target>` | Branch `tenant/<slug>`                | span `build.commit`                    |
| 5     | `git push origin tenant/<slug>`                 | PAT déjà en secret Vault              | span `build.push`                      |
| 6     | Reload LangServe / notify Edge‑Launcher         | gRPC / HTTP                           | span `build.deploy`                    |

*Header **X‑Tenant** : **facultatif (legacy only)** — la provenance est déduite du port / slug d’environnement.*

---

## 3. Quotas & nettoyage

* **Quota** : 100 builds / 24 h **par client et par cible** (cloud **et** edge).
* **Tag rejet** : compiler log `build.reject.quota` avec tags `stack_port` + `agent_type`.
* **Purge** : tâche hebdo `purge_build_tags.ps1` supprime les tags > 30 jours et exécute `git gc`.

---

## 4. CI sélective

```yaml
on:
  push:
    branches:
      - 'tenant/**'

jobs:
  tests:
    if: startsWith(github.ref, 'refs/heads/tenant/')
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: pytest -q
```

Le pipeline **ignore** les commits sur `main` sauf pour mises à jour communes.

---

## 5. Implémentation côté Compiler

```python
slug = os.environ["TENANT_SLUG"]  # injecté par docker‑compose
agent_targets = os.getenv("TARGETS", "cloud,edge").split(",")

# Flow provient de LangFlow, importé dans ActivePieces (folder app/flows/<slug>)
flow_path = Path(f"app/flows/{slug}/{flow_id}.json")

if "edge" in agent_targets:
    edge_out = Path(f"desktop/{slug}/edge_{ver}.zip")
    render_edge_bundle(flow_path, edge_out)

cloud_out = Path(f"agent-ai/{slug}/{flow_id}.py")
render_cloud_agent(flow_path, cloud_out)
```

> Le dossier `desktop/<slug>/` est créé à la volée si nécessaire.

---

## 6. Vérifications Edge-Agent

1. Vérifier l’existence de la branche `tenant/<slug>` via GitHub API.
2. Contrôler la présence du bundle `.zip` dans `desktop/<slug>/`.
3. S’assurer que le Manifest inclut `cpu_arch` conforme au poste du client.

---

## 📝 Changelog

| Version  | Date       | Motif                                                                                                                                         |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **v3.2** | 2025-05-10 | Ajout référence LangFlow → ActivePieces ; étape 0 du cycle de vie ; précision `app/flows/<slug>` export LangFlow ; cross‑link create\_tenant. |
| v3.1     | 2025-05-10 | Pivot Scénario B : suppression header X‑Tenant, déclencheur `create_tenant.ps1`, tags `stack_port` & `agent_type`, dual‑target cloud/edge.    |
| v3       | 2025-05-07 | Ajout quotas & purge tags.                                                                                                                    |
| v2       | 2025-05-05 | Branches tenant/<slug>, tableau cycle de vie.                                                                                                 |
| v1       | 2025-05-03 | Stratégie multi‑tenant initiale.                                                                                                              |
