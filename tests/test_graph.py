from app.agent_ai.graph import graph_exec

def test_graph_runs():
    """Le graphe compile et s'exécute sans lever d'exception."""
    graph_exec.invoke({"msg": "hello"})