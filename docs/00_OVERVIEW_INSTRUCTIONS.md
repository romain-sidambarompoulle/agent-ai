# 00\_OVERVIEW\_INSTRUCTIONS.md

> **Version v2.2 – 10 mai 2025**
> Aligné sur *Boussole d’état – 10 mai 2025* (pivot « LangFlow → React‑Flow Builder »)

---

## Contraintes invariantes (isolation client & secrets)

1. **Modèle SaaS & Local unifié** – Toute nouvelle fonctionnalité doit fonctionner aussi bien en mode cloud **(une stack ActivePieces Community 0.39 par client)** qu’en déploiement local Docker isolé.
2. **Isolation par tenant dès le départ** – Tout code, build ou test doit cibler la branche Git `tenant/<slug>` correspondante ; aucun commit direct sur `main`.
3. **Secrets chiffrés & scoppés** – Les clés API et tokens utilisateur sont stockés :

   * via le menu **Credentials** d’ActivePieces (valeur chiffrée dans la base Postgres de la stack cliente) ;
   * ou via **Secret MCP** sous la clé `tenant/<slug>/<name>`.
     Jamais de hard‑code provisoire dans le code ou un `.env` global.
4. **Pas de provisoire à casser plus tard** – Les workarounds « temporaires » sont interdits ; toute solution doit être industrielle dès son introduction ou consignée comme *ADR* avec une date d’abandon planifiée.
5. **CI “tenant‑guard”** obligatoire – Les pipelines doivent lancer des tests croisés (branche A vs branche B) et échouer si un secret ou un artefact en clair traverse la barrière. *(Le contrôle s’effectue au niveau Git, chaque stack étant physiquement isolée.)*
6. **Exceptions documentées** – Toute dérogation à ces règles doit être consignée, le jour même, dans `docs/adr_exceptions.md`, au format indiqué (contexte, cause, décision, plan de retrait).

---

### Onboarding locataire : création de la stack **avant** tout Flow

> *Métaphore éclair : on coule la dalle avant de poser la maison préfabriquée.*

#### 1. Déclencheur UX

| Étape                                                         | Source d’évènement     | Raison                                                                                  |
| ------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| **Validation du formulaire Sign‑up** (email + nom de société) | `POST /onboard/signup` | L’utilisateur manifeste une intention claire et durable ; on évite des stacks fantômes. |

#### 2. Pipeline technique (atomique & idempotent)

| Ordre | Couche             | Action                                                                                     | Fichier / service              |
| ----- | ------------------ | ------------------------------------------------------------------------------------------ | ------------------------------ |
| ①     | **Auth**           | Créer l’utilisateur + groupe `tenant/<slug>`                                               | `keycloak_admin.create_user()` |
| ②     | **Infrastructure** | **Provisionner une stack ActivePieces CE complète** (`compose/<slug>` + DNS + certificats) | `scripts/create_tenant.ps1`    |
| ③     | **Git**            | Branche `tenant/<slug>` + dossier `app/flows/<slug>/`                                      | `scripts/git_init_tenant.sh`   |
| ④     | **Vault MCP**      | Namespace `tenant/<slug>/`                                                                 | `secret_mcp.create_scope()`    |
| ⑤     | **E‑mail**         | Message de bienvenue avec lien vers l’UI dédiée                                            | Celery → SendGrid              |

#### 3. Schéma « dalle → maison »

```
(front Sign‑up) ─► /onboard/signup ─► onboarding_service
            │                                 │
            └──────── rollback si erreur ◄────┘
```

#### 4. Points de vigilance

* **Atomicité** : rollback complet si l’une des sous‑étapes échoue.
* **Idempotence** : second appel avec le même email → 200 + « déjà créé ».
* **Provisionnement** : la création d’une stack Docker peut durer 30‑60 s ; afficher un loader côté UI.
* **Observabilité** : tracer l’ensemble sous *span* « onboarding » dans Phoenix.

#### 5. Liens croisés

* [UI.md](UI.md) : section *On‑boarding* ➜ renvoi vers ce paragraphe.
* [GitStrategyMulticlient.md](Gitstrategymultitenant.md) : ajouter note « stack Docker dupliquée dès Sign‑up ».

---

## Definition of Done (global)

* Isolation par tenant (stack dédiée)
* Secrets chiffrés et scoppés
* Aucun hard‑code provisoire
* Pipeline tenant‑guard vert
* Tests/builds toujours dans la branche tenant

## 🎯 Mission

