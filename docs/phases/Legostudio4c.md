# Phase 4C — Compiler Service (Codegen Cloud)

> **Objectif :** disposer à la fin du sprint d’un service Dockerisé capable de transformer en temps réel un flow JSON ActivePieces en :
>
> * `app/flows/<slug>.py` (graph LangGraph)
> * `app/runners/<slug>_runner.py` (appelable en CLI ou via LangServe)
>
> …avec hot‑reload, tests CI **et isolation multi‑tenant garantie**.

---

## 1. Pré‑requis (à valider dès J‑1)

| Élément            | Vérification                                        | Cmd YAML (1 ligne)                                                                         |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| ActivePieces UI up | `/flow` renvoie 200                                 | `cmd: curl -I http://localhost:80/flow -o /dev/null -w "%{http_code}"\npath: ~\nvenv: off` |
| Webhook secret     | Stockée dans `.env` (`AP_BUILD_SECRET`)             | —                                                                                          |
| Repo git propre    | `git status` = clean                                | `cmd: git status --porcelain\npath: repo\nvenv: off`                                       |
| Branche tenant     | `git rev-parse --abbrev-ref HEAD` = `tenant/<slug>` | `cmd: git symbolic-ref --short HEAD\npath: repo\nvenv: off`                                |

---

## 2. Architecture cible

### Support multi-tenant : génération de code dans la branche locataire

> *Métaphore éclair : le **traceur de plans** dépose les plans finis directement dans l’appartement du locataire, et jamais dans le hall.*

1. **Déclencheur**  
   - Webhook ActivePieces `flow.saved` (ou `flow.version.published`) **inclut** l’entête HTTP `X-Tenant-Slug: <slug>` renseigné par le middleware Traefik.  
   - Si l’entête manque, la requête est rejetée (HTTP 400) pour éviter de polluer `main`.

2. **Pipeline Compiler Service**  
   | Étape | Action | Chemin |
   |-------|--------|--------|
   | ① | Checkout `tenant/<slug>` **en lecture-écriture** | `/srv/app` (venv : on) |
   | ② | Jinja² → rend `flow_<flowId>.py` + tests | `app/flows/<slug>/` |
   | ③ | `pytest -q` (fail fast) | `/srv/app` |
   | ④ | `git add/commit` « feat(flow): build <flowId> » | `/srv/app` |
   | ⑤ | `git push origin tenant/<slug>` | `/srv/app` |

3. **Garantie d’atomicité**  
   - En cas d’échec à ③, le commit est annulé (`git reset --hard && git clean -fd`).  
   - Les rollbacks respectent la stratégie décrite dans `docs/onboarding_flow.md`.

4. **Première exécution (slug bootstrap)**  
   - Si le répertoire `app/flows/<slug>/` est vide, le service crée également le fichier `__init__.py` + README tenant.  
   - Le commit initial est « chore(tenant): bootstrap <slug> ».

5. **Idempotence**  
   - Même `flowId` + même révision → aucun commit ; on log « no-op ».  
   - Différences détectées (hash Jinja²) → nouveau commit.

6. **Observabilité**  
   - Span *Phoenix* « compiler.<slug>.<flowId> » (status OK/ERROR).  
   - Tag `tenant:<slug>` pour filtrage Kibana.

➡︎ *Voir également* :  
- **UI.md** : section « Onboarding locataire – création automatique de workspace »  
- **Gitstrategymultitenant.md** : règles de branche et fusion  
- **docs/overviewinstruction.md

### 2.1 Gestion Git multi-tenant

* **Branche dédiée par client** : `tenant/<slug>`

  * isolation logique, RGPD friendly
  * permissions GitHub restreintes au token du tenant

* **Tagging** : `bld/<slug>/<yyyyMMddHHmmss>`

* **Nettoyage automatisé**

  * tags > 30 jours supprimés (`git tag -d`)
  * `git gc --aggressive` hebdomadaire

* **Quota builds** : 100 builds/24 h/tenant (HTTP 429 si dépassement)

```
ActivePieces ──► /build (POST) ──► Compiler Service ──► git commit + tag
                                           │
                                           └───► LangServe hot‑reload détecte nouveau runner
```

* **LangServe** tourne avec `--reload` dans le conteneur `agent-ai`.
* Le Compiler est un conteneur **FastAPI** + **Jinja2** + **Pydantic**.
* Les templates sont stockés dans `compiler/templates/`.

---

## 3. Tâches détaillées

