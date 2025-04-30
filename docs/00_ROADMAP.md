Roadmap – Projet Agents IA

Objectifs pédagogiques

Apprendre en construisant : chaque commande est exécutée puis expliquée.



Conserver l’autonomie : maîtrise du terminal Python / Git / Docker minimale mais suffisante.



Évoluer sans refonte : toutes les briques sont open-source et compatibles entre elles.

Phase 0 – Mise en place environnement & Hello‑World

Cloner l’exemple LangServe.

Exécuter localement, dockeriser, déployer (Render).

Phase 1 – Agent enrichi

Ajouter mémoire + mini RAG (Chroma).

Phase 2 – Orchestration LangGraph

Refactoriser en graphe d’états « think-validate-act ».

Phase 3 – Multi‑agents CrewAI

Créer 2-3 rôles (analyste, vérificateur, rédacteur) et voter sur la réponse.

Phase 4 – LLM local & Docker‑compose

Lancer Ollama en conteneur, basculer l’endpoint OpenAI vers le serveur llama.cpp.

Phase 5 – Tests, Guardrails & Observabilité

Intégrer TruLens, règles Guardrails Colang, dashboard Phoenix.

Phase 6 – Intégration ERP (optionnel / en pause)

(L’ERP pourra être ajouté quand prêt.)

Méta‑procédures

Chaque phase correspond à un chat dédié (#S0_setup, #S1_enrichi …).

Pour cocher une tâche : voir le mémo de commande dans chaque chat.

Après achèvement : ajouter une entrée à JOURNAL_2025.md.





Prochaines actions validées

Vérifier Python 3.10+, Git, Docker sur le PC Windows.

Choisir Render (plan gratuit) pour le premier déploiement.

Démarrer Sprint 0 : je fournis le copier-coller exact pour cloner et lancer LangServe ; vous exécutez puis me remontez les logs si besoin.

Ainsi, le présent message fixe officiellement les choix effectués et la progression convenue, afin que l’autre fil de discussion sache précisément quels conseils ont été adoptés.