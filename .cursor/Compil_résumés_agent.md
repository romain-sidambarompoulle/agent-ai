## Titre du fichier

00\_OVERVIEW\_INSTRUCTIONS – Contraintes & cadrage v2.3 (14 mai 2025)&#x20;

## Objectif / Problème traité

Définir les règles immuables, le processus d’onboarding multitenant et la stack technique pour un Builder maison permettant de déployer des agents IA no-code en mode SaaS **et** Docker local, tout en garantissant isolation, sécurité des secrets et traçabilité Git.

## Points clés

* **Isolation par locataire :** une stack complète (React-Flow + Node.js) et une branche Git `tenant/<slug>` par client.
* **Secrets chiffrés et scoppés :** stockés via Credentials UI ou Secret MCP (`tenant/<slug>/<name>`), jamais en clair.
* **CI “tenant-guard” :** tests croisés obligatoires, échec si un secret franchit la barrière.
* **Onboarding atomique & idempotent :** 5 étapes (Auth, Infra, Git, Vault, E-mail) déclenchées après `POST /onboard/signup`; rollback complet si erreur.
* **Compiler Service** : à chaque sauvegarde de flow LangFlow/React-Flow, génère le runner Python et commite dans la branche locataire.
* **Stack technologique** riche : LangFlow, React-Flow Builder, LangGraph, CrewAI, LangChain, LiteLLM, Llama-Index, Phoenix (observabilité « first »), Guardrails.
* **Quota builds** : 100 builds/24 h/tenant ; purge > 30 j, `git gc` hebdo.
* **Publics cibles** : entrepreneurs/PME pour automatiser leurs opérations ; consultants/agences revendant des flux.

## Décisions ou exigences

* Aucune fonctionnalité n’est acceptée si elle ne fonctionne pas en SaaS **et** en local.
* Tout code temporaire ou workaround interdit ; sinon ADR avec date de retrait.
* Tests via PowerShell tant que `/docs` LangServe est instable.
* Phoenix doit être lancé avant tout test multi-agents et le tracer enregistré.
* Open-source only ou licences permissives; budget cloud modéré.

## Actions à entreprendre

* Implémenter pipeline CI « tenant-guard » avec scans secrets/artéfacts.
* Créer scripts d’onboarding (Keycloak, Docker compose, DNS, Git, Vault).
* Intégrer Compiler Service dans le flux de sauvegarde des builders.
* Mettre en place purge automatique des tags et tâche `git gc`.
* Documenter toute dérogation dans `docs/adr_exceptions.md` le jour même.

## Mots-clés pour recherche

`multitenant`, `secrets`, `onboarding`, `CI-guard`, `Builder-maison`, `LangFlow`, `React-Flow`, `Compiler-Service`, `Phoenix`, `Git-tenant`


## Titre du fichier

00\_ROADMAP – Roadmap v3.2 (14 mai 2025)&#x20;

## Objectif / Problème traité

Établir et suivre, phase par phase, le plan d’évolution du Builder maison pour agents IA, tout en formant des utilisateurs peu aguerris au terminal et en conservant la capacité d’évoluer sans refonte lourde.

## Points clés

* **Apprendre en construisant :** chaque commande est exécutée puis commentée pour maximiser l’autonomie.
* **13 phases (0-12)** structurent le projet : de l’environnement initial jusqu’au bundle Docker Compose.
* Phases **0-3** (Hello-World, mini-RAG, LangGraph, CrewAI) **achevées** ✅.
* **Pivot 4B** : migration des flows LangFlow → Builder maison, dépendante de la stack isolée ActivePieces (4A).
* **Compiler Service 4C** (codegen Cloud + Edge) et **Scaffold React-Flow 4D** en cours ⏳ ; **API Builder 4E** à planifier 🕓.
* Phases **5-6** (Lego-studio Cloud/Desktop ; sécurité & distribution) prévues 🅿️.
* Phases **7-9** (optimisations embeddings, guardrails, LLM locaux) placées en backlog.
* Phases **10-12** (POC Secrétaire-robot, CI e2e, packaging) conditionnées à la complétion des fondations.
* Fiches de phase (activepieces\_4A.md, builder\_flows\_4B.md…) et changelog versionné jusqu’à **v3.2**.

