# 00\_explications\_imagé.md

> **Version 2 – 7 mai 2025**
> Métaphores & images mentales pour chaque sprint. Servez‑vous‑en comme GPS poétique ; pour les détails techniques, voyez `workflows.md`.

---

## 🏗️ Sprint 0 – « Couler les fondations »

| Étape technique                        | Image mentale                         |
| -------------------------------------- | ------------------------------------- |
| Installer Python 3.11, Git, Docker     | Verser le béton armé de la dalle.     |
| Cloner le repo LangServe *hello world* | Poser la première pierre du chantier. |
| Lancer `docker build -t agent-ai .`    | Couler la dalle sur toute la surface. |
| *Fin Sprint 0*                         | Les fondations sont solides.          |

*Voir workflows.md §Sprint 0 pour la recette.*

---

## 🧱 Sprint 1 – « Monter les murs porteurs »

| Étape technique                | Image mentale                         |
| ------------------------------ | ------------------------------------- |
| Ajouter **ChromaDB** (mémoire) | Maçonner les murs en briques mémoire. |
| Brancher persistance locale    | Sceller les briques au mortier.       |
| Tests Pytest verts             | Vérifier le niveau à bulles.          |

*Voir workflows.md §Sprint 1.*

---

## 🪟 Sprint 2 – « Poser les fenêtres »

| Étape technique                                          | Image mentale                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Construire graphe **LangGraph** (think → validate → act) | Installer les fenêtres double vitrage : la maison “voit” et “réfléchit”. |
| Runner CLI                                               | Poignée des fenêtres : ouverture/fermeture contrôlée.                    |

*Voir workflows.md §Sprint 2.*

---

## 🚪 Sprint 3 – « Installer les portes & la sécurité »

| Étape technique                    | Image mentale                                                        |
| ---------------------------------- | -------------------------------------------------------------------- |
| Intégrer **CrewAI** (multi‑agents) | Trois portiers (analyste, rédacteur, vérificateur) montent la garde. |
| Brancher **Phoenix OTEL**          | Caméras de surveillance dans chaque pièce.                           |
| CI GitHub + Guardrails initiaux    | Serrures anti‑intrusion.                                             |

*Voir workflows.md §Sprint 3.*

---

## 🎨 Sprint 4A – « Décorer la façade » (ActivePieces UI)

| Étape technique                          | Image mentale                                   |
| ---------------------------------------- | ----------------------------------------------- |
| Déployer **ActivePieces UI** via Traefik | Poser l’enseigne lumineuse sur la façade.       |
| Importer un flow webhook JSON            | Peindre la porte d’entrée aux couleurs du logo. |
| Premier déclencheur → logs Phoenix       | Tester la sonnette et vérifier la caméra.       |

*Voir workflows.md §Sprint 4A.*

---

## 🤝 Sprint 4B – « Orchestrer la garde des concierges » (multi‑agents)

| Étape technique                       | Image mentale                                        |
| ------------------------------------- | ---------------------------------------------------- |
| Configurer **LangGraph** + **CrewAI** | Répartir les clefs du bâtiment entre les concierges. |
| Lancer `graph_runner --trace`         | Faire la ronde de nuit avec talkie‑walkies allumés.  |
| Spans collectés par Phoenix           | Journal de bord signé à chaque porte.                |

*Voir workflows.md §Sprint 4B.*

---

## 📝 Changelog

| Version | Date       | Modifications                                                                                            |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| **v2**  | 2025‑05‑07 | Ajout Sprint 4A & 4B ; retrait mention Python 3.13 ; liens vers *workflows.md* ; normalisation tableaux. |
| v1      | 2025‑04‑29 | Création initiale (Sprints 0‑3).                                                                         |

---

*Fin du fichier. Continuez d’ajouter un tableau par sprint pour garder la fresque cohérente.*
