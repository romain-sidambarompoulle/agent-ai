🧠 Sprint 1 – « Aménager la mémoire »
| Métaphore chantier | Action technique | Pourquoi ? |
|--------------------|------------------|------------|
| **Poser des armoires‐archives** dans le hall | Installer **ChromaDB** (persistence `/app/data/chroma`) | Chaque conversation sera classée sur des étagères vectorielles. |
| **Donner un badge au concierge** pour consulter les archives | Après chaque réponse : `collection.add(...)` | Le concierge (notre chaîne) dépose le souvenir dans l’armoire. |
| **Mettre un ascenseur interne** vers la bonne étagère | Avant l’appel LLM : `similarity_search` | Il va chercher les souvenirs proches pour enrichir la réponse. |
| **Tester les tiroirs** | Nouveau test Pytest : insertion + retrieval OK | On s’assure que le badge ouvre bien la bonne armoire. |
| **Mettre à jour le plan incendie** (Dockerfile) | Ajouter `chromadb` dans `requirements.txt`, rebuild | Que l’immeuble conteneurisé ait aussi ses archives. |

À la fin du Sprint 1, l’immeuble se souvient enfin de chaque visiteur.


🔀 Sprint 2 – « Orchestration LangGraph »
| Métaphore chantier | Action technique | Pourquoi ? |
|--------------------|------------------|------------|
| **Installer une centrale domotique** | Refactoriser en **LangGraph** (graphe d’états) | Au lieu d’un couloir unique, on a plusieurs pièces reliées. |
| **Trois pièces principales** : « penser », « valider », « agir » | Nœuds : *think* → *validate* → *act* | Le concierge réfléchit, vérifie, puis répond. |
| **Tableau électrique** pour visualiser les flux | GraphViz / trace intégré LangGraph | On voit le courant circuler entre pièces. |
| **Alarmes anti‐court‐circuit** | Tests Pytest sur transitions et boucles | S’assurer qu’aucun fil ne tourne en boucle infinie. |
| **CI GitHub – contrôle qualité automatique** | Workflow `tests.yml` (pytest + pre-commit) | Chaque nouveau câble est testé avant fusion. |

Fin Sprint 2 : le bâtiment réagit intelligemment, sans se prendre les pieds dans ses propres fils.

👫 Sprint 3 – « Co‐propriété multi-agents CrewAI »
| Métaphore chantier | Action technique | Pourquoi ? |
|--------------------|------------------|------------|
| **Inviter plusieurs concierges** (analyste, rédacteur, vérificateur) | Mettre en place **CrewAI** avec 2-3 rôles | Chaque concierge a sa spécialité ; on partage la charge. |
| **Salle de réunion** pour voter la meilleure réponse | `Crew.run()` + stratégie de vote | Les agents débattent, évitent les réponses bancales. |
| **Journal de réunion** au sous‐sol | Log des messages inter-agents (LangSmith / Phoenix) | Garder la trace des décisions collectives. |
| **Règles de copropriété** (guardrails) | Integrer Guardrails / validateurs | Empêcher les concierges de divulguer de mauvais secrets. |
| **Test d’évacuation** | Scénarios Pytest multi-agents | Vérifier que la réunion aboutit toujours à une sortie unique et sensée. |

Vue d’ensemble 🏢
Sprint 1 : on aménage des archives vivantes – le bâtiment se souvient.

Sprint 2 : on tire une domotique en graphe – le bâtiment réfléchit avant d’agir.

Sprint 3 : on passe en copropriété intelligente – plusieurs concierges collaborent pour servir des réponses de qualité.