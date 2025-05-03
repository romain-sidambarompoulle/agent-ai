"""Exécution manuelle du graphe LangGraph."""

from app.agent_ai.graph import graph_exec
from dotenv import load_dotenv
load_dotenv()

# --- Active le tracer Phoenix ---
from phoenix.otel import register
register(                       # renvoie un TracerProvider
    project_name="agent-ai",    # nom visible dans l’UI (facultatif)
    auto_instrument=True        # détecte CrewAI, OpenAI, etc.
)

if __name__ == "__main__":
    result = graph_exec.invoke({"msg": "Hello from graph"})
    print("Résultat :", result)