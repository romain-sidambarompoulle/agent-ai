# Journal 2025 – Agent ai projet
## 2025-04-29
- Création `00_ROADMAP.md` (import initial).
- Création `00_OVERVIEW_INSTRUCTIONS.md`
- Création `JOURNAL_2025.md`
- Création méta prompt pour journalisation dans le dossier 01-références
- [#S0_setup] Mise en place environnement & Hello‑World 

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
| 2025-04-30 |**Dockerisation réussie**|`docker build -t langserve-hello .` ✔️|
| 2025-04-30 |**Conteneur fonctionne**|`docker run -p 8000:8000 -e OPENAI_API_KEY ...`<br>`/invoke` → 200 OK|
| 2025-04-30 |**Port 8000 libéré**|Arrêt Uvicorn + `docker stop $(docker ps -q)`|
| 2025-04-30 |**Fin Sprint 0**|Empilement stable : Python 3.12, FastAPI 0.115, Pydantic 2.11, LangServe 0.3.1, LangSmith 0.1.147. `/invoke` OK local & Docker.|
- API /invoke OK (venv + Docker).
- Swagger encore HS (bug LangServe 0.3.1).
- Prêt pour #S1_enrichi : mémoire + RAG (Chroma).