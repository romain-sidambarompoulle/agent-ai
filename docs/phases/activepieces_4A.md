# Phase 4A — Mise en place d’ActivePieces (UI)

> **Objectif sprint :** disposer en sandbox d’une interface *no‑code* ActivePieces opérationnelle, reliée à notre backend "agent‑ai", traçable dans Phoenix, et prête pour l’arrivée des flows manuels (4B).

---

## 1. Pré‑requis à valider

| Élément               | Vérification                                    | Cmd YAML (1 ligne)                                                |                                               |   |
| --------------------- | ----------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------- | - |
| Phoenix collector     | Dashboard `http://localhost:6006` répond        | \`cmd: curl.exe -I [http://localhost:6006](http://localhost:6006) | Select-Object -First 1\npath: \~\nvenv: off\` |   |
| Docker Compose ≥ 2.20 | `docker compose version` doit afficher `v2.20+` | `cmd: docker compose version\npath: ~\nvenv: off`                 |                                               |   |
| Ports libres          | 3000, 8080, 80, 443                             | —                                                                 |                                               |   |
| Webhook secret        | Variable `AP_BUILD_SECRET` présente dans `.env` | —                                                                 |                                               |   |

> *Pourquoi :* Phoenix d’abord pour tracer, ports pour éviter conflits, secret pour sécuriser le build dès 4B.

---

## 2. Clone du code ActivePieces (sous‑module)

```yaml
cmd: git submodule add https://github.com/activepieces/activepieces-core.git external/activepieces
path: C:\projets\agent-ai
venv: off
```

> *Pourquoi :* garder la version Community MIT sous contrôle Git, faciliter les mises à jour.
> **Branche cible** : après le clone, chaque utilisateur travaille dans **sa** branche `tenant/<slug>` ; les builds et commits ne doivent jamais être poussés sur `main`.

---

## 3. Ajout au `docker-compose.yml`

```yaml
services:
  activepieces-core:
    build: external/activepieces/docker/core
    ports: ["8080:8080"]
    env_file: .env
  activepieces-ui:
    build: external/activepieces/docker/ui
    ports: ["3000:3000"]
    environment:
      - AP_API_URL=http://activepieces-core:8080
    depends_on: [activepieces-core]
```

*Traefik (déjà présent) routera :* `/ui → 3000`, `/api/ap → 8080`.

---

## 3bis. Gestion des clés API utilisateur (Credentials)

| Étape UI                                                                                                          | Action utilisateur                                                                          | Résultat côté sécurité                       |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1. **Settings → Credentials → Add**                                                                               | Ouvre le formulaire de nouveau credential                                                   |                                              |
| 2. Choisir **HTTP Header Credential**                                                                             | Permet d’envoyer un header personnalisé                                                     |                                              |
| 3. Renseigner : <br>• **Name** =`OpenAI_API_Key` <br>• **Header** =`Authorization` <br>• **Value** =`Bearer sk-…` | La clé est chiffrée (AES‑256) dans la table `credentials` ; jamais renvoyée après création. |                                              |
| 4. Dans un flow, sélectionner `{{credential.OpenAI_API_Key}}`                                                     | Le header `Authorization: Bearer …` est injecté à chaque appel OpenAI                       | Aucune clé n’apparaît dans les logs Phoenix. |

> *Bonne pratique :* pour d’autres fournisseurs (Anthropic, Mistral, etc.), créer un credential équivalent en changeant simplement le nom.

## 3ter. On-boarding locataire – workspace & branche avant tout Flow

> *Métaphore éclair : l’hôtesse d’accueil remet le **badge** (workspace) et ouvre la **boîte à outils** (branche Git) avant que le locataire n’entre dans l’atelier.*

| # | Étape | Action précise | Fichier / service |
|---|-------|----------------|-------------------|
| 1 | **Sign-up** | Formulaire UI ➜ `POST /onboard/signup` (`email`, `company_name`) | `app/api/routes/onboard.py` |
| 2 | **Provisioning backend** | `onboarding_service.create_full_tenant(slug)` →<br>• Keycloak user + groupe `tenant/<slug>`<br>• ActivePieces `POST /workspaces {name: slug}`<br>• `git checkout -b tenant/<slug>` + dossier `app/flows/<slug>/`<br>• `secret_mcp.create_scope(slug)` | `app/services/…` + `scripts/git_init_tenant.sh` |
| 3 | **Redirection UI** | Backend répond `302` vers `http://ui.<slug>.localhost/workspace/<id>/flows` (token cookie) | Next.js middleware |
| 4 | **Idempotence** | Si le `slug` existe déjà → HTTP 200, payload `{workspace_id, slug}` | — |
| 5 | **Rollback** | Sur erreur → suppression user Keycloak + branche Git + workspace AP | Saga dans `onboarding_service` |

