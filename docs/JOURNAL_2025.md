# Journal 2025 – Agent ai projet
## 2025-04-29
- Création `00_ROADMAP.md` (import initial).
- Création `00_OVERVIEW_INSTRUCTIONS.md`
- Création `JOURNAL_2025.md`
- Création méta prompt pour journalisation dans le dossier 01-références
- Démarrage du Sprint 0 : **#S0_setup** (objectif : stack LangServe « Hello World » fonctionnelle).

## 2025-04-30 – Fin #S0_setup
| Date | Action | Détail / Commande |
|------|--------|------------------|
| 2025-04-28 |**Pré-requis vérifiés**|`py --version`, `git --version`, `docker version` ✔️|
| 2025-04-28 |**Clonage repo demo**|`git clone https://github.com/langchain-ai/langserve-launch-example.git`|
| 2025-04-28 |**Création venv 3.12**|`python -m venv .venv` → `Activate.ps1` |
| 2025-04-28 |**Install LangServe 0.3.1**|`pip install -e .`|
| 2025-04-28 |**MàJ dépendances**|`pip install --upgrade langserve langsmith fastapi starlette langchain langchain-openai`<br>`pip install "pydantic<2.10.2"`|
| 2025-04-28 |**Correctif import**|`from langchain_openai import ChatOpenAI` dans `chain.py`|
| 2025-04-29 |**Test serveur dev**|`uvicorn ... --reload --port 8000` → `/invoke` OK|
| 2025-04-30 |**Résolution conflits dépendances**| - Pinned `langserve==0.3.1`<br>- Pinned `langsmith==0.1.147`<br>- Pinned `pydantic>=2.10,<3`|
| 2025-04-30 |**Swagger cassé / laissé tel quel**|Bug connu LangServe 0.3.1 (affecte seulement `/docs`)|
| 2025‑04‑30 | **Réorganisation projet** | renommage dossier `agent-ai`, purge `.git` imbriqué, suppression Poetry, création `setup.py`, génération `app/requirements.txt` (UTF‑8) |
| 2025‑04‑30 | **Dépendances manquantes** | Ajout `langchain-community`, `sse_starlette` |
| 2025‑04‑30 | **Dockerisation** | Dockerfile : copie `requirements.txt`, `pip install -e app`, ajout LangSmith ; `docker build -t agent-ai .` ✔️ |
| 2025‑04‑30 | **Fix encodage requirements** | Conversion UTF‑16 → UTF‑8 pour éviter erreur install dans l’image |
| 2025‑04‑30 | **Image testée** | `docker run -p 9000:8000 … agent-ai` → `/invoke` 200 OK |
| 2025-04-30 |**Conteneur fonctionne**|`docker run -p 8000:8000 -e OPENAI_API_KEY ...`<br>`/invoke` → 200 OK|
| 2025-04-30 |**Port 8000 libéré**|Arrêt Uvicorn + `docker stop $(docker ps -q)`|
| 2025‑04‑30 | **Initialisation Git & push** | `git init` ➝ `git remote add origin …` ➝ `git push -u origin main` |
| 2025-04-30 |**Fin Sprint 0**|Empilement stable : Python 3.12, FastAPI 0.115, Pydantic 2.11, LangServe 0.3.1, LangSmith 0.1.147. `/invoke` OK local & Docker.|
## 2025-05-01 – Décision tests PowerShell
| Date        | Action                                    | Détail / Commande |
|-------------|-------------------------------------------|-------------------|
| 2025-05-01  | Standardiser l’exécution des tests API    | Tous les appels à l’endpoint `/invoke` se font désormais **exclusivement en PowerShell** via `Invoke-RestMethod`. Le Playground et `/docs` restent accessibles, mais ne servent plus de référence de recette tant que le bug Swagger de LangServe 0.3.1 n’est pas corrigé. |

- API `/invoke` OK en local (**venv**) et dans le conteneur Docker (**port 9000**).
- Dockerfile final : installation `requirements.txt` UTF‑8 + `uvicorn` ; image **`agent-ai`** construite et testée.
- Dépôt Git prêt (branche **main** sur GitHub).
- Swagger (`/docs`) toujours HS (bug LangServe 0.3.1) — sera résolu dès LangServe 0.3.2.
- **Prochaine étape : Sprint 1 — installation de Chroma, ajout mémoire / RAG.**

