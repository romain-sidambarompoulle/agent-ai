from langgraph.graph import StateGraph
from app.crew import run as crew_run      # 🆕 branchement CrewAI

def think(state: dict) -> dict:
    return state                 # TODO: logique de réflexion

def validate(state: dict) -> dict:          # <- type de retour dict au lieu de bool
    """Appelle la réunion CrewAI, range la réponse, puis renvoie l'état."""
    question = state.get("msg", "")
    state["llm_answer"] = crew_run(question)
    return state                            # <- on propage l'état

def act(state: dict) -> dict:               # <- même idée
    print("Action !", state)
    return state


g = StateGraph(dict)
g.add_node("think", think)
g.add_node("validate", validate)
g.add_node("act", act)

g.set_entry_point("think")
g.add_edge("think", "validate")
g.add_edge("validate", "act")

graph_exec = g.compile()