## Décisions ou exigences

* Recours exclusif à des composants **open-source** ou licences permissives.
* Pédagogie renforcée : expliciter chaque étape pour profils non experts Git/Docker/Python.
* Limiter toute refonte ; obligation de discussion/documentation avant changement majeur.
* Codes de statut normalisés (✅, ⏳, 🕓, 🅿️) pour le reporting d’avancement.

## Actions à entreprendre

* Terminer la migration LangFlow → Builder (4B) puis achever **Compiler Service 4C** et **Scaffold 4D**.
* Définir et lancer l’intégration **API Builder (4E)**, préalable au Lego-studio dual-target (5).
* Préparer la phase **Sécurité & distribution (6)** : signatures, auto-update Edge.
* Mettre à jour systématiquement les fiches de phase et le changelog à chaque release.

## Mots-clés pour recherche

`roadmap`, `Builder-maison`, `LangFlow`, `ActivePieces`, `LangGraph`, `CrewAI`, `Compiler-Service`, `React-Flow`, `guardrails`, `Docker-Compose`


## Titre du fichier

ADR-Exceptions – Journal des dérogations aux contraintes invariantes v1.1 (10 mai 2025)&#x20;

## Objectif / Problème traité

Conserver, dans un registre unique et chronologique, toute exception assumée aux contraintes « invariantes » du projet (une stack ActivePieces CE par client), afin d’assurer traçabilité, responsabilité et plan de retrait.

## Points clés

* Fichier aligné sur la *Boussole d’état* du 10 mai 2025 ; version v1.1.
* Numérotation minimaliste : `AAAA-MM-JJ — <slug>` ; pas de hiérarchie.
* Chaque entrée contient : **Contexte**, **Cause**, **Décision**, **Plan retrait**, **Clôture**.
* Exemple historique : `2025-05-08 — ignore-tenant-header-dev`

  * Middleware Traefik `X-Tenant` désactivé en dev pour simplifier les tests UI.
  * Exception **obsolète** dès le pivot 4B (10 mai 2025).
* Au 10 mai 2025 : *aucune exception ouverte* ; journal remis à zéro lors du pivot « LangFlow → React-Flow Builder ».

## Décisions ou exigences

* Toute nouvelle entrée **doit** être mentionnée dans le message de commit :
  `docs: add adr-exception <slug>`.
* Le fichier est l’unique source de vérité ; pas de dispersion dans d’autres docs.
* Chaque exception requiert un **plan de retrait daté** et un suivi jusqu’à clôture.
* Les exceptions ne doivent jamais élargir leur portée sans nouvelle entrée validée.

## Actions à entreprendre

* Intégrer un hook CI vérifiant la présence du motif `adr-exception` dans les commits.
* Mettre en place un rappel automatique pour réviser les exceptions encore ouvertes à chaque fin de sprint.
* Documenter la procédure de création/fermeture d’exception dans le *guide contributeurs*.

## Mots-clés pour recherche

`adr-exception`, `invariantes`, `ActivePieces`, `Traefik`, `X-Tenant`, `pivot-B`, `dérogation`, `journal`, `traçabilité`, `plan-retrait`


## Titre du fichier

boussole\_2025-05-10 – Boussole d’état v1.2 (14 mai 2025)&#x20;

## Objectif / Problème traité

Offrir une vue panoramique (vision, historique, architecture cible, douleurs, backlog) afin d’aligner l’équipe sur le pivot stratégique **« LangFlow → Builder maison »** et planifier les six semaines suivantes.

## Points clés

* **Vision** : SaaS 100 % open-source, déployable cloud ↔ Docker local, avec contrôle humain gradué.
* **Métaphore** : maisons préfabriquées (stack client) + atelier LEGO (LangFlow) + table à dessin (React-Flow Builder).
* **Pipeline magique** : flow dessiné → POST `/build` → Compiler Service (Jinja 2) génère `flows/<slug>.py` + hot-reload LangServe → nœud Builder appelle `/run-<slug>` → traces Phoenix.
* **Historique condensé** : 8-14 mai 2025 : ActivePieces 0.39 CE → pivot « stack/tenant » → ajout LangFlow → conception puis migration complète vers Builder maison.
* **Architecture cible** : monorepo, dossier `tenant/<slug>` + compose dédié (builder-api 31xx, langserve 80xx, phoenix 14xx, langflow interne 78xx, Postgres, Redis).
* **Douleurs ayant motivé le pivot** : UI LangFlow non brandable, nécessité de forker pour ajouter des blocs, double logique ActivePieces.