## 2025-05-02 – Fin #S1_chroma
| Date | Action | Détail / Commande / Décision |
|------|--------|-----------------------------|
| 2025-05-01 | **Création branche** | `git checkout -b feat/s1-chroma` |
| 2025-05-01 | **Installation Chroma** | `pip install chromadb` & ajout dans `requirements.txt` |
| 2025-05-01 | **Ajout mémoire** dans `app/langserve_launch_example/chain.py` | - `OpenAIEmbeddings()` <br>- `MEMORY = Chroma(collection_name="chat_memory", persist_directory="app/data/chroma")` |
| 2025-05-01 | **Pipeline mémoire** | 1) `similarity_search` ➜ contexte <br>2) LLM <br>3) `add_texts()` ➜ archivage |
| 2025-05-01 | **Tests PowerShell** | *Playground* instable, Swagger cassé → **standardiser** les appels via `Invoke-RestMethod` (ex. `{"input":{"topic":"cats"}}`). |
| 2025-05-01 | **Dossier de persistance ignoré** | Ajout `app/data/chroma/` dans `.gitignore` **et** `.dockerignore` pour éviter fichiers binaires et erreurs de version. |
| 2025-05-01 | **Image Docker : sprint1** | `docker build -t agent-ai:sprint1 .` |
| 2025-05-01 | **Port mapping** | Uvicorn par défaut 8000 → conteneur lancé avec `-p 8001:8000` |
| 2025-05-01 | **Variable d’env.** | `OPENAI_API_KEY` passée au conteneur ; **clé factice** utilisée dans CI. |
| 2025-05-02 | **Workflow CI GitHub** | `.github/workflows/ci.yml` → installe dépendances + `pytest -q`. <br>Ajout `env: OPENAI_API_KEY: "sk-test-dummy"` pour satisfaire la validation Pydantic. |
| 2025-05-02 | **CI verte** | Run `ci: set dummy OPENAI_API_KEY` ✔️ (voir onglet *Actions*). |
| 2025-05-02 | **Nettoyage image** | `.dockerignore` enrichi : `.venv/`, `__pycache__/`, `.git/`, `docs/`, `tests/`. Taille image sprint1 ≃ 1,5 Go ➜ 0,9 Go. |
| 2025-05-02 | **Fin Sprint 1** | Mémoire vectorielle opérationnelle en local & Docker, pipeline CI automatisé. Prochain sprint : **orchestration LangGraph**. |

### Décisions / points d’attention
- **Tests d’API** : exécuter uniquement via PowerShell (`Invoke-RestMethod`), pas via `/playground` tant que le bug Swagger de LangServe 0.3.1 persiste. :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}  
- **Clé OpenAI dans CI** : valeur factice `sk-test-dummy` pour ne pas consommer de quota ; acceptable car la suite de tests n’appelle pas l’API.  
- **Chroma & compatibilité** : toujours supprimer `app/data/chroma/` avant un changement majeur de version pour éviter l’erreur `KeyError: '_type'`.  
- **Port par défaut** : si le `CMD` Uvicorn n’indique pas `--port 8001`, mapper le conteneur `-p 8001:8000`.

## 2025-05-02 – Sprint 2 terminé
- Graphe LangGraph (think → validate → act) compilé & testé
- Stub CrewAI préparé dans validate()
- Tests Pytest verts (2 tests)
- Runner `python -m app.agent_ai.graph_runner` ok
- Image Docker `agent-ai:sprint2` buildée et testée
- requirements.txt figé avec `pip freeze` (commit df1706d)
- Dockerfile : ajout de `git` pour permettre `pip install` depuis GitHub

## 2025-05-02 – Sprint 3 : mise en place de CrewAI
| Date | Action | Détail / Commande |
|------|--------|------------------|
| 2025-05-02 | **Création branche** | `git checkout -b feat/s3-crewai` |
| 2025-05-02 | **Python 3.11 requis** | Recréation venv : `py -3.11 -m venv .venv` (CrewAI ⩾ 0.118 incompatible 3.13) |
| 2025-05-02 | **Installation CrewAI 0.118** | `pip install crewai==0.118.0 langchain-core>=0.1.12` |
| 2025-05-02 | **Dépendances manquantes** | + `langchain-openai`, `langgraph`, `langchain`, `langchain-community` |
| 2025-05-02 | **Squelette Crew** | `app/crew.py` : 3 agents (Analyste, Rédacteur, Vérificateur) + 1 Task + `crew.kickoff()` |
| 2025-05-02 | **Changement signature Agent** | Positional → keyword (`role`, `goal`, `backstory`, `llm`) |
| 2025-05-02 | **Processus Crew** | `Process.sequential` (pas de manager LLM défini) |
| 2025-05-02 | **Graphe mis à jour** | `validate()` appelle `crew_run()` et retourne **state** (plus `True`) |
| 2025-05-02 | **Suite Pytest** | `tests/test_graph.py` + correctifs import ; **3 tests verts** |
| 2025-05-02 | **CI GitHub** | Workflow toujours vert (clé OPENAI factice `sk-test-dummy`) |

