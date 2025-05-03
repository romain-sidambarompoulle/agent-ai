"""Exécution manuelle du graphe LangGraph."""

from app.agent_ai.graph import graph_exec

if __name__ == "__main__":
    result = graph_exec.invoke({"msg": "Hello from graph"})
    print("Résultat :", result)