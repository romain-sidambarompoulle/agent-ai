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


## 🌟 Ce que nous venons de construire (Sprint 2)

| Étape technique                                                    | Image mentale                                                                      |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Centrale domotique installée** : refactor en **LangGraph**       | 🔌🏠 Le disjoncteur principal distribue le courant vers trois pièces.              |
| **Trois pièces éclairées** : *think* → *validate* → *act*          | 💡➡️🧐➡️🚀 Le concierge réfléchit, vérifie, puis allume l’enseigne publique.       |
| **Prise murale CrewAI** posée dans `validate()` (stub)             | 🔌🤝 Une douille libre attend l’arrivée de plusieurs concierges au Sprint 3.       |
| **Alarmes anti-court-circuit** : 2 tests Pytest + caméra CI GitHub | 🚨🎥 Si un fil chauffe, le voyant rouge s’allume automatiquement.                  |
| **Photo Docker `agent-ai:sprint2`** prise & testée                 | 📸🛳️ La domotique voyage désormais dans un conteneur prêt à être déployé partout. |

*En résumé : l’immeuble réfléchit avant d’agir et il est prêt à accueillir une équipe de concierges spécialistes.

## 🌟 Ce que nous venons de construire (Sprint 3)

Nous avons transformé l’immeuble en **co-propriété intelligente** :  
trois concierges se relaient désormais pour fournir la meilleure réponse,  
et l’installation électrique a été remise aux normes Python 3.11.

| Étape technique | Image mentale |
|-----------------|---------------|
| **Rebâtir la chaufferie** : nouveau **venv 3 .11** (Python 3.13 ≠ CrewAI) | 🔥🏗️  On a vidé l’ancienne chaudière et installé un brûleur compatible avec le nouveau carburant CrewAI. |
| **Remplacer les badges concierges** (nouvelle signature `Agent(role, goal, backstory, llm)`) | 🪪  Chaque concierge a reçu un passeport complet ; fini les badges anonymes. |
| **Réunion à tour de rôle** : `Process.sequential` (pas encore de manager) | 🔔📜  Les concierges se passent la cloche : un parle, puis donne la parole au suivant, sans chef d’orchestre central pour l’instant. |
| **Appeler la réunion** via `crew.kickoff(inputs={question})` | 🎤🚀  On appuie sur le bouton “Kick-off” ; la séance démarre et rend un verdict signé. |
| **Graphe renvoie l’état complet** (plus le booléen `True`) | 📁➡️📁  Le même classeur circule d’une pièce à l’autre, enrichi de la page `llm_answer` avant de ressortir. |
| **Caméra Pytest** : 3 tests verts (dont vérification `llm_answer`) | 🎥🟢  L’alarme reste muette ; chaque scénario confirme que la lumière s’allume bien à la sortie. |
| **Clé OPENAI factice en CI** | 🔑🪄  La serrure reconnaît une fausse clé de démonstration ; personne ne consomme de vrai crédit. |
| **Exécutions API / tests** exclusivement **PowerShell** (`Invoke-RestMethod`) | 🖥️⚡  On passe par la porte latérale PowerShell tant que l’ascenseur Swagger reste bloqué. |

> *En résumé : l’immeuble réfléchit, vérifie et agit en équipe ;  
> les tuyaux Python ont été changés pour éviter les fuites, et la caméra de surveillance confirme que tout fonctionne.* 😉

## 🌟 Sprint 3 — 2ᵉ mi-temps : “Micro, caméras et tableau de bord”  

| Étape technique                                             | Image mentale                                                                           |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Brancher un “micro” Phoenix** (`arize-phoenix serve`)     | 🎙️🦅  On fixe un micro open-source dans la salle de réunion pour enregistrer chaque mot. |
| **Changer l’étiquette du micro** (`phoenix-tracing` → `arize-phoenix`) | 🔖  On décolle l’ancienne étiquette et on colle la nouvelle, la prise fait “clic !”. |
| **Déclarer la prise** : `trace=True` dans `crew.py`         | 🔌  On appuie sur l’interrupteur ; le voyant rouge s’allume, la bande tourne. |
| **Tableau de bord** `http://localhost:6006`                 | 📊  Un écran mural affiche en temps réel le battement des concierges. |
| **Test Pytest “le micro enregistre”**                       | 🚨  Un technicien tape dans le micro ; si le vu-mètre ne bouge pas, l’alarme sonne. |
| **Nettoyer les lieux avant chaque test** (`CHROMA_TEMP=1`)  | 🧹  On met un tapis jetable sur le sol : aucune empreinte ne reste après la visite. |
| **Fausse voix LLM** : mock **LiteLLM**                      | 🎭  Un acteur lit le script à la place des vraies célébrités ; on ne paye pas d’honoraires API. |
| **CI GitHub verte** — 14 exécutions dont la dernière “OK”   | ✅🎥  La caméra de chantier clignote en vert : tout le monde a son casque de sécurité. |

> *En résumé : la copropriété discute désormais sous contrôle d’un micro Phoenix,  
> la caméra CI valide que tout est bien enregistré, et personne ne dérange l’immeuble voisin (API) grâce à un acteur de doublage.* 😉