### Décisions / points d’attention
- **Venv recréé en 3.11** : tout fonctionne, mais prévoir d’éventuels effets de bord (scripts Docker / CI encore pointés sur 3.13).  
- **API CrewAI 0.118** :  
  * `Agent(...)` exige désormais les kwargs `role | goal | backstory | llm`.  
  * `Crew.run()` → remplacé par **`crew.kickoff(inputs={...})`**.  
  * Le mode **hierarchical** réclame `manager_agent` ; on reste en **sequential** pour l’instant.  
- **Tests API** : comme pour Sprint 1, les appels `/invoke` REST se font en **PowerShell** (Playground instable) :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}.  
- **Clé OpenAI dans CI** : toujours factice ; suffisant car les tests n’appellent pas l’API réelle :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}.  
- **Warnings LangChain** : imports `Chroma` et `OpenAIEmbeddings` encore marqués *deprecated* ; migrer vers `langchain_chroma` et `langchain_openai` quand priorité.  
- **Journalisation future** : activer tracing (LangSmith / Phoenix) pour visualiser les échanges inter-agents avant de passer en Sprint 4.

> _Image mentale_ : le nouveau tableau électrique (LangGraph) alimente désormais une salle de réunion où trois concierges discutent à tour de rôle ; la caméra de surveillance (Pytest + CI) confirme que l’ampoule « llm_answer » s’allume bien à la sortie.

### 🔍 Note technique – Construction de la *Crew* & Tracing Phoenix
*(Ajout au journal, {datetime.datetime.now().strftime('%d %b %Y')})*

#### Où se construit réellement la **Crew** ?

| Fichier | Rôle dans la chaîne d’appel |
|---------|-----------------------------|
| `graph_runner.py` | Lance `graph_exec.invoke(...)` |
| `graph.py`        | Définit le graphe **LangGraph** et importe `crew_run` |
| `crew.py`         | Crée l’objet `Crew(..., trace=True)` et expose `run(question)` |

> 👉 La construction de l’équipe (agents, tâches, `trace=True`) vit dans **`crew.py`**.  
> `graph_runner.py` se contente de déclencher le graphe et ne voit passer que l’état final.

---

#### Changement de nom du paquet Phoenix

- L’ancien nom : `phoenix-tracing` *(obsolète)*  
- **Nouveau nom officiel : `arize-phoenix`**  → `pip install arize-phoenix`

---

#### Pense‑bête pour enregistrer les traces

1. **Activer** le venv du projet :
   ```bash
   # Windows PowerShell
   .\\.venv\\Scripts\\Activate

2. **Démarrer** le serveur Phoenix :   
   phoenix serve          # écoute sur http://localhost:6006

3. **Lancer** ensuite votre application (graph_runner, etc.).

4. **Consulter** le tableau de bord : http://localhost:6006

  Variables d’environnement nécessaires :

  PHOENIX_COLLECTOR_ENDPOINT=http://localhost:6006
  # (PHOENIX_HOST est optionnel côté UI)

  « Sprint 3 · Mini-pas 3-4 »
  ## 2025-05-03 – Sprint 3 : mini-pas 3 & 4 bouclés
| Date | Action | Détail / Commande / Motivation |
|------|--------|--------------------------------|
| 2025-05-03 | **Mini-pas 3 : test Phoenix** | `tests/test_tracing_phoenix.py` : fixture OTEL → exporter mémoire ➜ assertion ≥ 1 span. |
| 2025-05-03 | **Phoenix installé** | `pip install arize-phoenix arize-phoenix-otel` (⚠️ remplace l’ancien `phoenix-tracing`). |
| 2025-05-03 | **Server Phoenix local** | `phoenix serve` (venv) ➜ UI http://localhost:6006. |
| 2025-05-03 | **Mini-pas 4 : CI verte** | Workflow GitHub passe au vert (3 tests). |
| 2025-05-03 | **Mock LiteLLM** | Fixture Autouse dans `tests/conftest.py` → renvoie `choices[0].message.content = "FAKE_ANSWER"`. Plus besoin de clé réelle OpenAI. |
| 2025-05-03 | **Nettoyage Chroma** | `clean_chroma` fixture : supprime `app/data/chroma/` en début de session pour éviter `KeyError: '_type'`. |
| 2025-05-03 | **CHROMA_TEMP** in-memory | `os.environ["CHROMA_TEMP"]="1"` dans les tests pour forcer la DB volatile (pas d’I/O). |
| 2025-05-03 | **Suppression duplication tests** | Retrait de la ligne `-e git+…#egg=agent_ai_app` dans `app/requirements.txt` + suppression de `pip install -e .` dans le workflow. |
| 2025-05-03 | **Dépendances stables** | Pin `chromadb==0.6.3`, `fastapi>=0.115.12`, `starlette>=0.46.2` pour lever les conflits. |
| 2025-05-03 | **PowerShell only** | Les appels REST d’intégration restent exécutés via **Invoke-RestMethod** (Playground Swagger toujours hors-service). |