| #   | Tâche                                              | Sortie attendue                                                                               |
| --- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 3.1 | **Modèle JSON Pydantic** (`FlowSchema`)            | Valide la structure envoyée par ActivePieces, versionnée (`schema_version`).                  |
| 3.2 | **Templates Jinja** (`flow.py.j2`, `runner.py.j2`) | Placeholders : `{{ imports }}`, `{{ entrypoint }}`, `{{ transitions }}`.                      |
| 3.3 | **Endpoint `/build`**                              | Vérifie signature HMAC → parse → génère fichiers → exécute `black` + `pytest -q tests/smoke`. |
| 3.4 | **Git commit & tag**                               | `git commit -am "build: {{ slug }} v{{ ts }}" && git tag ap-{{ slug }}-{{ ts }}`.             |
| 3.5 | **Observabilité Phoenix**                          | Span `build.{slug}` + outcome success/failed.                                                 |
| 3.6 | **Script CLI `create_tenant.sh`**                  | Crée en 1 cmd : branche Git `tenant/<slug>` + push ; PAT Git restreint ; secrets MCP (`git_pat`, `ap_build_secret`) ; bucket MinIO `flows/<slug>`. |
| 3.7 | **Suite tests “tenant-guard”**                     | CI lance deux builds (tenants A/B) ; échoue si secret ou artefact fuite entre espaces.         |
| 3.8 | **CI GitHub**                                      | Jobs `build`, `lint`, **`tenant-guard`** (must pass) ; image `compiler:latest` publiée.       |
| 3.9 | **Hot reload**                                     | Conteneur LangServe surveille `app/flows/*.py` ; succès = runner dispo en < 2 s.               |

### Commande Makefile pour test local

```yaml
cmd: make build-flow SLUG=my_flow JSON=./samples/hello.json
path: repo
venv: on
```

---

## 4. Sécurité & robustesse

* Signature HMAC SHA‑256 : en‑tête `X-Ap-Signature`.
* Compiler s’exécute en user non‑root, répertoire `tmpfs` pour build.
* Lint + tests **avant** le commit ⇒ si échec, retour 400 à ActivePieces.
* Rollback automatique : tag `build-failed/<slug>/<ts>`.
* **Tests tenant-guard** dans le pipeline : build tenant A puis B, puis script pytest qui tente d’accéder aux secrets de l’autre tenant → doit échouer.

---

## 5. Checklist de sortie de sprint 4C

* [ ] MVP « Hello World » généré depuis UI.
* [ ] 100 % tests unitaires verts.
* [ ] **Suite tenant-guard verte**.
* [ ] Pipeline GitHub : build + push image `compiler:latest`.
* [ ] Docs : `/docs/compiler_api.md` décrivant l’endpoint.
* [ ] Changelog v0.1 dans JOURNAL.md.

---

## 6. Préparer la phase 5 (dual‑target)

1. **Drapeau `target` dans le schema** (`cloud` | `edge`) ➜ ignoré pour l’instant mais déjà présent.
2. Prévoir dossier `edge_scripts/` et template `edge.py.j2` (vide, placeholder).
3. Inclure champ `edge_requirements` (Playwright, AutoHotkey…) dans le JSON.
4. Ajouter test e2e : stub Edge-Agent qui renvoie 200.
5. RFC à écrire : protocole de transmission `result_id` entre runner cloud et Edge-Agent.

> Quand ces points sont prêts, la phase 5 se concentrera sur la génération du script edge + son dispatch via le tunnel.

---

## 7. Timeline (3 jours ouvrés)

| Jour | Morning                     | After‑noon                     |
| ---- | --------------------------- | ------------------------------ |
| J+0  | Schema Pydantic + templates | Endpoint `/build` + signature  |
| J+1  | Git commit + Phoenix spans  | Suite tenant‑guard + CI GitHub |
| J+2  | Hot reload + docs           | Rétro + go/no‑go               |

---

## 8. Ressources open‑source

* **FastAPI** (MIT)
* **Jinja2** (BSD)
* **Black** (MIT)
* **Pytest** (MIT)
* **GitPython** (BSD)
* **Phoenix** (MIT)  citeturn23file0

---

> *Image mentale :* le Compiler est un **atelier d’imprimerie** : ActivePieces dépose un manuscrit JSON, la presse Jinja imprime le livret Python, le relieur Git le range sur l’étagère, et le serveur LangServe tourne déjà la page pour le lire au client – tout en vérifiant qu’aucune page secrète ne se glisse dans le mauvais livre grâce au **gardien tenant‑guard**.
