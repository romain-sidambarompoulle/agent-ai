# Stratégie Git multi‑tenant

> **Version 3.3 – 14 mai 2025**
> Aligné sur *Pivot LangFlow → Builder maison* (ActivePieces devient **\[OBSOLETE – remplacé par Builder]**).
> 🎯 *Scénario B* : chaque client dispose d’une **stack Builder cloud** (flows JSON + Compiler), tandis qu’un **Edge‑Agent local** exécute le code généré.
> 📎 *Source unique* : le flow JSON est **exporté depuis LangFlow puis importé dans Builder** ; aucune divergence entre cloud et desktop.

---

## 0. Pourquoi cette stratégie ?

* Centraliser le code généré **à partir des flows dessinés dans LangFlow**.
* Éviter collisions de code et de secrets entre clients.
* Simplifier les revues (diff confinés à une branche).
* Purger facilement les artefacts grâce aux tags `bld/<slug>/<ts>/<target>`.
* Offrir un audit clair (spans OTEL taggés `stack_port:41<idx>` et `agent_type`).

---

## 1. Organisation du dépôt

```text
monorepo/
 ├── main/                      # Ossature commune (Builder front, scripts, CI)
 ├── tenant/
 │    ├── acme-inc/             # Branche acme-inc (= slug)
 │    │    ├── agent-ai/        # Cloud agents Python
 │    │    ├── desktop/         # Bundles Edge (.zip/.exe)
 │    │    ├── app/flows/       # Flows JSON (export LangFlow)
 │    │    └── compose/         # Stack Docker isolée
 │    └── beta-corp/
 │         └── …
```

> 📌 **Création automatique** : le script `create_tenant.ps1 <slug>` (Phase 4B) génère la branche `tenant/<slug>`, le dossier `compose/<slug>` et pose un commit **chore(tenant): bootstrap** avec *hook* pré‑commit.

---

## 2. Cycle de vie d’un build

| Étape | Acteur                                      | Action                                                      | Trace OTEL                             |
| ----- | ------------------------------------------- | ----------------------------------------------------------- | -------------------------------------- |
| 0     | **LangFlow**                                | Export JSON `flow_<id>.json`                                | *(hors stack)*                         |
| 1     | **Webhook** `flow.saved` (port **41<idx>**) | Appelle `POST /build` avec header `X‑Api‑Key: $env:BLD_KEY` | span `build.received` tag `stack_port` |
| 2     | **Compiler Service**                        | Jinja → rend *cloud* et/ou *desktop*                        | span `build.render` tag `agent_type`   |
| 3     | Tests (`pytest`, lint, antivirus)           | Fail‑fast                                                   | span `build.test` status ERROR/OK      |
| 4     | `git commit --tag bld/<slug>/<ts>/<target>` | Branche `tenant/<slug>`                                     | span `build.commit`                    |
| 5     | `git push origin tenant/<slug>`             | PAT déjà en Vault                                           | span `build.push`                      |
| 6     | Reload LangServe / notify Edge‑Launcher     | gRPC / HTTP                                                 | span `build.notify`                    |

---

## 3. Quota & purge tags

* **Quota** : **100 builds / 24 h / client / cible**.
* **Purge** : tâche hebdo `purge_build_tags.ps1` supprime les tags > 30 jours, puis `git gc`.

---

## 4. CI sélective (GitHub Actions)

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

Le pipeline **ignore** les commits sur `main`, sauf pour mises à jour communes.

---

## 5. Implémentation côté Compiler

```python
slug = os.environ["TENANT_SLUG"]              # injecté par docker‑compose
a_targets = os.getenv("TARGETS", "cloud,edge").split(",")

# Flow provient de LangFlow, importé dans Builder (folder app/flows/{slug})
flow_path = Path(f"app/flows/{slug}/{flow_id}.json")

if "edge" in a_targets:
    edge_out = Path(f"desktop/{slug}/edge_{ver}.zip")
    render_edge_bundle(flow_path, edge_out)

cloud_out = Path(f"agent-ai/{slug}/{flow_id}.py")
render_cloud_agent(flow_path, cloud_out)
```

> Le dossier `desktop/<slug>/` est créé à la volée si nécessaire.

---

## 6. Vérifications Edge‑Agent

1. Vérifier l’existence de la branche `tenant/<slug>` via GitHub API.
2. Contrôler la présence du bundle `.zip` dans `desktop/<slug>/`.
3. S’assurer que le **Manifest** inclut `cpu_arch` compatible avec le poste du client.

---

## 📝 Changelog

| Version  | Date       | Motif                                                                                                              |
| -------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| **v3.3** | 2025‑05‑14 | Pivot complet ActivePieces → Builder : ports 41, header `BLD_KEY`, chaîne de valeur mise à jour.                   |
| v3.2     | 2025‑05‑10 | Ajout référence LangFlow → ActivePieces ; étape 0 du cycle de vie ; précision export LangFlow ; cross‑link tenant. |
| v3.1     | 2025‑05‑10 | Pivot Scénario B : suppression header X‑Tenant, déclencheur create\_tenant, tags stack\_port & agent\_type.        |
| v3       | 2025‑05‑07 | Ajout quotas & purge tags.                                                                                         |
| v2       | 2025‑05‑05 | Branches tenant/<slug>, tableau cycle de vie.                                                                      |
| v1       | 2025‑05‑03 | Stratégie multi‑tenant initiale.                                                                                   |
