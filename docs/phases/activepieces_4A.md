# Phase 4A — Mise en place d’ActivePieces + LangFlow (stack isolée)

> 🧱 **1 stack = 1 client** – Chaque client dispose toujours d’une **maison préfabriquée** : un dossier `compose/<slug>`.
> Mais désormais, on ajoute un **atelier LangFlow** à côté de la maison pour *dessiner les circuits* avant de poser les déclencheurs ActivePieces.
> **Objectif sprint 4A :** disposer d’une interface *no‑code* **ActivePieces Community 0.39** + **LangFlow 1.x** opérationnelles, reliées à *agent‑ai* et tracées dans Phoenix.

---

## 1. Pré‑requis

| Élément      | Détail                                                                             |
| ------------ | ---------------------------------------------------------------------------------- |
| CPU/RAM      | ≥ 2 vCPU, 3 Go (ActivePieces + LangFlow)                                           |
| Ports libres | **31xx**, **54xx**, **63xx**, **78xx**, **80xx** (78xx réservé à LangFlow interne) |
| Branche Git  | `tenant/<slug>` (jamais sur `main`)                                                |
| Outils       | Docker Desktop ≥ 4.29, PowerShell 7, Git CLI                                       |

---

## 2. Clone du code ActivePieces (pas de changement)

```yaml
- cmd: git clone https://github.com/activepieces/activepieces.git --branch 0.39.7 --depth 1
  path: C:\projets\agent-ai\external
  venv: off
```

---

## 3. Ajout au `docker-compose.yml`

Dans `compose/<slug>/docker-compose.yml` :

```yaml
services:
  activepieces:
    image: ghcr.io/activepieces/activepieces:0.39.7
    container_name: ap_${TENANT_SLUG}
    env_file: .env
    depends_on: [postgres, redis]
    ports:
      - "${AP_PORT:-31${TENANT_IDX}}:80"   # UI + API
    volumes:
      - ./external/activepieces:/usr/src/app

  langflow:
    image: ghcr.io/logspace-ai/langflow:latest
    container_name: lf_${TENANT_SLUG}
    env_file: .env
    ports:
      - "78${TENANT_IDX}:7860"            # Atelier flows (interne)
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://phoenix:4318
    depends_on: [phoenix]
```

> Le conteneur **langflow** reste interne : on ne le publie pas via Traefik tant que React‑Flow Builder n’est pas prêt.

---

### 3bis. Credentials

* ActivePieces : **Settings → Credentials** (clé chiffrée Postgres).
* LangFlow : pas de storage persistant pour l’instant ; la sauvegarde se fait via export JSON.

---

### 3ter. On‑boarding locataire (`create_tenant.ps1`)

Le script ajoute désormais **langflow** dans la liste des services à démarrer :

```
create_tenant <slug>
```

Étapes impactées :

1. Ajout ligne `78${TENANT_IDX}:7860` dans `.env`.
2. Génère `docker-compose.yml` avec le service **langflow**.
3. Démarre stack : `docker compose up -d traefik phoenix chromadb secret-mcp langflow activepieces ...`.

---

## 4. Branding minimal
ActivePieces :
1. Remplacer logo :

   ```yaml
   cmd: copy assets\logo_white.svg external\activepieces\packages\ui\public\logo.svg
   path: C:\projets\agent-ai
   venv: off
   ```
2. Palette Tailwind : `tailwind.config.js` → `colors.primary = '#1947E5'`.
3. Rebuild front :

   ```yaml
   cmd: docker compose build activepieces-ui
   path: C:\projets\agent-ai
   venv: off
   ```
LangFlow : thème Tailwind minimal dans `~/.langflow/config.json` (clé `primaryColor`).
> *Pourquoi :* un branding minimal évite la confusion client dès la démo.

---

## 5. Démarrage de la stack MVP

```yaml
- cmd: docker compose up -d
  path: C:\projets\agent-ai\compose\<slug>
  venv: off
```

* ActivePieces : `http://localhost:31<idx>` ou `http://ui.<slug>.domain.tld`.
* LangFlow : `http://localhost:78<idx>` (interne DevOps uniquement).

> 📡 **Phoenix first** : même principe, mais ajoutez aussi la var OTEL dans **langflow**.

---

## 6. Tests & CI (adapté)