```yaml
# Extrait docker-compose.override.yml : exposer l’endpoint onboarding
services:
  agent-ai:
    environment:
      - ENABLE_ONBOARDING=1
    ports: ["8000:8000"]   # /onboard/signup


   
   Test rapide “nouveau client”
   cmd: curl.exe -s -X POST http://api.localhost/onboard/signup ^
      -H "Content-Type: application/json" ^
      -d "{\"email\":\"bob@example.com\",\"company_name\":\"Bob Corp\"}" | jq
path: ~
venv: off

Sortie attendue :
{
  "slug": "bob-corp",
  "workspace_id": "9e1f…",
  "login_url": "http://ui.bob-corp.localhost/workspace/9e1f…/flows"
}

Points de vigilance
Isolation Git – les commits utilisateur restent dans tenant/<slug> ; rappel de la règle multi-tenant .

Header X-Tenant – déjà activé via Traefik middleware (section 5 bis) ; aucune requête sans header en prod activepieces_4A.

Script create_tenant.sh appelé en tâche de fond ; même logique que décrite dans UI.md UIUI.

➡︎ Référence croisée : docs/overviewinstruction.md pour le schéma complet.


---

## 4. Branding minimal

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

> *Pourquoi :* un branding minimal évite la confusion client dès la démo.

---

## 5. Démarrage stack MVP

```yaml
cmd: docker compose up -d traefik phoenix chromadb secret-mcp activepieces-core activepieces-ui agent-ai
path: C:\projets\agent-ai
venv: off
```

*Traefik* délivre les certificats Let’s Encrypt auto.

---
### 5 bis. Activation du middleware X-Tenant (isolation dès le dev)

> Objectif : chaque requête envoyée à l’API ou à l’UI transporte l’en-tête  
> `X-Tenant: <slug>` afin de tester l’isolation multi-client dès la phase 4A.

```yaml
# Traefik : déclarer le middleware dans traefik.yml
http:
  middlewares:
    add-x-tenant:
      headers:
        customRequestHeaders:
          X-Tenant: "demo"    # remplace « demo » par ton slug local

# Activer le middleware sur les deux services locaux
http:
  routers:
    ui-local:
      rule: "Host(`ui.demo.localhost`)"
      service: activepieces-ui
      middlewares:
        - add-x-tenant
    api-local:
      rule: "Host(`api.demo.localhost`)"
      service: activepieces-core
      middlewares:
        - add-x-tenant
Checklist rapide :

1Modifier hosts ou utiliser un proxy pour que
ui.demo.localhost et api.demo.localhost pointent sur 127.0.0.1.

2Redémarrer Traefik :

yaml

cmd: docker compose restart traefik
path: C:\projets\agent-ai
venv: off
3Vérifier :


curl.exe -I http://ui.demo.localhost | findstr /R "^X-Tenant:"
→ doit afficher X-Tenant: demo.


## 6. Test “Ping → Console”

1. Importer le flow exemple :

   ```yaml
   cmd: ap import --file templates/ping_console.flow.json
   path: external\activepieces
   venv: off
   ```
2. Cliquer **Run once** dans l’UI.
3. Vérifier :

   * log dans Phoenix (`span.name == flow.ping_console`)
   * réponse HTTP 200 dans l’onglet **Runs**.

> *Bonne pratique :* toujours tester un flow trivial avant d’ajouter de la logique IA.

---

## 7. CI de l’UI (optionnel mais conseillé)

Ajouter un job rapide dans `.github/workflows/ci.yml` :

```yaml
  ui-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build UI image
        run: docker build -t activepieces-ui:ci external/activepieces/docker/ui
```

---

## 8. Points à préparer pour la phase 4B

| Action                                              | Pourquoi                                         | Responsable |
| --------------------------------------------------- | ------------------------------------------------ | ----------- |
| Créer dossier `templates/` dans repo                | Stocker les flows JSON “Hello”                   | Dev Ops     |
| Définir header `X-Tenant` dans Traefik (middleware) | Futur routage build multi‑tenant                 | Ops         |ui.demo.localhost → X-Tenant: demo
| Documenter endpoint `/api/v1/build` (stub)          | UI devra l’appeler en 4B                         | Backend     |
| Générer PAT Git restreint par tenant (script)       | Nécessaire au push branche `tenant/<slug>`       | Dev Ops     |
| Lint front avec ESLint + Prettier                   | Code front cohérent avant customisations lourdes | Front       |
- [ ] Requêtes vers **ui.demo.localhost / api.demo.localhost** portent `X-Tenant: demo` (testé via `curl.exe -I`).


## 9. Bonnes pratiques (rappel)

* **Phoenix first** : lancer collecteur avant `activepieces-core` pour tracer chaque webhook.
* **Env. diff dev/prod** : variable `ENV=dev` active DB mémoire, pas de quotas.
* **Secrets dans Secret MCP** : `AP_DB_PASSWORD`, `ENCRYPTION_KEY`, et **clefs API utilisateur** sous forme de Credentials chiffrés.
* **Limiter le hot‑reload UI** en prod (Node.js watchers off) → économise CPU.
* **Sauvegardes** : exporter `/var/lib/activepieces` (flows) → S3 nightly.

---

## 10. Timeline indicative (2 jours)

| Jour | Matin                            | Après‑midi                           |
| ---- | -------------------------------- | ------------------------------------ |
| J+0  | Clone submodule + compose update | Branding minimal + build images      |
| J+1  | Démarrage stack + test Ping      | CI UI, rédaction docs, rétrospective |

---

> *Image mentale :* on installe d’abord la **scène de théâtre** (ActivePieces UI), on vérifie que le rideau s’ouvre et que la lumière (Phoenix) éclaire bien la scène. Au sprint suivant, les **acteurs** (flows Hello) pourront entrer en toute confiance.

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