Déployer **et** démocratiser des agents IA open‑source capables d’automatiser presque tout ce qu’on fait sur un PC – clics, formulaires, scripts, création de documents etc – **avec ou sans IA**, via une interface *no‑code* (**LangFlow** ou **React‑Flow Builder**) ; proposer l’offre en mode **SaaS clé en main** ou **installation locale Dockerisée** chez le client.

**Nouveauté (phase 4C+)** : chaque client peut dessiner ses flows visuels dans **LangFlow** ou **React‑Flow Builder**. À chaque sauvegarde, un **Compiler Service** génère automatiquement le code Python (runner cloud) puis le commite dans **sa branche Git dédiée** (`tenant/<slug>`). Aucune ligne de code n’est exposée au client, mais l’historique reste traçable côté backend. **ActivePieces** redevient un **déclencheur simple** : la Piece **RunAgentFlow** invoque le endpoint `/run-<slug>` pour exécuter le flow.

Objectif parallèle : **apprentissage “project‑based learning”**.

---

## 👥 Publics cibles

| Segment                       | Besoin principal                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| **Entrepreneurs solos / PME** | Automatiser les opérations quotidiennes (marketing, back‑office, web, ERP) sans équipe dev. |
| Consultants / Agences         | Construire et revendre des flux automatisés à leurs clients.                                |

---

## 🔧 Stack & compatibilité (à jour Sprint 4)

| Couche                      | Outils / Frameworks                                                                                | Notes                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **UI Flows**                | **LangFlow** (moteur & catalogue) **+ React‑Flow Builder** (Next.js, branding)                     | Dessin & sauvegarde de flows JSON envoyés au Compiler Service |
| **Automation & Triggers**   | **ActivePieces CE** (Piece **RunAgentFlow**)                                                       | Déclenche l’exécution `/run-<slug>` avec entrée utilisateur   |
| **Compiler Service**        | **FastAPI** + **Jinja2**                                                                           | Génère runners, pousse sur branche *tenant*                   |
| **Orchestration**           | **LangGraph**, **CrewAI**, **LangChain**                                                           | Graphe d’états + multi‑agents                                 |
| **Backend API**             | **LangServe**, **FastAPI**                                                                         | Expose les flows                                              |
| **LLM**                     | OpenAI / Anthropic (API) ; **LiteLLM** pour mock/abstraction ; **Ollama** & *llama.cpp* pour local |                                                               |
| **RAG / Index**             | **Llama‑Index**, Chroma DB                                                                         | RAG hiérarchique                                              |
| **Observabilité**           | **Phoenix** + OTEL                                                                                 | Règle « Phoenix first »                                       |
| **Validation & Guardrails** | **Guardrails (Colang)**                                                                            | Bloque données sensibles                                      |
| **Secret management**       | **Secret MCP Server**                                                                              | Vault minimal pour clés & creds                               |

---

### 🔐 Règles projet & sécurité

1. *Open‑source only* ou licences permissives.
2. Cloud (budget modéré) puis **Docker local** ; scripts YAML fournis.
3. Tester les endpoints **uniquement via PowerShell** (`Invoke‑RestMethod`) tant que `/docs` LangServe est instable.
4. **Phoenix doit être lancé** (`phoenix serve` ou conteneur) **avant** tout test multi‑agents ; exporter `PHOENIX_COLLECTOR_ENDPOINT` puis enregistrer le tracer dans le code.
5. Stocker les secrets dans **Secret MCP Server**, jamais en clair dans le repo/CI.
6. **Conventions Git multi‑client** : une branche `tenant/<slug>` par client ; tags `bld/<slug>/<ts>-<target>` pour chaque build ; quota 100 builds/24 h/tenant ; script cron purge les tags > 30 j et exécute `git gc` hebdo.

---

## ✍️ Style & pédagogie

Le langage imagé (métaphores, analogies) est encouragé pour chaque explication technique. Voir `00_explications_imagé.md` pour l’inspiration.

## 🗺️ Roadmap

Consulter `00_ROADMAP.md` pour la progression détaillée par sprints.

## 📝 Changelog

| Version  | Date       | Motif                                                                                                             |
| -------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| **v2.2** | 2025‑05‑10 | Alignement pivot LangFlow → React‑Flow Builder ; ActivePieces devient déclencheur (Piece RunAgentFlow)            |
| **v2.1** | 2025‑05‑08 | Ajout de la section Git multi‑tenant + mention de la création de flows client → compiler → branche.               |
| **v2**   | 2025‑05‑07 | Mise à jour majeure : mission élargie, nouveaux publics, stack enrichie, règles Phoenix & secrets, format README. |
| **v1**   | 2025‑04‑29 | Création initiale du fichier.                                                                                     |


---


