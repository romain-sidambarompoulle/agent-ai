## Titre du fichier

Boussole stratégique Builder — Vision 1.0 (14 mai 2025)&#x20;

## Objectif / Problème traité

Fournir une vision claire d’un SaaS open-source permettant de concevoir, versionner et déployer des « flux agents » IA depuis LangFlow vers une plateforme multi-tenant (Builder) ; assurer performance, extensibilité, traçabilité OTEL et simplicité d’on-premise via Docker.

## Points clés

* Métaphore : **Maisons préfabriquées** (stack Docker/client) + **atelier LEGO** (LangFlow catalogue) + **table à dessin** (React-Flow Builder).
* Double chantier parallèle : Builder (front React-Flow + API Node) & Agents IA (prototypés LangFlow, export JSON).
* **KPIs** : 60 FPS sur 1 000 nœuds (UX) ; nouveau nœud < 15 min / < 40 lignes (extensibilité) ; export JSON diff 0 (interop) ; traçabilité OTEL sans trou > 50 ms.
* Architecture cible (Scénario B v3) : monorepo, dossier `tenant/<slug>` pour flows JSON et runners Python ; services Docker par client (`builder-api`, `langserve`, `phoenix`, `langflow`).
* Flux : Client ↔ Builder (`/catalog` → **Save** `/build`) → Compiler (FastAPI + Jinja2) génère code Python → LangServe reload → déclencheur `/run-<slug>` → Phoenix trace.
* Limitations identifiées : chunking RAG avancé, rareté des connecteurs métier, gestion des secrets en clair.
* Plan d’action incrémental en 5 étapes, orienté « pas de code inutile ».
* Feuille de route 6 semaines : installation LangFlow, déclencheur Builder, MVP React-Flow, flows complexes (CrewAI), Edge-Agents locaux, documentation onboarding.

## Décisions ou exigences

* Pivot validé : abandon des dépendances propriétaires, tout open-source.
* Multi-tenant strict ; chaque client isolé dans sa stack Docker.
* Compatibilité bidirectionnelle LangFlow ↔ Builder garantie (schéma v1).
* 100 % des actions tracées OTEL vers Phoenix.
* Secrets chiffrés & UI « Credentials » obligatoire dans Builder.

## Actions à entreprendre

* Prototyper runner Python interne pour chunking RAG adaptatif.
* Développer nœuds connecteurs métier (Gmail, Slack, etc.).
* Implémenter stockage chiffré des clés + interface gestion secrets.
* Réaliser livrables S1 → S6 selon roadmap 6 semaines.
* Documenter workflow import/export LangFlow et conventions JSON.

## Mots-clés pour recherche

`Builder`, `LangFlow`, `SaaS`, `multi-tenant`, `React-Flow`, `OTEL`, `KPIs`, `Edge-Agent`, `roadmap`, `architecture`


## Titre du fichier

01\_CAHIER\_DES\_CHARGES\_BUILDER – Spécifications fonctionnelles v0.1 (14 mai 2025)&#x20;

## Objectif / Problème traité

Définir le périmètre fonctionnel, les exigences non-fonctionnelles et la feuille de route du MVP « Builder », orchestrateur React-Flow chargé d’importer des exports LangFlow, de les exécuter/déployer et de tracer toute activité via OTEL.

## Points clés