## Décisions ou exigences

* **LangFlow** reste moteur/registry ; **React-Flow Builder** devient l’unique interface UX ; **Builder maison** sert de déclencheur.
* 1 compose = 1 client pour respecter la GPL et simplifier l’isolation.
* Auth minimaliste par token unique tant que le besoin RBAC n’est pas avéré.
* Toute documentation (README, workflows, *Legostudio*, etc.) doit pointer vers cette Boussole v1.2.

## Actions à entreprendre

* Finaliser le **TODO 3 semaines** : installer LangFlow, nœud déclencheur, route `/catalog`, skeleton Builder, hot-reload.
* Suivre la **roadmap 6 semaines** : Builder MVP → flows complexes → edge-agents → documentation/onboarding pilote.
* Mettre à jour les fichiers obsolètes (workflows.md, *Legostudio*.md, etc.) et purger les références ActivePieces.

## Mots-clés pour recherche

`boussole`, `pivot`, `LangFlow`, `React-Flow`, `Builder-maison`, `Compiler-Service`, `Phoenix`, `monorepo`, `stack-tenant`, `roadmap`



## Titre du fichier

JOURNAL.md — Chronologie détaillée post-pivot v3 (10 mai 2025)&#x20;

## Objectif / Problème traité

Enregistrer quotidiennement les actions, décisions et résultats techniques depuis le pivot « Scénario B » afin d’assurer traçabilité fine et retour d’expérience pour la construction du Builder IA multitenant.

## Points clés

* Journal daté du 30 avr. au 12 mai 2025 couvrant **Phases 0-4A**.
* **10 mai : pivot B** → 1 stack ActivePieces CE par client, abandon header `X-Tenant`.
* **Phase 4A** achevée le 12 mai : stack demo ActivePieces + LangFlow 1.1.4 + Phoenix, smoke-tests OK.
* OTEL activé ; traces visibles Phoenix dès variable `AP_OTEL_EXPORTER_OTLP_ENDPOINT`.
* Script **create\_tenant.ps1** génère `compose/<slug>` avec secrets locaux.
* Git workflow : sous-module ActivePieces GPLv3, cherry-pick correctifs, branches locataires supprimées après merge ; CI verte.
* Limitation UI CE ≥ 0.28 (« Unlock Projects ») détectée → motive le pivot.
* Debug Phoenix/OTEL (6 mai) ; dépendances « pinnées » (`litellm 1.38.5`, `crewai 0.118.0`).
* Sprints antérieurs : Setup LangServe (0), Mémoire Chroma (1), Orchestration LangGraph (2), Implémentation CrewAI (3).

## Décisions ou exigences

* **Phoenix first** avant tout test multi-agents.
* Tests API via **PowerShell** tant que Swagger indisponible.
* Branches terminées ⇒ merge dans `main` puis suppression immédiate.
* Clé OpenAI factice en CI pour préserver quota.
* ADR obligatoire pour chaque hack temporaire.

## Actions à entreprendre

* Mettre à jour Journal & Boussole après chaque sprint.
* Reprendre le branding LangFlow ultérieurement.
* Confirmer maintien de la stratégie 1 compose/tenant ou implémenter workspace multi-tenant.
* Lancer **Phase 4B** (import LangFlow → Builder) après stabilisation 4A.

## Mots-clés pour recherche

`journal`, `pivot-B`, `Phase4A`, `ActivePieces`, `LangFlow`, `Phoenix`, `OTEL`, `create_tenant.ps1`, `Git-workflow`, `CrewAI`


## Titre du fichier

workflows.md — Workflows agents & orchestrations v2.3 (14 mai 2025)&#x20;

## Objectif / Problème traité

Normaliser la mise en œuvre, l’exécution et la sélection des orchestrations d’agents IA (LangGraph, CrewAI, automation scripts) après le pivot « LangFlow → Builder maison », tout en conservant historique, bonnes pratiques et guides pas-à-pas.

## Points clés

