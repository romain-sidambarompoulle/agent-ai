# INFO_STACK_AGENT.md

> **Version 2 – 7 mai 2025**
>
> Ce manuel recense – sans doublons avec la Roadmap ou le Journal – tout ce qu’il faut savoir pour **concevoir, câbler et vendre** des agents IA (ou scripts) basés sur nos stacks open‑source. Il sert de **boîte à idées** pour futurs workflows et d’index rapide des outils à disposition.

---

## 📑 Sommaire

1. [Objet du fichier](#1-objet)
2. [Stack open‑source de référence](#2-stack)
3. [Modèles & Protocoles](#3-modeles)
4. [Zones d’automatisation](#4-zones)
5. [Bibliothèque de scénarios](#5-bibli)
6. [Model Context Protocol (MCP) : guide & exemples](#6-mcp)
7. [Catalogue 25 outils LangChain](#7-catalogue)
8. [Scénarios réels détaillés](#8-scenarios)
9. [Changelog](#9-changelog)

---

## 1️⃣ Objet du fichier

* Donner **un panorama unique** des briques techniques utilisables par nos agents.
* Rassembler **idées et pipelines types** pour inspirer la création de nouveaux workflows.
* Laisser les détails d’implémentation, dates, bugs… au `JOURNAL_2025.md` afin d’éviter toute redondance citeturn15file12.

---

## 2️⃣ Stack open‑source de référence (Sprint 4)

| Couche                 | Outils clés                            | Rôle / Notes                                                      |
| ---------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| **Chaînes & outils**   | **LangChain**                          | Wrappers LLM, loaders, tools                                      |
| **Workflows**          | **LangGraph**                          | Graphe *think → validate → act*                                   |
| **Multi‑agents**       | **CrewAI**                             | Débat, vote, plan hierarchique                                    |
| **Observabilité**      | **Phoenix + OTEL**                     | « Phoenix first » avant tout test multi‑agents citeturn14file2 |
| **Tests / Guardrails** | Pytest, TruLens, **Guardrails Colang** | CI GitHub verte                                                   |
| **LLM Gateway**        | **LiteLLM**                            | Proxy OpenAI/Ollama ; mock CI                                     |
| **Vecteurs**           | **ChromaDB**                           | Persistant Docker                                                 |
| **Secret vault**       | **Secret MCP Server**                  | JWT + scopes                                                      |

---

## 3️⃣ Modèles & Protocoles

* **API distants** : OpenAI GPT‑4o, Anthropic Claude 3, Groq…
* **LLM locaux** : Llama‑3, Mistral‑7B, Gemma via **Ollama / llama.cpp**.
* **Protocoles** : Tool‑Calling JSON, Retrieval‑Augmented Generation, OTEL spans (`trace=True`). citeturn14file9

---

## 4️⃣ Zones d’automatisation & types d’actions

| Quartier métier      | Pipeline type (agents)                        | Pourquoi orchestrer ?                |
| -------------------- | --------------------------------------------- | ------------------------------------ |
| Prospection & Growth | Scraper → Enrichisseur → CRM Bot              | Pipeline séquentiel & enrichissement |
| Support client       | Router langue → FAQ RAG → Relecteur ton       | Séparer traduction / QA              |
| Ops financières      | Extracteur PDF → Vérif TVA → Conciliateur ERP | Double contrôle comptable            |
| RH / Recrutement     | Parseur CV → Scoreur → Interviewer IA         | Tri + génération questions           |
| Dev interne          | Gen patch → Linter → Tests                    | Boucles write‑run‑critic             |
| Marketing SEO        | Keyword Scout → Rédacteur → SEO critic        | 10 articles / semaine                |

*Table complète déplacée depuis v1 pour clarté* citeturn14file13

---

## 5️⃣ Bibliothèque de scénarios concrets (top 10)

| #  | Scénario (métaphore)                      | Orchestration                       | Bénéfice              |
| -- | ----------------------------------------- | ----------------------------------- | --------------------- |
| 1  | Aimant à prospects – *filet de pêche*     | **LangGraph**                       | Leads LinkedIn tagués |
| 2  | Hotline polyglotte – *standard 5 langues* | **CrewAI** + RAG                    | Support 24/7          |
| 3  | Radar concurrentiel – *satellite*         | LangGraph + CrewAI                  | Alertes hebdo         |
| 4  | Forgeron de pitch deck – *forge*          | CrewAI + Canva API                  | Slides prêtes         |
| 5  | Comptable Sherlock – *loupe factures*     | LangGraph ; CrewAI arbitre          | Audit continu         |
| 6  | Chasseur de bugs – *escouade SWAT*        | LangGraph loop ; CrewAI vote        | Qualité code ↑        |
| 7  | Chef contenu SEO – *bureau d’études*      | CrewAI collaboratif                 | 10 articles/sem       |
| 8  | Coach RH – *concierge HR*                 | LangGraph stages                    | Recrutement accéléré  |
| 9  | Veilleur légal – *alarme incendie*        | LangGraph continu ; CrewAI escalade | Conformité proactive  |
| 10 | Assembleur Odoo – *robot‑cuisinier*       | CrewAI + LangChain code             | Modules ERP rapides   |

*Source condensée ; voir Journal pour implémentations* citeturn14file14

---

## 6️⃣ Model Context Protocol (MCP) : guide rapide

### 6.1 Cheat‑sheet installation (YAML, 1 ligne)

```yaml
- cmd: pip install langchain-mcp-adapters fastmcp
  path: C:\projets\agent-ai
  venv: on
```

*…suite inchangée : serveur, appel Python, flags sécurité…* citeturn13file8

### 6.2 Intégration LangChain → LangGraph → CrewAI

Déclarer `MCPTool` comme n’importe quel `BaseTool`, ajouter un nœud *act* dans LangGraph puis laisser CrewAI voter si plusieurs serveurs sont dispo. Tracer `trace=True` pour audit. citeturn13file8

### 6.3 Exemples d’automatisations nouvelles grâce aux MCP

 Scénario boosté                     | Étapes agent + MCP                                              | Résultat opérationnel                   | Image mentale                |
| ----------------------------------- | --------------------------------------------------------------- | --------------------------------------- | ---------------------------- |
| **CI/CD autonome**                  | Linter → Testeur → `github-mcp` → `docker-mcp`                  | Merge + build + push image sans humain  | **Chaîne de montage**        |
| **Relance facture intelligente**    | Extracteur PDF → Vérif TVA → `stripe-mcp` → `gmail-mcp`         | Facture recalculée, mail envoyé         | **Facture qui s’envole**     |
| **Déploiement nocturne Kubernetes** | Planner → `k8s-mcp` (rollout) → Critic health check             | MEP à 2 h du matin, rollback auto si KO | **Tour de contrôle**         |
| **Scraping → CRM HubSpot**          | `browser-mcp` scrape → Enrichisseur → `fastmcp-unified` HubSpot | Lead qualifié créé                      | **Filet puis tapis roulant** |

---

## 7️⃣ Catalogue détaillé de 25 outils LangChain

### A. Extraction & veille

| Outil                      | Catégorie           | Exemple d’usage                                                 | Métaphore                         |
| -------------------------- | ------------------- | --------------------------------------------------------------- | --------------------------------- |
| `ApifyWrapperTool`         | Crawler SaaS        | Aspirer + mettre à jour un tableau prix concurrents chaque nuit | Drone photographiant les vitrines |
| `RequestsTool`             | HTTP brut           | Vérifier la dispo d’un produit sur un site B2B                  | Ping sonar                        |
| `BrowserTool` (Playwright) | Navigation headless | Récupérer les 10 premières offres d’emploi LinkedIn             | Visite éclair avec jumelles       |
| `SerpAPIWrapper`           | Google Search       | Remonter les 20 articles récents sur votre marque               | Radar médias                      |
| `DuckDuckGoSearchTool`     | Search alternatif   | Chercher info locale sans clé API                               | Skater discret dans les ruelles   |
| `RSSLoader`                | Loader RSS          | Suivre flux CP concurrents                                      | Robinet d’eau continue            |

### B. Chargement de documents / RAG

| Outil                    | Type fichier | Exemple                                                   | Métaphore                     |
| ------------------------ | ------------ | --------------------------------------------------------- | ----------------------------- |
| `UnstructuredFileLoader` | PDF / DOCX   | Lire contrats fournisseurs pour clause de résiliation     | Scanner multifonction         |
| `CSVLoader`              | CSV          | Analyser ventes mensuelles pour détecter rupture de stock | Tableur qui s’anime           |
| `WebBaseLoader`          | URL simple   | Indexer FAQ de votre site pour bot support                | Aspirateur mural              |
| `S3DirectoryLoader`      | Cloud        | Brancher dossiers marketing partagés                      | Tapis roulant entre entrepôts |

### C. Génération & transformation

| Outil / Chaîne            | Fonction           | Exemple                             | Métaphore                       |
| ------------------------- | ------------------ | ----------------------------------- | ------------------------------- |
| `LLMChain`                | Prompt → réponse   | Rédiger 5 accroches d’e‑mail        | Machine à slogans               |
| `ConversationChain`       | Chat à mémoire     | Assistant RH répondant au salarié   | Secrétaire qui se souvient      |
| `MapReduceDocumentsChain` | Résumé long corpus | Condenser 50 pages d’appel d’offres | Presse‑agrume                   |
| `RetrievalQA`             | Q\&R + vecteurs    | Bot SAV qui cite notice produit     | Concierge qui court à l’archive |

### D. Analyse & calcul

| Outil                | Usage           | Exemple                                | Métaphore              |
| -------------------- | --------------- | -------------------------------------- | ---------------------- |
| `PythonREPLTool`     | Exécuter Python | Calculer marge brute à partir de CSV   | Calculette vivante     |
| `SQLDatabaseToolkit` | Interroger BD   | Suivre KPI dans PostgreSQL / pgAdmin   | Analyste qui parle SQL |
| `PandasAI` (wrapper) | DataFrame LLM   | Générer rapport trimestriel interactif | Data‑journaliste       |

### E. Actionneurs & intégrations

| Outil              | Canal        | Exemple                           | Métaphore                     |
| ------------------ | ------------ | --------------------------------- | ----------------------------- |
| `GmailSendMessage` | E‑mail       | Envoyer devis personnalisés       | Pigeon voyageur turbo         |
| `ZapierNLAWrapper` | No‑code      | Poster lead qualifié dans HubSpot | Bras robot connecté           |
| `SlackPostMessage` | Chat interne | Alerte quand stock < 10 %         | Sirène au bureau              |
| `TwilioSMS`        | SMS          | Relance facture impayée           | Coup de fil automatique       |
| `ShellTool`        | CLI          | Lancer backup serveur via agent   | Gros bouton rouge du sous‑sol |

### F. Qualité du code & DevOps

| Outil                 | Finalité      | Exemple                          | Métaphore          |
| --------------------- | ------------- | -------------------------------- | ------------------ |
| `GitHubIssuesTool`    | Créer tickets | Ouvrir bug sur dépôt Odoo        | Carnet à souches   |
| `GitHubRepoTool`      | Lire code     | Scanner repo pour TODO critiques | Loupe de détective |
| `LinterTool` (custom) | Analyse code  | Vérifier PEP8 d’un module généré | Garde‑barrière     |

---

## 8️⃣ Scénarios réels détaillés

### 8.1 Secrétaire‑robot kiné (Playwright + MCP)

SUn kinésithérapeute libéral exerce dans une clinique dont le logiciel interne gère la facturation des actes.
Tous les soirs, une secrétaire‑robot lit un tableur (Excel/Google Sheet) contenant :

* le **numéro interne patient**
* la **liste des actes** réalisés
* la **date** et la **quantité de séances**

Objectif : **saisir automatiquement** ces actes dans le logiciel de la clinique, valider chaque quotation, puis passer au patient suivant sans intervention humaine (sauf anomalies).

> *Image mentale : le tableur est un bac à dossiers ; le robot les saisit un par un sur un tapis roulant, pendant que deux concierges vérifient qu’aucune case ne vire au rouge.*

### 13.2 Pipeline agents & orchestration

1. **Lecture du tableur** → `CSVLoader` (ou  `GoogleSheetsLoader`).
2. **Orchestration** → `LangGraph` enchaine « prendre fiche » → « saisir UI » → « vérifier » → « suivant » (avec reprise sur erreur).
3. **Navigation & saisie UI** → `Browser MCP Server` (Playwright headless) ; variante desktop : `UI‑Automation MCP` (pywinauto / AutoHotkey).
4. **Contrôle qualité** → `CrewAI` met en scène deux rôles :

   * **Agent Rédacteur** : remplit le formulaire.
   * **Agent Contrôleur** : lit l’écran, détecte messages d’erreurs ou champs rouges.
     Vote : si OK ⇒ on valide, sinon on reboucle ou isole.
5. **Gestion des secrets** → `Secret MCP Server` fournit ID & PW du kiné, token Playwright, etc.
6. **Audit & traçabilité** → callbacks LangChain / OTEL spans (`trace=True`).
7. **Reporting final** → `PythonREPLTool` compile un PDF (WeasyPrint) ou envoie un résumé via `Slack MCP` / `Gmail MCP`.

### 13.3 Flux détaillé LangGraph (texte)

```
CSVLoader ─┐
           ▼  (par fiche patient)
┌───────────────────────────────────────────────┐
│   Node « act » : Browser‑MCP.invoke()         │
│   ‑ remplissage formulaire quotation         │
└───────────────────────────────────────────────┘
           │  capture écran / status
           ▼
┌───────────────────────────────────────────────┐
│   Node « validate » : CrewAI.vote()           │
│   ‑ Rédacteur vs Contrôleur                  │
└───────────────────────────────────────────────┘
     │OK ?           │KO / Warning
     ▼               ▼
  next fiche     boucle / to‑manual
```

### 13.4 Contrôle qualité & sécurité

| Risque                        | Mesure                              | Outil impliqué              |
| ----------------------------- | ----------------------------------- | --------------------------- |
| Identifiants en clair         | Stockage dans coffre‑fort           | `Secret MCP`                |
| Saisie erronée                | Double regard CrewAI                | `CrewAI` validate node      |
| UI change (sélecteurs cassés) | Tests Playwright + log anomalies    | `Browser MCP`               |
| Captcha                       | API anti‑captcha ou fallback humain | `Browser MCP` + edge case   |
| Conformité santé (RGPD/HDS)   | Journal complet + hébergement HDS   | LangChain callbacks + infra |

### 13.5 Limites & bonnes pratiques

* **CAPTCHA / gestures** graphiques restent un point de fragilité.
* Garder les **sélecteurs UI** dans un fichier de config versionné.
* Activer un **flag dry‑run** en préproduction (Browser MCP → `--dry`), pour tester sans écrire.
* Prévoir un **rapport différentiel** (diff patient avant/après) en cas de rollback.

---

## 1️⃣4️⃣ Tableau récapitulatif des outils mobilisés

| Pièce / Fonction              | Outil (OSS)                                    | Rôle concret                                    | Image éclair                            |
| ----------------------------- | ---------------------------------------------- | ----------------------------------------------- | --------------------------------------- |
| Lecture tableur               | `CSVLoader` / `GoogleSheetsLoader`             | Convertit chaque ligne en fiche patient.        | Scanner multifonction                   |
| Orchestration flux            | **LangGraph**                                  | Gère enchaînement, boucles, parallélisme.       | Tapis roulant                           |
| Navigation & saisie (web)     | **Browser MCP Server** (Playwright)            | Ouvre le logiciel web, remplit, clique Valider. | Groom robot                             |
| Navigation & saisie (desktop) | **UI‑Automation MCP** (pywinauto/AHK)          | Pilote appli Windows.                           | Bras articulé                           |
| Contrôle qualité              | **CrewAI**                                     | Vote Rédacteur vs Contrôleur.                   | Double regard conducteur + chef de quai |
| Secrets                       | **Secret MCP Server**                          | Fournit ID/PW, tokens.                          | Coffre‑fort à code                      |
| Journal & audit               | LangChain Callbacks / OTEL                     | Enregistre chaque action MCP.                   | Caméra de surveillance                  |
| Reporting                     | `PythonREPLTool` + `WeasyPrint` ou `Slack MCP` | Génère PDF ou message Slack.                    | Chroniqueur de nuit                     |
| Alerting                      | Edge conditions LangGraph + `Slack MCP`        | Ping immédiat si erreur.                        | Alarme rouge                            |

### 8.2 Automatisation Internet Explorer (legacy)

Options Selenium IE, WinAppDriver, pywinauto, Edge‑IE mode, avec tableau Avantages/Limites pour migration rapide. citeturn15file18
| Option                        | Principe                     | Avantages                    | Limites                          |
| ----------------------------- | ---------------------------- | ---------------------------- | -------------------------------- |
| **Selenium + IEDriverServer** | WebDriver officiel IE        | Facile à script, API connue  | Driver obsolète, sécurité faible |
| **WinAppDriver**              | Automatisation UI Automation | Pilote toute fenêtre Windows | Projet figé, nécessite admin     |
| **pywinauto / AutoHotkey**    | Coordonnées écran + clavier  | Léger, 100 % OSS             | Fragile aux changements UI       |
| **Migration Edge (mode IE)**  | Ouvrir Web100T dans Edge     | Compatible Playwright        | Demande action IT                |
---

## 📝 Changelog

| Version | Date       | Motif                                                                                                                                             |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v2**  | 2025‑05‑07 | Nettoyage complet : renumérotation, suppression journaux & métaphores, déplacement scénarios réels, ajout section MCP, maintien catalogue outils. |
| **v1**  | 2025‑05‑03 | Création initiale (fourre‑tout).                                                                                                                  |

---