* **MVP (Sprints 4D→4E)** : zoom/pan canvas, sélection multiple, nœuds *Agent / LLM / Webhook / Condition*, arêtes dirigées + conditionnelles, palette + propriétés, bouton **Save** → `/api/flows`, export / import JSON LangFlow v1, traces OTEL `FLOW_EDIT` & `FLOW_SAVE`.
* **Rôle actuel** : Builder reste un orchestrateur léger ; la conception principale des graphes se fait encore dans LangFlow.
* **Objectif court terme** : valider orchestration + traçabilité OTEL sans Postgres/Redis, avec un front minimal.
* **Exigences non-fonctionnelles** : JS hors React-Flow < 150 kB gzip, image Docker < 300 MB & start < 5 s, WCAG AA, licences MIT/Apache 2/CC0 uniquement.
* **Guidelines composants** : nomenclature `TypeNode`, séparation logique/UI, Tailwind only, icônes `lucide-react` 24 px, props TS strict + `zod`, instrumentation systématique (`tracer.startActiveSpan`).
* **Roadmap incrémentale** : 4D – Next 14 + FlowCanvas stub (#12) ; 4E – nœuds de base + Save/Load API (#20) ; 4F – export LangFlow + OTEL complet (#27) ; 4G – mode collaboratif Yjs (#35).
* **Processus qualité** : toute nouvelle feature passe par une *Issue* « RFC – Feature ✨ » référencée au cahier.

## Décisions ou exigences

* Pas de bases Postgres/Redis pour le MVP.
* Traçabilité exhaustive OTEL obligatoire.
* Budgets stricts de performance, accessibilité et taille d’image Docker.
* Conformité licences open-source non négociable.
* Respect des guidelines de codage et d’instrumentation.

## Actions à entreprendre

* Implémenter Canvas (zoom/pan) + nœuds/edges de base.
* Développer API `/api/flows` in-memory et bouton **Save**.
* Intégrer export / import JSON LangFlow et tests de diff.
* Configurer OTEL (`FLOW_EDIT`, `FLOW_SAVE`) et vérifier budget JS/Docker.
* Préparer Sprint 4F (export + OTEL full) puis 4G (collab Yjs).

## Mots-clés pour recherche

`Builder`, `MVP`, `React-Flow`, `LangFlow`, `OTEL`, `cahier_des_charges`, `Roadmap`, `Docker`, `WCAG`, `NodeTypes`


## Titre du fichier

Guide illustré des fichiers *builder-front* (structure du projet)&#x20;

## Objectif / Problème traité

Présenter clairement l’architecture des dossiers/fichiers du dépôt **builder-front** afin d’aider développeurs et non-développeurs à localiser, comprendre et modifier chaque composant sans tâtonner.

## Points clés

* Vue d’ensemble : cinq zones majeures – `data/`, `prisma/`, `src/app`, `src/components`, `src/lib`.
* `data/flows.json` = « mini base » des flows ; toutes les routes API y lisent/écrivent.
* `prisma/` contient `schema.prisma` + migrations ; SQLite dev (`dev.db`) gardé pour futures persistes avancées.
* `src/app` = pages Next.js **(SSR)** + routes API REST (`/api/flows`, `/api/run`) servant de passerelle back-end.
* `src/components` héberge l’UI : `FlowPage`, `FlowCanvas` (ReactFlow), `LLMNode`, `SidebarProperties`, etc.
* `src/lib` regroupe helpers (`prisma.ts` singleton, `nodeTypes.ts` mapping ReactFlow).
* Parcours utilisateur typique : accueil `/` → création via `POST /api/flows/new` → édition `/flows/[id]` → sauvegarde `POST /api/flows` → exécution `POST /api/run`.
* Métaphores pédagogiques (garde-manger, tableau blanc aimanté…) pour faciliter la compréhension.
* Fichier souligne que Prisma est prêt mais désactivé pour les flows, favorisant un onboarding rapide.

## Décisions ou exigences

* Persistance par fichier (`flows.json`) retenue pour le MVP, base SQL envisagée ultérieurement.
* Structure modulaire Next 13 + ReactFlow imposée ; chaque composant isolé et typé strict (TS).
* Routes API définissent contrat REST stable (CRUD + run).
* Documentation veut rester accessible aux profils non techniques ; jargon minimal, analogies visuelles.

## Actions à entreprendre

* Évaluer migration progressive `flows.json` → Prisma/Postgres une fois scalabilité requise.
* Ajouter nouveaux blocs (ex. « Appel API externe ») en étendant `nodeTypes.ts` et `FlowCanvas`.
* Compléter logique `POST /api/run` : intégration CrewAI/LangGraph + traces OTEL.
* Mettre à jour guide à chaque refactor majeur (dossiers, contrats API, persistance).

## Mots-clés pour recherche

`builder-front`, `structure_projet`, `Next.js`, `ReactFlow`, `flows.json`, `Prisma`, `API_REST`, `CRUD`, `MVP`, `documentation`


## Titre du fichier

Journal 2025 — Pivot Builder (abandon d’ActivePieces)&#x20;

## Objectif / Problème traité

Conserver une trace chronologique complète du remplacement d’ActivePieces par le Builder maison (Next 14 + React-Flow), des choix d’architecture et de la migration de la persistance des *flows* (fichiers → SQLite → Postgres).

## Points clés

* **14 mai 2025** : scaffolding `builder-front` (create-next-app, Tailwind, React-Flow), API mock `/api/flows`, endpoint `/build`, TODO CI & Docker.
* **Partie B** : retrait d’ActivePieces (Docker+Git), libération des ports, variable `BLD_KEY`, redirection vers `builder-api`.
* **15–16 mai** : pages `FlowPage` & dashboard, gestion CRUD flows, duplication/suppression nœuds, première persistance duale (`flows.json` + SQLite Prisma), nœud **LLM Chain** avec appel OpenAI.
* **16–17 mai** : détection « double stockage », normalisation UUID, décision de basculer en **Postgres** pour la production.
* **19 mai 2025** : service `postgres:16-alpine` (port 5434), réglage `pg_hba.conf` (trust → md5), résolution collisions 5432/5433, migration `init_postgres`, mise à jour `DATABASE_URL`, conteneurs opérationnels (`pg_demo`, `demo-server`, Redis).
* Bonnes pratiques consignées : citations exhaustives, normalisation clés React, quoting JSON sous PowerShell, éviter les divergences de sources.

## Décisions ou exigences

* Abandon définitif d’ActivePieces ; stack 100 % open-source.
* **Source unique** : BDD Postgres + Prisma (suppression de `flows.json`).
* Port mapping standard (5434↔5432) et sécurité MD5 pour Postgres local.
* Clé OpenAI stockée dans `.env.local`; journal obligatoire pour audit OTEL.

## Actions à entreprendre

* Finaliser schéma Prisma (`Flow { id uuid, name, json, timestamps }`).
* Unifier toutes les routes API sur Postgres, supprimer helpers fichiers.
* Dockeriser Builder + Postgres par client, intégrer migrations auto.
* Ajouter nœuds **RAGRetriever** et exécution topologique bouton **Run**.
* Poursuivre la documentation quotidienne des bugs, correctifs, décisions.

## Mots-clés pour recherche

`journal`, `pivot`, `Builder`, `React-Flow`, `Prisma`, `Postgres`, `LLM Chain`, `flows`, `docker`, `ActivePieces`


## Titre du fichier

🗂️ Répertoire Builder — Guide rapide&#x20;

## Objectif / Problème traité

Servir de porte d’entrée unique aux documents du projet Builder en indiquant où trouver chaque fichier clé, comment y accéder rapidement en ligne de commande et quelle est la logique d’arborescence retenue.

## Points clés

* **Table des documents** : listing synthétique des quatre fichiers maîtres — *00\_VISION\_BUILDER*, *01\_CAHIER\_DES\_CHARGES\_BUILDER*, *JOURNAL\_2025*, *archive/PIVOT\_2025-05-14* — avec description de leur rôle (boussole stratégique, cahier des charges, journal de bord, snapshot).
* **Navigation rapide** : exemples de commandes `open` pour consulter instantanément chaque document sans chercher dans l’arbre.
* **Arborescence visuelle** : schéma `docs/…` + répertoires racines (`builder-front/`, `builder-api/`, etc.) afin de contextualiser les sources par rapport aux guides.
* **Métaphore pédagogique** : Vision = carte au trésor, Cahier = plan du navire, Journal = carnet de bord, Archive = photo du lancement — facilite l’appropriation par des profils variés.
* README placé à la racine de *docs* pour centraliser toute la documentation pivotée vers le Builder maison et rappeler l’abandon d’ActivePieces.

## Décisions ou exigences

* Tous les nouveaux documents techniques doivent être recensés dans cette table pour garder la documentation alignée.
* Conventions de nommage (`00_`, `01_`, etc.) imposées pour l’ordre de lecture et l’indexation automatisée.
* README doit rester concis ; détails opérationnels logés dans les fichiers spécialisés (Vision, Cahier, Journal).

## Actions à entreprendre

* Mettre à jour la table dès qu’un nouveau guide est ajouté ou renommé.
* Ajouter liens directs (URL Git) dans la section navigation pour consultation web.
* Maintenir la cohérence de l’arborescence illustrée après chaque refactor de dépôt.

## Mots-clés pour recherche

`README`, `documentation`, `Builder`, `table_des_docs`, `arborescence`, `navigation_rapide`, `pivot`, `guide`, `index`, `docs`


## Titre du fichier

Contexte unifié : Vision, Cahier des charges et Journal Builder (mi-mai → fin mai 2025)&#x20;

## Objectif / Problème traité

Consolider, dans un même document, la vision stratégique, les spécifications MVP et le journal chronologique du pivot « LangFlow → Builder maison », afin de guider le développement d’un orchestrateur d’agents IA open-source, multi-tenant, traçable OTEL et déployable via Docker/Postgres.

## Points clés

* **Vision** : éditeur visuel léger (React-Flow) pour concevoir, versionner et déployer des flux LangGraph/CrewAI sans dépendance propriétaire ; métaphore LEGO/maisons préfabriquées.
* **KPIs** : 60 FPS sur 1 000 nœuds ; nouveau nœud < 15 min / 40 lignes ; export JSON diff 0 ; aucune trace OTEL > 50 ms.
* **Architecture cible v3** : monorepo `main/`, `builder-front/`, `tenant/<slug>/`, services Docker par client (`builder-api 41xx`, `langserve 80xx`, `phoenix 14xx`, `langflow 78xx`).
* **MVP (Sprints 4D→4G)** : canvas zoom/pan, nœuds Agent/LLM/Webhook/Condition, edges conditionnels, bouton Save → `/api/flows`, export/import LangFlow v1, traces `FLOW_EDIT/SAVE`, mode collaboratif Yjs prévu.
* **Journal** : 14–19 mai 2025 : scaffold Next 14 + React-Flow, CRUD flows (`flows.json` puis SQLite), migration Postgres 16-alpine (port 5434), résolution pg\_hba, dual-storage éliminé, CI/GitHub Actions et Docker compose stabilisés.
* **Backend** : LangServe FastAPI (`/invoke`) connecté via proxy `/api/run`; nœud LLM Chain fonctionnel, clé OpenAI via `.env`.
* **Qualité** : code Tailwind/TS strict, instrumentation systématique, image Docker < 300 MB, JS hors React-Flow < 150 kB, WCAG AA.

## Décisions ou exigences

* Abandon définitif d’ActivePieces ; stack 100 % open-source.
* Source unique Postgres + Prisma pour les flows ; suppression de `flows.json`.
* Multi-tenant strict : une stack Docker par client, ports dédiés 41xx/80xx/14xx/78xx.
* Budgets de performance, accessibilité, licences MIT/Apache 2/CC0 non négociables.
* Journal exhaustif obligatoire pour audit et traçabilité OTEL.

## Actions à entreprendre

* Finaliser schéma Prisma (UUID, JSONB, timestamps) et unifier toutes les routes API.
* Brancher bouton **Run** UI sur `/api/run/<slug>` et afficher l’output.
* Implémenter nœuds RAGRetriever, connecteurs métier (Gmail, Slack).
* Automatiser purge hebdo tags bld & quotas build 100 / 24 h / client.
* Documenter et dockeriser Builder + Postgres par tenant avec migrations auto.

## Mots-clés pour recherche

`Builder`, `LangFlow`, `React-Flow`, `multi-tenant`, `Postgres`, `Prisma`, `OTEL`, `Docker`, `MVP`, `KPIs`


## Titre du fichier

Guide illustré des fichiers *builder-front* (MAJ janvier 2025)&#x20;

## Objectif / Problème traité

Décrire la structure complète du dépôt **builder-front**, son routage Next 15, la chaîne Prisma → PostgreSQL et les interactions UI/API afin de permettre aux contributeurs de naviguer, modifier ou étendre le code sans chercher.

## Points clés

* Arborescence principale : `.env.local`, `data/` (flows.json obsolète), `prisma/` (schema + migrations), `src/app` (pages + API REST), `src/components`, `src/lib`, `src/types`.
* Flux CRUD : pages SSR → routes `/api/flows` (GET/POST) & `/api/flows/[id]` (GET/PUT/DELETE) → Prisma → Postgres.
* Exécution : `/api/run/[slug]` proxy POST → `${BACKEND_URL}/run-${slug}` pour LangServe.
* Conformité **Next.js 15** : déstructuration de `params` avant tout `await` dans toutes les routes (warning résolu).
* Components clés : `FlowCanvas` (ReactFlow), `FlowEditor`, `FlowsAccordion`, `LLMNode`, `SidebarProperties`.
* Type unique `FlowJson` partagé (`src/types/flow.ts`) pour assurer cohérence du graphe.
* Architecture PRISMA : modèle `Flow` (id uuid, name, json, timestamps) ; migrations versionnées.
* Variables d’environnement : `NEXT_PUBLIC_API_URL` (CRUD) & `BACKEND_URL` (proxy exécution).
* Tests validés : backend direct vs proxy donnent mêmes résultats ; absence de warnings.

## Décisions ou exigences

* Source de vérité des flows : **PostgreSQL** géré via Prisma ; `flows.json` conservé uniquement comme secours.
* Respect strict des conventions de nommage fichiers/routes et des patterns Next 15.
* Tous les nouveaux fichiers ou refactor doivent être répercutés dans ce guide et dans le README central.
* UI : Tailwind, ReactFlow ; accessibilité WCAG AA visée.

## Actions à entreprendre

* Supprimer définitivement les accès résiduels à `data/flows.json` dès que la migration Postgres est stabilisée.
* Ajouter exemples d’appels curl pour chaque route API dans la documentation.
* Étendre `nodeTypes.ts` pour de nouveaux blocs (RAG, Webhook externe).
* Mettre en place tests e2e (Playwright) couvrant CRUD, Run et flux UI.

## Mots-clés pour recherche

`builder-front`, `Next.js 15`, `Prisma`, `PostgreSQL`, `FlowJson`, `ReactFlow`, `API_PROXY`, `CRUD`, `structure_projet`, `documentation`