* Version **2.3** alignée sur la *Boussole* (14 mai 2025) ; scenario B : **1 stack Builder/tenant**.
* Structure par sprint : 4A (*ActivePieces trigger* – obsolète) ; 4B (*Orchestration multi-agents*) actif.
* Variantes d’orchestration : **A (LangGraph maître)**, **B-1 (CrewAI brainstorm 90 %)**, **B-2 (Lite crew)**, **C (Automation-first + IA secours)** avec diagrammes Mermaid et schémas textuels détaillés.
* **Matrix de décision** (3 questions rapides + critères secondaires) attribue la bonne variante en < 3 min.
* Table **Templates & Chemins** : fichiers `.flow.json` et endpoints `/run-*` correspondants.
* Bonnes pratiques de structure dépôt : couches **🧰 Outils**, **🧩 Flows/Graphs**, **🚀 Runners** ; tous commits/tests sur `tenant/<slug>`.
* Guides YAML/CLI illustrant exécution LangGraph & CrewAI, collecte OTEL → Phoenix.
* Changelog v1 → v2.3 retraçant migration ActivePieces → Builder maison.

## Décisions ou exigences

* **Isolation locataire** obligatoire ; toutes commandes supposent branche/dossier `tenant/<slug>`.
* Obsolescence officielle de la pièce ActivePieces **RunAgentFlow** depuis v2.3.
* Garder historiquement les diagrammes et archives YAML mais **non maintenus**.
* Chaque nouveau scénario doit être noté dans Git : « Variante retenue : A/B-1/B-2/C ».

## Actions à entreprendre

* Mettre à jour les templates Builder (`/templates/variante_*`) à chaque modification endpoint.
* Automatiser le scan `app/flows/` pour exposer dynamiquement les endpoints FastAPI.
* Intégrer le questionnaire Q1-Q3 dans le formulaire de création de workflow pour guider les utilisateurs novices.
* Documenter la purge des archives ActivePieces et la redirection vers Builder maison.

## Mots-clés pour recherche

`workflows`, `LangGraph`, `CrewAI`, `Variante-A`, `Variante-B`, `Variante-C`, `OTEL`, `Phoenix`, `templates`, `Builder-maison`


## Titre du fichier

4A — Avancement Phase 4A (mise à jour du 12 mai 2025, 17 h \[min inconnue])&#x20;

## Objectif / Problème traité

Suivre l’exécution détaillée de la Phase 4A du projet : stabiliser la pile **ActivePieces CE + LangFlow 1.1.4** avec observabilité Phoenix/OTEL, versionnement Git par locataire et premiers smoke-tests automatisés.

## Points clés

* Toutes les tâches techniques planifiées (10/12) **terminées** ✅ : conteneur officiel ActivePieces, ajout LangFlow, OTEL activé, mini-flow `hello_flow.json`, script **create\_tenant.ps1**, déplacement du compose dans `compose/<slug>`, smoke-tests (`tests/smoke_4A.ps1`).
* Commit-ids significatifs : `fbbf428` (move compose), `5b2b767` (script tenant), `8eca70e` (smoke-tests).
* Branding ActivePieces et (facultatif) LangFlow placés en **parking** : rollback pour garder la stack propre.
* Stack stable : AP + LangFlow tournent, traces visibles dans Phoenix via `AP_OTEL_EXPORTER_OTLP_ENDPOINT`.
* Journal et Roadmap à mettre à jour dès validation finale du branding.

## Décisions ou exigences

* **Branding** AP suspendu : priorité à la stabilité ; sera repris ou reporté après choix explicite.
* Aucun secret ne doit apparaître dans les commits Git locataires.
* Toute progression de Phase 4A doit être reflétée dans Roadmap, Boussole et Journal le jour même.

## Actions à entreprendre

* Choisir l’orientation :

  * relancer le branding ActivePieces immédiatement,
  * passer directement au branding LangFlow,
  * ou **déclencher la Phase 4B** (intégration HTTP AP ↔ LangFlow).
* Une fois la décision prise : cocher la dernière case du tableau, mettre à jour Roadmap & Boussole, puis commiter.
* Si branding repris : créer un *skin* minimal, tester, puis reporter les commits dans `tenant/<slug>`.

## Mots-clés pour recherche