### Décisions · Points d’attention (05 mai 2025)
- **Clé OpenAI factice en CI** : `sk-test-dummy` reste dans `env:` ; sans importance car tous les appels LLM sont mockés.  
- **Tests = PowerShell** : Playground `/docs` & `/invoke` HTML instables sous LangServe 0.3.1 ➜ on garde les scripts PS pour la recette.  
- **Phoenix tracer** : pour activer en local, exporter `PHOENIX_COLLECTOR_ENDPOINT=http://localhost:6006` *avant* de lancer l’app.  
- **Warnings LangChain** : `Chroma`, `OpenAIEmbeddings` encore *deprecated* → migration vers `langchain-chroma` & `langchain-openai` planifiée Sprint 4.  
- **Python 3.11 unique** : CrewAI 0.118 incompatible 3.13 ; Docker & CI déjà alignés.  
- **CI “vert” ≠ production** : mock LiteLLM ne couvre pas la latence réelle ni la consommation de jetons - prévoir tests end-to-end séparés avec vraie clé.

> *Image mentale* : la caméra de surveillance (Pytest + CI) filme désormais les concierges (CrewAI) et envoie la bande au magnétophone open-source Phoenix ; le tout sans consommer la moindre minute de forfait téléphonique OpenAI.*

---
Si graph_runner est invoqué depuis VS Code “Run > Debug”, les traces ne montent pas : lancer en terminal PowerShell pour garantir l’initialisation d’OTel.

## 2025-05-05 – Sprint 3 ½ : Nettoyage des warnings (**Option A**)

| Date       | Action technique                                   | Détail / Décision / Pourquoi |
|------------|----------------------------------------------------|------------------------------|
| 2025-05-05 | **Mini-pas A-1 : migrations LangChain → `_openai`** | - Remplacé `langchain.embeddings.*` et `langchain.llms.*` par `langchain_openai`.<br>- Branche dédiée `chore/update-langchain-imports`.<br>- Tests Pytest 100 % verts. |
| 2025-05-05 | **Mini-pas A-2 : migration Chroma**                | - Installé `langchain-community` & `langchain-chroma`.<br>- Nouvel import : `from langchain_chroma import Chroma`.<br>- Warning *deprecated* Chroma supprimé. |
| 2025-05-05 | **Mini-pas A-3 : audit Pydantic**                  | - Recherche `class Config` → **0 occurrence** dans notre code.<br>- Confirme qu’aucune migration `ConfigDict` n’est urgente. |
| 2025-05-05 | **Standard “Tests = PowerShell only” réaffirmé**   | Les endpoints `/docs` & `/playground` restent instables (LangServe 0.3.1). Tous les tests d’intégration passent donc par `Invoke-RestMethod` (PS). |
| 2025-05-05 | **Clé OpenAI factice**                             | `OPENAI_API_KEY="sk-test-dummy"` reste dans `ci.yml`. Aucun appel réel : les LLM sont **mockés** (LiteLLM). |
| 2025-05-05 | **CI verte**                                       | Workflow `ci.yml` ré-exécuté → badge vert. |


### 🌄 Image mentale récap’
Nous avons posé des **vitres anti-bruit** : l’immeuble (notre app) continue de vivre, mais les bruits de la rue (warnings externes) n’envahissent plus le hall d’entrée (CI).  
Les prises électriques sont désormais **aux normes 2025** (`langchain_openai`, `langchain_chroma`) et les concierges peuvent travailler au calme.