*Extrait du pipeline GitHub Actions :* 

```yaml
- name: Smoke test ActivePieces
  run: |
    curl.exe -s http://localhost:31${{ env.IDX }}/v1/flows | ConvertFrom-Json | Out-Null

- name: Smoke test LangFlow
  run: |
    curl.exe -s http://localhost:78${{ env.IDX }}/api/v1/ping | ConvertFrom-Json | Out-Null
```

---

## 7. Points à préparer pour la phase 4B

| Action                                   | Pourquoi                                    | Responsable |
| ---------------------------------------- | ------------------------------------------- | ----------- |
| Exporter flow JSON depuis LangFlow       | Servira de template dans React‑Flow Builder | DevOps      |
| Middleware `X-Tenant` Traefik (inchangé) | Futur routage multi‑tenant                  | Ops         |
| Endpoint `/api/v1/build` (stub)          | UI AP appellera pour déclencher build flows | Backend     |

---

## 8. Bonnes pratiques (rappel)

* **Flux design → LangFlow** puis import JSON dans ActivePieces ou React‑Flow Builder.
* Conservez les secrets dans **Secret MCP** et référencez‑les dans LangFlow via env.`LF_…`.
* Limitez hot‑reload LangFlow en prod (`--no-reload`).

---

## 9. Changelog

| Version  | Date       | Motif                                                                                        |
| -------- | ---------- | -------------------------------------------------------------------------------------------- |
| **v1.1** | 2025‑05‑10 | Ajout service **langflow**, ports 78xx, script `create_tenant` mis à jour, tests CI adaptés. |
| v1.0     | 2025‑05‑09 | Version initiale — stack ActivePieces CE isolée.                                             |

---

## Liens croisés

* [langflow\_guide.md](langflow_guide.md) — Atelier flows.
* [UI.md](UI.md) — Rôle des front‑ends.

> 🧱 **Rappel** : chaque commit et chaque test doivent rester dans `tenant/<slug>` ; le lotissement entier s’écroule si vous touchez la branche *main* sans raison valable.

## Journal de déploiement

### 08/05/2025 – Phoenix

* Problème : crash à cause des URLs doublées (`http://http://…`)
* Cause : variables d’environnement PHOENIX\_HOST / PHOENIX\_COLLECTOR\_ENDPOINT superflues
* Solution : suppression des deux variables dans `.env`
* Vérification : `curl.exe -I http://localhost:6006` → HTTP/1.1 200 OK

## Journal de déploiement – **Phase 4A / ActivePieces**

> *Session unique : 9 mai 2025 – dépôt **agent-ai***  
> Libellés clairs, commandes YAML, résultat : ✔️ / ❌ / 🟡 / ⏳

---

### 1. Clone initial du sous-module **ActivePieces** (08/05/2025)

| #  | Action | Commande YAML exécutée | Résultat |
|----|--------|------------------------|----------|
| 2-1 | **Se placer à la racine** | `cmd: cd C:\\Users\\Util\\Desktop\\agent-ai`<br>`path: ~` | ✔️ |
| 2-2 | Clone (URL erronée) | `cmd: git submodule add https://github.com/activepieces/activepieces-core.git external/activepieces` | ❌ *Repository not found* |
| 2-3 | Nettoyage tentative ratée | `cmd: git submodule deinit -f external/activepieces ; git rm -rf external/activepieces` | ✔️ |
| 2-4 | **Ajout sous-module correct** | `cmd: git submodule add https://github.com/activepieces/activepieces.git external/activepieces` | ✔️ clone ≈ 273 Mo |
| 2-5 | Commit (par mégarde sur `main`) | `cmd: git add .gitmodules external/activepieces && git commit -m "chore: add ActivePieces GPLv3 as submodule"` | ✔️ SHA `4dd995f` |

---

### 2. Branche locataire créée… puis annulée

| # | Action | Commande | Résultat |
|---|--------|----------|----------|
| B-1 | Stash WIP (docs + Docker) | `cmd: git stash push -m "wip: docs et docker avant réorganisation"` | ✔️ stash@{0} |
| B-2 | Création **prématurée** `tenant/demo-activepieces` | `cmd: git branch tenant/demo-activepieces`<br>`cmd: git push -u origin tenant/demo-activepieces` | ✔️ *(incohérent vis-à-vis Vision 360°)* |
| B-3 | Alignement `main` ← origin | `cmd: git checkout main && git reset --hard origin/main` | ✔️ |
| B-4 | Retour branche locataire + pop stash | `cmd: git checkout tenant/demo-activepieces && git stash pop` | ✔️ |

