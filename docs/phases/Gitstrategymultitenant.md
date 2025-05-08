# Stratégie Git multi‑tenant (à partir de la phase 4C)

> **But :** garantir traçabilité, isolation client et CI fluide quand des centaines de clients créent des flows en parallèle.

---

## 0. Pourquoi cette stratégie ?

* **Traçabilité complète :** chaque build (runner cloud, bundle edge) est historisé.
* **Isolation RGPD :** aucune fuite de code ou de données entre clients.
* **Performance CI :** on ne teste que ce qui change.
* **Rollback instantané** et audit facile.

---

## 1. Organisation du dépôt

```
origin/
├── core/                  ← outils partagés, templates Jinja
├── tenant/acme/           ← flows & runners du client Acme
├── tenant/zenith/         ← idem pour Zenith
└── tenant/_archive/       ← anciens clients (purge partielle)
```

* **Branche** par client : `tenant/<slug>`
* **Convention de tags** : `bld/<slug>/<yyyyMMddHHmmss>-<target>` (ex. `bld/acme/20250508T1420-cloud`)

---

## 2. Cycle de vie d’un build

| Étape | Acteur           | Action                                                                                    |
| ----- | ---------------- | ----------------------------------------------------------------------------------------- |
| 1     | ActivePieces     | Envoie JSON à `/build` avec en‑tête `X‑Tenant: acme`                                      |
| 2     | Compiler Service | Génère runner cloud (et/ou bundle edge)                                                   |
| 3     | Git push         | `git checkout tenant/acme && git add . && git commit -m "build: …" && git tag bld/acme/…` |
| 4     | CI GitHub        | Déclenchée par `paths: tenant/acme/**` ; lint + tests                                     |
| 5     | Phoenix          | Span `build.acme.success` ou `build.acme.failed`                                          |

---

## 3. Quotas & nettoyage

* **Quota :** 100 builds / 24 h / tenant (sinon HTTP 429).
* **Purge tags > 30 j :** script cron (voir plus bas).
* **GC hebdomadaire :** `git gc --prune=30.days.ago --aggressive`.

```yaml
cmd: git for-each-ref --format='%(refname:short) %(creatordate:iso)' refs/tags/bld/acme \
     | awk '$2 < "$(date -d "30 days ago" +%Y-%m-%d)" {print $1}' \
     | xargs -r git tag -d
path: /srv/repos
venv: off
```

---

## 4. CI sélective (extrait `ci.yml`)

```yaml
on:
  push:
    branches: [ "tenant/**" ]
    paths: [ "tenant/**" ]

jobs:
  test:
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/heads/tenant/')
    steps:
      - uses: actions/checkout@v4
      - name: Run pytest smoke
        run: pytest -q tests/smoke
```

---

## 5. Implémentation côté Compiler (pseudo‑code)

```python
tenant = headers["X-Tenant"]
branch = f"tenant/{tenant}"
with git.Repo(".") as repo:
    if branch not in repo.branches:
        repo.git.checkout('-b', branch, 'core/main')
    else:
        repo.git.checkout(branch)
    # écrire fichiers …
    repo.index.add([...])
    repo.index.commit(f"build: {slug} v{ts}")
    repo.git.tag(f"bld/{tenant}/{ts}-{target}")
    origin.push(branch, tags=True)
```

---

## 6. Vérifications dans l’Edge‑Agent (phase 6)

* Vérifier existence branche (`HEAD /branches/tenant/<slug>`).
* Télécharger `manifest.json` depuis la branche tenant ; comparer `sha256`.
* Pull uniquement la branche tenant ; jamais `core`.

---

## 7. Évolution possible

| Volume builds               | Option                                  |
| --------------------------- | --------------------------------------- |
| < 10 000 /jour total        | **Monorépo** (présent)                  |
| > 10 000 builds/jour/tenant | GitHub App → repo privé par client      |
| Compliance forte            | Dépôt chiffré ou stockage S3 + manifest |

---

## 8. Résumé pas‑à‑pas (TL;DR)

1. **Créer branche** `tenant/<slug>` dès la signature du contrat.
2. **Configurer token PAT** scope =`repo:tenant/<slug>` dans Secrets GitHub.
3. **Modifier Compiler Service** pour push/commit/tag sur cette branche.
4. **Mettre en place CI sélective** et script de purge tags.
5. **Edge‑Agent** : vérifier branche + manifest avant d’exécuter.

Ainsi, tu garantis isolement, audit et performance dès la première build client.
