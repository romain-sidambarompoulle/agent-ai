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
