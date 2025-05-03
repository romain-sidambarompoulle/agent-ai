from app.agent_ai.graph import graph_exec

def test_graph_runs():
    """Le graphe compile et s'exécute sans lever d'exception."""
    graph_exec.invoke({"msg": "hello"})


def test_llm_answer_present():
    """Le graphe doit produire une clé 'llm_answer' non vide."""
    state = graph_exec.invoke({"msg": "Ping ?"})
    assert "llm_answer" in state and state["llm_answer"], "llm_answer manquante !"    