`Phase4A`, `ActivePieces`, `LangFlow`, `OTEL`, `Phoenix`, `branding`, `create_tenant.ps1`, `compose`, `smoke-test`, `pivot-B`


## Titre du fichier

activepieces\_4A – Phase 4A : stack ActivePieces 0.39 + LangFlow 1.x isolée&#x20;

## Objectif / Problème traité

Installer pour chaque client une pile no-code **ActivePieces Community** couplée à **LangFlow** (atelier de design de flows) avec traçabilité OTEL/Phoenix, versionnement Git locataire et premiers tests de fumée automatisés.

## Points clés

* **1 stack = 1 client** : dossier `compose/<slug>` et branche `tenant/<slug>`.
* Pré-requis : ≥ 2 vCPU / 3 Go, ports 31xx (AP), 54xx (PG), 63xx (Redis), 78xx (LangFlow interne), 80xx (Traefik).
* Ajout sous-module **activepieces 0.39.7** (profondeur 1) dans `external/`.
* `docker-compose.yml` : services **activepieces** UI+API (port 31\${IDX}) et **langflow** interne (port 78\${IDX}) reliés à Phoenix via `OTEL_EXPORTER_OTLP_ENDPOINT`.
* Script **create\_tenant.ps1** génère .env, compose, puis démarre la stack (`docker compose up -d traefik phoenix … langflow activepieces`).
* **Branding minimal** : logo, couleur primaire Tailwind, thème LangFlow ; mise en parking si instable.
* **Smoke tests CI** : ping `/v1/flows` (AP) et `/api/v1/ping` (LangFlow).
* Journaux détaillés : clone sous-module, alignement Git (cherry-pick, suppression branches fantômes), todo infra, tests header `X-Tenant`.

## Décisions ou exigences

* Secrets stockés dans **Secret MCP** ; aucun en clair dans Git.
* Phoenix doit toujours être lancé avant tout test multi-agents (« Phoenix first »).
* Commits/tests restent strictement dans la branche locataire ; `main` reste propre.
* Limiter hot-reload LangFlow en production.
* Branding repris uniquement après décision explicite ; priorité à la stabilité.

## Actions à entreprendre

* Commiter infra Docker & docs puis ajouter Postgres/Redis, services ActivePieces core/UI, et démarrer le MVP.
* Vérifier header Traefik `X-Tenant` et exécuter le flow « Ping ».
* Exporter les flows JSON depuis LangFlow pour Phase 4B et stubber l’endpoint `/api/v1/build`.
* Automatiser scan d’archives et mettre à jour Roadmap, Boussole, Journal dès qu’une tâche est cochée.

## Mots-clés pour recherche

`ActivePieces`, `LangFlow`, `Phase4A`, `stack-tenant`, `docker-compose`, `create_tenant`, `branding`, `OTEL`, `Phoenix`, `smoke-test`


## Titre du fichier

flows4B — Sprint 4B : premier flow « Hello-Agent » v2.4 (14 mai 2025)&#x20;

## Objectif / Problème traité

Décrire pas-à-pas l’export du flow « Hello-Agent » depuis LangFlow puis son import/exécution dans le **Builder maison**, valider le stub d’endpoint `/build` en CI et préparer la transition vers la Phase 4C (codegen Compiler Service).

## Points clés

* **Pivot acté :** ActivePieces déclaré *OBSOLETE* ; Builder devient l’unique interface UX.
* **Pré-requis réseau :** UI Builder `http://localhost:41<idx>` / LangFlow interne `http://localhost:78<idx>` ; fichier d’exemple `templates/hello_agent.flow.json`.
* **Procédure d’import :** `builder-cli import --file templates/hello_agent.flow.json` placée dans `compose/<slug>/external/builder`.
* **Compilation optionnelle :** `docker compose build builder-api` permet de refléter l’ajout ou la mise à jour d’un nœud.
* **Exécution & traçabilité :** bouton **Run** dans l’UI Builder ; chaque span est capturé par Phoenix.
* **Stub CI `/build` :** appel PowerShell `curl -X POST http://localhost:41<idx>/build -H "X-Api-Key: $env:BLD_KEY" -d '{"flowId":"hello_agent"}'`; header `X-Tenant` désormais facultatif (maintien compatibilité ascendante).
* **Check-list fin de sprint :** flow importé, credentials ajoutés, traces visibles, pipeline `/build` vert.
* **Préparation 4C :** stabiliser `FlowSchema` JSON, convertir stub en logique réelle FastAPI, créer dossiers `compiler/templates/`, provisionner PAT Git tenant, activer spans Phoenix lors du build.
* **Changelog** synthétise évolutions v2.1 → v2.4 ; dernière version consacre le pivot complet.

