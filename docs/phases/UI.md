# UI.md

> **Version 2 – 7 mai 2025**
> L’interface utilisateur du projet repose sur **ActivePieces** pour offrir un designer no‑code moderne qui met en lumière notre backend d’agents IA.

---

## 1️⃣ Choix de la plateforme UI

| Option           | Avantages clés                                                                           | Limites                                                    | Décision                   |
| ---------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------- |
| **ActivePieces** | Open‑source GPLv3, builder visuel récent, marketplace de « pieces », API Webhook simple. | Branding limité (UI), nécessite build front.               | \*\*✅ \*\*                 |
| Node‑RED / n8n   | Mature, grosse communauté.                                                               | Moins orienté IA, UX datée, modèles de monétisation flous. | Plan B (veille uniquement) |

---

## 2️⃣ Stratégie licence & white‑label (branding)

* **Rebuild modules EE** : remplacer logo, couleurs tailwind, activer « dark mode » par défaut.
* **SSO / OIDC** : ajouter un provider Keycloak dans le middleware Next.js d’ActivePieces.
* **Billing** : intégrer Paddle via Webhook pour activer quotas `MAX_TOKENS_PER_DAY`.
* **EE assets** stockés dans `ui/assets-branding`, versionnés via Git submodule.

---

## 3️⃣ Architecture déploiement (MVP SaaS)

| Couche        | Service (Docker Compose) | Port     | Notes                                           |
| ------------- | ------------------------ | -------- | ----------------------------------------------- |
| Ingress       | **Traefik**              | 80 / 443 | Let’s Encrypt, routes `/ui`, `/api`, `/phoenix` |
| UI            | **activepieces-ui**      | 3000     | Builder no‑code                                 |
| Backend flows | **activepieces-core**    | 8080     | Webhook / REST                                  |
| Agents API    | **agent-ai**             | 8000     | LangServe, CrewAI                               |
| Observabilité | **phoenix**              | 6006     | **Phoenix first** avant l’UI                    |
| Vector DB     | **chromadb**             | 8001     | Persistant                                      |
| Vault         | **secret-mcp**           | 8200     | Tokens JWT                                      |

---

## 4️⃣ Déploiement et montée en charge

### 4.1 MVP SaaS : Docker Compose + Traefik

```yaml
- cmd: docker compose up -d traefik phoenix chromadb secret-mcp activepieces-ui activepieces-core agent-ai
  path: C:\projets\agent-ai
  venv: off
```

* Traefik gère HTTPS auto avec Let’s Encrypt.
* Routing `/ui` → ActivePieces, `/api` → agent‑ai, `/phoenix` → dashboard OTEL.

### 4.2 Anticipation K8s + Helm

* Garde‑fous : labels, probes, variables ENV déjà **K8s‑ready**.
* Futur chart `agent-ai-stack` : export `docker-compose.yml` → Helm Chart minimal.
* Traefik restera l’IngressController ; secrets via **Sealed‑Secrets** ; volumes via PVC.

---

## 5️⃣ Prochaines actions (alignées Roadmap 4A / 4B)

| Sprint | Action UI                                                  | Responsable           | Statut  |
| ------ | ---------------------------------------------------------- | --------------------- | ------- |
| **4A** | Patch branding minimal (logo, palette)                     | Dev Front             | À faire |
|        | Déployer stack MVP (Compose + Traefik) en sandbox          | Ops                   | À faire |
| **4B** | Créer flows ActivePieces déclenchant les agents orchestrés | Ops + Prompt Engineer | À venir |
| **5**  | Ajouter job RAG (hook `vector-upsert`)                     | Ops                   | Parking |

---

## 6️⃣ Environnements & bonnes pratiques

### 6.1 Sandbox

```yaml
- cmd: docker compose -f docker-compose-sandbox.yml up -d
  path: C:\projets\agent-ai
  venv: off
```

* Variable `ENV=dev` active DB mémoire et fichiers volatils.

### 6.2 Migrations

Toujours exécuter :

```bash
make migrate
```

avant toute nouvelle image.

### 6.3 Observabilité (Phoenix first)

```bash
docker compose up -d phoenix
echo "Dashboard : http://localhost:6006"
```

### 6.4 Quotas & rate limiting

| Variable             | Défaut | Rôle                       |
| -------------------- | ------ | -------------------------- |
| `MAX_TOKENS_PER_DAY` | 100000 | Coupe‑circuit budgétaire   |
| `RATE_LIMIT_RPS`     | 5      | Débit max requêtes LLM/sec |

### 6.5 RGPD & Secrets

Voir `SECURITY_AND_PRIVACY.md` (TLS, rétention logs, Sealed‑Secrets).

---
#### Gestion des clés API utilisateur

Chaque client doit pouvoir ajouter / mettre à jour ses clés (OpenAI, Anthropic…) **sans passer par l’équipe ops**.  
Deux parcours possibles :

| Parcours | Étapes côté utilisateur | Stockage réel |
|----------|------------------------|---------------|
| **Credentials UI** (recommandé) | UI → *Settings → Credentials* → **Add credential → HTTP Header**<br>• Name : `OpenAI API Key`<br>• Header : `Authorization`<br>• Value : `Bearer sk-…` | Valeur chiffrée en DB (AES-256) ; jamais renvoyée en clair |
| **Secret MCP** (option avancée) | UI custom / portail d’on-boarding → POST `/secret-mcp` avec scope `tenant/<slug>/openai` | Stocké dans Secret MCP, accessible via `secret.get()` depuis les flows |

> **Règle d’or :** aucune clé API ne doit apparaître en clair dans le dépôt Git, les .env ni les logs.

#### Isolation tenant via middleware `X-Tenant`

```mermaid
flowchart LR
  browser["ui.<slug>.localhost"] -->|HTTP| traefik
  traefik -- "add header<br/>X-Tenant: <slug>" --> ap_ui[ActivePieces UI]
  browser2["api.<slug>.localhost"] --> traefik
  traefik -- "add header<br/>X-Tenant: <slug>" --> ap_core[ActivePieces Core]
Configuration minimale :
# traefik.yml (extrait)
http:
  middlewares:
    add-x-tenant:
      headers:
        customRequestHeaders:
          X-Tenant: "{slug}"   # remplacé via dynamic.yml ou labels

  routers:
    ui-tenant:
      rule: "Host(`ui.{slug}.localhost`)"
      service: activepieces-ui
      middlewares: [add-x-tenant]

    api-tenant:
      rule: "Host(`api.{slug}.localhost`)"
      service: activepieces-core
      middlewares: [add-x-tenant]
👉 Le script d’on-boarding scripts/create_tenant.sh <slug> crée le vhost, la branche Git tenant/<slug> et les secrets associés.




## 📝 Changelog

| Version | Date       | Motif                                                                                                                                |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **v2**  | 2025‑05‑07 | Résumé comparatif, ajout déploiement Compose + Traefik, avertissement Phoenix, suppression Section 8 vide, actions alignées Roadmap. |
| **v1**  | 2025‑04‑30 | Draft initial ActivePieces UI.                                                                                                       |