---

### 3. Validation sous-module

| # | Action | Commande | Résultat |
|---|--------|----------|----------|
| V-1 | Contrôle gitlink | `cmd: git submodule status external/activepieces` | ✔️ `d0847488…` |
| V-2 | Init/update profondeur 1 | `cmd: git submodule update --init --depth 1` | ✔️ |

---

### 4. Nettoyage fichiers obsolètes

| # | Action | Commande | Résultat |
|---|--------|----------|----------|
| N-1 | Suppression README racine | `cmd: git rm README.md && git commit -m "chore: remove obsolete README"` | ✔️ SHA `a294dfb` |
| N-2 | Push branche locataire | `cmd: git push` | ✔️ |

---

### 5. **Ré-alignement Git complet** (09/05/2025)

| # | Action / Décision | Commande YAML | Résultat |
|---|-------------------|---------------|----------|
| G-1 | Cherry-pick sous-module sur `main` | `cmd: git cherry-pick 4dd995f` | ✔️ SHA `23893f1` |
| G-2 | Cherry-pick **infra Docker & docs** | `cmd: git cherry-pick 19b2505` | ✔️ SHA `1e71fc6` |
| G-3 | Cherry-pick README removal | `cmd: git cherry-pick a294dfb` | ✔️ SHA `0e4a4b8` |
| G-4 | Cherry-pick docs onboarding & multi-tenant | `cmd: git cherry-pick 40eac5e` | ✔️ SHA `105b760` |
| G-5 | Push `main` réaligné | `cmd: git push origin main` | GitHub ← `105b760` |
| G-6 | **Suppression branche locataire prématurée** | `cmd: git branch -D tenant/demo-activepieces`<br>`cmd: git push origin :tenant/demo-activepieces` | ✔️ voie libre |
| G-7 | Contrôle final | `cmd: git branch -a` | Liste = `* main` |

> **Bilan** : le dépôt est de nouveau conforme à la Vision 360° – aucune branche locataire fantôme.

---
### 6. **À faire – Pré-commit _infra_ (Docker & docs)**

| # | Action prévue | Commande YAML (à exécuter) | Statut |
|---|---------------|---------------------------|--------|
| P-1 | Staging Docker & docs | `cmd: git add .dockerignore .gitignore Dockerfile docker-compose.yml docs/ Dockerfile.app` | ⏳ |
| P-2 | Commit `"infra: base Docker & docs"` | `cmd: git commit -m "infra: base Docker & docs"` | ⏳ |

---

### 7. **À faire – Mise à jour `docker-compose.yml` + démarrage stack**

| # | Action prévue | Commande YAML (à exécuter) | Statut |
|---|---------------|---------------------------|--------|
| I-1 | Ajouter services `postgres`, `redis`, `activepieces-core`, `activepieces-ui` | *(édition manuelle du fichier)* | ⏳ |
| I-2 | Pull images | `cmd: docker compose pull` | ⏳ |
| I-3 | Démarrer MVP | `cmd: docker compose up -d traefik phoenix chromadb secret-mcp postgres redis activepieces-core activepieces-ui agent-ai` | ⏳ |

---

### 8. **À faire – Vérifications rapides**

| # | Test prévu | Commande | Statut |
|---|-----------|----------|--------|
| V-A | Vérifier header `X-Tenant` (Traefik) | `cmd: curl.exe -I http://ui.demo.localhost | findstr /R "^X-Tenant:"` | ⏳ |
| V-B | Exécuter flow “Ping → Console” | *(import template + Run once)* | ⏳ |

---

## État actuel

* **Branche :** `main` unique, propre, aucune branche locataire fantôme.  
* **Sous-module :** `external/activepieces` fixé, profondeur 1.  
* **Infra Docker :** Traefik, Phoenix, Chroma, Secret-MCP, Agent-AI déjà là ; **Postgres, Redis, ActivePieces** pas encore ajoutés.  
* **Prochaines actions :** enchaîner les points 6, 7, 8 ci-dessus pour terminer la Phase 4A.

---
