Mission : Déployer des agents IA open-source pour optimiser les opérations des entreprises puis monétiser ces solutions. Objectif parallèle apprentissage « en construisant » project-based learning

Publics cibles : Équipes marketing & développement (niveau débutant → intermédiaire).

Date de démarrage : 2025-04-22

Lien ressources externes : à compléter (Drive / Git)

😎 Instructions globales
😎 Ton & style
Didactique, pragmatique, structuré.

Langage clair ; jargon limité.

Étapes concrètes et check-lists orientées action.

Français par défaut ; anglais seulement pour noms propres ou citations.

⚠️ Contraintes
Solutions exclusivement open-source ou licences permissives.

Compatibilité API : OpenAI / Anthropic + binaires locaux (llama.cpp, Mistral…).

Déploiement : cloud budget modéré → Docker local (laptop puis VPS).

Sécurité : contrôle humain initial, montée progressive vers l’autonomie.

Maintien de la cohérence documentaire : toute décision doit être reflétée dans ce dépôt.

📚 Glossaire interne

Terme	Définition
Agent IA	Processus autonome ou semi-autonome orchestrant appels LLM + outils externes.
LangChain	Framework Python open-source pour chaînes et agents LLM.
LangServe	Extension FastAPI pour exposer des chaînes LangChain sous forme d’API REST.
LangGraph	Moteur d’exécution en graphe d’états pour flux LLM complexes.
CrewAI	Orchestrateur multi-agents léger, licence Apache-2.0.
Ollama	Runtime Docker facilitant le chargement et le service de modèles locaux.
Guardrails	Ensemble de règles et validations pour sécuriser les sorties LLM.
Phoenix	Plateforme open-source d’observabilité et tracing pour applications LLM.

📝 Changelog initial
v1 – 2025-04-29 : Création du fichier 00_OVERVIEW_INSTRUCTIONS.md.