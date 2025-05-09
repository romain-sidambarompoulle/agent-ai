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

*Session : 9 mai 2025 – Repo :\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*`agent-ai`*

Modèle calqué sur l’exemple `ActivePieces 4A` : chaque tâche comporte
• un libellé clair • l’action réalisée • la (ou les) commande(s) exécutée(s) au format YAML.

2\. Clone du code ActivePieces (sous-module)

| 2-1 | **Se placer à la racine du projet**                                                                                                                                                                                                                              | `yaml\ncmd: cd C:\\Users\\Util\\Desktop\\agent-ai\npath: ~\nvenv: off`                                                                                   | ✔️                           |
| 2-2 | **Tentative clone (URL erronée)**                                                                                                                                                                                                                                | `yaml\ncmd: git submodule add https://github.com/activepieces/activepieces-core.git external/activepieces\npath: C:\\…\\agent-ai\nvenv: off`             | ❌ *« Repository not found »* |
| 2-3 | **Nettoyage de la tentative ratée**                                                                                                                                                                                                                              | `yaml\ncmd: git submodule deinit -f external/activepieces ; git rm -rf external/activepieces\npath: C:\\…\\agent-ai\nvenv: off`                          | ✔️                           |
| 2-4 | **Ajout du sous-module (URL correcte)**                                                                                                                                                                                                                          | `yaml\ncmd: git submodule add https://github.com/activepieces/activepieces.git external/activepieces\npath: C:\\…\\agent-ai\nvenv: off`                  | ✔️ clone \~273 Mo            |
| 2-5 | **Indexation + commit (sur *********************************************************************************************************main********************************************************************************************************* par mégarde)** | `yaml\ncmd: git add .gitmodules external/activepieces && git commit -m \"chore: add ActivePieces GPLv3 as submodule\"\npath: C:\\…\\agent-ai\nvenv: off` | ✔️                           |

### 2-bis. Réorganisation branches & stash

| B-1 | \*\*Sauvegarde WIP (docs & Docker) dans un \*\****stash***                                                                                                                                                          | `yaml\ncmd: git stash push -m \"wip: docs et docker avant réorganisation\"\npath: C:\\…\\agent-ai\nvenv: off`                                                                  | ✔️ stash@{0}               |
| B-2 | \*\*Création + push branche \*\*\`\`                                                                                                                                                                                | `yaml\ncmd: git branch tenant/demo-activepieces\npath: C:\\…\\agent-ai\nvenv: off`\n`yaml\ncmd: git push -u origin tenant/demo-activepieces\npath: C:\\…\\agent-ai\nvenv: off` | ✔️                         |
| B-3 | **Alignement de *****************************************************************************************main***************************************************************************************** sur origin** | `yaml\ncmd: git checkout main\npath: C:\\…\\agent-ai\nvenv: off`\n`yaml\ncmd: git reset --hard origin/main\npath: C:\\…\\agent-ai\nvenv: off`                                  | ✔️                         |
| B-4 | **Retour sur branche de travail + pop stash**                                                                                                                                                                       | `yaml\ncmd: git checkout tenant/demo-activepieces\npath: C:\\…\\agent-ai\nvenv: off`\n`yaml\ncmd: git stash pop\npath: C:\\…\\agent-ai\nvenv: off`                             | ✔️ docs & Docker restaurés |

2-ter. Validation du sous-module

|     |                              |                                                                                           |                             |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------- | --------------------------- |
| V-1 | **Contrôle gitlink**         | `yaml\ncmd: git submodule status external/activepieces\npath: C:\\…\\agent-ai\nvenv: off` | ✔️ `d0847488…` (gitlink OK) |
| V-2 | **Init/Update profondeur 1** | `yaml\ncmd: git submodule update --init --depth 1\npath: C:\\…\\agent-ai\nvenv: off`      | ✔️                          |

2-quater. Nettoyage fichiers obsolètes

|     |                                      |                                                                                                                    |                     |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------- |
| N-1 | **Suppression volontaire du README** | `yaml\ncmd: git rm README.md && git commit -m \"chore: remove obsolete README\"\npath: C:\\…\\agent-ai\nvenv: off` | ✔️ commit `a294dfb` |
| N-2 | **Push branche mise à jour**         | `yaml\ncmd: git push\npath: C:\\…\\agent-ai\nvenv: off`                                                            | ✔️ GitHub synchro   |

2-quinquies. Pré-commit *infra* (en cours)

|     |                                          |                                                                                                                                    |                  |
| --- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| P-1 | **Staging Docker & docs**                | `yaml\ncmd: git add .dockerignore .gitignore Dockerfile docker-compose.yml docs/ Dockerfile.app\npath: C:\\…\\agent-ai\nvenv: off` | 🟡 prêt à commit |
| P-2 | **Commit « infra: base Docker & docs »** | *(à exécuter juste avant le push final)*                                                                                           | ⏳ *à faire*      |

### ↪️ Prochaine étape (Phase 4A · 3)

* **Finaliser le commit infra (P-2).**
* **Insérer** les services `postgres`, `redis` et `activepieces` dans `docker-compose.yml`.
* **Lancer** `docker compose pull` puis `docker compose up -d`.

*Quand le commit est poussé ****et**** que le compose est prêt, tapez : ****OK****.*