## Décisions ou exigences

* `X-Api-Key` obligatoire pour toute requête Builder ; `X-Tenant` uniquement si rétro-compatibilité nécessaire.
* Le **schema JSON** des flows doit être figé avant d’activer le Compiler Service.
* Phoenix doit tracer automatiquement les builds pour diagnostic.
* Toute mise à jour d’image Builder nécessite rebuild ou tag explicite.

## Actions à entreprendre

* Finaliser import + run automatisé du flow **Hello-Agent** pour chaque tenant.
* Implémenter l’endpoint `/build` réel dans FastAPI et connecter au Compiler Service.
* Créer templates Jinja (`flow.py.j2`, `runner.py.j2`) dans `compiler/templates/`.
* Générer PAT Git et secrets MCP via `create_tenant.ps1` avant phase 4C.

## Mots-clés pour recherche

`Sprint4B`, `Hello-Agent`, `Builder`, `LangFlow`, `/build`, `FlowSchema`, `Compiler`, `Phoenix`, `CI`, `import`


## Titre du fichier

Stratégie Git multi-tenant v3.3 (14 mai 2025)&#x20;

## Objectif / Problème traité

Définir une organisation Git qui isole les artefacts générés pour chaque client dans un projet Builder / LangFlow, tout en garantissant traçabilité OTEL, quotas de build et CI sélective.

## Points clés

* **Scénario B** : stack Builder cloud par client ; Edge-Agent local exécute le code rendu.
* **Source unique** : le flow JSON exporté depuis LangFlow est importé tel-quel dans Builder, évitant toute divergence cloud/desktop.
* **Monorepo** : branche `main` (ossature commune) ; branches `tenant/<slug>` contenant `agent-ai/`, `desktop/`, `app/flows/`, `compose/`.
* Script `create_tenant.ps1` crée branche, dossiers et commit *chore(tenant): bootstrap* avec hook pré-commit.
* Cycle de vie : webhook `flow.saved` (port 41<idx>) → Compiler (Jinja) → tests → commit taggé `bld/<slug>/<ts>/<target>` → push → notification reload/Edge.
* OTEL : spans normalisés (`build.*`) taggés `stack_port`, `agent_type`.
* Quotas : 100 builds / 24 h / client / cible ; purge hebdo des tags > 30 jours via `purge_build_tags.ps1` puis `git gc`.
* CI GitHub Actions déclenchée uniquement sur branches `tenant/**`.
* Compiler paramétré par env `TENANT_SLUG`, `TARGETS`; génère bundles Edge (`desktop/<slug>/…`) et agents cloud (`agent-ai/<slug>/…`).
* Edge-Agent vérifie branche, bundle `.zip` et compatibilité `cpu_arch` avant exécution.

## Décisions ou exigences

* Abandon d’ActivePieces, pivot complet vers Builder.
* Aucune collision de secrets ; PAT stocké en Vault.
* Tags de build obligatoires pour purge et audit.
* Maintien d’un audit clair via OTEL + tags spécifiques.
* Tests (lint, `pytest`, antivirus) : fail-fast obligatoire avant push.
* Limite stricte de 30 jours pour conservation d’artefacts.

## Actions à entreprendre

* Finaliser et déployer `create_tenant.ps1` + hook.
* Automatiser le webhook `flow.saved` et sécuriser `BLD_KEY`.
* Mettre en place `purge_build_tags.ps1` sur cron hebdo.
* Configurer GitHub Actions selon le `tenant/**` pattern.
* Documenter procédure Edge-Agent (vérifs branche / bundle / Manifest).

## Mots-clés pour recherche

`monorepo`, `tenant`, `Builder`, `LangFlow`, `Edge-Agent`, `bld_tags`, `quota_build`, `OTEL`, `CI_GitHub`, `purge_scripts`
