# Sprint 0 — Le chantier en images

> *Une métaphore pour se souvenir des grandes étapes avant d’attaquer les agents IA.*

---

## 1. Tracer le terrain 🧭
- **Géomètres** : on a vérifié les outils (Python, Git, Docker).  
  *Sans instruments fiables, le bâtiment serait de travers.*

## 2. Couler les fondations 🏗️
- On a cloné le gabarit **LangServe** et créé un **venv** propre.  
  *Le béton de base qui supportera toutes les briques Python.*

## 3. Redresser les premières poutres ⚒️
- Conflits de versions réglés (Pydantic, LangServe, LangSmith).  
  - On a "calé des cales" : pin de versions.  
  - Remplacé une poutre bancale : import `ChatOpenAI`.

## 4. Monter la structure porteuse 🏢
- **Test Uvicorn** : la grue tourne (/invoke 200 OK).  
- **Evacuation Poetry** : trop lourd → on passe à `setup.py` + `requirements.txt` (UTF‑8).

## 5. Fermer le gros œuvre avec Docker 🛳️
- **Dockerfile** final : copie du code + install deps + `uvicorn`.  
- Image **`agent-ai`** coulée, testée (/invoke sur port 9000).

## 6. Brancher à la centrale électrique ⚡
- **GitHub** : `git init` → remote → **push main**.  
  *Chaque nouvelle brique sera historisée.*

## 7. Inspection finale ✅
| Contrôle | Résultat |
|----------|----------|
| Tests unitaires | verts |
| API locale | 200 OK |
| API Docker | 200 OK |
| Journal | complété |

---

## Où en est‑on ?
Nous avons construit **les fondations habitables** : structure, plomberie de base, tableau électrique.

> **Pas encore d’appartements meublés** (agents IA), mais un rez‑de‑chaussée prêt à accueillir de nouvelles pièces.

---

## Et maintenant ? 🏠➡️🧠
**Sprint 1 : “Aménager la mémoire”**
- **Chroma** = le garde‑meuble (stock des souvenirs).
- **RAG** = l’ascenseur pour aller chercher ces souvenirs.
- Objectif : que le concierge (l’agent) se souvienne de ce qu’on lui dit.

*Prêt à monter les cloisons ?*