### 🚧 Points d’attention
- **Migration Pydantic v3** : créer un ticket pour convertir nos futurs modèles avec `ConfigDict` avant fin 2025.  
- **Swagger / Playground** : surveiller la sortie de LangServe ≥ 0.3.2 pour réactiver les tests via `/docs`.  
- **Warnings tiers** : la configuration `pytest.ini` filtre uniquement les libs externes ; tout warning provenant de **notre** code apparaîtra toujours en rouge.

> *En résumé : la plomberie des imports est remise aux normes, le tableau électrique affiche « 0 défaut », et la caméra CI filme désormais un chantier silencieux et propre.* 😉


## 2025-05-04 – Notes warnings dépendances

### Tableau récapitulatif
| Warning                                                      | Source                                         | Gravité fonctionnelle       | Explication courte |
| ------------------------------------------------------------ | ---------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PydanticDeprecatedSince20: Support for class-based config…` | **pydantic v2**                                | **Faible** – simple annonce | Le vieux mécanisme `class Config:` reste supporté **jusqu’à Pydantic v3** ; aucune incidence immédiate. |
| `json_encoders is deprecated`                                | **pydantic v2**                                | Faible                      | Option toujours fonctionnelle, suppression annoncée pour v3. |
| `open_text is deprecated`                                    | **importlib-resources** (appelé par **litellm**) | Très faible                 | litellm exploite encore une API à remplacer ; aucune rupture fonctionnelle. |
| Warnings `chromadb` sur `model_fields`                       | **chroma-db** + **pydantic**                   | Faible                      | Appel d’une propriété v1.11 toujours disponible ; pas d’impact sur le stockage des embeddings. |

### Pourquoi ce n’est pas bloquant
Ce sont des **DeprecationWarning** destinés aux développeurs :  
tant que les librairies conservent leur compatibilité rétro (c’est le cas), le service SaaS reste pleinement opérationnel.

### Choix : garder ou filtrer ?
| Choix                                                     | Effet en local (dev/CI) | Effet en prod SaaS | Quand le choisir |
| --------------------------------------------------------- | ----------------------- | ------------------ | ---------------- |
| **Garder visibles** | Permet de sentir l’obsolescence et d’anticiper la migration. | Logs plus verbeux, sans impact business. | Phase d’évolution rapide. |
| **Filtrer** (pytest.ini / logging) | CI plus lisible ; on garde nos propres warnings. | Journaux prod plus propres, coûts de stockage réduits. | Quand le bruit masque des alertes ou gonfle les logs. |

Pour l’instant, **aucun filtrage n’est indispensable** ; on documente simplement la situation.

### Bonne pratique minimaliste
* **Conserver** les warnings durant la phase de dev actuelle (Option A terminée ✅).  
* **Épingler** les versions actuelles dans `requirements.txt` :

  ```text
  pydantic==2.11.1
  chromadb==0.4.22
  importlib-resources==6.4.0
  litellm==1.38.5

Créer une carte Trello / ticket GitHub :

« Avant fin 2025 : migrer Config → ConfigDict quand Pydantic v3 sortira (breaking) ».
Ainsi :

Les clients bénéficient d’un service stable.

L’équipe garde en tête la dette technique sans être noyée de messages de dépendances.

## 2025-05-05 – Sprint 3¾ : **Consolidation Git & CI verte**
    | Date | Action | Détail / Décision |
    |------|--------|------------------|
    | 2025-05-05 | **Migrations dépendances** | Pin **langchain-core 0.3.58**, **langchain-openai 0.3.16**, **langchain-chroma 0.2.3**, **rich 13.9.4**, **jiter 0.8.2** pour aligner CrewAI & LangChain. |
    | 2025-05-05 | **CI verte** | Workflow GitHub repasse au vert (4 tests) après upgrade dépendances. |
    | 2025-05-05 | **Nettoyage branches** | `chore/update-langchain-imports`, `feat/s1-chroma`, `feat/s2-graph`, `feat/s3-crewai` ➜ contenus déjà dans **main** ; branches supprimées local + GitHub. |
    | 2025-05-05 | **Audit Git** | `git fsck` → *0 commit utile orphelin* ; repo 100 % sain. |
    | 2025-05-05 | **Règle d’or documentée** | > *« Une branche fonctionnelle + tests verts doit **toujours** être fusionnée dans `main`, puis supprimée. Garder des branches “finies” hors de `main` casse la synergie du projet (agents, Phoenix, Docker). »* |

    > _Image mentale_ : on a démonté tous les échafaudages inutiles, resserré les boulons de la tuyauterie Python, et la caméra CI confirme que le bâtiment est prêt pour les prochains travaux Docker / CrewAI._
    "
  path: ./         # racine dépôt
  venv: off