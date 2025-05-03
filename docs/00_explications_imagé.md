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
## 🌟 Ce que nous venons de construire (Sprint 1)

| Étape technique | Image mentale |
|-----------------|---------------|
| **Nous avons creusé un “grenier à souvenirs”** (Chroma) dans le hall de l’immeuble « Agent-AI ». | 🏠 ➡️ 🗄️  Le concierge peut désormais ranger chaque conversation (sous forme de cartes index), puis ressortir les plus pertinentes quand un visiteur revient. |
| **Nous avons pris une photo de l’immeuble avec son grenier** (image Docker `agent-ai:sprint1`). | 📸 ➡️ 🚚  Cette photo tient dans un conteneur maritime : on peut la charger sur n’importe quel quai (machine) et retrouver exactement les mêmes pièces et meubles. |
| **Sur le quai, nous avons branché le courant** (`-e OPENAI_API_KEY=…`). | 🔌  Sans cette prise, l’ascenseur (embeddings OpenAI) restait bloqué au rez-de-chaussée. |
| **Le port d’accès public est 8001 ; à l’intérieur, le concierge écoute en 8000** (`-p 8001:8000`). | 🌉  On installe une passerelle numérotée 8001 pour que les visiteurs extérieurs trouvent la porte intérieure 8000. |
| **La caméra de surveillance “CI” vérifie chaque modification** (`pytest` sur GitHub Actions). | 🎥  À chaque nouvelle brique posée, la caméra s’allume : si la porte ne ferme plus ou si le grenier s’écroule, l’alarme rouge s’affiche immédiatement. |

> *En résumé : le hall de l’immeuble se souvient de ses visiteurs, peut être déménagé sans rien casser, et un garde-fou automatique surveille le chantier 24h/24.* 😉

